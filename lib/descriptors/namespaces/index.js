'use strict';

// 1. init default namespace
// 2. create default namespace in types

const odp = Object.defineProperty;

const {
	MNEMONICA,
	SymbolDefaultNamespace
} = require('../../constants');

// namespace storage
// name + namespace config
// future feature : path of namespace
// shortcut for ns of module exports
// inter-mediator
const namespaces = new Map();

const createNamespace = (name, descrtiption, opts) => {
	
	// TODO : Check all arguments !
	
	const namespace = Object.assign({
		descrtiption,
		path : null
	}, opts);
	
	odp(namespace, 'name', {
		get () {
			return name;
		},
		enumerable : true
	});
	
	namespaces.set(name, namespace);
	
	return namespace;
	
};

const DEFAULT_NAMESPACE = createNamespace(SymbolDefaultNamespace, `default ${MNEMONICA} namespace`);

const fascade = Object.create(null);

odp(fascade, 'createNamespace', {
	get () {
		return createNamespace;
	},
	enumerable : true
});

odp(fascade, 'namespaces', {
	get () {
		return namespaces;
	},
	enumerable : true
});

odp(fascade, SymbolDefaultNamespace, {
	get () {
		return DEFAULT_NAMESPACE;
	}
});


module.exports = fascade;