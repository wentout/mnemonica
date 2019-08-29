'use strict';

const odp = Object.defineProperty;


const {
	// DEFAULT_NAMESPACE_NAME,
	// namespaces,
	// namespace,
	types,
} = require('./lib/descriptors');

const {
	define,
	// SymbolConstructorName,
	collectConstructors
} = require('./lib/api').types;

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


module.exports = fascade;

