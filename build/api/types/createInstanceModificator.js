'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(obey) {
    const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype, addProps) {
        const existentInstance = this;
        const Mnemosyne = {};
        Reflect.setPrototypeOf(Mnemosyne, existentInstance);
        addProps(Mnemosyne);
        Object.defineProperty(Mnemosyne, 'constructor', {
            get() {
                return ModificatorType;
            },
            enumerable: false
        });
        Object.entries(ModificatorTypePrototype).forEach((entry) => {
            const [name, value] = entry;
            if (name !== 'constructor') {
                (ModificatorType.prototype[name] = value);
            }
        });
        ModificatorType.prototype.constructor = ModificatorType;
        Reflect.setPrototypeOf(ModificatorType.prototype, Mnemosyne);
        obey(existentInstance, ModificatorType);
        return ModificatorType;
    };
    return CreateInstanceModificator;
}
//# sourceMappingURL=createInstanceModificator.js.map