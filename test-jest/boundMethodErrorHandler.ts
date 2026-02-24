'use strict';

export interface ExceptionReason {
	methodName: string;
	args: unknown[];
	applyTo: unknown;
	instance: Record<string, unknown> & {
		exception?: new (...args: unknown[]) => Error;
	};
	from: unknown;
	error?: Error;
}

export const boundMethodErrorHandler = function (exceptionReason: ExceptionReason): Error | undefined {
	const {
		methodName: _methodName,
		args,
		applyTo: _applyTo,
		instance,
		from: _from,
		error
	} = exceptionReason;

	const ExceptionConstructor = instance.exception;

	if (ExceptionConstructor) {
		try {
			const reThrowing = new ExceptionConstructor(error, ...args);
			return reThrowing;
		} catch (caughtError: unknown) {
			// If exception creation fails, return the original error
			return caughtError instanceof Error ? caughtError : error;
		}
	}
	return error;
};
