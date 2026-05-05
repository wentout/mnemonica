'use strict';

import type { Hookable } from '../../types';

import { ErrorsTypes } from '../../descriptors/errors';
const {
	MISSING_CALLBACK_ARGUMENT,
	// FLOW_CHECKER_REDEFINITION,
} = ErrorsTypes;

export const flowCheckers = new WeakMap<Hookable, () => unknown>();
export const registerFlowChecker = function (this: Hookable, cb: () => unknown ) {

	if ( typeof cb !== 'function' ) {
		throw new MISSING_CALLBACK_ARGUMENT;
	}

	// if ( flowCheckers.has( this ) ) {
	// 	throw new FLOW_CHECKER_REDEFINITION;
	// }

	flowCheckers.set( this,
		cb );

};
