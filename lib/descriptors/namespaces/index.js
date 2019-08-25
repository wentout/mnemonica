'use strict';

// 1. init default namespace
// 2. create default namespace in types

const {
	odp,
	DEFAULT_NAMESPACE_NAME
} = require('../../const');

// namespace storage
// name + namespace config
// future feature : path of namespace
// shortcut for ns of module exports
// inter-mediator
const namespaces = {};

odp(namespaces, DEFAULT_NAMESPACE_NAME, {
	get () {
		return {
			descrtiption : 'default namespace',
			// memory only namespace
			path : null
		};
	}
});

const fascade = {
	DEFAULT_NAMESPACE_NAME,
};

odp(fascade, 'namespaces', {
	get () {
		return namespaces;
	}
});

odp(fascade, 'namespace', {
	get () {
		return namespaces[DEFAULT_NAMESPACE_NAME];
	}
});


module.exports = fascade;