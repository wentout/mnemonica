'use strict';

const {
	WRONG_INSTANCE_INVOCATION
} = require('../errors');

module.exports = (instance) => {
	
	if (instance !== Object(instance)) {
		throw new WRONG_INSTANCE_INVOCATION;
	}
	
	const extracted = {};
	
	for (const name in instance) {
		if (name === 'constructor' && !instance.hasOwnProperty(name)) {
			continue;
		}
		extracted[name] = instance[name];
	}
	
	return extracted;
	
};
