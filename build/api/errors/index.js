'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructError = exports.BASE_MNEMONICA_ERROR = exports.getStack = exports.cleanupStack = exports.stackCleaners = void 0;
const constants_1 = require("../../constants");
const { odp, SymbolConstructorName, MNEMONICA, ErrorMessages, } = constants_1.constants;
const { BASE_ERROR_MESSAGE } = ErrorMessages;
exports.stackCleaners = [];
const cleanupStack = (stack) => {
    const cleaned = stack.reduce((arr, line) => {
        exports.stackCleaners.forEach(cleanerRegExp => {
            if (!cleanerRegExp.test(line)) {
                arr.push(line);
            }
        });
        return arr;
    }, []);
    return cleaned.length ? cleaned : stack;
};
exports.cleanupStack = cleanupStack;
const getStack = function (title, stackAddition, tillFunction) {
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, tillFunction || exports.getStack);
    }
    else {
        this.stack = (new Error()).stack;
    }
    this.stack = this.stack.split('\n').slice(1);
    this.stack = (0, exports.cleanupStack)(this.stack);
    this.stack.unshift(title);
    if (Array.isArray(stackAddition) && stackAddition.length) {
        this.stack.push(...stackAddition);
    }
    this.stack.push('\n');
    return this.stack;
};
exports.getStack = getStack;
class BASE_MNEMONICA_ERROR extends Error {
    constructor(message = BASE_ERROR_MESSAGE, additionalStack) {
        super(message);
        const BaseStack = this.stack;
        odp(this, 'BaseStack', {
            get() {
                return BaseStack;
            }
        });
        const stack = (0, exports.cleanupStack)(BaseStack.split('\n'));
        if (additionalStack) {
            stack.unshift(...additionalStack);
        }
        this.stack = stack.join('\n');
    }
    static get [SymbolConstructorName]() {
        return `base of : ${MNEMONICA} : errors`;
    }
}
exports.BASE_MNEMONICA_ERROR = BASE_MNEMONICA_ERROR;
const constructError = (name, message) => {
    const NamedErrorConstructor = class extends BASE_MNEMONICA_ERROR {
        constructor(addition, stack) {
            const saying = addition ? `${message} : ${addition}` : `${message}`;
            super(saying, stack);
        }
    };
    const reNamer = {};
    reNamer[name] = NamedErrorConstructor;
    Object.defineProperty(reNamer[name].prototype.constructor, 'name', {
        get() {
            return name;
        }
    });
    return reNamer[name];
};
exports.constructError = constructError;
//# sourceMappingURL=index.js.map