'use strict';

const {
	WRONG_INSTANCE_INVOCATION
} = require('../errors');

module.exports = (instance) => {
	if (!instance) {
		throw new WRONG_INSTANCE_INVOCATION;
	}
	const extracted = {};
	for (const name in instance) {
		extracted[name] = instance[name];
	}
	return extracted;
};