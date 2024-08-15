'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFlowChecker = exports.flowCheckers = void 0;
const errors_1 = require("../../descriptors/errors");
const { MISSING_CALLBACK_ARGUMENT, FLOW_CHECKER_REDEFINITION, } = errors_1.ErrorsTypes;
exports.flowCheckers = new WeakMap();
const registerFlowChecker = function (cb) {
    if (typeof cb !== 'function') {
        throw new MISSING_CALLBACK_ARGUMENT;
    }
    if (exports.flowCheckers.has(this)) {
        throw new FLOW_CHECKER_REDEFINITION;
    }
    exports.flowCheckers.set(this, cb);
};
exports.registerFlowChecker = registerFlowChecker;
//# sourceMappingURL=flowCheckers.js.map