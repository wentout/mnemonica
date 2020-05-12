'use strict';

import { ErrorsTypes } from '../../descriptors/errors';
const {
	WRONG_HOOK_TYPE,
	MISSING_HOOK_CALLBACK,
} = ErrorsTypes;

const hooksTypes = [
	'preCreation',
	'postCreation',
	'creationError',
];

export const registerHook = function (this:any, hookType:string, cb:Function) {
	
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
