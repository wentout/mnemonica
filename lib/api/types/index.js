'use strict';


const odp = Object.defineProperty;

const {
	types : defaultTypes
} = require('../../descriptors/types');

const {
	
	SymbolSubtypeCollection,
	SymbolConstructorName,
	
	MNEMONICA,
	MNEMOSYNE,
	TYPE_TITLE_PREFIX,
	
} = require('../../constants');

const {
	ALREADY_DECLARED,
	WRONG_TYPE_DEFINITION,
	TYPENAME_MUST_BE_A_STRING,
	WRONG_MODIFICATION_PATTERN,
	HANDLER_MUST_BE_A_FUNCTION,
	EXISTENT_PROPERTY_REDEFINITION
} = require('../../errors');

const {
	collectConstructors
} = require('../../utils'),

compileNewModificatorFunctionBody
  = require('./compileNewModificatorFunctionBody');

const
	oldMC = require('./CreateInstanceModificator200XthWay'),
	newMC = require('./CreateInstanceModificator');
	
const getModificationConstructor = (useOldStyle) => {
	return useOldStyle ? oldMC : newMC;
};

const getTypeChecker = (TypeName) => {
	return (instance) => {
		if (!instance) {
			return false;
		}
		if (!instance.constructor) {
			return false;
		}
		const constructors = collectConstructors(instance);
		return constructors[TypeName] || false;
	};
};

const checkProto = (proto) => {
	if (!(proto instanceof Object)) {
		throw new WRONG_TYPE_DEFINITION('expect prototype to be an object');
	}
};

const addSubTypes = (inheritedInstance, subtypes) => {
	Object.entries(subtypes).forEach((subtype) => {
		const [name, SubTypeDescriptor] = subtype;
		
		if (inheritedInstance.hasOwnProperty(name)) {
			throw new EXISTENT_PROPERTY_REDEFINITION(name);
		}
		
		odp(inheritedInstance, name, {
			get () {
				const SubTypeConstructor = function (...args) {
					const InstanceModificator = CreateInstance.call(inheritedInstance, SubTypeDescriptor);
					const inheritedSubInstance = new InstanceModificator(...args);
					addSubTypes(inheritedSubInstance, SubTypeDescriptor.subtypes);
					return inheritedSubInstance;
				};
				
				odp(SubTypeConstructor, Symbol.hasInstance, {
					get () {
						return getTypeChecker(SubTypeDescriptor.TypeName);
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
	const { extract } = require('../../utils');
	odp(base, 'extract', {
		get () {
			return function () {
				return extract(this);
			};
		}
	});
	return base;
};


const CreateInstance = function (TypeDescriptor, args) {
	
	const {
		ConstructHandler,
		proto,
		subtypes,
		isSubType,
		parentType,
		useOldStyle,
	} = TypeDescriptor;
	
	const existentInstance = getExistentInstance.call(this, isSubType);
	
	if (isSubType && !(existentInstance instanceof parentType)) {
		throw new WRONG_MODIFICATION_PATTERN;
	}
	
	const ModificationConstructor = getModificationConstructor(useOldStyle);
	const InstanceModificator = ModificationConstructor.call(existentInstance, ConstructHandler(), proto);
	
	if (isSubType) {
		return InstanceModificator;
	}
	
	const inheritedInstance = new InstanceModificator(...args);
	addSubTypes(inheritedInstance, subtypes);
	
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
			return getTypeChecker(TypeName);
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



const CreateDefinition = function (
	TypeName,
	ConstructHandler,
	proto = {},
	useOldStyle
) {
	
	const types = this;
	
	const parentType = types[SymbolSubtypeCollection];
	const isSubType = (
		parentType === undefined ||
		parentType === MNEMONICA
	) ? false : true;
	
	if (typeof TypeName !== 'string') {
		throw new TYPENAME_MUST_BE_A_STRING;
	}
	
	if (types[TypeName]) {
		throw new ALREADY_DECLARED;
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
		parentType,
		
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
		get () {
			return getTypeChecker(TypeName);
		}
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

const defineFromType = function (ConstructHandlerGetter) {
	const types = this;
	// we need this to extract TypeName
	const type = ConstructHandlerGetter();
	const TypeName = type.name;
	return CreateDefinition.call(
		types,
		TypeName,
		() => {
			const ConstructHandler = ConstructHandlerGetter();
			ConstructHandler[SymbolConstructorName] = TypeName;
			return ConstructHandler;
		},
		type.prototype,
		false
	);
};

const defineFromFunction = function (
	TypeName,
	ConstructHandler = function () {},
	proto = {},
	useOldStyle = false
) {
	if (typeof ConstructHandler !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}
	
	const types = this;
	
	const ConstructHandlerGetter = function () {
		const CreationHandler = function (constructionAnswer) {
			// standard says : 
			// if constructor returns something
			// then this is a toy
			// we have to play with
			// respectively
			// so we will not follow the rule
			// if (constructionAnswer instanceof types[TypeName]) {
			// and instead follow the line below
			if (constructionAnswer instanceof Object) {
				return constructionAnswer;
			}
			return this;
		};
		const modificatorBody = compileNewModificatorFunctionBody(TypeName);
		const ModificationConstructor = modificatorBody(
			ConstructHandler,
			CreationHandler,
			proto,
			SymbolConstructorName
		);
		return ModificationConstructor;
	};
	
	return CreateDefinition.call(
		types,
		TypeName,
		ConstructHandlerGetter,
		proto,
		useOldStyle
	);

};


const define = function (TypeOrTypeName, ...args) {
	const types = this || defaultTypes;
	if (typeof TypeOrTypeName === 'string') {
		return defineFromFunction.call(types, TypeOrTypeName, ...args);
	}
	if (typeof TypeOrTypeName === 'function') {
		return defineFromType.call(types, TypeOrTypeName);
	}
	throw new WRONG_TYPE_DEFINITION('definition is not provided');
};


module.exports = {
	define,
};

