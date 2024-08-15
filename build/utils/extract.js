'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.extract = void 0;
const errors_1 = require("../descriptors/errors");
const { WRONG_INSTANCE_INVOCATION } = errors_1.ErrorsTypes;
const hop_1 = require("./hop");
const extract = (instance) => {
    if (instance !== Object(instance)) {
        throw new WRONG_INSTANCE_INVOCATION;
    }
    const extracted = {};
    for (const name in instance) {
        if (name === 'constructor' && !(0, hop_1.hop)(instance, name)) {
            continue;
        }
        extracted[name] = instance[name];
    }
    return extracted;
};
exports.extract = extract;
//# sourceMappingURL=extract.js.map