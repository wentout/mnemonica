'use strict';

const mnemonica = require('../src/index');
const { getProps } = mnemonica;

export const boundMethodErrorHandler = function (exceptionReason: any) {
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
