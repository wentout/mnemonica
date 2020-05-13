'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.invokeHook = void 0;
const constants_1 = require('../../constants');
const { MNEMONICA, } = constants_1.constants;
const flowCheckers_1 = require('./flowCheckers');
const hop_1 = require('../../utils/hop');
exports.invokeHook = function (hookType, opts) {
    const { type, existentInstance, inheritedInstance, args } = opts;
    const invocationResults = new Set();
    const self = this;
    if (hop_1.hop(self.hooks, hookType)) {
        const { TypeName, } = type;
        const hookArgs = {
            type,
            TypeName,
            existentInstance : existentInstance.constructor.name === MNEMONICA ?
                null : existentInstance,
            args,
        };
        inheritedInstance && Object.assign(hookArgs, {
            inheritedInstance
        });
        this.hooks[hookType].forEach((hook) => {
            const result = hook.call(self, hookArgs);
            invocationResults.add(result);
        });
        const flowChecker = flowCheckers_1.flowCheckers.get(this);
        (typeof flowChecker === 'function') && flowChecker
            .call(this, Object.assign({}, {
            invocationResults,
            hookType,
        }, hookArgs));
    }
    return invocationResults;
};
