'use strict';

const {
	SymbolConstructorName,
	MNEMONICA,
	ErrorMessages : {
		BASE_ERROR_MESSAGE
	},
} = require('../../constants');

class BASE_MNEMONICA_ERROR extends Error {
	constructor (message = BASE_ERROR_MESSAGE, stack) {
		super(message);
		const BaseStack = this.stack;
		Object.defineProperty(this, 'BaseStack', {
			get () {
				return BaseStack;
			}
		});
		const split = BaseStack.split('\n');
		this.stack = [split[0], ...split.slice(5)].join('\n');
		if (stack) {
			this.stack = stack + this.stack;
		}
	}
	static get [SymbolConstructorName] () {
		return `base of : ${MNEMONICA} : errors`;
	}
}

const constructError = (name, message) => {
	const body = `
		class ${name} extends base {
			constructor (addition, stack) {
				super(addition ?
					\`${message} : $\{addition}\` :
					'${message}',
					stack
				);
			}
		};
		return ${name};
	`;

	const ErrorConstructor = (
		new Function('base', body)
	)(BASE_MNEMONICA_ERROR);

	return ErrorConstructor;
};

module.exports = {
	BASE_MNEMONICA_ERROR,
	constructError
};

