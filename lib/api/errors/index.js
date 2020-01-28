'use strict';

const {
	SymbolConstructorName,
	MNEMONICA,
	ErrorMessages : {
		BASE_ERROR_MESSAGE
	},
} = require('../../constants');

const dirname = require('path').resolve(__dirname, '../');

const cleanupStack = (stack) => {
	return stack.reduce((arr, line) => {
		if (line.indexOf(dirname) < 0) {
			arr.push(line);
		}
		return arr;
	}, []);
};

const getStack = (title, stackAddition) => {

	let {
		stack
	} = (new Error);

	stack = stack.split('\n').slice(1);

	stack.unshift(title);
	stackAddition && stack.push(...stackAddition);
	stack.push('\n');

	return cleanupStack(stack);

};

class BASE_MNEMONICA_ERROR extends Error {
	
	constructor (message = BASE_ERROR_MESSAGE, additionalStack) {
		
		super(message);
		const BaseStack = this.stack;
		Object.defineProperty(this, 'BaseStack', {
			get () {
				return BaseStack;
			}
		});
		
		const stack = cleanupStack(BaseStack.split('\n'));
		
		if (additionalStack) {
			stack.unshift(...additionalStack);
		}
		
		this.stack = stack.join('\n');
		
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
	constructError,
	cleanupStack,
	getStack,
};

