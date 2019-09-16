'use strict';

// 1. init default namespace
// 2. create default namespace in types

const odp = Object.defineProperty;

const {
	SymbolConstructorName,
	SymbolDefaultNamespace,
	MNEMOSYNE,
} = require('../../constants');

const {
	NAMESPACE_DOES_NOT_EXIST
} = require('../../errors');

const {
	namespaces,
	[SymbolDefaultNamespace] : defaultNamespace
} = require('../namespaces');

const types = new WeakMap();

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
	
	types.set(namespace, this);
	
};

const api = require('../../api').types;
TypesCollection.prototype = api;

const DEFAULT_TYPES = new TypesCollection(defaultNamespace);

const fascade = {};

odp(fascade, 'definedTypesCollections', {
	get () {
		return types;
	},
	enumerable : true
});

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