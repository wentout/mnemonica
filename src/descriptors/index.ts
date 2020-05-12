'use strict';

// 1. init default namespace
// 2. create default namespace in types

import { ErrorsTypes } from './errors';

import { namespaces } from './namespaces';
import { types } from './types';

const fascade = {

	...namespaces,

	...types,

	errors: {
		...ErrorsTypes
	},

};

export default {
	...fascade
};
