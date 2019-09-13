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

const createTypesCollection = (namespace) => {
	
	if (!namespaces.has(namespace.name)) {
		throw new NAMESPACE_DOES_NOT_EXIST;
	}
	
	const namespaceTypes = {};
	
	odp(namespaceTypes, Symbol.hasInstance, {
		get () {
			return (instance) => {
				return instance[SymbolConstructorName] === namespace.name;
			};
		}
	});
	
	odp(namespaceTypes, 'subtypes', {
		get () {
			return namespaceTypes;
		}
	});
	
	odp(namespaceTypes, MNEMOSYNE, {
		get () {
			return namespaceTypes;
		}
	});
	
	odp(namespaceTypes, 'namespace', {
		get () {
			return namespace;
		}
	});
	
	types.set(namespace, namespaceTypes);
	
	return namespaceTypes;
	
};

const DEFAULT_TYPES = createTypesCollection(defaultNamespace);

const fascade = {};

odp(fascade, 'definedTypesCollections', {
	get () {
		return types;
	},
	enumerable : true
});

odp(fascade, 'createTypesCollection', {
	get () {
		return createTypesCollection;
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