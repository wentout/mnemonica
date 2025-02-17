'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const { odp, SymbolConstructorName, SymbolGaia, SymbolReplaceUranus, MNEMONICA, GAIA, URANUS } = constants_1.constants;
const utils_1 = require("../utils");
const { getTypeChecker, reflectPrimitiveWrappers } = utils_1.default;
const extract_1 = require("../../utils/extract");
const parent_1 = require("../../utils/parent");
const pick_1 = require("../../utils/pick");
const exceptionConstructor_1 = require("../errors/exceptionConstructor");
const InstanceCreator_1 = require("./InstanceCreator");
const Gaia = function (Uranus) {
    const gaiaProto = Uranus ? Uranus : this;
    const GaiaConstructor = function () { };
    GaiaConstructor.prototype = Object.create(gaiaProto);
    const gaia = new GaiaConstructor;
    odp(gaia, MNEMONICA, {
        get() {
            return !Uranus ? GAIA : URANUS;
        }
    });
    return gaia;
};
const MnemonicaProtoProps = {
    extract() {
        return function () {
            return (0, extract_1.extract)(this);
        };
    },
    pick() {
        return function (...args) {
            return (0, pick_1.pick)(this, ...args);
        };
    },
    parent() {
        return function (constructorLookupPath) {
            return (0, parent_1.parent)(this, constructorLookupPath);
        };
    },
    clone() {
        return this.fork();
    },
    fork() {
        const { __type__: type, __collection__: collection, __parent__: existentInstance, __args__, __self__ } = this;
        const { isSubType, TypeName } = type;
        return function (...forkArgs) {
            let forked;
            const Constructor = isSubType ?
                existentInstance :
                collection;
            const args = forkArgs.length ? forkArgs : __args__;
            if (this === __self__) {
                forked = new (Constructor[TypeName])(...args);
            }
            else {
                forked = new InstanceCreator_1.InstanceCreator(type, reflectPrimitiveWrappers(this), args);
            }
            return forked;
        };
    },
    [SymbolReplaceUranus]() {
        return function (uranus) {
            Reflect.setPrototypeOf(Reflect.getPrototypeOf(this[SymbolGaia]), uranus);
        };
    },
    [SymbolConstructorName]() {
        return MNEMONICA;
    },
    exception() {
        const self = this;
        return function (error, ...args) {
            const target = new.target;
            return exceptionConstructor_1.default.call(self, target, error, ...args);
        };
    },
    sibling() {
        const self = this;
        const siblings = (SiblingTypeName) => {
            const { __collection__: collection, } = self;
            const sibling = collection[SiblingTypeName];
            return sibling;
        };
        return new Proxy(siblings, {
            get(_, prop) {
                return siblings(prop);
            },
            apply(_, __, args) {
                return siblings(args[0]);
            }
        });
    }
};
const TypesRoots = new WeakMap;
const Mnemosyne = function (gaia) {
    const instance = this;
    const Mnemonica = function () {
        odp(this, SymbolConstructorName, {
            get() {
                return MNEMONICA;
            }
        });
    };
    const mnemonica = Reflect.getPrototypeOf(gaia);
    Reflect.setPrototypeOf(Mnemonica.prototype, mnemonica);
    Object.entries(MnemonicaProtoProps).forEach(([name, method]) => {
        odp(Mnemonica.prototype, name, {
            get() {
                return method.call(this);
            }
        });
    });
    Object.getOwnPropertySymbols(MnemonicaProtoProps).forEach((symbol) => {
        odp(Mnemonica.prototype, symbol, {
            get() {
                const symbolMethod = Reflect.get(MnemonicaProtoProps, symbol);
                return symbolMethod.call(this);
            }
        });
    });
    odp(Mnemonica.prototype, Symbol.hasInstance, {
        get() {
            return getTypeChecker(this.constructor.name);
        }
    });
    odp(Mnemonica.prototype, SymbolGaia, {
        get() {
            return gaia;
        }
    });
    const proto = new Mnemonica();
    TypesRoots.set(instance, proto);
    Reflect.setPrototypeOf(instance, proto);
};
exports.default = {
    Gaia,
    Mnemosyne,
    get MnemosynePrototypeKeys() {
        return Object.keys(MnemonicaProtoProps);
    }
};
//# sourceMappingURL=Mnemosyne.js.map