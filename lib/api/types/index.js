'use strict';

const {
	types : defaultTypes
} = require('../../descriptors/types');

const {
	odp,
	
	SymbolSubtypeCollection,
	SymbolConstructorName,
	
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
	WRONG_TYPE_DEFINITION,
	ALREADY_DECLARED,
	
} = require('../../const');


const collectConstructors = require('./collectConstructors');
const CreateInstanceModificator = require('./CreateInstanceModificator');
const compileNewModificatorFunctionBody = require('./compileNewModificatorFunctionBody');

const checkProto = (proto) => {
	if (!(proto instanceof Object)) {
		throw new Error(WRONG_TYPE_DEFINITION);
	}
};


const addSubTypes = (inheritedInstance, subtypes) => {
	Object.entries(subtypes).forEach((subtype) => {
		const [name, SubTypeDescriptor] = subtype;
		odp(inheritedInstance, name, {
			get () {
				return function (...args) {
					const InstanceModificator = CreateInstance.call(inheritedInstance, SubTypeDescriptor);
					const inheritedSubInstance = new InstanceModificator(...args);
					return inheritedSubInstance;
				};
			}
		});
	});
};

const getExistentInstance = function (isSubType) {
	if (isSubType) {
		return this;
	}
	const base = new Object();
	base[SymbolConstructorName] = 'Mnemosyne';
	return base;
};

const CreateInstance = function (TypeDescriptor, args) {
	
	const {
		ConstructHandler,
		TypeName,
		proto,
		subtypes,
		isSubType,
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
	
	const modificatorBody = compileNewModificatorFunctionBody(TypeName);
	const ModificationConstructor = modificatorBody(ConstructHandler, CreationHandler, proto, SymbolConstructorName);
	const InstanceModificator = CreateInstanceModificator.call(existentInstance, ModificationConstructor);
	
	if (isSubType) {
		return InstanceModificator;
	}
	
	const inheritedInstance = new InstanceModificator(...args);
	return inheritedInstance;
	
};

const DefineSubType = function (...args) {
	// this; // binded to TypeDescriptor
	const SubTypeProxy = define.call(this.subtypes, ...args);
	return SubTypeProxy;
};


const defineFromFunction = function (
	TypeName,
	ConstructHandler = function () {
		return this;
	},
	proto = {},
) {
	
	const types = this;
	
	const parentType = types[SymbolSubtypeCollection] || null;
	const isSubType = parentType ? true : false;
	
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
	
	
	const ModificatorTypeDescriptorTitle = `constructor of : ${TypeName}`;
	
	const TypeDescriptor = {
		
		ConstructHandler,
		TypeName,
		proto,
		
		isSubType,
		subtypes,
		
		meta : {
			name : TypeName,
			title : ModificatorTypeDescriptorTitle,
		}
		
	};
	
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
	
	odp(types, TypeName, {
		enumerable : true,
		get () {
			return TypeDescriptor;
		},
	});
	
	const typeProxyConstructMethod = function (target, args) {
		// this; // referenced to TypeProxy
		return CreateInstance(TypeDescriptor, args);
	};
	
	const typeProxyGetterMethod = function (target, prop) {
		// this; // referenced to TypeProxy
		
		if (prop == 'define') {
			const SubTypeProxy = DefineSubType.bind(TypeDescriptor);
			return SubTypeProxy;
		}
		
		if (prop === Symbol.hasInstance) {
			return (instance) => {
				if (!instance.constructor) {
					return false;
				}
				const constructors = collectConstructors(instance);
				return constructors[TypeName] || false;
			};
		}
		
		const result = TypeDescriptor[prop] || target[prop];
		
		return result;
	};
	
	const TypeProxy = new Proxy(ConstructHandler, {
		construct : typeProxyConstructMethod,
		get : typeProxyGetterMethod
	});
	
	return TypeProxy;
	
};

const defineFromType = function (GetConstructHandler) {
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
	
	return defineFromFunction.call(types, TypeName, type, proto);
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