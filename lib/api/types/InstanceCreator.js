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
	getStack,
	getExistentStack,
} = require('./utils');



const addProps = function (proto) {

	const {
		type,
		existentInstance,
		args,
		stack,
	} = this;

	const {
		namespace,
		collection,
		subtypes,
	} = type;

	odp(proto, '__proto_proto__', {
		get () {
			return proto;
		}
	});

	odp(proto, '__args__', {
		get () {
			return args;
		}
	});

	odp(proto, '__collection__', {
		get () {
			return collection;
		}
	});

	odp(proto, '__namespace__', {
		get () {
			return namespace;
		}
	});

	odp(proto, '__subtypes__', {
		get () {
			return subtypes;
		}
	});

	odp(proto, '__type__', {
		get () {
			return type;
		}
	});

	odp(proto, '__parent__', {
		get () {
			return existentInstance;
		}
	});

	odp(proto, '__stack__', {
		get () {
			return stack;
		}
	});

	const timestamp = Date.now();
	Object.defineProperty(proto, '__timestamp__', {
		get () {
			return timestamp;
		}
	});

};

const invokePreHooks = function () {

	const {
		type,
		existentInstance,
		args,
	} = this;

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

const invokePostHooks = function () {

	const {
		inheritedInstance
	} = this;

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


const addSubTypes = function () {

	const self = this;

	const {
		inheritedInstance,
		type: {
			subtypes
		},
		stack
	} = self;

	const {
		__proto_proto__: proto
	} = inheritedInstance;

	Object.entries(subtypes).forEach((subtype) => {

		const [name, subType] = subtype;

		if (inheritedInstance.hasOwnProperty(name)) {
			throw new EXISTENT_PROPERTY_REDEFINITION(name, stack);
		}

		odp(proto, name, {

			get () {
				
				const subtypeProxy = new Proxy(InstanceCreator, {
					
					get (target, prop) {
						
						if (prop === Symbol.hasInstance) {
							return getTypeChecker(subType.TypeName);
						}
						
						return target[prop];
						
					},
					
					construct (Target, args) {
						return new Target(subType, inheritedInstance, args);
					},
					
					apply (Target, thisArg, args) {
						const existentInstance = thisArg || inheritedInstance;
						return new Target(subType, existentInstance, args);
					},
					
				});
				
				return subtypeProxy;

			}

		});

	});
};

const postProcessing = function (continuationOf) {

	const self = this;
	const {
		stack,
	} = self;

	if (!self.inheritedInstance.constructor) {
		const msg = 'should inherit from mnemonica instance';
		throw new WRONG_MODIFICATION_PATTERN(msg, stack);
	}

	if (!self.inheritedInstance.constructor[SymbolConstructorName]) {
		const msg = 'should inherit from mnemonica instance';
		throw new WRONG_MODIFICATION_PATTERN(msg, stack);
	}

	if (continuationOf && !(self.inheritedInstance instanceof continuationOf)) {
		const icn = self.inheritedInstance.constructor.name;
		const msg = `should inherit from ${continuationOf.TypeName} but got ${icn}`;
		throw new WRONG_MODIFICATION_PATTERN(msg, self.stack);
	}

	odp(self.inheritedInstance, '__self__', {
		get () {
			return self.inheritedInstance;
		}
	});

	self.addSubTypes();
	self.invokePostHooks();

};

const addThen = function (then) {

	const self = this;

	self.inheritedInstance = self.inheritedInstance
		.then((instance) => {
			self.inheritedInstance = instance;
			self.inheritedInstance =
				new InstanceCreator(
					then.subtype,
					self.inheritedInstance,
					then.args,
					// was chained :
					true
					// self.existentInstance
				);
			return self.inheritedInstance;
		});

};

const makeWaiter = function (type, then) {

	const self = this;

	self.inheritedInstance = self.inheritedInstance
		.then((instance) => {

			if (!(instance instanceof self.type)) {
				const icn = instance.constructor.name;
				const msg = `should inherit from ${type.TypeName} but got ${icn}`;
				throw new WRONG_MODIFICATION_PATTERN(msg, self.stack);
			}

			self.inheritedInstance = instance;
			if (self.inheritedInstance.__self__ !== self.inheritedInstance) {
				// it was async instance,
				// so we have to add all the stuff
				// for sync instances it was done already
				self.postProcessing(type);
			}
			return self.inheritedInstance;
		});

	if (then) {
		self.addThen(then);
	}

	Object.entries(type.subtypes).forEach((entry) => {
		const [name, subtype] = entry;
		self.inheritedInstance[name] = (...args) => {
			self.inheritedInstance = self.makeWaiter(subtype, {
				name,
				subtype,
				args,
			});
			return self.inheritedInstance;
		};
	});

	return self.inheritedInstance;

};


const InstanceCreator = function (type, existentInstance, args, chained) {

	const {
		constructHandler,
		proto,
		useOldStyle,
		TypeName
	} = type;

	const self = this;

	const ModificationConstructor = getModificationConstructor(useOldStyle);

	const ModificatorType = constructHandler();

	const stackAddition = chained ? self.getExistentStack(existentInstance) : [];

	const title = `\n<-- creation of [ ${TypeName} ] traced -->`;

	const stack = getStack(title, stackAddition);

	Object.assign(self, {

		type,
		TypeName,
		
		existentInstance,

		get args () {
			return args;
		},

		ModificationConstructor,
		ModificatorType,
		stack,

	});

	const InstanceModificator = ModificationConstructor.call(
		existentInstance,
		ModificatorType,
		Object.assign({}, proto),
		addProps.bind(self)
	);

	self.InstanceModificator = InstanceModificator;

	self.invokePreHooks();

	self.inheritedInstance = new InstanceModificator(...args);

	if (self.inheritedInstance instanceof Promise) {

		const waiter = self.makeWaiter(type);

		odp(waiter, SymbolConstructorName, {
			get () {
				return TypeName;
			}
		});

		return waiter;

	}

	self.postProcessing(type);

	return self.inheritedInstance;

};

Object.assign(InstanceCreator.prototype, {
	getStack,
	getExistentStack,
	postProcessing,
	makeWaiter,
	addThen,
	addSubTypes,
	invokePreHooks,
	invokePostHooks
});


module.exports = {
	InstanceCreator
};
