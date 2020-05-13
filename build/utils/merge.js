'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.merge = void 0;
const errors_1 = require('../descriptors/errors');
const { WRONG_ARGUMENTS_USED } = errors_1.ErrorsTypes;
exports.merge = (a, b, ...args) => {
    if (a !== Object(a)) {
        throw new WRONG_ARGUMENTS_USED('A should be an object');
    }
    if (b !== Object(b)) {
        throw new WRONG_ARGUMENTS_USED('B should be an object');
    }
    if (typeof a.fork !== 'function') {
        throw new WRONG_ARGUMENTS_USED('A should have A.fork()');
    }
    const aa = a.fork.call(b, ...args);
    return aa;
};
