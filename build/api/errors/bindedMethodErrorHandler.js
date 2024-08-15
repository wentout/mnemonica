'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindedMethodErrorHandler = void 0;
const constants_1 = require("../../constants");
const { odp, } = constants_1.constants;
const bindedMethodErrorHandler = (exceptionReason) => {
    const { applyTo, args, method, asNew, error } = exceptionReason;
    const reThrown = error.exceptionReason !== undefined;
    if (reThrown) {
        error.reasons.push(exceptionReason);
        error.surplus.push(error);
        return error;
    }
    else {
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
    }
    if (applyTo && applyTo.exception instanceof Function) {
        let preparedException = error;
        try {
            preparedException = new applyTo.exception(error, {
                args,
                exceptionReasonMethod: method,
                exceptionReasonObject: applyTo,
                reasonsIsNew: asNew
            });
        }
        catch (additionalError) {
            error.surplus.push(additionalError);
            return error;
        }
        if (preparedException instanceof Error) {
            return preparedException;
        }
    }
    return error;
};
exports.bindedMethodErrorHandler = bindedMethodErrorHandler;
//# sourceMappingURL=bindedMethodErrorHandler.js.map