'use strict';

const collectConstructors = require('./collectConstructors');

const utils = {

	extract : require('./extract'),
	parent  : require('./parent'),
	pick    : require('./pick'),
	toJSON  : require('./toJSON'),
	
	parse : require('./parse'),
	merge : require('./merge'),

	get collectConstructors () {
		return collectConstructors;
	}

};

module.exports = utils;
