'use strict';

// 1. init default namespace
// 2. create default namespace in types

const odp = Object.defineProperty;

const {
	SymbolConstructorName,
	SymbolDefaultNamespace,
	SymbolDefaultTypesCollection,
	MNEMONICA,
	MNEMOSYNE,
} = require('../../constants');

const {
	NAMESPACE_DOES_NOT_EXIST,
	ASSOCIATION_EXISTS,
} = require('../../descriptors/errors');

const {
	namespaces,
	[SymbolDefaultNamespace]: defaultNamespace
} = require('../namespaces');


const TypesCollection = function (namespace) {

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
		return function (hookName, hookCallback) {
			return proto.registerFlowChecker.call(this, hookName, hookCallback);
		}.bind(this);
	}
});

odp(TypesCollection.prototype, MNEMONICA, {
	get () {
		return this;
	}
});


const createTypesCollection = function (namespace = defaultNamespace, association) {

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
	
	const typesCollection = new TypesCollection(namespace);
	namespace.typesCollections.set(typesCollection, typesCollection);
	if (association) {
		namespace.typesCollections.set(association, typesCollection);
	}
	return typesCollection;
};

const DEFAULT_TYPES = createTypesCollection(defaultNamespace, SymbolDefaultTypesCollection);

const fascade = {};

odp(fascade, 'createTypesCollection', {
	get () {
		return function (...args) {
			return createTypesCollection.call(this, ...args);
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
