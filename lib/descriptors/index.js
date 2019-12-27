'use strict';

// 1. init default namespace
// 2. create default namespace in types

const fascade = {
	
	...require('./namespaces'),
	
	...require('./types'),
	
	errors : {
		...require('./errors')
	},
	
};

module.exports = {
	...fascade
};
