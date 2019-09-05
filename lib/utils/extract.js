'use strict';

const {
	WRONG_MODIFICATION_PATTERN,
} = require('../errors');

module.exports = (instance) => {
	if (!instance) {
		throw new WRONG_MODIFICATION_PATTERN;
	}
	const extracted = {};
	for (const name in instance) {
		extracted[name] = instance[name];
	}
	return extracted;
};