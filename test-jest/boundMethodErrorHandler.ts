'use strict';

const mnemonica = require('../src/index');
const { getProps } = mnemonica;

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

export const boundMethodErrorHandler = function (exceptionReason: ExceptionReason) {
	const {
		methodName,
		args,
		applyTo,
		instance,
		from,
		error
	} = exceptionReason;

	const ExceptionConstructor = instance.exception;
	const props = getProps(instance);
	const { __type__ } = props;

	if (ExceptionConstructor) {
		try {
			const reThrowing = new ExceptionConstructor(error, ...args);
			return reThrowing;
		} catch (error) {
			// If exception creation fails, return the original error
			return error;
		}
	}
	return error;
};
