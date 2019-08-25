'use strict';

// 1. init default namespace
// 2. create default namespace in types

const {
	odp,
	DEFAULT_NAMESPACE_NAME
} = require('../../const');

const types = {};

const defaultNamespaceTypes = {};

odp(types, DEFAULT_NAMESPACE_NAME, {
	get () {
		return defaultNamespaceTypes;
	}
});


const fascade = {};
odp(fascade, 'types', {
	get () {
		return types[DEFAULT_NAMESPACE_NAME];
	}
});

// TODO :  types storages for namespaces
// add Proxy for this, and : 
// 1. check if namespace exists
// 2. then add type for this namespace
// 3. think of what if namespace missing


module.exports = fascade;