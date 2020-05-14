'use strict';

// 1. init default namespace
// 2. create default namespace in types

import { ErrorsTypes } from './errors';
import { namespaces } from './namespaces';
import { types } from './types';

export const descriptors = {

	// namespaces.createNamespace,
	// namespaces.defaultNamespace,
	// namespaces.SymbolDefaultNamespace,
	// namespaces.defaultOptionsKeys,
	// namespaces.namespaces,
	...namespaces,

	// types.defaultTypes,
	// types.createTypesCollection,
	...types,

	ErrorsTypes

};
