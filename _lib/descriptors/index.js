'use strict';

// 1. init default namespace
// 2. create default namespace in types


const ErrorsTypes = require('./errors');

const fascade = {
	
	...require('./namespaces'),
	
	...require('./types'),
	
	errors : {
		...ErrorsTypes
	},
	
};

module.exports = {
	...fascade
};
