'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
const constants_1 = require("../../constants");
const { odp, SymbolConstructorName, SymbolDefaultTypesCollection, SymbolConfig, defaultOptions, defaultOptionsKeys, MNEMONICA, MNEMOSYNE, } = constants_1.constants;
const types_1 = require("../../api/types");
const hooksAPI = require("../../api/hooks");
const { registerHook, invokeHook, registerFlowChecker, } = hooksAPI;
const typesCollections = new Map();
const TypesCollection = function (_config) {
    const self = this;
    const subtypes = new Map();
    const config = defaultOptionsKeys.reduce((o, key) => {
        const value = _config[key];
        const option = defaultOptions[key];
        const t_conf = typeof value;
        const t_opts = typeof option;
        if (t_conf === t_opts) {
            o[key] = value;
        }
        else {
            o[key] = option;
        }
        return o;
    }, {});
    odp(this, SymbolConfig, {
        get() {
            return config;
        }
    });
    odp(this, Symbol.hasInstance, {
        get() {
            return (instance) => {
                return instance[SymbolConstructorName] === MNEMONICA;
            };
        }
    });
    odp(this, 'subtypes', {
        get() {
            return subtypes;
        }
    });
    odp(subtypes, MNEMOSYNE, {
        get() {
            return typesCollections.get(self);
        }
    });
    odp(this, MNEMOSYNE, {
        get() {
            return typesCollections.get(self);
        }
    });
    const hooks = Object.create(null);
    odp(this, 'hooks', {
        get() {
            return hooks;
        }
    });
};
odp(TypesCollection.prototype, MNEMONICA, {
    get() {
        return typesCollections.get(this);
    }
});
odp(TypesCollection.prototype, 'define', {
    get() {
        const { subtypes } = this;
        return function (...args) {
            return types_1.define.call(this, subtypes, ...args);
        };
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'lookup', {
    get() {
        return function (...args) {
            return types_1.lookup.call(this.subtypes, ...args);
        }.bind(this);
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'registerHook', {
    get() {
        const self = this;
        return function (hookName, hookCallback) {
            return registerHook.call(self, hookName, hookCallback);
        }.bind(this);
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'invokeHook', {
    get() {
        return function (hookName, hookCallback) {
            const self = this;
            return invokeHook.call(typesCollections.get(self), hookName, hookCallback);
        }.bind(this);
    }
});
odp(TypesCollection.prototype, 'registerFlowChecker', {
    get() {
        return function (flowCheckerCallback) {
            const self = this;
            return registerFlowChecker.call(typesCollections.get(self), flowCheckerCallback);
        }.bind(this);
    }
});
const typesCollectionProxyHandler = {
    get(target, prop) {
        if (target.subtypes.has(prop)) {
            return target.subtypes.get(prop);
        }
        return Reflect.get(target, prop);
    },
    set(target, TypeName, Constructor) {
        return target.define(TypeName, Constructor);
    },
    getOwnPropertyDescriptor(target, prop) {
        return target.subtypes.has(prop) ? {
            configurable: true,
            enumerable: true,
            writable: false,
            value: target.subtypes.get(prop)
        } : undefined;
    }
};
const createTypesCollection = (config = {}) => {
    const typesCollection = new TypesCollection(config);
    const typesCollectionProxy = new Proxy(typesCollection, typesCollectionProxyHandler);
    typesCollections.set(typesCollection, typesCollectionProxy);
    return typesCollectionProxy;
};
const DEFAULT_TYPES = createTypesCollection();
odp(DEFAULT_TYPES, SymbolDefaultTypesCollection, {
    get() {
        return true;
    }
});
exports.types = {
    get createTypesCollection() {
        return function (config = {}) {
            return createTypesCollection(config);
        };
    },
    get defaultTypes() {
        return DEFAULT_TYPES;
    }
};
//# sourceMappingURL=index.js.map