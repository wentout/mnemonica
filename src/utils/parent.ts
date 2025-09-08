'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const {
	WRONG_INSTANCE_INVOCATION
} = ErrorsTypes;

import { _getProps, Props } from '../api/types/Props';

// seek for firts parent instance
// of instance prototype chain
// with constructors of path
export const parent = ( instance: any, path: string ): any => {

	// at this situation this check is enough
	if ( instance !== Object( instance ) ) {
		throw new WRONG_INSTANCE_INVOCATION;
	}

	const props = _getProps(instance) as Props;

	if ( !props ) {
		return;
	}

	const {
		__parent__: p
	} = props;

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
