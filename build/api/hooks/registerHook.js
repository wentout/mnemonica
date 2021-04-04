'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.registerHook = void 0;
const errors_1 = require('../../descriptors/errors');
const { WRONG_HOOK_TYPE, MISSING_HOOK_CALLBACK, } = errors_1.ErrorsTypes;
const hooksTypes = [
	'preCreation',
	'postCreation',
	'creationError',
];
const registerHook = function (hookType, cb) {
	if (!hooksTypes.includes(hookType)) {
		throw new WRONG_HOOK_TYPE;
	}
	if (typeof cb !== 'function') {
		throw new MISSING_HOOK_CALLBACK;
	}
	if (!this.hooks[hookType]) {
		this.hooks[hookType] = new Set([cb]);
	}
	else {
		this.hooks[hookType].add(cb);
	}
};
exports.registerHook = registerHook;
