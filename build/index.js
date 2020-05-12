'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
const wrapThis = (method) => {
    return function (instance, ...args) {
        return method(instance !== undefined ? instance : this, ...args);
    };
};
const constants_1 = require('./constants');
const descriptors_1 = require('./descriptors');
const { defaultTypes } = descriptors_1.default;
const errors_1 = require('./api/errors');
const { defineStackCleaner } = errors_1.default;
const utils_1 = require('./utils');
const utilsWrapped = Object.assign({}, Object.entries(Object.assign({}, utils_1.utils)).reduce((methods, util) => {
    const [name, fn] = util;
    methods[name] = wrapThis(fn);
    return methods;
}, {}));
const define = function (...args) {
    const types = (this === fascade) ? defaultTypes : this || defaultTypes;
    return types.define(...args);
};
const lookup = function (...args) {
    const types = (this === fascade) ? defaultTypes : this || defaultTypes;
    return types.lookup(...args);
};
const fascade = {};
Object.entries(Object.assign(Object.assign(Object.assign({}, constants_1.constants), descriptors_1.default), { defaultCollection : defaultTypes.subtypes, defineStackCleaner, utils : utilsWrapped, define,
    lookup })).forEach((entry) => {
    const [name, code] = entry;
    Object.defineProperty(fascade, name, {
        get () {
            return code;
        },
        enumerable : true
    });
});
// console.log(Object.keys(fascade));
module.exports = fascade;
