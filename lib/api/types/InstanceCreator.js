'use strict';

const odp = Object.defineProperty;

const {
	SymbolGaia,
	SymbolConstructorName,
} = require('../../constants');

const {
	WRONG_MODIFICATION_PATTERN,
} = require('../../descriptors/errors');


const {
	getModificationConstructor,
	cleanupStack,
	getStack,
	getExistentStack,
	CreationHandler,
} = require('./utils');

const compileNewModificatorFunctionBody
	= require('./compileNewModificatorFunctionBody');


const throwModificationError = (self, error) => {
	
	const {
		TypeName
	} = self;
	
	const modificatorBody = compileNewModificatorFunctionBody(TypeName);

	const modificatorType = modificatorBody(
		function () {},
		CreationHandler,
		SymbolConstructorName
	);
	
	self.ModificatorType = modificatorType();
	
	self.InstanceModificator = makeInstanceModificator(self);
	
	const erroredInstance = new self.InstanceModificator();
	
	Object.setPrototypeOf(Object.getPrototypeOf(erroredInstance[SymbolGaia]), error);
	
	self.stack = cleanupStack(self.stack).join('\n');
	throw erroredInstance;

};


const addProps = function () {

	const {
		type,
		existentInstance,
		args,
		stack,
		__proto_proto__: proto
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


const undefineParentSubTypes = function () {

	const self = this;

	const {
		__proto_proto__: proto,
		existentInstance : {
			__subtypes__ : subtypes
		}
	} = self;
	
	if (!subtypes) {
		return;
	}
	
	const unscopables = {};

	subtypes.forEach((subtype, name) => {
		odp(proto, name, {
			get () {
				return undefined;
			}
		});
		unscopables[name] = true;
	});
	
	proto[Symbol.unscopables] = unscopables;

};


const proceedProto = function () {
	
	const self = this;
	self.addProps();
	self.strictChain && self.undefineParentSubTypes();
	
};


const invokePreHooks = function () {

	const {
		type,
		existentInstance,
		args,
		InstanceModificator
	} = this;

	const {
		namespace,
		collection,
	} = type;

	namespace.invokeHook('preCreation', {
		type,
		existentInstance,
		args,
		InstanceModificator
	});

	collection.invokeHook('preCreation', {
		type,
		existentInstance,
		args,
		InstanceModificator
	});

	type.invokeHook('preCreation', {
		type,
		existentInstance,
		args,
		InstanceModificator
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

		})
		.catch(error => {
			if (self.forceErrors) {
				throwModificationError(self, error);
			} else {
				throw error;
			}
		});

	if (then) {
		self.addThen(then);
	}

	type.subtypes.forEach((subtype, name) => {
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

const makeInstanceModificator = (self) => {
		
	const {
		ModificationConstructor,
		existentInstance,
		ModificatorType,
		proto,
		
	} = self;
	
	return ModificationConstructor.call(
		existentInstance,
		ModificatorType,
		Object.assign({}, proto),
		function (__proto_proto__) {
			self.__proto_proto__ = __proto_proto__;
			proceedProto.call(self, __proto_proto__);
		}
	);
};


const InstanceCreator = function (type, existentInstance, args, chained) {

	const {
		constructHandler,
		proto,
		config : {
			useOldStyle,
			strictChain,
			forceErrors
		},
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
		
		strictChain,
		forceErrors,
		
		proto
		
	});

	self.invokePreHooks();
	
	self.InstanceModificator = makeInstanceModificator(self);
	
	if (forceErrors) {
		
		try {
			
			self.inheritedInstance = new self.InstanceModificator(...args);
			
		} catch (error) {
			
			throwModificationError(self, error);
			
		}
		
	} else {
		self.inheritedInstance = new self.InstanceModificator(...args);
	}
	

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
	proceedProto,
	addProps,
	addThen,
	undefineParentSubTypes,
	invokePreHooks,
	invokePostHooks,
});


module.exports = {
	InstanceCreator
};
