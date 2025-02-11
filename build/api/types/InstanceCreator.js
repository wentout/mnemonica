'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceCreator = void 0;
const constants_1 = require("../../constants");
const { odp, SymbolConstructorName, defaultOptions: { ModificationConstructor: defaultMC } } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const { WRONG_MODIFICATION_PATTERN, } = errors_1.ErrorsTypes;
const utils_1 = require("../utils");
const { getExistentAsyncStack, makeFakeModificatorType, } = utils_1.default;
const errors_2 = require("../errors");
const throwModificationError_1 = require("../errors/throwModificationError");
const addProps_1 = require("./addProps");
const InstanceModificator_1 = require("./InstanceModificator");
const obeyConstructor_1 = require("./obeyConstructor");
const invokePreHooks = function () {
    const { type, existentInstance, args, InstanceModificator } = this;
    const { collection, } = type;
    const hookData = {
        type,
        existentInstance,
        args,
        InstanceModificator
    };
    collection.invokeHook('preCreation', hookData);
    type.invokeHook('preCreation', hookData);
};
const invokePostHooks = function () {
    const creator = this;
    const { inheritedInstance, } = creator;
    const { __type__: type, __parent__: existentInstance, __args__: args, } = inheritedInstance;
    const { collection, } = type;
    const hookType = inheritedInstance instanceof Error ?
        'creationError' : 'postCreation';
    const hookData = {
        type,
        existentInstance,
        inheritedInstance,
        args,
        creator
    };
    return {
        type: type.invokeHook(hookType, hookData),
        collection: collection.invokeHook(hookType, hookData),
    };
};
const postProcessing = function (continuationOf) {
    const self = this;
    const { stack, } = self;
    if (!self.inheritedInstance.constructor) {
        const msg = 'should inherit from mnemonica instance';
        self.throwModificationError(new WRONG_MODIFICATION_PATTERN(msg, stack));
    }
    if (!self.inheritedInstance.constructor[SymbolConstructorName]) {
        const msg = 'should inherit from mnemonica instance';
        self.throwModificationError(new WRONG_MODIFICATION_PATTERN(msg, stack));
    }
    if (continuationOf && !(self.inheritedInstance instanceof continuationOf)) {
        const icn = self.inheritedInstance.constructor.name;
        const msg = `should inherit from ${continuationOf.TypeName} but got ${icn}`;
        self.throwModificationError(new WRONG_MODIFICATION_PATTERN(msg, stack));
    }
    odp(self.inheritedInstance, '__self__', {
        get() {
            return self.inheritedInstance;
        }
    });
    self.invokePostHooks();
};
const addThen = function (then) {
    const self = this;
    self.inheritedInstance = self.inheritedInstance
        .then(() => {
        self.inheritedInstance =
            new exports.InstanceCreator(then.subtype, self.inheritedInstance, then.args, true);
        return self.inheritedInstance;
    });
};
const makeAwaiter = function (type, then) {
    const self = this;
    self.inheritedInstance = self.inheritedInstance
        .then((instance) => {
        if (typeof instance !== 'object') {
            if (self.config.awaitReturn) {
                const msg = `should inherit from ${type.TypeName}: seems async ${type.TypeName} has no return statement`;
                throw new WRONG_MODIFICATION_PATTERN(msg, self.stack);
            }
            else {
                return instance;
            }
        }
        if (!(instance instanceof self.type)) {
            const icn = instance.constructor.name;
            const msg = `should inherit from ${type.TypeName} but got ${icn}`;
            throw new WRONG_MODIFICATION_PATTERN(msg, self.stack);
        }
        self.inheritedInstance = instance;
        if (self.inheritedInstance.__self__ !== self.inheritedInstance) {
            self.postProcessing(type);
        }
        return self.inheritedInstance;
    })
        .catch((error) => {
        if (self.config.blockErrors) {
            self.throwModificationError(error);
        }
        else {
            throw error;
        }
    });
    if (then) {
        self.addThen(then);
    }
    type.subtypes.forEach((subtype, name) => {
        self.inheritedInstance[name] = (...args) => {
            self.inheritedInstance = self.makeAwaiter(subtype, {
                name,
                subtype,
                args,
            });
            return self.inheritedInstance;
        };
    });
    return self.inheritedInstance;
};
const InstanceCreatorPrototype = {
    getExistentAsyncStack,
    postProcessing,
    makeAwaiter,
    addProps: addProps_1.addProps,
    addThen,
    invokePreHooks,
    invokePostHooks,
    throwModificationError: throwModificationError_1.throwModificationError
};
exports.InstanceCreator = function (type, existentInstance, args, chained) {
    const { constructHandler, proto, config, TypeName } = type;
    const { ModificationConstructor, blockErrors, submitStack } = config;
    const mc = ModificationConstructor(obeyConstructor_1.obey, defaultMC);
    const self = this;
    const ModificatorType = constructHandler();
    Object.assign(self, {
        type,
        TypeName,
        existentInstance,
        get args() {
            return args;
        },
        ModificationConstructor: mc,
        ModificatorType,
        config,
        proto
    });
    if (submitStack || chained) {
        const stackAddition = chained ? self.getExistentAsyncStack(existentInstance) : [];
        const title = `\n<-- creation of [ ${TypeName} ] traced -->`;
        if (submitStack) {
            errors_2.getStack.call(self, title, stackAddition);
        }
        else {
            self.stack = title;
        }
    }
    if (blockErrors && existentInstance instanceof Error) {
        self.ModificatorType = makeFakeModificatorType(TypeName);
        self.InstanceModificator = (0, InstanceModificator_1.makeInstanceModificator)(self);
        throw new self.InstanceModificator(...args);
    }
    self.invokePreHooks();
    self.InstanceModificator = (0, InstanceModificator_1.makeInstanceModificator)(self);
    if (blockErrors) {
        try {
            const answer = new self.InstanceModificator(...args);
            self.inheritedInstance = answer;
        }
        catch (error) {
            self.throwModificationError(error);
        }
    }
    else {
        const answer = new self.InstanceModificator(...args);
        self.inheritedInstance = answer;
    }
    if (self.inheritedInstance instanceof Promise) {
        const waiter = self.makeAwaiter(type);
        odp(waiter, SymbolConstructorName, {
            get() {
                return TypeName;
            }
        });
        return waiter;
    }
    self.postProcessing(type);
    return self.inheritedInstance;
};
Object.assign(exports.InstanceCreator.prototype, InstanceCreatorPrototype);
//# sourceMappingURL=InstanceCreator.js.map