'use strict';

// 1. init default namespace
// 2. create default namespace in types

const odp = Object.defineProperty;

const {
	MNEMONICA,
	SymbolDefaultNamespace
} = require('../../constants');

const {
	OPTIONS_ERROR,
} = require('../../descriptors/errors');

const defaultOptions = {
	
	// explicit declaration we wish use
	// an old style based constructors
	// e.g. with prototype described with:
	//    createInstanceModificator200XthWay
	// or more general with: createInstanceModificator
	useOldStyle : false,
	
	// shall or not we use strict checking
	// for creation sub-instances Only from current type
	// or we might use up-nested sub-instances from chain
	strictChain : true
	
};

// namespace storage
// name + namespace config
// future feature : path of namespace
// shortcut for ns of module exports
// inter-mediator
const namespaces = new Map();

const Namespace = function (name, config = {}) {

	if (typeof config === 'string') {
		config = {
			description : config
		};
	}

	if (!(config instanceof Object)) {
		throw new OPTIONS_ERROR;
	}

	const typesCollections = new Map();

	this.config = Object.assign({}, defaultOptions, config);

	odp(this, 'name', {
		get () {
			return name;
		},
		enumerable : true
	});

	odp(this, 'typesCollections', {
		get () {
			return typesCollections;
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

Namespace.prototype = {
	createTypesCollection (association, config) {
		const {
			createTypesCollection
		} = require('../types');
		return createTypesCollection(this, association, config);
	},
	...require('../../api/hooks')
};

const DEFAULT_NAMESPACE = new Namespace(SymbolDefaultNamespace, {
	description : `default ${MNEMONICA} namespace`
});

const fascade = Object.create(null);

odp(fascade, 'createNamespace', {
	get () {
		return (name, config) => {
			return new Namespace(name, config);
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

odp(fascade, 'defaultNamespace', {
	get () {
		return DEFAULT_NAMESPACE;
	},
	enumerable : true
});

odp(fascade, SymbolDefaultNamespace, {
	get () {
		return DEFAULT_NAMESPACE;
	}
});

odp(fascade, 'defaultOptionsKeys', {
	get () {
		return Object.keys(defaultOptions);
	}
});

module.exports = fascade;
