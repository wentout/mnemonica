'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.defineStackCleaner = exports.defaultCollection = exports.lookup = exports.define = void 0;
const wrapThis = (method) => {
    return function (instance, ...args) {
        return method(instance !== undefined ? instance : this, ...args);
    };
};
const constants_1 = require('./constants');
const descriptors_1 = require('./descriptors');
const { defaultTypes } = descriptors_1.default;
const errors = require('./api/errors');
const utils_1 = require('./utils');
const utilsWrapped = Object.assign({}, Object.entries(Object.assign({}, utils_1.utils)).reduce((methods, util) => {
    const [name, fn] = util;
    methods[name] = wrapThis(fn);
    return methods;
}, {}));
exports.define = function (...args) {
    const types = (this === mnemonica) ? defaultTypes : this || defaultTypes;
    return types.define(...args);
};
exports.lookup = function (...args) {
    const types = (this === mnemonica) ? defaultTypes : this || defaultTypes;
    return types.lookup(...args);
};
exports.defaultCollection = defaultTypes.subtypes;
exports.defineStackCleaner = errors.defineStackCleaner;
const mnemonica = {};
Object.entries(Object.assign(Object.assign(Object.assign({ define            : exports.define,
    lookup            : exports.lookup,
    defaultCollection : exports.defaultCollection }, constants_1.constants), descriptors_1.default), { utils : utilsWrapped, defineStackCleaner : exports.defineStackCleaner })).forEach((entry) => {
    const [name, code] = entry;
    Object.defineProperty(mnemonica, name, {
        get () {
            return code;
        },
        enumerable : true
    });
});
exports.default = mnemonica;
module.exports = mnemonica;
