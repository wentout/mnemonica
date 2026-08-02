'use strict';

// TODO :

// events
// handlers
// helpers
// loaders
// transforms

import {
	invokeHook,
	registerHook,
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
	registerFlowChecker,
};

export const types = {
	define,
	lazy,
	lookup,
};
