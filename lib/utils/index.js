'use strict';

const collectConstructors = require('./collectConstructors');

const utils = {

	extract: require('./extract'),
	pick: require('./pick'),

	toJSON: require('./toJSON'),

	parse: require('./parse'),

	get collectConstructors() {
		return collectConstructors;
	}

};

module.exports = utils;
