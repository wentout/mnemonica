'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.types = void 0;
const hop_1 = require('../../utils/hop');
const constants_1 = require('../../constants');
const { odp, SymbolConstructorName, SymbolDefaultNamespace, SymbolDefaultTypesCollection, SymbolConfig, MNEMONICA, MNEMOSYNE, } = constants_1.constants;
const errors_1 = require('../../descriptors/errors');
const { NAMESPACE_DOES_NOT_EXIST, ASSOCIATION_EXISTS, } = errors_1.ErrorsTypes;
const namespaces_1 = require('../namespaces');
const { [SymbolDefaultNamespace]: defaultNamespace, defaultOptionsKeys } = namespaces_1.namespaces;
const types_1 = require('../../api/types');
const hooksAPI = require('../../api/hooks');
const proto = Object.assign({ define : types_1.define,
	lookup : types_1.lookup }, hooksAPI);
const TypesCollection = function (namespace, config) {
	const self = this;
	const subtypes = new Map();
	config = defaultOptionsKeys.reduce((o, key) => {
		if (typeof config[key] === 'boolean') {
			o[key] = config[key];
		}
		else {
			o[key] = namespace[SymbolConfig][key];
		}
		return o;
	}, {});
	odp(this, SymbolConfig, {
		get () {
			return config;
		}
	});
	odp(this, Symbol.hasInstance, {
		get () {
			return (instance) => {
				return instance[SymbolConstructorName] === namespace.name;
			};
		}
	});
	odp(this, 'subtypes', {
		get () {
			return subtypes;
		}
	});
	odp(subtypes, MNEMOSYNE, {
		get () {
			return namespace.typesCollections.get(self);
		}
	});
	odp(this, MNEMOSYNE, {
		get () {
			return namespace.typesCollections.get(self);
		}
	});
	odp(this, 'namespace', {
		get () {
			return namespace;
		}
	});
	odp(subtypes, 'namespace', {
		get () {
			return namespace;
		}
	});
	const hooks = Object.create(null);
	odp(this, 'hooks', {
		get () {
			return hooks;
		}
	});
};
odp(TypesCollection.prototype, MNEMONICA, {
	get () {
		return this.namespace.typesCollections.get(this);
	}
});
odp(TypesCollection.prototype, 'define', {
	get () {
		const { subtypes } = this;
		return function (...args) {
			return proto.define.call(this, subtypes, ...args);
		};
	},
	enumerable : true
});
odp(TypesCollection.prototype, 'lookup', {
	get () {
		return function (...args) {
			return proto.lookup.call(this.subtypes, ...args);
		}.bind(this);
	},
	enumerable : true
});
odp(TypesCollection.prototype, 'registerHook', {
	get () {
		const proxy = this.namespace.typesCollections.get(this);
		return function (hookName, hookCallback) {
			return proto.registerHook.call(this, hookName, hookCallback);
		}.bind(proxy);
	},
	enumerable : true
});
odp(TypesCollection.prototype, 'invokeHook', {
	get () {
		const proxy = this.namespace.typesCollections.get(this);
		return function (hookName, hookCallback) {
			return proto.invokeHook.call(this, hookName, hookCallback);
		}.bind(proxy);
	}
});
odp(TypesCollection.prototype, 'registerFlowChecker', {
	get () {
		const proxy = this.namespace.typesCollections.get(this);
		return function (flowCheckerCallback) {
			return proto.registerFlowChecker.call(this, flowCheckerCallback);
		}.bind(proxy);
	}
});
const typesCollectionProxyHandler = {
	get (target, prop) {
		if (target.subtypes.has(prop)) {
			return target.subtypes.get(prop);
		}
		return Reflect.get(target, prop);
	},
	set (target, TypeName, Constructor) {
		return target.define(TypeName, Constructor);
	},
	getOwnPropertyDescriptor (target, prop) {
		return target.subtypes.has(prop) ? {
			configurable : true,
			enumerable   : true,
			writable     : false,
			value        : target.subtypes.get(prop)
		} : undefined;
	}
};
const createTypesCollection = (namespace = defaultNamespace, association, config = {}) => {
	if (!(namespace instanceof Object) ||
        !hop_1.hop(namespace, 'name') ||
        !namespaces_1.namespaces.namespaces.has(namespace.name)) {
		throw new NAMESPACE_DOES_NOT_EXIST;
	}
	if (namespace.typesCollections.has(association)) {
		throw new ASSOCIATION_EXISTS;
	}
	const typesCollection = new TypesCollection(namespace, config);
	const typesCollectionProxy = new Proxy(typesCollection, typesCollectionProxyHandler);
	namespace.typesCollections.set(typesCollection, typesCollectionProxy);
	namespace.typesCollections.set(typesCollectionProxy, typesCollection);
	if (association) {
		namespace.typesCollections.set(association, typesCollectionProxy);
	}
	return typesCollectionProxy;
};
const DEFAULT_TYPES = createTypesCollection(defaultNamespace, SymbolDefaultTypesCollection);
odp(DEFAULT_TYPES, SymbolDefaultTypesCollection, {
	get () {
		return true;
	}
});
exports.types = {
	get createTypesCollection () {
		return function (namespace, association, config = {}) {
			return createTypesCollection(namespace, association, config);
		};
	},
	get defaultTypes () {
		return DEFAULT_TYPES;
	}
};
