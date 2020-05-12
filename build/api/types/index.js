'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.lookup = exports.define = void 0;
const odp = Object.defineProperty;
const hop_1 = require('../../utils/hop');
const constants_1 = require('../../constants');
const { SymbolSubtypeCollection, SymbolConstructorName, SymbolConfig, TYPE_TITLE_PREFIX, MNEMOSYNE, } = constants_1.constants;
const errors_1 = require('../../descriptors/errors');
const { ALREADY_DECLARED, WRONG_TYPE_DEFINITION, TYPENAME_MUST_BE_A_STRING, HANDLER_MUST_BE_A_FUNCTION, } = errors_1.ErrorsTypes;
// invokeHook
// registerHook
// registerFlowChecker
const hooksApi = require('../hooks');
const TypeProxy_1 = require('./TypeProxy');
const compileNewModificatorFunctionBody_1 = require('./compileNewModificatorFunctionBody');
const utils_1 = require('./utils');
const { checkProto, getTypeChecker, CreationHandler, getTypeSplitPath, checkTypeName, isClass, } = utils_1.default;
const errors_2 = require('../errors');
const { getStack, } = errors_2.default;
const TypeDescriptor = function (defineOrigin, types, TypeName, constructHandler, proto, config) {
    // here "types" refers to types collection object {}
    const parentType = types[SymbolSubtypeCollection] || null;
    const isSubType = parentType ? true : false;
    const namespace = isSubType ? parentType.namespace : types.namespace;
    const collection = isSubType ? parentType.collection : types[MNEMOSYNE];
    if (types.has(TypeName)) {
        throw new ALREADY_DECLARED;
    }
    checkProto(proto);
    const subtypes = new Map();
    const title = `${TYPE_TITLE_PREFIX}${TypeName}`;
    config = Object.assign({}, collection[SymbolConfig], config);
    const type = Object.assign(this, {
        get constructHandler () {
            return constructHandler;
        },
        TypeName,
        proto,
        isSubType,
        subtypes,
        parentType,
        namespace,
        collection,
        title,
        config,
        hooks : Object.create(null)
    });
    getStack.call(this, `Definition of [ ${TypeName} ] made at:`, [], defineOrigin);
    odp(subtypes, SymbolSubtypeCollection, {
        get () {
            return type;
        }
    });
    types.set(TypeName, new TypeProxy_1.TypeProxy(type));
    return types.get(TypeName);
};
Object.assign(TypeDescriptor.prototype, hooksApi);
TypeDescriptor.prototype.define = function (...args) {
    return exports.define.call(exports.define, this.subtypes, ...args);
};
TypeDescriptor.prototype.lookup = function (...args) {
    return exports.lookup.call(this.subtypes, ...args);
};
odp(TypeDescriptor.prototype, Symbol.hasInstance, {
    get () {
        return getTypeChecker(this.TypeName);
    }
});
const defineFromType = function (subtypes, constructHandlerGetter, config) {
    // we need this to extract TypeName
    const type = constructHandlerGetter();
    if (typeof type !== 'function') {
        throw new HANDLER_MUST_BE_A_FUNCTION;
    }
    const TypeName = type.name;
    if (!TypeName) {
        throw new TYPENAME_MUST_BE_A_STRING;
    }
    const asClass = isClass(type);
    const makeConstructHandler = function () {
        const constructHandler = constructHandlerGetter();
        // constructHandler[SymbolConstructorName] = TypeName;
        odp(constructHandler, SymbolConstructorName, {
            get () {
                return TypeName;
            }
        });
        const protoDesc = Object
            .getOwnPropertyDescriptor(constructHandler, 'prototype');
        if (protoDesc.writable) {
            constructHandler.prototype = {};
        }
        return constructHandler;
    };
    if (typeof config === 'object') {
        config = Object.assign({}, config);
        config.useOldStyle = false;
    }
    else {
        config = {};
    }
    config.asClass = asClass;
    return new TypeDescriptor(this, subtypes, TypeName, makeConstructHandler, type.prototype, config);
};
const defineFromFunction = function (subtypes, TypeName, constructHandler = function () { }, proto, config = {}) {
    if (typeof constructHandler !== 'function') {
        throw new HANDLER_MUST_BE_A_FUNCTION;
    }
    const asClass = isClass(constructHandler);
    const modificatorBody = compileNewModificatorFunctionBody_1.default(TypeName, asClass);
    const makeConstructHandler = modificatorBody(constructHandler, CreationHandler, SymbolConstructorName);
    if (!proto) {
        if (hop_1.hop(constructHandler, 'prototype')) {
            proto = Object.assign({}, constructHandler.prototype);
        }
        else {
            proto = {};
        }
    }
    if (typeof config === 'object') {
        config = Object.assign({}, config);
    }
    if (typeof config === 'boolean') {
        config = {
            useOldStyle : config
        };
    }
    config.asClass = asClass;
    return new TypeDescriptor(this, subtypes, TypeName, makeConstructHandler, proto, config);
};
exports.define = function (subtypes, TypeOrTypeName, constructHandlerOrConfig, proto, config) {
    if (typeof TypeOrTypeName === 'function') {
        if (TypeOrTypeName.name) {
            return exports.define.call(this, subtypes, TypeOrTypeName.name, TypeOrTypeName, constructHandlerOrConfig, proto, config);
        }
        else {
            return defineFromType.call(this, subtypes, TypeOrTypeName, constructHandlerOrConfig);
        }
    }
    if (typeof TypeOrTypeName === 'string') {
        checkTypeName(TypeOrTypeName);
        const split = getTypeSplitPath(TypeOrTypeName);
        const Type = exports.lookup.call(subtypes, split[0]);
        if (!Type) {
            if (split.length === 1) {
                return defineFromFunction.call(this, subtypes, TypeOrTypeName, constructHandlerOrConfig, proto, config);
            }
            throw new WRONG_TYPE_DEFINITION(`${split[0]} definition is not yet exists`);
        }
        const TypeName = split.slice(1).join('.');
        if (split.length > 1) {
            return exports.define.call(this, Type.subtypes, TypeName, constructHandlerOrConfig, proto, config);
        }
        // so, here we go with
        // defineFromType.call
        // from the next step
        return exports.define.call(this, Type.subtypes, constructHandlerOrConfig, proto, config);
    }
    throw new WRONG_TYPE_DEFINITION('definition is not provided');
};
exports.lookup = function (TypeNestedPath) {
    if (typeof TypeNestedPath !== 'string') {
        throw new WRONG_TYPE_DEFINITION('arg : type nested path must be a string');
    }
    if (!TypeNestedPath.length) {
        throw new WRONG_TYPE_DEFINITION('arg : type nested path has no path');
    }
    const split = getTypeSplitPath(TypeNestedPath);
    const [name] = split;
    const type = this.get(name);
    if (split.length == 1) {
        return type;
    }
    const NextNestedPath = split.slice(1).join('.');
    return exports.lookup.call(type.subtypes, NextNestedPath);
};
exports.default = {
    define : exports.define,
    lookup : exports.lookup
};
