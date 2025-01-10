'use strict';

import { constants } from '../../constants';
const {
	MNEMONICA,
} = constants;

import { flowCheckers } from './flowCheckers';

import { hop } from '../../utils/hop';

export const invokeHook = function ( this: any, hookType: string, opts: { [ index: string ]: any } ) {

	const {
		type,
		existentInstance,
		inheritedInstance,
		args,
		// InstanceModificator,
		creator
	} = opts;

	const invocationResults = new Set();

	// eslint-disable-next-line @typescript-eslint/no-this-alias
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
			existentInstance : existentInstance.constructor.name === MNEMONICA ?
				null : existentInstance,
			args,
		};

		if ( typeof inheritedInstance === 'object' ) {
			Object.assign( hookArgs, {
				inheritedInstance,
				throwModificationError ( error: Error ) {
					creator.throwModificationError( error );
				}
			} );
		}

		// eslint-disable-next-line no-shadow
		this.hooks[ hookType ].forEach( ( hook: ( this: unknown, hookParams: typeof hookArgs ) => void ) => {
			const result = hook.call( self, hookArgs );
			invocationResults.add( result );
		} );

		const flowChecker = flowCheckers.get( this );
		if ( typeof flowChecker === 'function' ) {
			flowChecker
				.call( this, Object.assign( {}, {
					invocationResults,
					hookType,
				}, hookArgs ) );
		}

	}

	return invocationResults;

};
