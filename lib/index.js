'use strict';

const odp = Object.defineProperty;


const {
	namespaces,
	namespace,
	types,
} = require('./descriptors');

const {
	extract,
	toJSON,
	collectConstructors
} = require('./utils');


const {
	DEFAULT_NAMESPACE_NAME,
	MNEMONICA,
	MNEMOSYNE,
	SymbolSubtypeCollection,
	SymbolConstructorName,
	ErrorMessages,
} = require('./constants');

const errors = require('./errors');

const {
	define
} = require('./api').types;

const fascade = {};

odp(fascade, 'types', {
	get () {
		return types;
	},
	enumerable : true
});
odp(fascade, 'namespace', {
	get () {
		return namespace;
	},
	enumerable : true
});
odp(fascade, 'namespaces', {
	get () {
		return namespaces;
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
odp(fascade, 'MNEMOSYNE', {
	get () {
		return MNEMOSYNE;
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

odp(fascade, 'errors', {
	get () {
		return errors;
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
odp(fascade, 'ErrorMessages', {
	get () {
		return ErrorMessages;
	}
});

module.exports = fascade;

