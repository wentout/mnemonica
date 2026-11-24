'use strict';

import type {
	Hookable, hook
} from '../../types';

import { resolveHookType } from './hookTypes';

// true when the callback was registered; an unknown callback is not an error.
// The exact callback is removed: a Set holds it by reference.
export const unregisterHook = function ( this: Hookable, name: string, cb: hook ): boolean {

	const hookType = resolveHookType(
		name,
		cb
	);

	const callbacks = this.hooks[ hookType ];
	if ( callbacks === undefined ) {
		return false;
	}

	const removed = callbacks.delete( cb );

	// the last one out: an empty entry would still run the flow checker
	// on every construction (see invokeHook)
	if ( callbacks.size === 0 ) {
		Reflect.deleteProperty(
			this.hooks,
			hookType
		);
	}

	return removed;

};
