'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const { odp } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const { WRONG_ARGUMENTS_USED, WRONG_INSTANCE_INVOCATION } = errors_1.ErrorsTypes;
const errors_2 = require("../errors");
const utils_1 = require("../../utils");
const { parse } = utils_1.utils;
const utils_2 = require("../utils");
const { makeFakeModificatorType } = utils_2.default;
const InstanceModificator_1 = require("../types/InstanceModificator");
const checkThrowArgs = (instance, target, error, args) => {
    let wrongThrow;
    if (!target) {
        throw new WRONG_INSTANCE_INVOCATION('exception should be made with new keyword');
    }
    if (!(error instanceof Error)) {
        wrongThrow = new WRONG_ARGUMENTS_USED('error must be instanceof Error');
    }
    if (!(wrongThrow instanceof Error)) {
        return;
    }
    odp(wrongThrow, 'instance', {
        get() {
            return instance;
        }
    });
    odp(wrongThrow, 'error', {
        get() {
            return error;
        }
    });
    odp(wrongThrow, 'args', {
        get() {
            return args;
        }
    });
    throw wrongThrow;
};
const exceptionConsctructHandler = function (opts) {
    const { instance, TypeName, typeStack, args, error } = opts;
    const exception = this;
    odp(exception, 'args', {
        get() {
            return args;
        }
    });
    odp(exception, 'originalError', {
        get() {
            return error;
        }
    });
    odp(exception, 'instance', {
        get() {
            return instance;
        }
    });
    odp(exception, 'extract', {
        get() {
            return () => {
                return instance.extract();
            };
        }
    });
    odp(exception, 'parse', {
        get() {
            return () => {
                return parse(instance);
            };
        }
    });
    const errorStack = exception.stack.split('\n');
    const stack = [];
    const title = `\n<-- lifecycle of [ ${TypeName} ] traced -->`;
    errors_2.getStack.call(exception, title, [], prepareException);
    stack.push(...exception.stack);
    stack.push('<-- with the following error -->');
    errorStack.forEach((line) => {
        if (!stack.includes(line)) {
            stack.push(line);
        }
    });
    stack.push('\n<-- of constructor definitions stack -->');
    stack.push(...typeStack);
    exception.stack = (0, errors_2.cleanupStack)(stack).join('\n');
    return exception;
};
const prepareException = function (target, error, ...args) {
    const instance = this;
    checkThrowArgs(instance, target, error, args);
    const { __type__, __creator__ } = instance;
    const { stack: typeStack, TypeName } = __type__;
    const ExceptionCreator = Object.create(__creator__);
    ExceptionCreator.config = Object.assign({}, __creator__.config);
    ExceptionCreator.config.blockErrors = false;
    ExceptionCreator.existentInstance = error;
    ExceptionCreator.ModificatorType = makeFakeModificatorType(TypeName, function () {
        return exceptionConsctructHandler.call(this, {
            instance,
            TypeName,
            typeStack,
            args,
            error
        });
    });
    ExceptionCreator.InstanceModificator = (0, InstanceModificator_1.makeInstanceModificator)(ExceptionCreator);
    return new ExceptionCreator.InstanceModificator();
};
exports.default = prepareException;
