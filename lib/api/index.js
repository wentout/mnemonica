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
	o[name] = require(`./${name}`);
	return o;
}, {});