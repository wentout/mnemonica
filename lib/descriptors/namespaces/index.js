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

const Namespace = function (name, descrtiption, opts) {
	
	// TODO : Check all arguments !
	
	Object.assign(this, {
		descrtiption,
		path : null
	}, opts);
	
	odp(this, 'name', {
		get () {
			return name;
		},
		enumerable : true
	});
	
	const hooks = Object.create(null);
	odp(this, 'hooks', {
		get () {
			return hooks;
		}
	});
	
	namespaces.set(name, this);
	
};

Namespace.prototype = require('../../api/hooks');

const DEFAULT_NAMESPACE = new Namespace(SymbolDefaultNamespace, `default ${MNEMONICA} namespace`);

const fascade = Object.create(null);

odp(fascade, 'createNamespace', {
	get () {
		return (...args) => {
			return new Namespace(...args);
		};
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