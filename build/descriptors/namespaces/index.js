'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.namespaces = void 0;
const odp = Object.defineProperty;
const constants_1 = require('../../constants');
const { MNEMONICA, SymbolDefaultNamespace, SymbolConfig, } = constants_1.constants;
const errors_1 = require('../../descriptors/errors');
const { OPTIONS_ERROR, } = errors_1.ErrorsTypes;
const hooksAPI = require('../../api/hooks');
const __1 = require('../');
const defaultOptions = {
    useOldStyle : false,
    strictChain : true,
    blockErrors : true,
    submitStack : false
};
const namespaceStorage = new Map();
const Namespace = function (name, config) {
    if (typeof config === 'string') {
        config = {
            description : config
        };
    }
    if (!(config instanceof Object)) {
        throw new OPTIONS_ERROR;
    }
    const typesCollections = new Map();
    config = Object.assign({}, defaultOptions, config);
    odp(this, SymbolConfig, {
        get () {
            return config;
        }
    });
    odp(this, 'name', {
        get () {
            return name;
        },
        enumerable : true
    });
    odp(this, 'typesCollections', {
        get () {
            return typesCollections;
        },
        enumerable : true
    });
    const hooks = Object.create(null);
    odp(this, 'hooks', {
        get () {
            return hooks;
        }
    });
    namespaceStorage.set(name, this);
};
Namespace.prototype = Object.assign({ createTypesCollection (association, config) {
        const { createTypesCollection } = __1.descriptors;
        return createTypesCollection(this, association, config);
    } }, hooksAPI);
const DEFAULT_NAMESPACE = new Namespace(SymbolDefaultNamespace, {
    description : `default ${MNEMONICA} namespace`
});
exports.namespaces = Object.create(null);
odp(exports.namespaces, 'createNamespace', {
    get () {
        return (name, config = {}) => {
            return new Namespace(name, config);
        };
    },
    enumerable : true
});
odp(exports.namespaces, 'namespaces', {
    get () {
        return namespaceStorage;
    },
    enumerable : true
});
odp(exports.namespaces, 'defaultNamespace', {
    get () {
        return DEFAULT_NAMESPACE;
    },
    enumerable : true
});
odp(exports.namespaces, SymbolDefaultNamespace, {
    get () {
        return DEFAULT_NAMESPACE;
    }
});
odp(exports.namespaces, 'defaultOptionsKeys', {
    get () {
        return Object.keys(defaultOptions);
    }
});
