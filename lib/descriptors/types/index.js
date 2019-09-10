'use strict';

// 1. init default namespace
// 2. create default namespace in types

const odp = Object.defineProperty;

const {
	SymbolSubtypeCollection,
	SymbolConstructorName,
	MNEMONICA,
	MNEMOSYNE,
	DEFAULT_NAMESPACE_NAME
} = require('../../constants');

const types = {};

const defaultNamespaceTypes = {};

odp(defaultNamespaceTypes, SymbolSubtypeCollection, {
	get () {
		return MNEMONICA;
	}
});

odp(defaultNamespaceTypes, MNEMOSYNE, {
	get () {
		const InstanceChecker = {};
		odp(InstanceChecker, Symbol.hasInstance, {
			get () {
				return (instance) => {
					return instance[SymbolConstructorName] === MNEMOSYNE;
				};
			}
		});
		odp(InstanceChecker, 'subtypes', {
			get () {
				return defaultNamespaceTypes;
			}
		});
		return InstanceChecker;
	}
});

odp(types, DEFAULT_NAMESPACE_NAME, {
	get () {
		return defaultNamespaceTypes;
	}
});


const fascade = {};
odp(fascade, 'types', {
	get () {
		return types[DEFAULT_NAMESPACE_NAME];
	},
	enumerable : true
});

// TODO :  types storages for namespaces
// add Proxy for this, and : 
// 1. check if namespace exists
// 2. then add type for this namespace
// 3. think of what if namespace missing


module.exports = fascade;