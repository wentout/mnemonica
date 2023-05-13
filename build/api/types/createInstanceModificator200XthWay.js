'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const obeyConstructor_1 = require("./obeyConstructor");
function default_1() {
    const CreateInstanceModificatorAncient200XthWay = function (ModificatorType, ModificatorTypePrototype, addProps) {
        const existentInstance = this;
        const TripleSchemeClosure = function () {
            const Mnemosyne = this;
            addProps(Mnemosyne);
            const Inherico = function () {
                const moreInherited = this;
                ModificatorType.prototype = moreInherited;
                Object.assign(ModificatorType.prototype, ModificatorTypePrototype);
                Object.defineProperty(ModificatorType.prototype, 'constructor', {
                    get() {
                        return ModificatorType;
                    },
                    enumerable: false
                });
                (0, obeyConstructor_1.obey)(existentInstance, ModificatorType);
                return ModificatorType;
            };
            Inherico.prototype = Mnemosyne;
            Inherico.prototype.constructor = ModificatorType;
            return new Inherico();
        };
        TripleSchemeClosure.prototype = existentInstance;
        return new TripleSchemeClosure();
    };
    return CreateInstanceModificatorAncient200XthWay;
}
exports.default = default_1;
