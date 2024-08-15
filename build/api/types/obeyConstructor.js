'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.obey = void 0;
const constants_1 = require("../../constants");
const { SymbolUsed } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const { PROTOTYPE_USED_TWICE, } = errors_1.ErrorsTypes;
const obey = (existentInstance, ModificatorType) => {
    let protoConstructor = ModificatorType;
    while (protoConstructor instanceof Function) {
        if (Object.prototype.hasOwnProperty.call(protoConstructor, SymbolUsed) && protoConstructor[SymbolUsed]) {
            const error = new PROTOTYPE_USED_TWICE(`${protoConstructor.name}.prototype > ${ModificatorType.name}`);
            throw error;
        }
        const sample = Reflect.getPrototypeOf(protoConstructor);
        if (sample instanceof Function) {
            protoConstructor = sample;
        }
        else {
            Object.defineProperty(protoConstructor, SymbolUsed, {
                get() {
                    return true;
                }
            });
            break;
        }
    }
    Reflect.setPrototypeOf(protoConstructor, existentInstance.constructor);
};
exports.obey = obey;
//# sourceMappingURL=obeyConstructor.js.map