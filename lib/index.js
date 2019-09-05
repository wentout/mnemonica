'use strict';

const odp = Object.defineProperty;


const {
	// namespaces,
	// namespace,
	types,
} = require('./descriptors');

const {
	extract,
	toJSON
} = require('./utils');


const {
	DEFAULT_NAMESPACE_NAME,
	MNEMONICA,
	SymbolSubtypeCollection,
	SymbolConstructorName,
} = require('./constants');

const {
	define,
	collectConstructors
} = require('./api').types;

const fascade = {};

// export default types
odp(fascade, 'types', {
	get () {
		// TODO : statistics for each access
		return types;
	},
	enumerable : true
});

odp(fascade, 'define', {
	get () {
		return define;
	}
});

odp(fascade, 'collectConstructors', {
	get () {
		return collectConstructors;
	}
});

odp(fascade, 'DEFAULT_NAMESPACE_NAME', {
	get () {
		return DEFAULT_NAMESPACE_NAME;
	}
});
odp(fascade, 'MNEMONICA', {
	get () {
		return MNEMONICA;
	}
});
odp(fascade, 'SymbolSubtypeCollection', {
	get () {
		return SymbolSubtypeCollection;
	}
});
odp(fascade, 'SymbolConstructorName', {
	get () {
		return SymbolConstructorName;
	}
});


odp(fascade, 'extract', {
	get () {
		return function (instance) {
			if (!instance) {
				instance = this;
			}
			return extract(instance);
		};
	}
});
odp(fascade, 'toJSON', {
	get () {
		return function (instance) {
			if (!instance) {
				instance = this;
			}
			return toJSON(instance);
		};
	}
});


module.exports = fascade;

