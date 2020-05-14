'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const {
	WRONG_INSTANCE_INVOCATION
} = ErrorsTypes;

export const pick = ( instance: any, ...args: string[] ) => {

	// at this situation this check is enough
	if ( instance !== Object( instance ) ) {
		throw new WRONG_INSTANCE_INVOCATION;
	}

	const props = args.reduce( ( arr: string[], el: string | string[] ) => {
		if ( Array.isArray( el ) ) {
			arr.push( ...el );
		} else {
			arr.push( el );
		}
		return arr;
	}, [] );

	const picked = props.reduce( ( obj: { [ index: string ]: any }, name: string ) => {
		obj[ name ] = instance[ name ];
		return obj;
	}, {} );

	return picked;

};
