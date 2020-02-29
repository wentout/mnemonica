'use strict';

const path = require('path');

module.exports = [
	
	'hooks',
	'types',
	'errors',
	
	// TODO :
	
	// events
	// handlers
	// helpers
	// loaders
	// transforms
	
].reduce((o, name) => {
	const fileName = `./${name}/index`;
	const filePath = path.resolve('./lib/api/', fileName);
	const api = require(filePath);
	o[name] = api;
	return o;
}, {});
