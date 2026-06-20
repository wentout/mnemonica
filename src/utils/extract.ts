'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const { WRONG_INSTANCE_INVOCATION } = ErrorsTypes;

import type { Extracted } from '../types';

// import { hop } from './hop';

export const extract = <T extends object>( instance: T ): Extracted<T> => {

	// at this situation this check is enough
	if ( instance !== Object( instance ) ) {
		throw new WRONG_INSTANCE_INVOCATION;
	}

	const extracted: { [ index: string ]: unknown } = {};

	for ( const name in instance ) {
		// if ( name === 'constructor' && !hop( instance, name ) ) {
		// 	continue;
		// }
		// if (name === 'timestamp') {
		// 	continue;
		// }

		extracted[ name ] = ( instance as Record<string, unknown> )[ name ];
	}

	const result = extracted as Extracted<T>;
	return result;

};
