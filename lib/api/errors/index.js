'use strict';

const {
	SymbolConstructorName,
	MNEMONICA,
	ErrorMessages : {
		BASE_ERROR_MESSAGE,
		
	},
} = require('../../constants');

const stackCleaners = [];

const defineStackCleaner = (regexp) => {
	if (regexp instanceof RegExp) {
		stackCleaners.push(regexp);
	} else {
		const {
			WRONR_STACK_CLEANER,
		} = require('../../descriptors/errors');
		throw new WRONR_STACK_CLEANER;
	}
};

const cleanupStack = (stack) => {
	const cleaned = stack.reduce((arr, line) => {
		stackCleaners.forEach(cleanerRegExp => {
			if (!cleanerRegExp.test(line)) {
				arr.push(line);
			}
		});
		return arr;
	}, []);
	return cleaned.length ? cleaned : stack;
};

const getStack = function (title, stackAddition, tillFunction) {
	
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, tillFunction || getStack);
	} else {
		this.stack = (new Error()).stack;
	}
	
	this.stack = this.stack.split('\n').slice(1);
	this.stack = cleanupStack(this.stack);
	
	this.stack.unshift(title);
	stackAddition && this.stack.push(...stackAddition);
	this.stack.push('\n');

	return this.stack;

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
	defineStackCleaner,
};

