'use strict';

import { ErrorsTypes } from '../../descriptors/errors';
const {
	MISSING_CALLBACK_ARGUMENT,
	FLOW_CHECKER_REDEFINITION,
} = ErrorsTypes;

export const flowCheckers = new WeakMap();
export const registerFlowChecker = function (this:any, cb: Function ) {

	if ( typeof cb !== 'function' ) {
		throw new MISSING_CALLBACK_ARGUMENT;
	}

	if ( flowCheckers.has( this ) ) {
		throw new FLOW_CHECKER_REDEFINITION;
	}

	flowCheckers.set( this, cb );

};
