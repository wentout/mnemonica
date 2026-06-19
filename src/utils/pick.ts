'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const { WRONG_INSTANCE_INVOCATION } = ErrorsTypes;

export function pick <T extends object, K extends keyof T> (
	instance: T,
	...args: (K | K[])[]
): { [P in K]: T[P] } & {};
export function pick <T extends object> (
	instance: T,
	...args: (string | string[])[]
): Record<string, unknown>;
export function pick ( instance: object, ...args: (string | string[])[] ) {

	// at this situation this check is enough
	if ( instance !== Object( instance ) ) {
		throw new WRONG_INSTANCE_INVOCATION;
	}

	const props = args.reduce(
		( arr: string[], el: string | string[] ) => {
			if ( Array.isArray( el ) ) {
				arr.push( ...el );
			} else {
				arr.push( el );
			}
			return arr;
		},
		[] 
	);

	const record = instance as Record<string, unknown>;
	const picked = props.reduce(
		( obj: { [ index: string ]: unknown }, name: string ) => {
			obj[ name ] = record[ name ];
			return obj;
		},
		{} 
	);

	return picked;

}
