'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const {
	WRONG_INSTANCE_INVOCATION
} = ErrorsTypes;

import { hop } from './hop';

export const extract = ( instance: any ) => {

	// at this situation this check is enough
	if ( instance !== Object( instance ) ) {
		throw new WRONG_INSTANCE_INVOCATION;
	}

	const extracted: { [ index: string ]: any } = {};

	for ( const name in instance ) {
		if ( name === 'constructor' && !hop( instance, name ) ) {
			continue;
		}
		// if (name === 'timestamp') {
		// 	continue;
		// }

		extracted[ name ] = instance[ name ];
	}

	return extracted;

};
