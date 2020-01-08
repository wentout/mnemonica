'use strict';

// 1. init default namespace
// 2. create default namespace in types

const odp = Object.defineProperty;

const {
	SymbolConstructorName,
	SymbolDefaultNamespace,
	SymbolDefaultTypesCollection,
	SymbolConfig,
	MNEMONICA,
	MNEMOSYNE,
} = require('../../constants');

const {
	NAMESPACE_DOES_NOT_EXIST,
	ASSOCIATION_EXISTS,
} = require('../../descriptors/errors');

const {
	namespaces,
	[SymbolDefaultNamespace]: defaultNamespace,
	defaultOptionsKeys
} = require('../namespaces');


const TypesCollection = function (namespace, config = Object.assign({}, defaultOptionsKeys)) {

	odp(this, Symbol.hasInstance, {
		get () {
			return (instance) => {
				return instance[SymbolConstructorName] === namespace.name;
			};
		}
	});

	odp(this, 'subtypes', {
		get () {
			return this;
		}
	});

	// For instanceof MNEMOSYNE
	odp(this, MNEMOSYNE, {
		get () {
			return this;
		}
	});

	odp(this, 'namespace', {
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
	
	// namespace config is less important than types collection config
	config = defaultOptionsKeys.reduce((o, key) => {
		if (typeof config[key] === 'boolean') {
			o[key] = config[key];
		} else {
			o[key] = namespace[SymbolConfig][key];
		}
		return o;
	}, {});
	
	odp(this, SymbolConfig, {
		get () {
			return config;
		}
	});

};

// here is TypesCollection.define() method
const {
	define,
	lookup
} = require('../../api').types;
const hooksAPI = require('../../api/hooks');

const proto = {
	define,
	lookup,
	...hooksAPI
};

odp(TypesCollection.prototype, 'define', {
	get () {
		return function (...args) {
			return proto.define.call(this, ...args);
		}.bind(this);
	},
	enumerable : true
});

odp(TypesCollection.prototype, 'lookup', {
	get () {
		return function (...args) {
			return proto.lookup.call(this, ...args);
		}.bind(this);
	},
	enumerable : true
});

odp(TypesCollection.prototype, 'registerHook', {
	get () {
		return function (hookName, hookCallback) {
			return proto.registerHook.call(this, hookName, hookCallback);
		}.bind(this);
	},
	enumerable : true
});

odp(TypesCollection.prototype, 'invokeHook', {
	get () {
		return function (hookName, hookCallback) {
			return proto.invokeHook.call(this, hookName, hookCallback);
		}.bind(this);
	}
});

odp(TypesCollection.prototype, 'registerFlowChecker', {
	get () {
		return function (flowCheckerCallback) {
			return proto.registerFlowChecker.call(this, flowCheckerCallback);
		}.bind(this);
	}
});

odp(TypesCollection.prototype, MNEMONICA, {
	get () {
		return this;
	}
});

const typesCollectionProxyHandler = {
	set (target, TypeName, Constructor) {
		return target.define(TypeName, Constructor);
	}
};

const createTypesCollection = (namespace = defaultNamespace, association, config) => {

	if (
		!(namespace instanceof Object) ||
		!namespace.hasOwnProperty('name') ||
		!namespaces.has(namespace.name)
	) {
		throw new NAMESPACE_DOES_NOT_EXIST;
	}

	if (namespace.typesCollections.has(association)) {
		throw new ASSOCIATION_EXISTS;
	}

	const typesCollection = new TypesCollection(namespace, config);
	namespace.typesCollections.set(typesCollection, typesCollection);
	
	const typesCollectionProxy = new Proxy(typesCollection, typesCollectionProxyHandler);
	
	namespace.typesCollections.set(typesCollectionProxy, typesCollection);
	
	if (association) {
		namespace.typesCollections.set(association, typesCollectionProxy);
	}

	return typesCollectionProxy;

};

const DEFAULT_TYPES = createTypesCollection(defaultNamespace, SymbolDefaultTypesCollection);

const fascade = {};

odp(fascade, 'createTypesCollection', {
	get () {
		return function (namespace, association, config) {
			return createTypesCollection(namespace, association, config);
		};
	},
	enumerable : true
});

odp(fascade, 'defaultTypes', {
	get () {
		return DEFAULT_TYPES;
	},
	enumerable : true
});

module.exports = fascade;
