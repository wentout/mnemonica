'use strict';

// 1. init default namespace
// 2. create default namespace in types

const odp = Object.defineProperty;

const {
	SymbolConstructorName,
	SymbolDefaultNamespace,
	MNEMONICA,
	MNEMOSYNE,
} = require('../../constants');

const {
	NAMESPACE_DOES_NOT_EXIST
} = require('../../errors');

const {
	namespaces,
	[SymbolDefaultNamespace] : defaultNamespace
} = require('../namespaces');


const TypesCollection = function (namespace) {
	
	if (!namespaces.has(namespace.name)) {
		throw new NAMESPACE_DOES_NOT_EXIST;
	}
	
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

	
	namespace.typesCollections.add(this);
	
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
		};
	},
	enumerable : true
});

odp(TypesCollection.prototype, 'lookup', {
	get () {
		return function (...args) {
			return proto.lookup.call(this, ...args);
		};
	},
	enumerable : true
});

odp(TypesCollection.prototype, 'registerHook', {
	get () {
		return function (hookName, hookCallback) {
			return proto.registerHook.call(this, hookName, hookCallback);
		};
	},
	enumerable : true
});

odp(TypesCollection.prototype, 'invokeHook', {
	get () {
		return function (hookName, hookCallback) {
			return proto.invokeHook.call(this, hookName, hookCallback);
		};
	}
});

odp(TypesCollection.prototype, 'registerFlowChecker', {
	get () {
		return function (hookName, hookCallback) {
			return proto.registerFlowChecker.call(this, hookName, hookCallback);
		};
	}
});

odp(TypesCollection.prototype, MNEMONICA, {
	get () {
		return this;
	}
});


const DEFAULT_TYPES = new TypesCollection(defaultNamespace);

const fascade = {};

odp(fascade, 'createTypesCollection', {
	get () {
		return (namespace) => {
			return new TypesCollection(namespace);
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