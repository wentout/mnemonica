'use strict';

// 1. init default namespace
// 2. create default namespace in types

const {
	odp,
	DEFAULT_NAMESPACE_NAME
} = require('../constants');

const fascade = {
	DEFAULT_NAMESPACE_NAME,
};

const {
	namespaces,
	namespace
} = require('./namespaces');

const {
	types
} = require('./types');

odp(fascade, 'namespaces', {
	get () {
		return namespaces;
	}
});

odp(fascade, 'namespace', {
	get () {
		return namespace;
	}
});

odp(fascade, 'types', {
	get () {
		return types;
	}
});


module.exports = fascade;