'use strict';

const {
	types : defaultTypes
} = require('../../descriptors/types');

const {
	odp,
	
	SymbolSubtypeCollection,
	SymbolConstructorName,
	
	MNEMONICA,
	MNEMOSYNE,
	TYPE_TITLE_PREFIX,
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
	WRONG_TYPE_DEFINITION,
	ALREADY_DECLARED,
	
} = require('../../const');


const collectConstructors = require('./collectConstructors');
const CreateInstanceModificator = require('./CreateInstanceModificator');
const CreateInstanceModificator200XthWay = require('./CreateInstanceModificator200XthWay');
const compileNewModificatorFunctionBody = require('./compileNewModificatorFunctionBody');

const checkProto = (proto) => {
	if (!(proto instanceof Object)) {
		throw new Error(WRONG_TYPE_DEFINITION);
	}
};


const addSubTypes = (inheritedInstance, subtypes) => {
	Object.entries(subtypes).forEach((subtype) => {
		const [name, SubTypeDescriptor] = subtype;
		
		if (inheritedInstance.constructor.prototype.hasOwnProperty(name)) {
			throw new Error('existent property re-definition');
		}
		
		odp(inheritedInstance.constructor.prototype, name, {
			get () {
				const SubTypeConstructor = function (...args) {
					const InstanceModificator = CreateInstance.call(inheritedInstance, SubTypeDescriptor);
					const inheritedSubInstance = new InstanceModificator(...args);
					return inheritedSubInstance;
				};
				
				odp(SubTypeConstructor, Symbol.hasInstance, {
					get () {
						return (instance) => {
							const constructors = collectConstructors(instance);
							return constructors[instance.constructor.name] || false;
						};
					}
				});

				return SubTypeConstructor;
			}
		});
		
	});
};

const getExistentInstance = function (isSubType) {
	if (isSubType) {
		return this;
	}
	const base = new Object();
	// O Great Mnemosyne! Please!
	// Save us from Oblivion...
	// https://en.wikipedia.org/wiki/Mnemosyne
	base[SymbolConstructorName] = MNEMOSYNE;
	odp(base, 'extract', {
		get () {
			return function () {
				if (!this) {
					throw new Error('this does not exists');
				}
				const extracted = {};
				for (const name in this) {
					extracted[name] = this[name];
				}
				return JSON.parse(JSON.stringify(extracted));
			};
		}
	});
	return base;
};

const CreateInstance = function (TypeDescriptor, args) {
	
	const {
		ConstructHandler,
		TypeName,
		proto,
		subtypes,
		isSubType,
		useOldStyle,
	} = TypeDescriptor;
	
	const existentInstance = getExistentInstance.call(this, isSubType);
	if (!existentInstance) {
		throw new Error('WRONG_TYPE_DEFINITION');
	}
	
	const CreationHandler = function (constructionAnswer) {
		addSubTypes(this, subtypes);
		// if CreationHandler will return something
		// then that Something is a toy
		// we have to play with
		if (constructionAnswer) {
			this.constructor.ConstructionAnswer = constructionAnswer;
		}
		return this;
	};
	
	const ModificattionConstructor = useOldStyle ?
		CreateInstanceModificator200XthWay : CreateInstanceModificator;
	// console.log(ModificattionConstructor.prototype.constructor.name);
	
	const modificatorBody = compileNewModificatorFunctionBody(TypeName);
	const ModificationConstructor = modificatorBody(ConstructHandler, CreationHandler, SymbolConstructorName);
	const InstanceModificator = ModificattionConstructor.call(existentInstance, ModificationConstructor, proto);
	
	if (isSubType) {
		return InstanceModificator;
	}
	
	const inheritedInstance = new InstanceModificator(...args);
	return inheritedInstance;
	
};

const defineTypeProxy = function (TypeDescriptor) {
	
	const {
		TypeName,
		ConstructHandler
	} = TypeDescriptor;
	
	const typeProxyConstructMethod = function (target, args) {
		// this; // referenced to TypeProxy
		return CreateInstance(TypeDescriptor, args);
	};
	
	const typeProxyGetterMethod = function (target, prop) {
		// this; // referenced to TypeProxy
		
		if (prop === Symbol.hasInstance) {
			return (instance) => {
				if (!instance.constructor) {
					return false;
				}
				const constructors = collectConstructors(instance);
				return constructors[TypeName] || false;
			};
		}
		
		const propDeclaration = TypeDescriptor[prop];
		if (propDeclaration) {
			return propDeclaration;
		} else {
			if (TypeDescriptor.hasOwnProperty(prop)) {
				return propDeclaration;
			}
		}
		
		return target[prop];
	};
	
	const TypeProxy = new Proxy(ConstructHandler, {
		construct : typeProxyConstructMethod,
		get : typeProxyGetterMethod
	});
	
	Object.assign(TypeDescriptor, { TypeProxy });
	
	return TypeProxy;
};

const defineFromFunction = function (
	TypeName,
	ConstructHandler = function () {
		return this;
	},
	proto = {},
	useOldStyle = false 
) {
	
	const types = this;
	
	const parentType = types[SymbolSubtypeCollection];
	const isSubType = parentType === MNEMONICA ? false : true;
	
	if (typeof TypeName !== 'string') {
		throw new Error(TYPENAME_MUST_BE_A_STRING);
	}
	
	if (typeof ConstructHandler !== 'function') {
		throw new Error(HANDLER_MUST_BE_A_FUNCTION);
	}
	
	if (types[TypeName]) {
		throw new Error(ALREADY_DECLARED);
	}
	
	checkProto(proto);
	
	const subtypes = {};
	
	
	const ModificatorTypeDescriptorTitle = `${TYPE_TITLE_PREFIX}${TypeName}`;
	
	const TypeDescriptor = {
		
		ConstructHandler,
		TypeName,
		proto,
		
		isSubType,
		subtypes,
		
		title : ModificatorTypeDescriptorTitle,
		
		// about using
		// CreateInstanceModificator200XthWay
		// or more general
		// CreateInstanceModificator
		useOldStyle
		
	};
	
	odp(TypeDescriptor, 'define', {
		get () {
			return define.bind(TypeDescriptor.subtypes);
		}
	});

	odp(TypeDescriptor, Symbol.hasInstance, {
		enumerable : true,
		get () {
			return (instance) => {
				const constructors = collectConstructors(instance);
				return constructors[TypeName] || false;
			};
		},
	});
	
	odp(subtypes, SymbolSubtypeCollection, {
		get () {
			return TypeDescriptor;
		}
	});
	
	const TypeProxy = defineTypeProxy(TypeDescriptor);
	
	odp(types, TypeName, {
		enumerable : true,
		get () {
			return TypeProxy;
		},
	});
	
	return TypeProxy;
	
};

const defineFromType = function (GetConstructHandler, useOldStyle) {
	const types = this;
	
	// we need this to extract TypeName
	const type = GetConstructHandler();
	const TypeName = type.name;
	
	if (!TypeName) {
		throw new Error(TYPENAME_MUST_BE_A_STRING);
	}
	
	if (types[TypeName]) {
		throw new Error(WRONG_TYPE_DEFINITION);
	}
	
	const proto = type.prototype;
	
	return defineFromFunction.call(types, TypeName, type, proto, useOldStyle);
};


const define = function (TypeOrTypeName, ...args) {
	const types = this;
	let definitor = null;
	if (typeof TypeOrTypeName === 'string') {
		return defineFromFunction.call(types, TypeOrTypeName, ...args);
	}
	if (typeof TypeOrTypeName === 'function') {
		return defineFromType.call(types, TypeOrTypeName, ...args);
	}
	if (definitor === null) {
		throw new Error(WRONG_TYPE_DEFINITION);
	}
	return definitor.call(types, TypeOrTypeName, ...args);
};


module.exports = {
	define : define.bind(defaultTypes),
	SymbolConstructorName,
	collectConstructors
};