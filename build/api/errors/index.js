'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.constructError = exports.BASE_MNEMONICA_ERROR = exports.getStack = exports.cleanupStack = exports.defineStackCleaner = void 0;
const constants_1 = require('../../constants');
const { SymbolConstructorName, MNEMONICA, ErrorMessages: { BASE_ERROR_MESSAGE, }, } = constants_1.constants;
const stackCleaners = [];
exports.defineStackCleaner = (regexp) => {
    if (regexp instanceof RegExp) {
        stackCleaners.push(regexp);
    }
    else {
        const { ErrorsTypes: { WRONG_STACK_CLEANER } } = require('../../descriptors/errors');
        throw new WRONG_STACK_CLEANER;
    }
};
exports.cleanupStack = (stack) => {
    const cleaned = stack.reduce((arr, line) => {
        stackCleaners.forEach(cleanerRegExp => {
            (!cleanerRegExp.test(line)) && arr.push(line);
        });
        return arr;
    }, []);
    return cleaned.length ? cleaned : stack;
};
exports.getStack = function (title, stackAddition, tillFunction) {
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, tillFunction || exports.getStack);
    }
    else {
        this.stack = (new Error()).stack;
    }
    this.stack = this.stack.split('\n').slice(1);
    this.stack = exports.cleanupStack(this.stack);
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
        const stack = exports.cleanupStack(BaseStack.split('\n'));
        if (additionalStack) {
            stack.unshift(...additionalStack);
        }
        this.stack = stack.join('\n');
    }
    static get [SymbolConstructorName] () {
        return `base of : ${MNEMONICA} : errors`;
    }
}
exports.BASE_MNEMONICA_ERROR = BASE_MNEMONICA_ERROR;
exports.constructError = (name, message) => {
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
    const ErrorConstructor = (new Function('base', body))(BASE_MNEMONICA_ERROR);
    return ErrorConstructor;
};
