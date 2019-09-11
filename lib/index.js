'use strict';

const wrapThis = (method) => {
	return function (instance, ...args) {
		return method(instance || this, ...args);
	};
};

const fascade = {};
Object.entries({
	
	define : require('./api').types.define,
	
	errors : { ...require('./errors') },
	
	...require('./constants'),
	
	...require('./descriptors'),
	
	utils : {
		
		...Object.entries({
			
			...require('./utils')
			
		}).reduce((utils, util) => {
			const [name, fn] = util;
			utils[name] = wrapThis(fn);
			return utils;
		}, {}),
		
	},

}).forEach((entry) => {
	const [name, code] = entry;
	Object.defineProperty(fascade, name, {
		get () {
			return code;
		},
		enumerable : true
	});
});

// console.log(Object.keys(fascade));

module.exports = fascade;