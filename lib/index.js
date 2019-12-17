'use strict';

const wrapThis = (method) => {
	return function (instance, ...args) {
		return method(instance !== undefined ? instance : this, ...args);
	};
};

const
	constants = require('./constants'),
	descriptors = require('./descriptors'),
	{
		defaultTypes
	} = descriptors;


const utils = {

	...Object.entries({

		...require('./utils')

	}).reduce((methods, util) => {
		const [name, fn] = util;
		methods[name] = wrapThis(fn);
		return methods;
	}, {}),

};

const define = function (...args) {
	const types = this || defaultTypes;
	return types.define(...args);
};

const lookup = function (...args) {
	const types = this || defaultTypes;
	return types.lookup(...args);
};

const fascade = {};

Object.entries({

	errors : { ...require('./descriptors/errors') },

	...constants,

	...descriptors,

	utils,

	define,
	lookup

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
