'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwModificationError = void 0;
const constants_1 = require("../../constants");
const { odp, SymbolReplaceGaia, } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const { BASE_MNEMONICA_ERROR } = errors_1.ErrorsTypes;
const _1 = require("./");
const utils_1 = require("../utils");
const { makeFakeModificatorType } = utils_1.default;
const utils_2 = require("../../utils");
const { parse } = utils_2.utils;
const InstanceModificator_1 = require("../types/InstanceModificator");
const throwModificationError = function (error) {
    const self = this;
    const { TypeName, type: { stack: typeStack }, args } = self;
    const exceptionReason = error.exceptionReason || error;
    if (error.exceptionReason !== undefined) {
        error.reasons.push(error.exceptionReason);
        error.surplus.push(error);
        throw error;
    }
    odp(error, 'exceptionReason', {
        get() {
            return exceptionReason;
        },
        enumerable: true
    });
    const reasons = [exceptionReason];
    odp(error, 'reasons', {
        get() {
            return reasons;
        },
        enumerable: true
    });
    const surplus = [];
    odp(error, 'surplus', {
        get() {
            return surplus;
        },
        enumerable: true
    });
    self.ModificatorType = makeFakeModificatorType(TypeName);
    self.InstanceModificator = (0, InstanceModificator_1.makeInstanceModificator)(self);
    const erroredInstance = new self.InstanceModificator();
    erroredInstance[SymbolReplaceGaia](error);
    const stack = [];
    if (error instanceof BASE_MNEMONICA_ERROR) {
        stack.push(error.stack);
    }
    else {
        const title = `\n<-- creation of [ ${TypeName} ] traced -->`;
        _1.getStack.call(erroredInstance, title, [], exports.throwModificationError);
        stack.push(...erroredInstance.stack);
        const errorStack = error.stack.split('\n');
        stack.push('<-- with the following error -->');
        errorStack.forEach((line) => {
            if (!stack.includes(line)) {
                stack.push(line);
            }
        });
        stack.push('\n<-- of constructor definitions stack -->');
        stack.push(...typeStack);
    }
    const erroredInstanceStack = (0, _1.cleanupStack)(stack).join('\n');
    odp(erroredInstance, 'stack', {
        get() {
            return erroredInstanceStack;
        }
    });
    self.inheritedInstance = erroredInstance;
    const results = self.invokePostHooks();
    const { type, collection, namespace } = results;
    if (type.has(true) || collection.has(true) || namespace.has(true)) {
        return;
    }
    odp(erroredInstance, 'args', {
        get() {
            return args;
        }
    });
    odp(erroredInstance, 'originalError', {
        get() {
            return error;
        }
    });
    odp(erroredInstance, 'instance', {
        get() {
            return erroredInstance;
        }
    });
    odp(erroredInstance, 'extract', {
        get() {
            return () => {
                return erroredInstance.__self__.extract();
            };
        }
    });
    odp(erroredInstance, 'parse', {
        get() {
            return () => {
                return parse(erroredInstance);
            };
        }
    });
    throw erroredInstance;
};
exports.throwModificationError = throwModificationError;
//# sourceMappingURL=throwModificationError.js.map