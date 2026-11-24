'use strict';

import type { hooksTypes } from '../../types';

import { ErrorsTypes } from '../../descriptors/errors';
const {
	WRONG_HOOK_TYPE,
	MISSING_HOOK_CALLBACK,
} = ErrorsTypes;

// the full names and their short forms; a Map, so that no inherited
// property name passes for a hook name
const hookTypes = new Map<string, hooksTypes>( [
	[ 'preCreation', 'preCreation' ],
	[ 'postCreation', 'postCreation' ],
	[ 'creationError', 'creationError' ],
	[ 'pre', 'preCreation' ],
	[ 'post', 'postCreation' ],
	[ 'error', 'creationError' ],
] );

// The checks registerHook and unregisterHook share: which hook type the given
// name means, and that there is a callback.
export const resolveHookType = function ( name: string, cb: unknown ): hooksTypes {

	const hookType = hookTypes.get( name );

	if ( hookType === undefined ) {
		throw new WRONG_HOOK_TYPE;
	}

	if ( typeof cb !== 'function' ) {
		throw new MISSING_HOOK_CALLBACK;
	}

	return hookType;
};
