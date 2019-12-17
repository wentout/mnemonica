'use strict';

const {
	WRONG_HOOK_TYPE,
	MISSING_HOOK_CALLBACK,
} = require('../../descriptors/errors');


const hooksTypes = [
	'preCreation',
	'postCreation',
];

module.exports = function (hookType, cb) {
	
	if (!hooksTypes.includes(hookType)) {
		throw new WRONG_HOOK_TYPE;
	}
	
	if (typeof cb !== 'function') {
		throw new MISSING_HOOK_CALLBACK;
	}
	
	if (!this.hooks[hookType]) {
		this.hooks[hookType] = new Set([cb]);
	} else {
		this.hooks[hookType].add(cb);
	}
	
};
