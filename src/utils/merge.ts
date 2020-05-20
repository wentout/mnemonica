'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const {
	WRONG_ARGUMENTS_USED
} = ErrorsTypes;

export const merge = ( a: any, b: any, ...args: any[] ) => {

	// at this situation this check is enough
	if ( a !== Object( a ) ) {
		throw new WRONG_ARGUMENTS_USED( 'A should be an object' );
	}

	// at this situation this check is enough
	if ( b !== Object( b ) ) {
		throw new WRONG_ARGUMENTS_USED( 'B should be an object' );
	}

	if ( typeof a.fork !== 'function' ) {
		throw new WRONG_ARGUMENTS_USED( 'A should have A.fork()' );
	}

	const aa = a.fork.call( b, ...args );
	return aa;

};
