'use strict';

import exceptionConstructor from '../api/errors/exceptionConstructor';

export const exception = (instance: object) => {

	const result = function (error: Error, ...args: unknown[]) {
		const target = new.target;
		const exceptionResult = exceptionConstructor.call(
			instance,
			target,
			error,
			...args
		);
		return exceptionResult;
	};
	return result;

};
