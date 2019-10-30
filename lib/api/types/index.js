'use strict';


const odp = Object.defineProperty;

const {

	SymbolSubtypeCollection,
	SymbolConstructorName,
	SymbolGaia,

	TYPE_TITLE_PREFIX,
	MNEMOSYNE,
	MNEMONICA,
	GAIA,
	URANUS

} = require('../../constants');

const {
	ALREADY_DECLARED,
	WRONG_TYPE_DEFINITION,
	TYPENAME_MUST_BE_A_STRING,
	WRONG_MODIFICATION_PATTERN,
	HANDLER_MUST_BE_A_FUNCTION,
	EXISTENT_PROPERTY_REDEFINITION,
} = require('../../errors');

const hooksApi = require('../hooks');
const extract = require('../../utils/extract');
const parent = require('../../utils/parent');
const pick = require('../../utils/pick');

const {
	collectConstructors
} = require('../../utils');

const compileNewModificatorFunctionBody
	= require('./compileNewModificatorFunctionBody');

const
	oldMC = require('./createInstanceModificator200XthWay'),
	newMC = require('./createInstanceModificator');

const getModificationConstructor = (useOldStyle) => {
	return (useOldStyle ? oldMC : newMC)();
};

const getTypeChecker = (TypeName) => {
	return (instance) => {
		if (!instance) {
			return false;
		}
		if (!instance.constructor) {
			return false;
		}
		if (instance instanceof Promise) {
			return instance[SymbolConstructorName] === TypeName;
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


const addProps = function (proto) {

	const {
		type,
		existentInstance,
		args,
		// } = opts;
	} = this;

	const {
		namespace,
		collection,
		subtypes,
	} = type;


	odp(proto, '__proto_proto__', {
		get() {
			return proto;
		}
	});

	odp(proto, '__args__', {
		get() {
			return args;
		}
	});

	odp(proto, '__collection__', {
		get() {
			return collection;
		}
	});

	odp(proto, '__namespace__', {
		get() {
			return namespace;
		}
	});

	odp(proto, '__subtypes__', {
		get() {
			return subtypes;
		}
	});

	odp(proto, '__type__', {
		get() {
			return type;
		}
	});

	odp(proto, '__parent__', {
		get() {
			return existentInstance;
		}
	});

	const timestamp = Date.now();
	Object.defineProperty(proto, '__timestamp__', {
		get() {
			return timestamp;
		}
	});

};


const invokePreHooks = function (opts) {

	const {
		type,
		existentInstance,
		args,
	} = opts;

	const {
		namespace,
		collection,
	} = type;

	namespace.invokeHook('preCreation', {
		type,
		existentInstance,
		args
	});

	collection.invokeHook('preCreation', {
		type,
		existentInstance,
		args
	});

	type.invokeHook('preCreation', {
		type,
		existentInstance,
		args
	});

};

const invokePostHooks = function (inheritedInstance) {

	const {
		__type__: type,
		__parent__: existentInstance,
		__args__: args,
	} = inheritedInstance;

	const {
		namespace,
		collection,
	} = type;

	type.invokeHook('postCreation', {
		type,
		existentInstance,
		inheritedInstance,
		args
	});

	collection.invokeHook('postCreation', {
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

};

const proceedInheritance = function (opts) {

	const {
		InstanceModificator,
		args,
	} = opts;

	const inheritedInstance = new InstanceModificator(...args);
	return inheritedInstance;

};

const addSubTypes = (inheritedInstance, subtypes) => {

	const {
		__proto_proto__: proto
	} = inheritedInstance;

	Object.entries(subtypes).forEach((subtype) => {

		const [name, subType] = subtype;

		if (inheritedInstance.hasOwnProperty(name)) {
			throw new EXISTENT_PROPERTY_REDEFINITION(name);
		}

		if (!inheritedInstance.constructor) {
			throw new WRONG_MODIFICATION_PATTERN('should inherit from mnemonica instance');
		}

		if (!inheritedInstance.constructor[SymbolConstructorName]) {
			throw new WRONG_MODIFICATION_PATTERN('should inherit from mnemonica instance');
		}

		odp(proto, name, {

			get() {

				const SubTypeConstructor = function (...args) {

					const inheritedSubInstance =
						createInstance
							.call(inheritedInstance, subType, args);

					return inheritedSubInstance;

				};

				odp(SubTypeConstructor, Symbol.hasInstance, {
					get() {
						return getTypeChecker(subType.TypeName);
					}
				});

				return SubTypeConstructor;

			}

		});

	});
};


const Mnemosyne = function (namespace, gaia) {

	const Mnemonica = function () {
		odp(this, SymbolConstructorName, {
			get() {
				return namespace.name;
			}
		});
	};

	const mnemonica = Object.getPrototypeOf(gaia);

	Object.setPrototypeOf(Mnemonica.prototype, mnemonica);
	Mnemonica.prototype.constructor = Mnemonica;

	// instance of self Constructor type
	odp(Mnemonica.prototype, Symbol.hasInstance, {
		get() {
			return getTypeChecker(this.constructor.name);
		}
	});

	odp(Mnemonica.prototype, SymbolGaia, {
		get() {
			return gaia;
		}
	});

	odp(Mnemonica.prototype, SymbolConstructorName, {
		get() {
			return MNEMONICA;
		}
	});

	odp(Mnemonica.prototype, 'extract', {
		get() {
			return function () {
				return extract(this);
			};
		}
	});

	odp(Mnemonica.prototype, 'pick', {
		get() {
			return function (...args) {
				return pick(this, ...args);
			};
		}
	});

	odp(Mnemonica.prototype, 'parent', {
		get() {
			return function (constructorLookupPath) {
				return parent(this, constructorLookupPath);
			};
		}
	});

	odp(Mnemonica.prototype, 'clone', {
		get() {
			return this.fork();
		}
	});

	odp(Mnemonica.prototype, 'fork', {
		get() {

			const {
				__type__: type,
				__collection__: collection,
				__parent__: existentInstance,
				__args__
			} = this;

			const {
				isSubType,
				TypeName
			} = type;

			// 'function', cause might be called with 'new'
			return function (...forkArgs) {
				const Constructor = isSubType ?
					existentInstance : collection;
				const args = forkArgs.length ? forkArgs : __args__;
				const forked = new (Constructor[TypeName])(...args);
				return forked;
			};
		}
	});

	const proto = new Mnemonica();

	Object.setPrototypeOf(this, proto);

};

const addThen = (inheritedInstance, then) => {
	inheritedInstance = inheritedInstance
		.then((instance) => {
			const finish = createInstance.call(
				instance,
				then.subtype,
				then.args
			);
			return finish;
		});
	return inheritedInstance;
};

const makeWaiter = (inheritedInstance, type, then) => {

	inheritedInstance = inheritedInstance
		.then((instance) => {
			addSubTypes(instance, type.subtypes);
			invokePostHooks(instance);
			return instance;
		});

	if (then) {
		inheritedInstance = addThen(inheritedInstance, then);
	}

	Object.entries(type.subtypes).forEach((entry) => {
		const [name, subtype] = entry;
		inheritedInstance[name] = (...args) => {
			const thens = {
				name,
				subtype,
				args,
			};
			inheritedInstance = makeWaiter(inheritedInstance, subtype, thens);
			return inheritedInstance;
		};
	});

	return inheritedInstance;

};


const createInstance = function (type, args) {

	const {
		constructHandler,
		proto,
		useOldStyle,
		subtypes,
		TypeName
	} = type;


	const existentInstance = this;

	const ModificationConstructor = getModificationConstructor(useOldStyle);

	const ModificatorType = constructHandler();

	const opts = {
		type,
		existentInstance,
		get args() {
			return args;
		},
	};

	const InstanceModificator = ModificationConstructor.call(
		existentInstance,
		ModificatorType,
		Object.assign({}, proto),
		addProps.bind(opts)
	);

	opts.InstanceModificator = InstanceModificator;

	invokePreHooks(opts);
	const inheritedInstance = proceedInheritance(opts);

	if (inheritedInstance instanceof Promise) {

		const waiter = makeWaiter(inheritedInstance, type);

		odp(waiter, SymbolConstructorName, {
			get() {
				return TypeName;
			}
		});

		return waiter;

	}

	addSubTypes(inheritedInstance, subtypes);
	invokePostHooks(inheritedInstance);

	return inheritedInstance;

};

const Gaia = function (Uranus) {

	const gaia = !Uranus ? this :
		Object.setPrototypeOf(this, Uranus);

	odp(gaia, MNEMONICA, {
		get() {
			return !Uranus ? GAIA : URANUS;
		}
	});

	return gaia;
};


const TypeProxy = function (type, Uranus) {

	const {
		namespace,
		isSubType,
		constructHandler
	} = type;

	this.__type__ = type;

	if (!isSubType) {

		odp(this, SymbolGaia, {
			get() {
				return new Mnemosyne(namespace, new Gaia(Uranus));
			}
		});

	}

	const typeProxy = new Proxy(constructHandler, this);

	return typeProxy;

};

TypeProxy.prototype.get = function (target, prop) {

	const {
		__type__: type
	} = this;

	if (prop === 'call') {
		return function (Uranus, ...args) {
			return new (new TypeProxy(type, Uranus))(...args);
		};
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

TypeProxy.prototype.construct = function (target, args) {
	const {
		__type__: type
	} = this;
	const gaia = this[SymbolGaia];
	const instance = createInstance.call(gaia, type, args);
	return instance;
};


const TypeDescriptor = function (
	types,
	TypeName,
	constructHandler,
	proto,
	useOldStyle
) {

	// here "types" refers to types collection object {}

	const parentType = types[SymbolSubtypeCollection] || null;

	const isSubType = parentType ? true : false;

	const namespace = isSubType ? parentType.namespace : types.namespace;
	const collection = isSubType ? parentType.collection : types[MNEMOSYNE];

	if (types[TypeName]) {
		throw new ALREADY_DECLARED;
	}

	checkProto(proto);

	const subtypes = {};

	const title = `${TYPE_TITLE_PREFIX}${TypeName}`;

	const type = Object.assign(this, {

		get constructHandler() {
			return constructHandler;
		},

		TypeName,
		proto,

		isSubType,
		subtypes,
		parentType,

		namespace,
		collection,

		title,

		// about using
		// createInstanceModificator200XthWay
		// or more general
		// createInstanceModificator
		useOldStyle,

		hooks: Object.create(null)

	});

	odp(subtypes, SymbolSubtypeCollection, {
		get() {
			return type;
		}
	});

	odp(types, TypeName, {
		enumerable: true,
		get() {
			return new TypeProxy(type);
		},
	});

	return types[TypeName];

};

Object.assign(TypeDescriptor.prototype, hooksApi);

TypeDescriptor.prototype.define = function (...args) {
	return define.call(this.subtypes, ...args);
};

TypeDescriptor.prototype.lookup = function (...args) {
	return lookup.call(this.subtypes, ...args);
};

odp(TypeDescriptor.prototype, Symbol.hasInstance, {
	get() {
		return getTypeChecker(this.TypeName);
	}
});

const defineFromType = function (constructHandlerGetter) {
	// we need this to extract TypeName
	const type = constructHandlerGetter();

	if (typeof type !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}

	const TypeName = type.name;

	if (!TypeName) {
		throw new TYPENAME_MUST_BE_A_STRING;
	}

	const makeConstructHandler = function () {
		const ModificationConstructor = constructHandlerGetter();
		// constructHandler[SymbolConstructorName] = TypeName;
		odp(ModificationConstructor, SymbolConstructorName, {
			get() {
				return TypeName;
			}
		});
		const protoDesc = Object
			.getOwnPropertyDescriptor(ModificationConstructor, 'prototype');
		if (protoDesc.writable) {
			ModificationConstructor.prototype = {};
		}
		return ModificationConstructor;
	};
	return new TypeDescriptor(
		this,
		TypeName,
		makeConstructHandler,
		type.prototype,
		false
	);
};

const defineFromFunction = function (
	TypeName,
	constructHandler = function () { },
	proto = {},
	useOldStyle = false
) {

	if (typeof constructHandler !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}

	const makeConstructHandler = function () {
		const modificatorBody = compileNewModificatorFunctionBody(TypeName);
		const ModificationConstructor = modificatorBody(
			constructHandler,
			CreationHandler,
			SymbolConstructorName
		);
		ModificationConstructor.prototype = {};
		return ModificationConstructor;
	};

	return new TypeDescriptor(
		this,
		TypeName,
		makeConstructHandler,
		proto,
		useOldStyle
	);

};

const getTypeSplitPath = (path) => {
	const split = path
		.replace(/\[(\w+)\]/g, '.$1')
		.replace(/^\./, '')
		.split(/\.|\/|:/);
	return split;
};

const define = function (TypeOrTypeName, ...args) {

	if (typeof TypeOrTypeName === 'string') {

		if (!TypeOrTypeName.length) {
			throw new WRONG_TYPE_DEFINITION('TypeName must not be empty');
		}

		const split = getTypeSplitPath(TypeOrTypeName);

		const Type = lookup.call(this, split[0]);

		if (!Type) {
			if (split.length === 1) {
				return defineFromFunction.call(this, TypeOrTypeName, ...args);
			} else {
				throw new WRONG_TYPE_DEFINITION(`${split[0]} definition is not yet exists`);
			}
		}

		const TypeName = split.slice(1).join('.');

		if (split.length > 1) {
			return define.call(Type.subtypes, TypeName, ...args);
		}

		// so, here we go with
		// defineFromType.call
		// from the next step
		return define.call(Type.subtypes, ...args);

	}

	if (typeof TypeOrTypeName === 'function') {
		return defineFromType.call(this, TypeOrTypeName);
	}

	throw new WRONG_TYPE_DEFINITION('definition is not provided');

};

const lookup = function (TypeNestedPath) {

	if (typeof TypeNestedPath !== 'string') {
		throw new WRONG_TYPE_DEFINITION('arg : type nested path must be a string');
	}

	if (!TypeNestedPath.length) {
		throw new WRONG_TYPE_DEFINITION('arg : type nested path has no path');
	}

	const split = getTypeSplitPath(TypeNestedPath);

	var [name] = split;
	var type = this[name];
	if (split.length == 1) {
		return type;
	}

	const NextNestedPath = split.slice(1).join('.');
	return lookup.call(type.subtypes, NextNestedPath);

};

module.exports = {
	define,
	lookup
};

