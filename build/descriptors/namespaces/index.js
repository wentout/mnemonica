'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.namespaces = void 0;
// 1. init default namespace
// 2. create default namespace in types
const odp = Object.defineProperty;
const constants_1 = require('../../constants');
const { MNEMONICA, SymbolDefaultNamespace, SymbolConfig, } = constants_1.constants;
const errors_1 = require('../../descriptors/errors');
const { OPTIONS_ERROR, } = errors_1.ErrorsTypes;
const hooksAPI = require('../../api/hooks');
const defaultOptions = {
    // explicit declaration we wish use
    // an old style based constructors
    // e.g. with prototype described with:
    //    createInstanceModificator200XthWay
    // or more general with: createInstanceModificator
    useOldStyle : false,
    // shall or not we use strict checking
    // for creation sub-instances Only from current type
    // or we might use up-nested sub-instances from chain
    strictChain : true,
    // should we use forced errors checking
    // to make all inherited types errored
    // if there is an error somewhere in chain
    // disallow instance construction 
    // if there is an error in prototype chain
    blockErrors : true,
    // if it is necessary to collect stack
    // as a __stack__ prototype property
    // during the process of instance creation
    submitStack : false
};
// namespace storage
// name + namespace config
// future feature : path of namespace
// shortcut for ns of module exports
// inter-mediator
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
        const { types: { createTypesCollection } } = require('../types');
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
