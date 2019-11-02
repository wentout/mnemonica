'use strict';

const odp = Object.defineProperty;

const {
	SymbolConstructorName,
} = require('../../constants');

const {
	WRONG_MODIFICATION_PATTERN,
	EXISTENT_PROPERTY_REDEFINITION,
} = require('../../errors');


const {
	getModificationConstructor,
	getTypeChecker,
} =	require('./utils');


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

const invokePreHooks = (opts) => {

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

const invokePostHooks = (inheritedInstance) => {

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

const proceedInheritance = (opts) => {

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
			if (instance.__self__ !== instance) {
				// it was async instance,
				// so we have to add all the stuff
				// for sync instances it was done already
				postProcessing(instance, type.subtypes);
			}
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

const postProcessing = (inheritedInstance, subtypes) => {

	odp(inheritedInstance, '__self__', {
		get() {
			return inheritedInstance;
		}
	});

	addSubTypes(inheritedInstance, subtypes);
	invokePostHooks(inheritedInstance);

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

	postProcessing(inheritedInstance, subtypes);

	return inheritedInstance;

};

module.exports = createInstance;
