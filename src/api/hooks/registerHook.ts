'use strict';

import type {
	Hookable, hook
} from '../../types';

import { resolveHookType } from './hookTypes';

export const registerHook = function ( this: Hookable, name: string, cb: hook ) {

	const hookType = resolveHookType(
		name,
		cb
	);

	if ( !this.hooks[ hookType ] ) {
		this.hooks[ hookType ] = new Set( [ cb ] );
	} else {
		this.hooks[ hookType ].add( cb );
	}

};
