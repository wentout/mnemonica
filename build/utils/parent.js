'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.parent = void 0;
const errors_1 = require("../descriptors/errors");
const { WRONG_INSTANCE_INVOCATION } = errors_1.ErrorsTypes;
// seek for firts parent instance
// of instance prototype chain
// with constructors of path
exports.parent = (instance, path) => {
    // at this situation this check is enough
    if (instance !== Object(instance)) {
        throw new WRONG_INSTANCE_INVOCATION;
    }
    const { __parent__: p } = instance;
    if (!p) {
        return;
    }
    if (!path) {
        return p;
    }
    const { constructor: { name } } = p;
    // seek throuh parent instances
    // about the fist constructor with this name
    return name === path ?
        p : exports.parent(p, path);
};
