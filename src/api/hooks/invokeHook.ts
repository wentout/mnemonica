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
		args
	} = opts;

	const invocationResults = new Set();

	const self = this;

	if ( hop( self.hooks, hookType ) ) {

		// "this" referes to
		// namespace, if called from namespaces
		// type, if called from types

		const {
			TypeName,
			// parentType,
		} = type;

		const hookArgs = {
			type,
			TypeName,
			existentInstance: existentInstance.constructor.name === MNEMONICA ?
				null : existentInstance,
			args,
		};

		inheritedInstance && Object.assign( hookArgs, {
			inheritedInstance
		} );

		this.hooks[ hookType ].forEach( ( hook: Function ) => {
			const result = hook.call( self, hookArgs );
			invocationResults.add( result );
		} );

		const flowChecker = flowCheckers.get( this );
		( typeof flowChecker === 'function' ) && flowChecker
			.call( this, Object.assign( {}, {
				invocationResults,
				hookType,
			}, hookArgs ) );

	}

	return invocationResults;

};
