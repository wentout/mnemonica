'use strict';

import type {
	hooksOpts, Hookable, HookFunction 
} from '../../types';

import { flowCheckers } from './flowCheckers';
import { HookInvocation } from './HookInvocation';

import { hop } from '../../utils/hop';

export const invokeHook = function ( this: Hookable, hookType: string, opts: hooksOpts ) {

	const {
		type,
		existentInstance,
		inheritedInstance,
		args,
		creator
	} = opts;

	const invocationResults = new Set<unknown>();

	const self = this;

	if ( hop(
		self.hooks,
		hookType 
	) ) {

		const builder = new HookInvocation(
			type,
			existentInstance,
			args
		);

		if ( typeof inheritedInstance === 'object' ) {
			builder.withInheritedInstance( inheritedInstance );
		}
		if ( creator ) {
			builder.withCreator( creator );
		}

		const hookArgs = builder.build();

		self.hooks[ hookType ].forEach( ( hook: HookFunction ) => {
			const result = hook.call(
				self,
				hookArgs
			);
			invocationResults.add( result );
		} );

		const flowChecker = flowCheckers.get( this );
		if ( typeof flowChecker === 'function' ) {
			(flowChecker as unknown as (opts: object) => unknown)({
				...hookArgs,
				invocationResults,
				hookType,
			});
		}

	}

	return invocationResults;

};
