'use strict';


const odp = Object.defineProperty;

const {
	invokeHook
} = require('../namespaces');

const {
	
	SymbolSubtypeCollection,
	SymbolConstructorName,
	
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

const proceedInheritance = (opts) => {
	
	const {
		TypeDescriptor,
		existentInstance,
		InstanceModificator,
		args,
	} = opts;
	
	const {
		namespace,
		subtypes
	} = TypeDescriptor;
	
	invokeHook.call(namespace, 'preCreation', {
		TypeDescriptor,
		existentInstance,
		args
	});
	
	const inheritedInstance = new InstanceModificator(...args);
	addSubTypes(subtypes, inheritedInstance);
	
	invokeHook.call(namespace, 'postCreation', {
		TypeDescriptor,
		existentInstance,
		inheritedInstance,
		args
	});
	
	return inheritedInstance;

};

const addSubTypes = (subtypes, inheritedInstance) => {
	Object.entries(subtypes).forEach((subtype) => {
		const [name, SubTypeDescriptor] = subtype;
		
		if (inheritedInstance.hasOwnProperty(name)) {
			throw new EXISTENT_PROPERTY_REDEFINITION(name);
		}
		
		odp(inheritedInstance, name, {
			get () {
				
				const SubTypeConstructor = function (...args) {
					
					const InstanceModificator = createInstance.call(inheritedInstance, SubTypeDescriptor);
					
					const inheritedSubInstance = proceedInheritance({
						TypeDescriptor : SubTypeDescriptor,
						existentInstance : inheritedInstance,
						InstanceModificator,
						args,
					});
					
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

const getExistentInstance = function (isSubType, NamespaceName) {
	if (isSubType) {
		return this;
	}
	const base = new Object();
	// O Great Mnemosyne! Please!
	// Save us from Oblivion...
	// https://en.wikipedia.org/wiki/Mnemosyne
	base[SymbolConstructorName] = NamespaceName;
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

const createInstance = function (TypeDescriptor, args) {
	
	const {
		constructHandler,
		proto,
		isSubType,
		parentType,
		useOldStyle,
		namespace
	} = TypeDescriptor;
	
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
		TypeDescriptor,
		existentInstance,
		InstanceModificator,
		args,
	});
	
	return inheritedInstance;
	
};

const defineTypeProxy = function (TypeDescriptor) {
	
	const {
		TypeName,
		constructHandler
	} = TypeDescriptor;
	
	const typeProxyConstructMethod = function (target, args) {
		// this; // referenced to TypeProxy
		return createInstance(TypeDescriptor, args);
	};
	
	const typeProxyGetterMethod = function (target, prop) {
		// this; // referenced to TypeProxy
		
		if (prop === Symbol.hasInstance) {
			return getTypeChecker(TypeName);
		}
		
		const propDeclaration = TypeDescriptor[prop];
		if (propDeclaration) {
			return propDeclaration;
		}
		if (TypeDescriptor.hasOwnProperty(prop)) {
			return propDeclaration;
		}
		
		return target[prop];
	};
	
	const TypeProxy = new Proxy(constructHandler, {
		construct : typeProxyConstructMethod,
		get : typeProxyGetterMethod
	});
	
	Object.assign(TypeDescriptor, { TypeProxy });
	
	return TypeProxy;
};



const CreateDefinition = function (
	TypeName,
	constructHandler,
	proto = {},
	useOldStyle
) {
	
	// here "this" refers to types object {}
	const parentType = this[SymbolSubtypeCollection] || null;
	
	const isSubType = parentType ? true : false;
	
	const namespace = isSubType ? parentType.namespace : this.namespace;
	
	if (typeof TypeName !== 'string') {
		throw new TYPENAME_MUST_BE_A_STRING;
	}
	
	if (this[TypeName]) {
		throw new ALREADY_DECLARED;
	}
	
	checkProto(proto);
	
	const subtypes = {};
	
	const ModificatorTypeDescriptorTitle = `${TYPE_TITLE_PREFIX}${TypeName}`;
	
	const TypeDescriptor = {
		
		constructHandler,
		TypeName,
		proto,
		
		isSubType,
		subtypes,
		parentType,
		
		namespace,
		
		title : ModificatorTypeDescriptorTitle,
		
		// about using
		// createInstanceModificator200XthWay
		// or more general
		// createInstanceModificator
		useOldStyle
		
	};
	
	odp(subtypes, SymbolSubtypeCollection, {
		get () {
			return TypeDescriptor;
		}
	});
	
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
	
	const TypeProxy = defineTypeProxy(TypeDescriptor);
	
	odp(this, TypeName, {
		enumerable : true,
		get () {
			return TypeProxy;
		},
	});
	
	return TypeProxy;
	
};

const defineFromType = function (constructHandlerGetter) {
	// we need this to extract TypeName
	const type = constructHandlerGetter();
	const TypeName = type.name;
	return CreateDefinition.call(
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
			constructHandler,
			CreationHandler,
			proto,
			SymbolConstructorName
		);
		return ModificationConstructor;
	};
	
	return CreateDefinition.call(
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

