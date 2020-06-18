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

		if ( typeof inheritedInstance === 'object' ) {
			Object.assign( hookArgs, {
				inheritedInstance,
				bindMethod (name: string, method: CallableFunction) {
					creator.bindMethod(inheritedInstance, name, method);
				},
				bindProtoMethods () {
					creator.bindProtoMethods();
				},
				throwModificationError ( error: Error ) {
					creator.throwModificationError( error );
				}
			} );
		}

		this.hooks[ hookType ].forEach( ( hook: ( this: any, hookParams: typeof hookArgs ) => void ) => {
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
