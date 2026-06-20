'use strict';

import { parent } from './parent';

// Runtime delegate for parentTyped. The type-level path validation and
// return-type inference live in UtilsCollection in src/types/index.ts.
export const parentTyped = function <T extends object, P extends string> (
	instance: T,
	path: P
): object | undefined {
	const result = parent(instance, path);
	return result;
};
