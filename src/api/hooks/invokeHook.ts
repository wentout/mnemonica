'use strict';

import type { hooksOpts, Hookable } from '../../types';

import { flowCheckers } from './flowCheckers';

import { hop } from '../../utils/hop';

export const invokeHook = function ( this: Hookable, hookType: string, opts: hooksOpts ) {

	const {
		type,
		existentInstance,
		inheritedInstance,
		args,
		// InstanceModificator,
		creator
	} = opts;

	const invocationResults = new Set();

	 
	const self = this;

	if ( hop( self.hooks, hookType ) ) {

		// "this" referes to
		// type, if called from types

		const {
			TypeName,
			// parentType,
		} = type;

		const hookArgs = {
			type,
			TypeName,
			existentInstance,
			args,
		};

		if ( typeof inheritedInstance === 'object' ) {
			Object.assign( hookArgs, {
				inheritedInstance,
				throwModificationError ( error: Error ) {
					creator!.throwModificationError( error );
				}
			} );
		}

		 
		this.hooks[ hookType ].forEach( ( hook: CallableFunction ) => {
			const result = (hook as Function).call( self, hookArgs );
			invocationResults.add( result );
		} );

		const flowChecker = flowCheckers.get( this );
		if ( typeof flowChecker === 'function' ) {
			(flowChecker as Function)
				.call( this, Object.assign( {}, {
					invocationResults,
					hookType,
				}, hookArgs ) );
		}

	}

	return invocationResults;

};
