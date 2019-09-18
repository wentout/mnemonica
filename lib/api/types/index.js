'use strict';


const odp = Object.defineProperty;

const {
	
	SymbolSubtypeCollection,
	SymbolConstructorName,
	
	TYPE_TITLE_PREFIX,
	MNEMONICA,
	
} = require('../../constants');

const {
	ALREADY_DECLARED,
	WRONG_TYPE_DEFINITION,
	TYPENAME_MUST_BE_A_STRING,
	WRONG_MODIFICATION_PATTERN,
	HANDLER_MUST_BE_A_FUNCTION,
	EXISTENT_PROPERTY_REDEFINITION
} = require('../../errors');

const hooksApi = require('../hooks');

const {
	collectConstructors
} = require('../../utils');

const compileNewModificatorFunctionBody
  = require('./compileNewModificatorFunctionBody');

const
	oldMC = require('./createInstanceModificator200XthWay'),
	newMC = require('./createInstanceModificator');
	
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

const proceedInheritance = (opts) => {
	
	const {
		type,
		existentInstance,
		InstanceModificator,
		args,
	} = opts;
	
	const {
		namespace,
		subtypes
	} = type;
	
	namespace.invokeHook('preCreation', {
		type,
		existentInstance,
		args
	});
	
	type.invokeHook('preCreation', {
		type,
		existentInstance,
		args
	});
	
	const inheritedInstance = new InstanceModificator(...args);
	addSubTypes(subtypes, inheritedInstance);
	
	type.invokeHook('postCreation', {
		type,
		existentInstance,
		inheritedInstance,
		args
	});
	
	namespace.invokeHook('postCreation', {
		type,
		existentInstance,
		inheritedInstance,
		args
	});
	
	return inheritedInstance;

};

const addSubTypes = (subtypes, inheritedInstance) => {
	Object.entries(subtypes).forEach((subtype) => {
		const [name, subType] = subtype;
		
		if (inheritedInstance.hasOwnProperty(name)) {
			throw new EXISTENT_PROPERTY_REDEFINITION(name);
		}
		
		odp(inheritedInstance, name, {
			get () {
				
				const SubTypeConstructor = function (...args) {
					
					const InstanceModificator = createInstance.call(inheritedInstance, subType);
					
					const inheritedSubInstance = proceedInheritance({
						type : subType,
						existentInstance : inheritedInstance,
						InstanceModificator,
						args,
					});
					
					return inheritedSubInstance;
					
				};
				
				odp(SubTypeConstructor, Symbol.hasInstance, {
					get () {
						return getTypeChecker(subType.TypeName);
					}
				});

				return SubTypeConstructor;
			}
		});
		
	});
};

const getExistentInstance = function (isSubType, NamespaceName) {
	if (isSubType) {
		return this;
	}
	
	// const modificatorBody = compileNewModificatorFunctionBody(MNEMONICA);
	
	// const mnemonica = modificatorBody(
	// 	function () {},
	// 	CreationHandler,
	// 	SymbolConstructorName
	// );
	
	const mnemonica = {};
	mnemonica[SymbolConstructorName] = NamespaceName;
	
	const { extract } = require('../../utils');
	
	odp(mnemonica, 'extract', {
		get () {
			return function () {
				return extract(this);
			};
		}
	});
	
	odp(mnemonica, Symbol.hasInstance, {
		get () {
			return getTypeChecker(this.constructor.name);
		}
	});
	
	return mnemonica;
};

const createInstance = function (type, args) {
	
	const {
		constructHandler,
		proto,
		isSubType,
		parentType,
		useOldStyle,
		namespace
	} = type;
	
	const existentInstance = getExistentInstance.call(this, isSubType, namespace.name);
	
	if (isSubType && !(existentInstance instanceof parentType)) {
		throw new WRONG_MODIFICATION_PATTERN;
	}
	
	const ModificationConstructor = getModificationConstructor(useOldStyle);
	const InstanceModificator = ModificationConstructor.call(existentInstance, constructHandler(), proto, namespace.name);
	
	if (isSubType) {
		return InstanceModificator;
	}
	
	const inheritedInstance = proceedInheritance({
		type,
		existentInstance,
		InstanceModificator,
		args,
	});
	
	return inheritedInstance;
	
};

const defineTypeProxy = function (type) {
	
	const {
		TypeName,
		constructHandler
	} = type;
	
	const typeProxyConstructMethod = function (target, args) {
		// this; // referenced to TypeProxy
		return createInstance(type, args);
	};
	
	const typeProxyGetterMethod = function (target, prop) {
		// this; // referenced to TypeProxy
		
		if (prop === Symbol.hasInstance) {
			return getTypeChecker(TypeName);
		}
		
		const propDeclaration = type[prop];
		if (propDeclaration) {
			return propDeclaration;
		}
		// used for existent props with value
		// undefined || null || false 
		if (type.hasOwnProperty(prop)) {
			return propDeclaration;
		}
		
		return target[prop];
	};
	
	const TypeProxy = new Proxy(constructHandler, {
		construct : typeProxyConstructMethod,
		get : typeProxyGetterMethod
	});
	
	Object.assign(type, { TypeProxy });
	
	return TypeProxy;
};


const TypeDescriptor = function (
	types,
	TypeName,
	constructHandler,
	proto = {},
	useOldStyle
) {
	
	// here "types" refers to types collection object {}
	
	const parentType = types[SymbolSubtypeCollection] || null;
	
	const isSubType = parentType ? true : false;
	
	const namespace = isSubType ? parentType.namespace : types.namespace;
	
	if (typeof TypeName !== 'string') {
		throw new TYPENAME_MUST_BE_A_STRING;
	}
	
	if (types[TypeName]) {
		throw new ALREADY_DECLARED;
	}
	
	checkProto(proto);
	
	const subtypes = {};
	
	const title = `${TYPE_TITLE_PREFIX}${TypeName}`;
	
	const type = Object.assign(this, {
		
		constructHandler,
		TypeName,
		proto,
		
		isSubType,
		subtypes,
		parentType,
		
		namespace,
		
		title,
		
		// about using
		// createInstanceModificator200XthWay
		// or more general
		// createInstanceModificator
		useOldStyle,
		
		hooks : Object.create(null)
	});
	
	
	odp(subtypes, SymbolSubtypeCollection, {
		get () {
			return type;
		}
	});

	const TypeProxy = defineTypeProxy(type);
	
	odp(types, TypeName, {
		enumerable : true,
		get () {
			return TypeProxy;
		},
	});
	
	return TypeProxy;
	
};

Object.assign(TypeDescriptor.prototype, hooksApi);

TypeDescriptor.prototype.define = function (...args) {
	return define.call(this.subtypes, ...args);
};

odp(TypeDescriptor.prototype, Symbol.hasInstance, {
	get () {
		return getTypeChecker(this.TypeName);
	}
});

const defineFromType = function (constructHandlerGetter) {
	// we need this to extract TypeName
	const type = constructHandlerGetter();
	const TypeName = type.name;
	return new TypeDescriptor(
		this,
		TypeName,
		function () {
			const constructHandler = constructHandlerGetter();
			constructHandler[SymbolConstructorName] = TypeName;
			return constructHandler;
		},
		type.prototype,
		false
	);
};

const defineFromFunction = function (
	TypeName,
	constructHandler = function () {},
	proto = {},
	useOldStyle = false
) {
	if (typeof constructHandler !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}
	
	const constructHandlerGetter = function () {
		const modificatorBody = compileNewModificatorFunctionBody(TypeName);
		const ModificationConstructor = modificatorBody(
			constructHandler,
			CreationHandler,
			SymbolConstructorName
		);
		return ModificationConstructor;
	};
	
	return new TypeDescriptor(
		this,
		TypeName,
		constructHandlerGetter,
		proto,
		useOldStyle
	);

};


const define = function (TypeOrTypeName, ...args) {
	
	if (typeof TypeOrTypeName === 'string') {
		return defineFromFunction.call(this, TypeOrTypeName, ...args);
	}
	
	if (typeof TypeOrTypeName === 'function') {
		return defineFromType.call(this, TypeOrTypeName);
	}
	
	throw new WRONG_TYPE_DEFINITION('definition is not provided');
	
};


module.exports = {
	define,
};

