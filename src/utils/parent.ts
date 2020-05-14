'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const {
	WRONG_INSTANCE_INVOCATION
} = ErrorsTypes;

// seek for firts parent instance
// of instance prototype chain
// with constructors of path
export const parent = ( instance: any, path: string ): any => {

	// at this situation this check is enough
	if ( instance !== Object( instance ) ) {
		throw new WRONG_INSTANCE_INVOCATION;
	}

	const {
		__parent__: p
	} = instance;

	if ( !p ) {
		return;
	}

	if ( !path ) {
		return p;
	}

	const {
		constructor: {
			name
		}
	} = p;

	// seek throuh parent instances
	// about the fist constructor with this name
	return name === path ?
		p : parent( p, path );

};
