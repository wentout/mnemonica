'use strict';

const collectConstructors = require('./collectConstructors');

const utils = {
	extract : require('./extract'),
	toJSON : require('./toJSON'),
	parse : require('./parse'),
	get collectConstructors () {
		return collectConstructors;
	}
};

module.exports = utils;
