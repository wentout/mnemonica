'use strict';

import { ErrorsTypes } from '../descriptors/errors';
import { stackCleaners } from '../api/errors';

const {
	WRONG_STACK_CLEANER
} = ErrorsTypes;

export const defineStackCleaner = (regexp:RegExp) => {
	if ( !( regexp instanceof RegExp ) ) {
		throw new WRONG_STACK_CLEANER;
	}
	stackCleaners.push( regexp );
};
