'use strict';

import exceptionConstructor from '../api/errors/exceptionConstructor';

export const exception = function (instance: object, error: Error, ...args: unknown[]) {

	const target = new.target;
	const exceptionResult = exceptionConstructor.call(
		instance,
		target,
		error,
		...args
	);
	return exceptionResult;

};
