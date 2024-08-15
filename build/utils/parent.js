'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.parent = void 0;
const errors_1 = require("../descriptors/errors");
const { WRONG_INSTANCE_INVOCATION } = errors_1.ErrorsTypes;
const parent = (instance, path) => {
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
    return name === path ?
        p : (0, exports.parent)(p, path);
};
exports.parent = parent;
//# sourceMappingURL=parent.js.map