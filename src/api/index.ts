'use strict';

import {
	invokeHook,
	registerHook,
	unregisterHook,
	registerFlowChecker,
} from './hooks';
import {
	define,
	lazy,
	lookup,
} from './types';

export * as errors from './errors';

export const hooks = {
	invokeHook,
	registerHook,
	unregisterHook,
	registerFlowChecker,
};

export const types = {
	define,
	lazy,
	lookup,
};
