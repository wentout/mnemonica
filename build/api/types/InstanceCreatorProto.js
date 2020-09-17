'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.proceedProto = exports.undefineParentSubTypes = exports.addProps = void 0;
const constants_1 = require('../../constants');
const { odp, } = constants_1.constants;
exports.addProps = function () {
	const self = this;
	const { type, existentInstance, args, config: { submitStack }, __proto_proto__: proto } = self;
	const { namespace, collection, subtypes, } = type;
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
	if (submitStack) {
		const { stack } = this;
		odp(proto, '__stack__', {
			get () {
				return stack.join('\n');
			}
		});
	}
	odp(proto, '__creator__', {
		get () {
			return self;
		}
	});
	const timestamp = Date.now();
	odp(proto, '__timestamp__', {
		get () {
			return timestamp;
		}
	});
};
exports.undefineParentSubTypes = function () {
	const self = this;
	const { __proto_proto__: proto, existentInstance: { __subtypes__: subtypes } } = self;
	if (!subtypes) {
		return;
	}
	const unscopables = {};
	[...subtypes.keys()].forEach((name) => {
		odp(proto, name, {
			get () {
				return undefined;
			}
		});
		unscopables[name] = true;
	});
	proto[Symbol.unscopables] = unscopables;
};
exports.proceedProto = function () {
	const self = this;
	self.addProps();
	if (self.config.strictChain) {
		self.undefineParentSubTypes();
	}
};
