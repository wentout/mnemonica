'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const getClassConstructor = (ConstructHandler, CreationHandler) => {
    return class extends ConstructHandler {
        constructor(...args) {
            const answer = super(...args);
            return CreationHandler.call(this, answer);
        }
    };
};
const getFunctionConstructor = (ConstructHandler, CreationHandler) => {
    const newable = Object.hasOwnProperty.call(ConstructHandler, 'prototype');
    return function (...args) {
        let answer;
        if (!newable) {
            answer = ConstructHandler.call(this, ...args);
        }
        else {
            const _proto = ConstructHandler.prototype;
            ConstructHandler.prototype = this.constructor.prototype;
            answer = new ConstructHandler(...args);
            ConstructHandler.prototype = _proto;
        }
        return CreationHandler.call(this, answer);
    };
};
const compileNewModificatorFunctionBody = function (FunctionName, asClass = false) {
    return function (ConstructHandler, CreationHandler, SymbolConstructorName) {
        return function () {
            let ModificationBody;
            if (asClass) {
                ModificationBody = getClassConstructor(ConstructHandler, CreationHandler);
            }
            else {
                ModificationBody = getFunctionConstructor(ConstructHandler, CreationHandler);
            }
            ModificationBody.prototype.constructor = ModificationBody;
            Object.defineProperty(ModificationBody.prototype.constructor, 'name', {
                value: FunctionName,
                writable: false
            });
            Object.defineProperty(ModificationBody, SymbolConstructorName, {
                get() {
                    return FunctionName;
                }
            });
            return ModificationBody;
        };
    };
};
exports.default = compileNewModificatorFunctionBody;
//# sourceMappingURL=compileNewModificatorFunctionBody.js.map