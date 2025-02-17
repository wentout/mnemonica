'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookup = exports.define = void 0;
const hop_1 = require("../../utils/hop");
const constants_1 = require("../../constants");
const { odp, SymbolParentType, SymbolConstructorName, SymbolConfig, TYPE_TITLE_PREFIX, MNEMOSYNE, } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const { ALREADY_DECLARED, WRONG_TYPE_DEFINITION, TYPENAME_MUST_BE_A_STRING, HANDLER_MUST_BE_A_FUNCTION, } = errors_1.ErrorsTypes;
const hooksApi = require("../hooks");
const TypeProxy_1 = require("./TypeProxy");
const compileNewModificatorFunctionBody_1 = require("./compileNewModificatorFunctionBody");
const utils_1 = require("../utils");
const { checkProto, getTypeChecker, CreationHandler, getTypeSplitPath, checkTypeName, isClass, } = utils_1.default;
const errors_2 = require("../errors");
const TypeDescriptor = function (defineOrigin, types, TypeName, constructHandler, proto, config) {
    const parentType = types[SymbolParentType] || null;
    const isSubType = parentType ? true : false;
    const collection = isSubType ? parentType.collection : types[MNEMOSYNE];
    if (types.has(TypeName)) {
        throw new ALREADY_DECLARED;
    }
    checkProto(proto);
    const subtypes = new Map();
    const title = `${TYPE_TITLE_PREFIX}${TypeName}`;
    config = Object.assign({}, collection[SymbolConfig], config);
    const type = Object.assign(this, {
        get constructHandler() {
            return constructHandler;
        },
        TypeName,
        proto,
        isSubType,
        subtypes,
        parentType,
        collection,
        title,
        config,
        hooks: Object.create(null)
    });
    errors_2.getStack.call(this, `Definition of [ ${TypeName} ] made at:`, [], defineOrigin);
    odp(subtypes, SymbolParentType, {
        get() {
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
    get() {
        return getTypeChecker(this.TypeName);
    }
});
const defineFromType = function (subtypes, constructHandlerGetter, config) {
    const type = constructHandlerGetter();
    if (typeof type !== 'function') {
        throw new HANDLER_MUST_BE_A_FUNCTION;
    }
    const TypeName = type.name;
    if (!TypeName) {
        throw new TYPENAME_MUST_BE_A_STRING;
    }
    const asClass = isClass(type);
    const makeConstructHandler = () => {
        const constructHandler = constructHandlerGetter();
        odp(constructHandler, SymbolConstructorName, {
            get() {
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
    }
    else {
        config = {};
    }
    config.asClass = asClass;
    return new TypeDescriptor(this, subtypes, TypeName, makeConstructHandler, type.prototype, config);
};
const extractNonEnumerableProps = (_obj) => {
    const extracted = Object.entries(Object.getOwnPropertyDescriptors(_obj)).reduce((obj, entry) => {
        const [name, { value }] = entry;
        odp(obj, name, {
            value,
            configurable: true,
            enumerable: true,
            writable: true,
        });
        return obj;
    }, {});
    return extracted;
};
const defineFromFunction = function (subtypes, TypeName, constructHandler = function () { }, proto, config = {}) {
    if (typeof constructHandler !== 'function') {
        throw new HANDLER_MUST_BE_A_FUNCTION;
    }
    const asClass = isClass(constructHandler);
    const modificatorBody = (0, compileNewModificatorFunctionBody_1.default)(TypeName, asClass);
    const makeConstructHandler = modificatorBody(constructHandler, CreationHandler, SymbolConstructorName);
    if (!proto) {
        if ((0, hop_1.hop)(constructHandler, 'prototype')) {
            proto = Object.assign({}, constructHandler.prototype);
        }
        else {
            proto = {};
        }
    }
    if (asClass) {
        proto = extractNonEnumerableProps(proto);
    }
    if (config instanceof Function) {
        config = {
            ModificationConstructor: config
        };
    }
    if (typeof config !== 'object') {
        config = {};
    }
    config.asClass = asClass;
    return new TypeDescriptor(this, subtypes, TypeName, makeConstructHandler, proto, config);
};
const define = function (subtypes, TypeOrTypeName, constructHandlerOrConfig, proto, config) {
    if (typeof TypeOrTypeName === 'function') {
        if (TypeOrTypeName.name) {
            return exports.define.call(this, subtypes, TypeOrTypeName.name, TypeOrTypeName, constructHandlerOrConfig || TypeOrTypeName.prototype, config);
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
        return exports.define.call(this, Type.subtypes, constructHandlerOrConfig, proto, config);
    }
    throw new WRONG_TYPE_DEFINITION('definition is not provided');
};
exports.define = define;
const lookup = function (TypeNestedPath) {
    if (typeof TypeNestedPath !== 'string') {
        throw new WRONG_TYPE_DEFINITION('arg : type nested path must be a string');
    }
    if (!TypeNestedPath.length) {
        throw new WRONG_TYPE_DEFINITION('arg : type nested path has no path');
    }
    const split = getTypeSplitPath(TypeNestedPath);
    const [name] = split;
    const type = this.get(name);
    if (split.length === 1) {
        return type;
    }
    const NextNestedPath = split.slice(1).join('.');
    return exports.lookup.call(type.subtypes, NextNestedPath);
};
exports.lookup = lookup;
//# sourceMappingURL=index.js.map