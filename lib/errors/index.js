'use strict';

const {
	SymbolConstructorName,
	MNEMONICA,
	ErrorMessages,
} = require('../constants');


const BASE_MNEMONICA_ERROR = class ErrorConstructor extends Error {
	constructor (message = ErrorMessages.BASE_ERROR_MESSAGE) {
		super(message);
		const BaseStack = this.stack;
		Object.defineProperty(this, 'BaseStack', {
			get () {
				return BaseStack;
			}
		});
		const split = BaseStack.split('\n'); 
		this.stack = [split[0], ...split.slice(5)].join('\n');
	}
	static get [SymbolConstructorName] () {
		return `base of : ${MNEMONICA} : errors`;
	}
};

const ErrorsTypes = {
	BASE_MNEMONICA_ERROR
};

Object.entries(ErrorMessages).forEach(entry => {
	const [name, message] = entry;
	const body = `
		class ${name} extends base {
			constructor (addition) {
				super(addition ?
					\`${message} : $\{addition}\` :
					'${message}'
				);
			}
		};
		return ${name};
	`;
	
	const ErrorConstructor = (
		new Function('base', body)
	)(BASE_MNEMONICA_ERROR);
	
	ErrorsTypes[name] = ErrorConstructor;
});

module.exports = ErrorsTypes;

