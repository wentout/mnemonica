'use strict';

module.exports = [
	
	'hooks',
	'types',
	
	// TODO :
	
	// events
	// handlers
	// helpers
	// loaders
	// transforms
	
].reduce((o, name) => {
	const api = require(`./${name}`);
	o[name] = api;
	return o;
}, {});