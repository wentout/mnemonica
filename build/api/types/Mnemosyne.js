'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const { odp, SymbolConstructorName, SymbolGaia, SymbolReplaceUranus, MNEMONICA, GAIA, URANUS } = constants_1.constants;
const utils_1 = require("../utils");
const { getTypeChecker, findSubTypeFromParent, reflectPrimitiveWrappers } = utils_1.default;
const extract_1 = require("../../utils/extract");
const parent_1 = require("../../utils/parent");
const pick_1 = require("../../utils/pick");
const exceptionConstructor_1 = require("../errors/exceptionConstructor");
const InstanceCreator_1 = require("./InstanceCreator");
const TypesRoots = new WeakMap;
const Gaia = function (Uranus) {
    const gaiaProto = Uranus ? Uranus : this;
    const GaiaConstructor = function () { };
    Reflect.setPrototypeOf(GaiaConstructor.prototype, Object.create(gaiaProto));
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
const MnemosynePrototypeKeys = Object.keys(MnemonicaProtoProps);
const MnemonicaInstanceProps = [
    '__proto_proto__',
    '__type__',
    '__self__',
    '__args__',
    '__parent__',
    '__subtypes__',
    '__stack__',
    '__collection__',
    '__timestamp__',
    '__creator__'
].concat(MnemosynePrototypeKeys);
const staticProps = [
    'constructor',
    'prototype',
    'then',
    'stack',
    'message',
    'domain',
    'on',
    'once',
    'off',
    'inspect',
    'showDiff',
]
    .concat(MnemonicaInstanceProps)
    .concat(Object.getOwnPropertyNames(Object.prototype))
    .concat(Object.getOwnPropertyNames(Function.prototype))
    .reduce((obj, key) => {
    obj[key] = true;
    return obj;
}, Object.create(null));
const makeSubTypeProxy = function (subtype, inheritedInstance) {
    const subtypeProxy = new Proxy(InstanceCreator_1.InstanceCreator, {
        get(Target, _prop) {
            if (_prop === Symbol.hasInstance) {
                return getTypeChecker(subtype.TypeName);
            }
            return Reflect.get(Target, _prop);
        },
        construct(Target, _args) {
            return new Target(subtype, inheritedInstance, _args);
        },
        apply(Target, thisArg, _args) {
            if (thisArg === undefined) {
                thisArg = inheritedInstance;
            }
            let existentInstance = reflectPrimitiveWrappers(thisArg);
            if (!existentInstance[SymbolGaia]) {
                const mnemosyne = new Mnemosyne(new Gaia(existentInstance));
                existentInstance = new Proxy(mnemosyne, {
                    get: mnemosyneProxyHandlerGet
                });
            }
            const entity = new Target(subtype, existentInstance, _args);
            return entity;
        },
    });
    return subtypeProxy;
};
const mnemosyneProxyHandlerGet = (target, prop, receiver) => {
    const result = Reflect.get(target, prop, receiver);
    if (result !== undefined) {
        return result;
    }
    if (typeof prop === 'symbol') {
        return result;
    }
    if (staticProps[prop]) {
        return result;
    }
    const instance = Reflect.getPrototypeOf(receiver);
    const { __type__: { config: { strictChain }, subtypes }, } = instance;
    const subtype = subtypes.has(prop) ?
        subtypes.get(prop) :
        strictChain ?
            undefined :
            findSubTypeFromParent(instance, prop);
    return subtype ? makeSubTypeProxy(subtype, receiver) : result;
};
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
    Reflect.setPrototypeOf(instance, proto);
    TypesRoots.set(instance, proto);
};
const createMnemosyne = function (Uranus) {
    const uranus = reflectPrimitiveWrappers(Uranus);
    const mnemosyne = new Mnemosyne(new Gaia(uranus));
    const mnemosyneProxy = new Proxy(mnemosyne, {
        get: mnemosyneProxyHandlerGet
    });
    return mnemosyneProxy;
};
exports.default = {
    Gaia,
    get createMnemosyne() {
        return createMnemosyne;
    },
    get MnemosynePrototypeKeys() {
        return MnemosynePrototypeKeys;
    },
    get TypesRoots() {
        return TypesRoots;
    }
};
//# sourceMappingURL=Mnemosyne.js.map