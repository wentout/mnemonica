'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.types = exports.hooks = exports.errors = void 0;
const hooks_1 = require('./hooks');
const types_1 = require('./types');
exports.errors = require('./errors');
exports.hooks = {
	invokeHook          : hooks_1.invokeHook,
	registerHook        : hooks_1.registerHook,
	registerFlowChecker : hooks_1.registerFlowChecker,
};
exports.types = {
	define : types_1.define,
	lookup : types_1.lookup,
};
