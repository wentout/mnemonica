'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const { WRONG_ARGUMENTS_USED } = ErrorsTypes;
import { fork } from './fork';
import { getProps } from '../api/types/Props';
import type {
	Merge,
	InstanceResult,
} from '../types';

export const merge = <A extends object, B extends object>(
	a: A,
	b: B,
	...args: unknown[]
): InstanceResult<Merge<B, A>> => {

	// at this situation this check is enough
	if ( a !== Object( a ) ) {
		throw new WRONG_ARGUMENTS_USED( 'A should be an object' );
	}

	// at this situation this check is enough
	if ( b !== Object( b ) ) {
		throw new WRONG_ARGUMENTS_USED( 'B should be an object' );
	}

	const props = getProps(a);
	if (props === undefined) {
		throw new WRONG_ARGUMENTS_USED('A should be a mnemonica instance');
	}

	const forked = fork(a);
	const aa = forked.call(
		b,
		...args 
	);
	const result = aa as InstanceResult<Merge<B, A>>;
	return result;

};
