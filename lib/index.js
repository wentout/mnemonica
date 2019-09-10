'use strict';

const wrapThis = (method) => {
	return function (instance, ...args) {
		if (!instance) {
			instance = this;
		}
		return method(instance, ...args);
	};
};

const fascade = Object.entries({
	
	define : require('./api').types.define,
	
	errors : { ...require('./errors') },
	
	...require('./constants'),
	
	...require('./descriptors'),
	
	...Object.entries({
		
		...require('./utils')
		
	}).reduce((utils, util) => {
		const [name, fn] = util;
		utils[name] = wrapThis(fn);
		return utils;
	}, {}),

}).reduce((fascade, entry) => {
	const [name, code] = entry;
	Object.defineProperty(fascade, name, {
		get () {
			return code;
		},
		enumerable : true
	});
	return fascade;
}, {});

// console.log(Object.keys(fascade));

module.exports = fascade;