'use strict';

module.exports = [
	
	'namespaces',
	'types',
	
	// TODO :
	
	// ejects
	// events
	// handlers
	// helpers
	// hooks
	// loaders
	// transforms
	
].reduce((o, name) => {
	const api = require(`./${name}`);
	o[name] = api;
	return o;
}, {});