'use strict';

const constants = require('../constants');
const {
	odp,
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
		const BaseStack = this.stack;
		odp(this, 'BaseStack', {
			get () {
				return BaseStack;
			}
		});
		const split = BaseStack.split('\n'); 
		this.stack = [split[0], ...split.slice(5)].join('\n');
	}
	static [SymbolConstructorName] () {
		return `base of : ${MNEMONICA} : errors`;
	}
};

Object.entries(ErrorMessages).forEach(entry => {
	const [name, message] = entry;
	const body = `
		class ${name} extends base {
			constructor (addition) {
				super('${message}');
				if (addition) {
					this.message += ' : ' + addition;
				}

			}
		};
		return ${name};
	`;
	
	const ErrorConstructor = (
		new Function('base', body)
	)(BaseMnemonicaError);
	
	defineErrorType(name, function (addition) {
		const error = new ErrorConstructor(addition);
		return error;
	});
});

module.exports = ErrorsTypes;
