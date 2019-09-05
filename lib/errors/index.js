'use strict';

const constants = require('../constants');
const {
	SymbolConstructorName,
	MNEMONICA,
	ErrorMessages,
} = constants;

const {
	define
} = require('../api/types');

const ErrorsTypes = {};

const defineErrorType = define.bind(ErrorsTypes);

const BaseMnemonicaError = class ErrorConstructor extends Error {
	constructor (message) {
		super(message);
	}
	static [SymbolConstructorName] () {
		return `base of : ${MNEMONICA} : errors`;
	}
};

Object.entries(ErrorMessages).forEach(entry => {
	const [name, message] = entry;
	const body = `
		class ${name} extends base {
			constructor () {
				super('${message}');
			}
		};
	`;
	const ErrorConstructor = new Function('base', body);
	
	defineErrorType(name, ErrorConstructor(BaseMnemonicaError));
});

module.exports = ErrorsTypes;
