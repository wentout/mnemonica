'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.pick = void 0;
const errors_1 = require('../descriptors/errors');
const { WRONG_INSTANCE_INVOCATION } = errors_1.ErrorsTypes;
exports.pick = (instance, ...args) => {
    // at this situation this check is enough
    if (instance !== Object(instance)) {
        throw new WRONG_INSTANCE_INVOCATION;
    }
    const props = args.reduce((arr, el) => {
        if (Array.isArray(el)) {
            arr.push(...el);
        }
        else {
            arr.push(el);
        }
        return arr;
    }, []);
    const picked = props.reduce((obj, name) => {
        obj[name] = instance[name];
        return obj;
    }, {});
    return picked;
};
