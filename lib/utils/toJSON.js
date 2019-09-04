'use strict';

const extract = require('./extract');
module.exports = function (instance) {
	const extracted = extract(instance);
	return JSON.stringify(extracted);
};