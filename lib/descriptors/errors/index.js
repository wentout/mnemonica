'use strict';

const {
	ErrorMessages,
} = require('../../constants');

const {
	BASE_MNEMONICA_ERROR,
	constructError,
} = require('../../api/errors');

const ErrorsTypes = {
	BASE_MNEMONICA_ERROR
};

Object.entries(ErrorMessages).forEach(entry => {
	const [ErrorConstructorName, message] = entry;
	const ErrorConstructor = constructError(ErrorConstructorName, message);
	ErrorsTypes[ErrorConstructorName] = ErrorConstructor;
});

module.exports = ErrorsTypes;

