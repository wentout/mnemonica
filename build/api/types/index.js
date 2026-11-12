'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookup = exports.lazy = exports.define = void 0;
const hop_1 = require("../../utils/hop");
const constants_1 = require("../../constants");
const { odp, SymbolParentType, SymbolConstructorName, SymbolConfig, TYPE_TITLE_PREFIX, MNEMOSYNE, } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const Mnemosyne_1 = __importDefault(require("./Mnemosyne"));
const { getDefaultPrototype } = Mnemosyne_1.default;
const { ALREADY_DECLARED, WRONG_TYPE_DEFINITION, WRONG_MODIFICATION_PATTERN, TYPENAME_MUST_BE_A_STRING, HANDLER_MUST_BE_A_FUNCTION, OPTIONS_ERROR, } = errors_1.ErrorsTypes;
const hooksApi = __importStar(require("../hooks"));
const TypeProxy_1 = require("./TypeProxy");
const compileNewModificatorFunctionBody_1 = __importStar(require("./compileNewModificatorFunctionBody"));
const lazyDefinition_1 = require("./lazyDefinition");
const utils_1 = __importStar(require("../utils"));
const { getCachedTypeChecker, getTypeSplitPath, checkTypeName, isClass, } = utils_1.default;
const errors_2 = require("../errors");
const installLazyDefinition = function (type, TypeName, shimConstructHandler, shimProto, mergedConfig, getter) {
    const cell = {
        handler: undefined,
        asClass: false,
        proto: shimProto,
        failed: false,
        error: undefined
    };
    const reset = function () {
        cell.handler = undefined;
        cell.asClass = false;
        cell.proto = shimProto;
        cell.failed = false;
        cell.error = undefined;
    };
    const gather = function () {
        reset();
        try {
            const gathered = getter();
            if (!(0, compileNewModificatorFunctionBody_1.isCallableCandidate)(gathered)) {
                throw new HANDLER_MUST_BE_A_FUNCTION;
            }
            (0, compileNewModificatorFunctionBody_1.classifyConstructHandler)(TypeName, gathered);
            const handler = gathered;
            cell.handler = handler;
            cell.asClass = isClass(handler);
            cell.proto = ((0, hop_1.hop)(handler, 'prototype') &&
                (typeof handler.prototype === 'object')) ? handler.prototype : getDefaultPrototype();
        }
        catch (error) {
            cell.failed = true;
            cell.error = error;
        }
    };
    (0, lazyDefinition_1.setLazyDefinition)(type, {
        cell,
        blockErrors: mergedConfig.blockErrors !== false,
        gather,
        reset
    });
    const lazyConstructHandler = function () {
        if (cell.handler === undefined) {
            const shimResult = shimConstructHandler();
            return shimResult;
        }
        const { handler } = cell;
        const modificatorBody = (0, compileNewModificatorFunctionBody_1.default)(TypeName, cell.asClass);
        const wrappedBody = modificatorBody(handler, utils_1.CreationHandler, SymbolConstructorName);
        const handlerResult = wrappedBody();
        return handlerResult;
    };
    odp(type, 'constructHandler', {
        get() {
            return lazyConstructHandler;
        },
        enumerable: true,
        configurable: true
    });
    odp(type, 'proto', {
        get() {
            const result = cell.proto;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    odp(type, 'config', {
        get() {
            const result = Object.assign({}, mergedConfig, { asClass: cell.asClass });
            return result;
        },
        enumerable: true,
        configurable: true
    });
};
const typeDescriptorCreator = function (defineOrigin, types, TypeName, constructHandler, proto, config, lazyGetter) {
    const parentType = types[SymbolParentType] || null;
    const isSubType = parentType ? true : false;
    const collection = isSubType
        ? parentType.collection
        : types[MNEMOSYNE];
    if (types.has(TypeName)) {
        throw new ALREADY_DECLARED(TypeName);
    }
    const subtypes = new Map();
    const title = `${TYPE_TITLE_PREFIX}${TypeName}`;
    if (config !== undefined && typeof config === 'object' && 'name' in config) {
        const nameError = '\"name\" is a collection option ' +
            '(createTypesCollection({ name })) — it cannot be set on a type';
        throw new OPTIONS_ERROR(nameError);
    }
    config = Object.assign({}, collection[SymbolConfig], config);
    Reflect.deleteProperty(config, 'name');
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
    if (lazyGetter !== undefined) {
        installLazyDefinition(type, TypeName, constructHandler, proto, config, lazyGetter);
    }
    odp(subtypes, SymbolParentType, {
        get() {
            return type;
        }
    });
    const ancestor = (isSubType || lazyGetter !== undefined) ? undefined : proto;
    types.set(TypeName, new TypeProxy_1.TypeProxy(type, ancestor));
    const result = types.get(TypeName);
    return result;
};
const TypeDescriptor = typeDescriptorCreator;
Object.assign(TypeDescriptor.prototype, hooksApi);
TypeDescriptor.prototype.define = function (TypeOrTypeName, constructHandlerOrConfig, config) {
    const result = exports.define.call(exports.define, this.subtypes, TypeOrTypeName, constructHandlerOrConfig, config);
    return result;
};
TypeDescriptor.prototype.lazy = function (TypeName, getter, config) {
    const result = exports.lazy.call(this, this.subtypes, TypeName, getter, config);
    return result;
};
TypeDescriptor.prototype.lookup = function (TypeNestedPath) {
    const relativeResult = exports.lookup.call(this.subtypes, TypeNestedPath);
    if (relativeResult) {
        return relativeResult;
    }
    const collection = this.collection;
    const rootResult = collection.lookup(TypeNestedPath);
    return rootResult;
};
odp(TypeDescriptor.prototype, 'decorate', {
    get() {
        const self = this;
        const result = function (options) {
            const decorator = function (cstr) {
                const { name } = cstr;
                const defineResult = self.define(name, cstr, options);
                return defineResult;
            };
            return decorator;
        };
        return result;
    },
    enumerable: true
});
odp(TypeDescriptor.prototype, Symbol.hasInstance, {
    get() {
        const result = getCachedTypeChecker(this.TypeName);
        return result;
    }
});
const resolveDefinitionContext = function (subtypes, path) {
    const split = getTypeSplitPath(path);
    const [head, ...rest] = split;
    const parent = exports.lookup.call(subtypes, head);
    if (!parent) {
        if (rest.length > 0) {
            throw new WRONG_TYPE_DEFINITION(`parent ${head} definition is not yet exists!`);
        }
        const noParentResult = { target: subtypes, name: head };
        return noParentResult;
    }
    if (rest.length > 0) {
        const nestedResult = resolveDefinitionContext(parent.subtypes, rest.join('.'));
        return nestedResult;
    }
    const resolvedResult = { target: subtypes, name: head, parent };
    return resolvedResult;
};
const checkDuplicate = function (target, name) {
    const existing = exports.lookup.call(target, name);
    if (existing) {
        throw new ALREADY_DECLARED(name);
    }
};
const createFromDirectHandler = function (defineOrigin, target, name, handler, config, lazyGetter) {
    handler = handler || function () { };
    const asClass = isClass(handler);
    const modificatorBody = (0, compileNewModificatorFunctionBody_1.default)(name, asClass);
    const makeConstructHandler = modificatorBody(handler, utils_1.CreationHandler, SymbolConstructorName);
    if (config instanceof Function) {
        config = {
            ModificationConstructor: config
        };
    }
    config.asClass = asClass;
    const proto = ((0, hop_1.hop)(handler, 'prototype') &&
        (typeof handler.prototype === 'object')) ? handler.prototype : getDefaultPrototype();
    if (!target.has(name)) {
        (0, compileNewModificatorFunctionBody_1.classifyConstructHandler)(name, handler);
    }
    const result = new TypeDescriptor(defineOrigin, target, name, makeConstructHandler, proto, config, lazyGetter);
    return result;
};
const createFromLazyDefinition = function (defineOrigin, target, name, getter, config) {
    const result = createFromDirectHandler(defineOrigin, target, name, undefined, config, getter);
    return result;
};
const define = function (subtypes, TypeOrTypeName, constructHandlerOrConfig, config) {
    if (!config || (typeof config !== 'object' && typeof config !== 'function')) {
        config = {};
    }
    if (typeof TypeOrTypeName === 'function') {
        const fn = TypeOrTypeName;
        if (fn.name) {
            checkDuplicate(subtypes, fn.name);
            const defineResult = exports.define.call(this, subtypes, fn.name, fn, config);
            return defineResult;
        }
        throw new TYPENAME_MUST_BE_A_STRING;
    }
    if (typeof TypeOrTypeName !== 'string') {
        throw new WRONG_TYPE_DEFINITION('definition is not provided');
    }
    checkTypeName(TypeOrTypeName);
    let handler;
    if (typeof constructHandlerOrConfig === 'function') {
        handler = constructHandlerOrConfig;
    }
    else if (typeof constructHandlerOrConfig === 'object') {
        config = constructHandlerOrConfig;
    }
    const { target, name, parent } = resolveDefinitionContext(subtypes, TypeOrTypeName);
    if (parent && !handler) {
        throw new WRONG_TYPE_DEFINITION('definition is not provided');
    }
    const result = createFromDirectHandler(this, target, name, handler, config);
    return result;
};
exports.define = define;
const lazy = function (subtypes, TypeName, getter, config) {
    if (typeof TypeName !== 'string') {
        throw new TYPENAME_MUST_BE_A_STRING;
    }
    if (typeof getter !== 'function') {
        throw new HANDLER_MUST_BE_A_FUNCTION;
    }
    const callbackKind = getter.constructor.name;
    if (callbackKind === 'AsyncFunction' ||
        callbackKind === 'GeneratorFunction' ||
        callbackKind === 'AsyncGeneratorFunction') {
        const msg = `${TypeName}: lazy callback must be a sync function ` +
            '(async and generator callbacks are not supported)';
        throw new WRONG_MODIFICATION_PATTERN(msg);
    }
    if (!config || (typeof config !== 'object' && typeof config !== 'function')) {
        config = {};
    }
    checkTypeName(TypeName);
    const { target, name } = resolveDefinitionContext(subtypes, TypeName);
    const lazyResult = createFromLazyDefinition(this, target, name, getter, config);
    return lazyResult;
};
exports.lazy = lazy;
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
    if (!type) {
        return undefined;
    }
    const result = exports.lookup.call(type.subtypes, NextNestedPath);
    return result;
};
exports.lookup = lookup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3R5cGVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0NiLHlDQUFzQztBQUV0QywrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLFlBQVksRUFFWixpQkFBaUIsRUFDakIsU0FBUyxHQUVULEdBQUcscUJBQVMsQ0FBQztBQUVkLHFEQUF1RDtBQUd2RCw0REFBcUM7QUFDckMsTUFBTSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsbUJBQVUsQ0FBQztBQUUzQyxNQUFNLEVBQ0wsZ0JBQWdCLEVBQ2hCLHFCQUFxQixFQUNyQiwwQkFBMEIsRUFDMUIseUJBQXlCLEVBQ3pCLDBCQUEwQixFQUMxQixhQUFhLEdBQ2IsR0FBRyxvQkFBVyxDQUFDO0FBS2hCLG1EQUFxQztBQUNyQywyQ0FBd0M7QUFFeEMseUdBSTZDO0FBRTdDLHFEQUcwQjtBQUUxQixrREFBdUQ7QUFDdkQsTUFBTSxFQUNMLG9CQUFvQixFQUNwQixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLE9BQU8sR0FDUCxHQUFHLGVBQVUsQ0FBQztBQUVmLHNDQUdtQjtBQWFuQixNQUFNLHFCQUFxQixHQUFHLFVBQzdCLElBQTRCLEVBQzVCLFFBQWdCLEVBQ2hCLG9CQUFpRCxFQUNqRCxTQUF1QyxFQUN2QyxZQUEwQyxFQUMxQyxNQUF1QjtJQUt2QixNQUFNLElBQUksR0FBdUI7UUFDaEMsT0FBTyxFQUFHLFNBQVM7UUFDbkIsT0FBTyxFQUFHLEtBQUs7UUFDZixLQUFLLEVBQUssU0FBUztRQUNuQixNQUFNLEVBQUksS0FBSztRQUNmLEtBQUssRUFBSyxTQUFTO0tBQ25CLENBQUM7SUFJRixNQUFNLEtBQUssR0FBRztRQUNiLElBQUksQ0FBQyxPQUFPLEdB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QU0sRUFDTixNQUE0QixDQUM1QixDQUFDO0lBQ0YsT0FBTyxVQUFVLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBdkRXLFFBQUEsSUFBSSxRQXVEZjtBQUVLLE1BQU0sTUFBTSxHQUFHLFVBRXJCLGNBQXNCO0lBR3RCLElBQUksT0FBTyxjQUFjLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDeEMsTUFBTSxJQUFJLHFCQUFxQixDQUFDLHlDQUF5QyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUIsTUFBTSxJQUFJLHFCQUFxQixDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRS9DLE1BQU0sQ0FBRSxJQUFJLENBQUUsR0FBRyxLQUFLLENBQUM7SUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQTBCLENBQUM7SUFDckQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFJRCxNQUFNLE1BQU0sR0FBRyxjQUFNLENBQUMsSUFBSSxDQUN6QixJQUFJLENBQUMsUUFBb0IsRUFDekIsY0FBYyxDQUNkLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUVmLENBQUMsQ0FBQztBQWxDVyxRQUFBLE1BQU0sVUFrQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENvbnN0cnVjdGlvbiBQaXBlbGluZSAoaGlnaC1sZXZlbCBmbG93KTpcbiAqXG4gKiAgIGRlZmluZShUeXBlTmFtZSwgY3RvcikgIOKGkiAgbmV3IFR5cGVEZXNjcmlwdG9yKCkgIOKGkiAgbmV3IFR5cGVQcm94eSgpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnN0YW5jZUNyZWF0b3IodHlwZSwgcGFyZW50LCBhcmdzKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWtlSW5zdGFuY2VNb2RpZmljYXRvcihzZWxmKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RpZmljYXRpb25Db25zdHJ1Y3Rvci5jYWxsKHBhcmVudCwgTW9kaWZpY2F0b3JUeXBlLCBwcm90bywgX2FkZFByb3BzKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyIGNvbnN0cnVjdG9yIHJ1bnMgKG5ldyBNb2RpZmljYXRvclR5cGUoLi4uYXJncykpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQcm9jZXNzaW5nKCkg4oaSIGludm9rZVBvc3RIb29rcygpXG4gKi9cblxuaW1wb3J0IHtcblx0X0ludGVybmFsX1RDXyxcblx0VHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0VHlwZUNsYXNzLFxuXHRUeXBlRGVmLFxuXHRDb2xsZWN0aW9uRGVmLFxuXHRjb25zdHJ1Y3Rvck9wdGlvbnMsXG5cdFR5cGVBYnNvcmJlcixcblx0TW9kaWZpY2F0aW9uQ29uc3RydWN0b3JGYWN0b3J5LFxuXHRNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHREZWZpbmVOZXdhYmxlLFxuXHRMYXp5RGVmLFxufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGhvcCB9IGZyb20gJy4uLy4uL3V0aWxzL2hvcCc7XG5cbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5jb25zdCB7XG5cdG9kcCxcblx0U3ltYm9sUGFyZW50VHlwZSxcblx0U3ltYm9sQ29uc3RydWN0b3JOYW1lLFxuXHRTeW1ib2xDb25maWcsXG5cblx0VFlQRV9USVRMRV9QUkVGSVgsXG5cdE1ORU1PU1lORSxcblxufSA9IGNvbnN0YW50cztcblxuaW1wb3J0IHsgRXJyb3JzVHlwZXMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycy9lcnJvcnMnO1xuLy8gaW1wb3J0IHsgZGVzY3JpcHRvcnMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycyc7XG5cbmltcG9ydCBtbmVtb3N5bmVzIGZyb20gJy4vTW5lbW9zeW5lJztcbmNvbnN0IHsgZ2V0RGVmYXVsdFByb3RvdHlwZSB9ID0gbW5lbW9zeW5lcztcblxuY29uc3Qge1xuXHRBTFJFQURZX0RFQ0xBUkVELFxuXHRXUk9OR19UWVBFX0RFRklOSVRJT04sXG5cdFdST05HX01PRElGSUNBVElPTl9QQVRURVJOLFxuXHRUWVBFTkFNRV9NVVNUX0JFX0FfU1RSSU5HLFxuXHRIQU5ETEVSX01VU1RfQkVfQV9GVU5DVElPTixcblx0T1BUSU9OU19FUlJPUixcbn0gPSBFcnJvcnNUeXBlcztcblxuLy8gaW52b2tlSG9va1xuLy8gcmVnaXN0ZXJIb29rXG4vLyByZWdpc3RlckZsb3dDaGVja2VyXG5pbXBvcnQgKiBhcyBob29rc0FwaSBmcm9tICcuLi9ob29rcyc7XG5pbXBvcnQgeyBUeXBlUHJveHkgfSBmcm9tICcuL1R5cGVQcm94eSc7XG5cbmltcG9ydCBjb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHksIHtcblx0Y2xhc3NpZnlDb25zdHJ1Y3RIYW5kbGVyLFxuXHRpc0NhbGxhYmxlQ2FuZGlkYXRlLFxuXHRDb25zdHJ1Y3RIYW5kbGVyXG59IGZyb20gJy4vY29tcGlsZU5ld01vZGlmaWNhdG9yRnVuY3Rpb25Cb2R5JztcblxuaW1wb3J0IHtcblx0c2V0TGF6eURlZmluaXRpb24sXG5cdExhenlEZWZpbml0aW9uQ2VsbCxcbn0gZnJvbSAnLi9sYXp5RGVmaW5pdGlvbic7XG5cbmltcG9ydCBUeXBlc1V0aWxzLCB7IENyZWF0aW9uSGFuZGxlciB9IGZyb20gJy4uL3V0aWxzJztcbmNvbnN0IHtcblx0Z2V0Q2FjaGVkVHlwZUNoZWNrZXIsXG5cdGdldFR5cGVTcGxpdFBhdGgsXG5cdGNoZWNrVHlwZU5hbWUsXG5cdGlzQ2xhc3MsXG59ID0gVHlwZXNVdGlscztcblxuaW1wb3J0IHtcblx0Z2V0U3RhY2ssXG5cdFN0YWNrYWJsZUluc3RhbmNlLFxufSBmcm9tICcuLi9lcnJvcnMnO1xuXG5leHBvcnQgdHlwZSBUeXBlc01hcCA9IE1hcDxzdHJpbmcsIG9iamVjdD4gJiB7XG5cdFtTeW1ib2xQYXJlbnRUeXBlXT86IFR5cGVEZWY7XG5cdFtNTkVNT1NZTkVdPzogQ29sbGVjdGlvbkRlZjtcbn07XG5cbi8vIExhenkgdHlwZSBmYWNhZGVzLlxuLy8gQSBsYXp5IHR5cGUgaXMgYSByZWd1bGFyIGRlZmluZSB3aG9zZSBoYW5kbGVyIGlzIHRoZSBlbXB0eSBzaGltOyB0aGUgcmVhbFxuLy8gY29uc3RydWN0b3IgaXMgZ2F0aGVyZWQgZnJvbSB0aGUgY2FsbGJhY2sgb25jZSBwZXIgY29uc3RydWN0aW9uIChzZWVcbi8vIGxhenlEZWZpbml0aW9uLnRzKS4gVGhlIHR5cGUncyBwcm90byAvIGNvbmZpZyAvIGNvbnN0cnVjdEhhbmRsZXIgcmVhZCB0aGVcbi8vIGdhdGhlciBjZWxsLCBzbyB0aGUgc2FtZSB0eXBlIG9iamVjdCBzZXJ2ZXMgZXZlcnkgY29uc3RydWN0aW9uIHdpdGhvdXRcbi8vIGV2ZXIgY2FsbGluZyB0aGUgY2FsbGJhY2sgYXQgZGVmaW5lIHRpbWUuXG5jb25zdCBpbnN0YWxsTGF6eURlZmluaXRpb24gPSBmdW5jdGlvbiAoXG5cdHR5cGU6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsXG5cdFR5cGVOYW1lOiBzdHJpbmcsXG5cdHNoaW1Db25zdHJ1Y3RIYW5kbGVyOiBNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdHNoaW1Qcm90bzogeyBbaW5kZXg6IHN0cmluZ106IHVua25vd24gfSxcblx0bWVyZ2VkQ29uZmlnOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRnZXR0ZXI6IExhenlEZWY8b2JqZWN0PlxuKSB7XG5cblx0Ly8gb3V0c2lkZSBhbnkgY29uc3RydWN0aW9uIHRoZSBjZWxsIGhvbGRzIHRoZSBkZWZpbmUtdGltZSBmYWxsYmFjazpcblx0Ly8gbm8gaGFuZGxlciwgdGhlIHNoaW0ncyBlbXB0eSBwcm90b3R5cGUsIGFzQ2xhc3Mgb2ZmLCBubyBmYWlsdXJlXG5cdGNvbnN0IGNlbGw6IExhenlEZWZpbml0aW9uQ2VsbCA9IHtcblx0XHRoYW5kbGVyIDogdW5kZWZpbmVkLFxuXHRcdGFzQ2xhc3MgOiBmYWxzZSxcblx0XHRwcm90byAgIDogc2hpbVByb3RvLFxuXHRcdGZhaWxlZCAgOiBmYWxzZSxcblx0XHRlcnJvciAgIDogdW5kZWZpbmVkXG5cdH07XG5cblx0Ly8gYmFjayB0byB0aGUgZGVmaW5lLXRpbWUgc3RhdGU6IG5vIGhhbmRsZXIgcmV0YWluZWQsIHRoZSBzaGltJ3MgZW1wdHlcblx0Ly8gcHJvdG90eXBlLCBhc0NsYXNzIG9mZiwgbm8gZXJyb3Jcblx0Y29uc3QgcmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Y2VsbC5oYW5kbGVyID0gdW5kZWZpbmVkO1xuXHRcdGNlbGwuYXNDbGFzcyA9IGZhbHNlO1xuXHRcdGNlbGwucHJvdG8gPSBzaGltUHJvdG87XG5cdFx0Y2VsbC5mYWlsZWQgPSBmYWxzZTtcblx0XHRjZWxsLmVycm9yID0gdW5kZWZpbmVkO1xuXHR9O1xuXG5cdC8vIHRoZSBzaW5nbGUgY2FsbGJhY2sgY2FsbCBwZXIgY29uc3RydWN0aW9uIOKAlCBpbnZva2VkIE9OTFkgYnlcblx0Ly8gZ2F0aGVyTGF6eURlZmluaXRpb24gYXQgdGhlIGNvbnN0cnVjdGlvbiBlbnRyaWVzXG5cdGNvbnN0IGdhdGhlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXNldCgpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBnYXRoZXJlZCA9IGdldHRlcigpO1xuXHRcdFx0aWYgKCFpc0NhbGxhYmxlQ2FuZGlkYXRlKGdhdGhlcmVkKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgSEFORExFUl9NVVNUX0JFX0FfRlVOQ1RJT047XG5cdFx0XHR9XG5cdFx0XHQvLyB0aGUgc2hhcGUgY2hlY2tzIGFyZSB3aGF0IG1ha2UgaXQgYSBDb25zdHJ1Y3RIYW5kbGVyXG5cdFx0XHRjbGFzc2lmeUNvbnN0cnVjdEhhbmRsZXIoXG5cdFx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0XHRnYXRoZXJlZFxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGhhbmRsZXIgPSBnYXRoZXJlZDtcblx0XHRcdGNlbGwuaGFuZGxlciA9IGhhbmRsZXI7XG5cdFx0XHRjZWxsLmFzQ2xhc3MgPSBpc0NsYXNzKGhhbmRsZXIpO1xuXHRcdFx0Ly8gc2FtZSBmYWxsYmFjayBhcyB0aGUgZGlyZWN0IHBhdGg6IGFuIG93biBOT04tT0JKRUNUIHByb3RvdHlwZVxuXHRcdFx0Ly8gKHByb3RvdHlwZSA9IDEyMykgaXMgcmVwbGFjZWQgYnkgdGhlIGRlZmF1bHRcblx0XHRcdGNlbGwucHJvdG8gPSAoXG5cdFx0XHRcdGhvcChcblx0XHRcdFx0XHRoYW5kbGVyLFxuXHRcdFx0XHRcdCdwcm90b3R5cGUnXG5cdFx0XHRcdCkgJiZcblx0XHRcdFx0KHR5cGVvZiBoYW5kbGVyLnByb3RvdHlwZSA9PT0gJ29iamVjdCcpXG5cdFx0XHQpID8gaGFuZGxlci5wcm90b3R5cGUgOiBnZXREZWZhdWx0UHJvdG90eXBlKCk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdC8vIHBhc3N0aHJvdWdoLCBleGFjdGx5IGxpa2UgcnVuQnVpbGQncyBjYXRjaDogd2hhdGV2ZXIgdGhlXG5cdFx0XHQvLyBjYWxsYmFjayB0aHJldyByZWFjaGVzIHRocm93TW9kaWZpY2F0aW9uRXJyb3IgYXMtaXMgKGEgdGhyb3duXG5cdFx0XHQvLyBub24tRXJyb3IgYnJlYWtzIHRoZSBwcm90b3R5cGUgc3BsaWNlIHRoZXJlIHRoZSBzYW1lIHdheSBpdFxuXHRcdFx0Ly8gZG9lcyBmb3IgYSBjb25zdHJ1Y3RvciBib2R5KS4gVGhlIGZsYWcgaXMgc2VwYXJhdGUgZnJvbSB0aGVcblx0XHRcdC8vIHZhbHVlOiBhIGNhbGxiYWNrIG1heSB0aHJvdyB1bmRlZmluZWRcblx0XHRcdGNlbGwuZmFpbGVkID0gdHJ1ZTtcblx0XHRcdGNlbGwuZXJyb3IgPSBlcnJvcjtcblx0XHR9XG5cdH07XG5cblx0Ly8ga2V5ZWQgYnkgdGhlIHR5cGUgZGVzY3JpcHRvciBoZXJlOyBUeXBlUHJveHkgcmVnaXN0ZXJzIGl0cyBwcm94eVxuXHQvLyBhZ2FpbnN0IHRoZSBzYW1lIGRlZmluaXRpb24gd2hlbiBpdCB3cmFwcyB0aGlzIHR5cGVcblx0c2V0TGF6eURlZmluaXRpb24oXG5cdFx0dHlwZSxcblx0XHR7XG5cdFx0XHRjZWxsLFxuXHRcdFx0Ly8gdGhlIG1lcmdlZCBjb25maWcgdmFsdWUgYXQgZGVmaW5lIHRpbWUg4oCUIHRoZSBjYWxsYmFjayBtdXN0XG5cdFx0XHQvLyBub3QgcnVuIHdoZW4gdGhlIGNvbnN0cnVjdGlvbiB3aWxsIGJlIGJsb2NrZWRcblx0XHRcdGJsb2NrRXJyb3JzIDogbWVyZ2VkQ29uZmlnLmJsb2NrRXJyb3JzICE9PSBmYWxzZSxcblx0XHRcdGdhdGhlcixcblx0XHRcdHJlc2V0XG5cdFx0fVxuXHQpO1xuXG5cdC8vIHplcm8tYXJnIGZhY3RvcnksIHRoZSBzYW1lIGNvbnRyYWN0IGFzIGEgZGlyZWN0IHR5cGUnc1xuXHQvLyBjb25zdHJ1Y3RIYW5kbGVyOiBidWlsZHMgdGhlIHdyYXBwZXIgZnJvbSB0aGUgZ2F0aGVyZWQgaGFuZGxlcixcblx0Ly8gcmVidWlsdCBvbiBldmVyeSBjb25zdHJ1Y3Rpb24gKHRoZSBjYWxsYmFjayBtYXkgcmV0dXJuIGEgbmV3IGZ1bmN0aW9uXG5cdC8vIGVhY2ggdGltZSk7IGJlZm9yZSB0aGUgZ2F0aGVyIOKAlCBhbmQgYWZ0ZXIgYSBmYWlsZWQgb25lIOKAlCBpdCBidWlsZHNcblx0Ly8gdGhlIHNoaW0ncyB3cmFwcGVyLCB3aGljaCB0aGUgZXJyb3IgcGF0aCB0aGVuIHJlcGxhY2VzXG5cdGNvbnN0IGxhenlDb25zdHJ1Y3RIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmIChjZWxsLmhhbmRsZXIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3Qgc2hpbVJlc3VsdCA9IHNoaW1Db25zdHJ1Y3RIYW5kbGVyKCk7XG5cdFx0XHRyZXR1cm4gc2hpbVJlc3VsdDtcblx0XHR9XG5cdFx0Y29uc3QgeyBoYW5kbGVyIH0gPSBjZWxsO1xuXHRcdGNvbnN0IG1vZGlmaWNhdG9yQm9keSA9IGNvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keShcblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0Y2VsbC5hc0NsYXNzXG5cdFx0KTtcblx0XHRjb25zdCB3cmFwcGVkQm9keSA9IG1vZGlmaWNhdG9yQm9keShcblx0XHRcdGhhbmRsZXIsXG5cdFx0XHRDcmVhdGlvbkhhbmRsZXIsXG5cdFx0XHRTeW1ib2xDb25zdHJ1Y3Rvck5hbWVcblx0XHQpO1xuXHRcdGNvbnN0IGhhbmRsZXJSZXN1bHQgPSB3cmFwcGVkQm9keSgpO1xuXHRcdHJldHVybiBoYW5kbGVyUmVzdWx0O1xuXHR9O1xuXG5cdG9kcChcblx0XHR0eXBlLFxuXHRcdCdjb25zdHJ1Y3RIYW5kbGVyJywge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGxhenlDb25zdHJ1Y3RIYW5kbGVyO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGUgICA6IHRydWUsXG5cdFx0XHRjb25maWd1cmFibGUgOiB0cnVlXG5cdFx0fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0eXBlLFxuXHRcdCdwcm90bycsIHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGNlbGwucHJvdG87XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZSAgIDogdHJ1ZSxcblx0XHRcdGNvbmZpZ3VyYWJsZSA6IHRydWVcblx0XHR9XG5cdCk7XG5cblx0Ly8gYSBmcmVzaCBjb3B5IHBlciByZWFkOiBhc0NsYXNzIGlzIHBlci1jb25zdHJ1Y3Rpb24gYW5kIG11c3QgbmV2ZXJcblx0Ly8gbGVhayBpbnRvIHRoZSBzaGFyZWQgbWVyZ2VkIGNvbmZpZ1xuXHRvZHAoXG5cdFx0dHlwZSxcblx0XHQnY29uZmlnJywge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdFx0XHR7fSxcblx0XHRcdFx0XHRtZXJnZWRDb25maWcsXG5cdFx0XHRcdFx0eyBhc0NsYXNzIDogY2VsbC5hc0NsYXNzIH1cblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlICAgOiB0cnVlLFxuXHRcdFx0Y29uZmlndXJhYmxlIDogdHJ1ZVxuXHRcdH1cblx0KTtcblxufTtcblxuY29uc3QgdHlwZURlc2NyaXB0b3JDcmVhdG9yID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRkZWZpbmVPcmlnaW46IFR5cGVBYnNvcmJlcixcblx0dHlwZXM6IFR5cGVzTWFwLFxuXHRUeXBlTmFtZTogc3RyaW5nLFxuXHRjb25zdHJ1Y3RIYW5kbGVyOiBNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdHByb3RvOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRjb25maWc6IHsgW2luZGV4OiBzdHJpbmddOiB1bmtub3duIH0sXG5cdGxhenlHZXR0ZXI/OiBMYXp5RGVmPG9iamVjdD4sXG4pIHtcblxuXHQvLyBoZXJlIFwidHlwZXNcIiByZWZlcnMgdG8gc3VidHlwZXMgb2YgdHlwZSBvciBjb2xsZWN0aW9uIG9iamVjdCB7fVxuXG5cdGNvbnN0IHBhcmVudFR5cGUgPSB0eXBlc1sgU3ltYm9sUGFyZW50VHlwZSBdIHx8IG51bGw7XG5cblx0Y29uc3QgaXNTdWJUeXBlID0gcGFyZW50VHlwZSA/IHRydWUgOiBmYWxzZTtcblxuXHRjb25zdCBjb2xsZWN0aW9uID0gaXNTdWJUeXBlXG5cdFx0PyAocGFyZW50VHlwZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuY29sbGVjdGlvbiBhcyBvYmplY3Rcblx0XHQ6IHR5cGVzWyBNTkVNT1NZTkUgXTtcblxuXHRpZiAodHlwZXMuaGFzKFR5cGVOYW1lKSkge1xuXHRcdHRocm93IG5ldyBBTFJFQURZX0RFQ0xBUkVEKFR5cGVOYW1lKTtcblx0fVxuXG5cdC8vIGNvbnN0IHN1YnR5cGVzID0gZGVzY3JpcHRvcnMuY3JlYXRlVHlwZXNDb2xsZWN0aW9uKCk7XG5cdGNvbnN0IHN1YnR5cGVzID0gbmV3IE1hcDxzdHJpbmcsIG9iamVjdD4oKTtcblxuXHRjb25zdCB0aXRsZSA9IGAke1RZUEVfVElUTEVfUFJFRklYfSR7VHlwZU5hbWV9YDtcblxuXHQvLyAnbmFtZScgaXMgYSBDT0xMRUNUSU9OIG9wdGlvbiBvbmx5OiBhIHVzZXIgcGFzc2luZyBpdCBoZXJlIG1lYW50IHRvXG5cdC8vIG5hbWUgdGhlIGNvbGxlY3Rpb24sIG5vdCB0aGUgdHlwZSDigJQgc2F5IHNvIHJlYWRhYmx5XG5cdGlmICggY29uZmlnICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGNvbmZpZyA9PT0gJ29iamVjdCcgJiYgJ25hbWUnIGluIGNvbmZpZyApIHtcblx0XHRjb25zdCBuYW1lRXJyb3IgPSAnXFxcIm5hbWVcXFwiIGlzIGEgY29sbGVjdGlvbiBvcHRpb24gJyArXG5cdFx0XHQnKGNyZWF0ZVR5cGVzQ29sbGVjdGlvbih7IG5hbWUgfSkpIOKAlCBpdCBjYW5ub3QgYmUgc2V0IG9uIGEgdHlwZSc7XG5cdFx0dGhyb3cgbmV3IE9QVElPTlNfRVJST1IoIG5hbWVFcnJvciApO1xuXHR9XG5cdGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oXG5cdFx0e30sXG5cdFx0KGNvbGxlY3Rpb24gYXMgUmVjb3JkPHN5bWJvbCwgdW5rbm93bj4pWyBTeW1ib2xDb25maWcgXSxcblx0XHRjb25maWdcblx0KTtcblx0Ly8gbmV2ZXIgaW5oZXJpdGVkIGludG8gdGhlIHR5cGUncyBjb25maWcgZWl0aGVyXG5cdFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoIGNvbmZpZywgJ25hbWUnICk7XG5cblx0Y29uc3QgdHlwZSA9IE9iamVjdC5hc3NpZ24oXG5cdFx0dGhpcyxcblx0XHR7XG5cblx0XHRcdGdldCBjb25zdHJ1Y3RIYW5kbGVyICgpIHtcblx0XHRcdFx0cmV0dXJuIGNvbnN0cnVjdEhhbmRsZXI7XG5cdFx0XHR9LFxuXG5cblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0cHJvdG8sXG5cblx0XHRcdGlzU3ViVHlwZSxcblx0XHRcdHN1YnR5cGVzLFxuXHRcdFx0cGFyZW50VHlwZSxcblxuXHRcdFx0Y29sbGVjdGlvbixcblxuXHRcdFx0dGl0bGUsXG5cblx0XHRcdGNvbmZpZyxcblxuXHRcdFx0aG9va3MgOiBPYmplY3QuY3JlYXRlKG51bGwpXG5cblx0XHR9XG5cdCk7XG5cblx0Z2V0U3RhY2suY2FsbChcblx0XHR0aGlzIGFzIFN0YWNrYWJsZUluc3RhbmNlLFxuXHRcdGBEZWZpbml0aW9uIG9mIFsgJHtUeXBlTmFtZX0gXSBtYWRlIGF0OmAsXG5cdFx0W10sXG5cdFx0ZGVmaW5lT3JpZ2luXG5cdCk7XG5cblx0Ly8gbGF6eSB0eXBlczogcHJvdG8gLyBjb25maWcgLyBjb25zdHJ1Y3RIYW5kbGVyIGJlY29tZSBmYWNhZGVzIG92ZXIgdGhlXG5cdC8vIHBlci1jb25zdHJ1Y3Rpb24gZ2F0aGVyIGNlbGwg4oCUIHNlZSBpbnN0YWxsTGF6eURlZmluaXRpb24gYWJvdmUgYW5kXG5cdC8vIGxhenlEZWZpbml0aW9uLnRzXG5cdGlmIChsYXp5R2V0dGVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRpbnN0YWxsTGF6eURlZmluaXRpb24oXG5cdFx0XHR0eXBlLFxuXHRcdFx0VHlwZU5hbWUsXG5cdFx0XHRjb25zdHJ1Y3RIYW5kbGVyLFxuXHRcdFx0cHJvdG8sXG5cdFx0XHRjb25maWcsXG5cdFx0XHRsYXp5R2V0dGVyXG5cdFx0KTtcblx0fVxuXG5cdG9kcChcblx0XHRzdWJ0eXBlcyxcblx0XHRTeW1ib2xQYXJlbnRUeXBlLCB7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gdHlwZTtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Ly8gY29uc3QgYW5jZXN0b3IgPSBpc1N1YlR5cGUgPyBPYmplY3QuY3JlYXRlKG51bGwpIDogcHJvdG87XG5cdC8vIGEgbGF6eSByb290J3MgYW5jZXN0b3IgaXMgbm90IGtub3duIGF0IGRlZmluZSB0aW1lIGVpdGhlcjogVHlwZVByb3h5XG5cdC8vIGluc3RhbGxzIGEgZmFjYWRlIG92ZXIgdGhlIGdhdGhlciBjZWxsIHdoZW4gaXQgcmVjZWl2ZXMgdW5kZWZpbmVkIGZvclxuXHQvLyBhIG5vbi1zdWJ0eXBlIGhlcmVcblx0Y29uc3QgYW5jZXN0b3IgPSAoaXNTdWJUeXBlIHx8IGxhenlHZXR0ZXIgIT09IHVuZGVmaW5lZCkgPyB1bmRlZmluZWQgOiBwcm90bztcblx0dHlwZXMuc2V0KFxuXHRcdFR5cGVOYW1lLFxuXHRcdG5ldyBUeXBlUHJveHkoXG5cdFx0XHR0eXBlLFxuXHRcdFx0YW5jZXN0b3Jcblx0XHQpXG5cdCk7XG5cblx0Ly8gdHlwZXMuc2V0KCBUeXBlTmFtZSwgbmV3IFR5cGVQcm94eSggdHlwZSApICk7XG5cblx0Y29uc3QgcmVzdWx0ID0gdHlwZXMuZ2V0KFR5cGVOYW1lKTtcblx0cmV0dXJuIHJlc3VsdDtcblxufTtcblxuLy8gdGhlIGNyZWF0b3IgaXMgb25seSBldmVyIGludm9rZWQgd2l0aCBgbmV3YCAodGhlIGNyZWF0ZUZyb20qIGNhbGwgc2l0ZXNcbi8vIGJlbG93KTsgYSBmdW5jdGlvbiBleHByZXNzaW9uIGNhcnJpZXMgbm8gY29uc3RydWN0IHNpZ25hdHVyZSwgc28gaXQgaXNcbi8vIG5hbWVkIG9uY2UgYXMgdGhlIGNvbnN0cnVjdG9yIGludGVyZmFjZSBpdCBpcyB1c2VkIHRocm91Z2gg4oCUIHRoZVxuLy8gcHJvdG90eXBlIGNvbnRyYWN0IGlzIGF0dGFjaGVkIGltbWVkaWF0ZWx5IGJlbG93XG4vLyBUaGUgcmVnaXN0ZXJlZCByZXN1bHQgaXMgYSBUeXBlUHJveHksIG5vdCB0aGUgZGVzY3JpcHRvcidzIGRlY2xhcmVkXG4vLyBUeXBlRGVzY3JpcHRvckluc3RhbmNlIHNoYXBlLlxuY29uc3QgVHlwZURlc2NyaXB0b3IgPSB0eXBlRGVzY3JpcHRvckNyZWF0b3IgYXMgX0ludGVybmFsX1RDXzxUeXBlRGVzY3JpcHRvckluc3RhbmNlPjtcblxuT2JqZWN0LmFzc2lnbihcblx0VHlwZURlc2NyaXB0b3IucHJvdG90eXBlLFxuXHRob29rc0FwaVxuKTtcblxuVHlwZURlc2NyaXB0b3IucHJvdG90eXBlLmRlZmluZSA9IGZ1bmN0aW9uIChcblx0dGhpczogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0VHlwZU9yVHlwZU5hbWU6IHN0cmluZyB8IERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWc/OiBEZWZpbmVOZXdhYmxlT3JDYWxsYWJsZSB8IG9iamVjdCxcblx0Y29uZmlnPzogb2JqZWN0XG4pIHtcblx0Y29uc3QgcmVzdWx0ID0gZGVmaW5lLmNhbGwoXG5cdFx0ZGVmaW5lLFxuXHRcdHRoaXMuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0VHlwZU9yVHlwZU5hbWUsXG5cdFx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnLFxuXHRcdGNvbmZpZ1xuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuVHlwZURlc2NyaXB0b3IucHJvdG90eXBlLmxhenkgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsXG5cdFR5cGVOYW1lOiBzdHJpbmcsXG5cdGdldHRlcj86IExhenlEZWY8b2JqZWN0Pixcblx0Y29uZmlnPzogb2JqZWN0XG4pIHtcblx0Y29uc3QgcmVzdWx0ID0gbGF6eS5jYWxsKFxuXHRcdHRoaXMsXG5cdFx0dGhpcy5zdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRUeXBlTmFtZSxcblx0XHRnZXR0ZXIsXG5cdFx0Y29uZmlnXG5cdCk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5UeXBlRGVzY3JpcHRvci5wcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRUeXBlTmVzdGVkUGF0aDogc3RyaW5nXG4pIHtcblx0Ly8gcmVsYXRpdmUgZmlyc3Q6IHJlc29sdmUgYW1vbmcgdGhpcyB0eXBlJ3Mgb3duIHN1YnR5cGVzLFxuXHQvLyBlLmcuIEFkbWluVHlwZS5sb29rdXAoJ1N1YlR5cGUnKSBvciAnU3ViVHlwZS5EZWVwU3ViVHlwZSdcblx0Y29uc3QgcmVsYXRpdmVSZXN1bHQgPSBsb29rdXAuY2FsbChcblx0XHR0aGlzLnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFR5cGVOZXN0ZWRQYXRoXG5cdCk7XG5cdGlmIChyZWxhdGl2ZVJlc3VsdCkge1xuXHRcdHJldHVybiByZWxhdGl2ZVJlc3VsdDtcblx0fVxuXHQvLyByb290IGZhbGxiYWNrOiByZXNvbHZlIGFic29sdXRlIHJlZ2lzdHJ5IHBhdGhzIGZyb20gdGhlXG5cdC8vIGNvbGxlY3Rpb24sIGUuZy4gQWRtaW5UeXBlLmxvb2t1cCgnVXNlclR5cGUuQWRtaW5UeXBlJyksXG5cdC8vIHdoaWNoIGlzIHdoYXQgdGhlIFR5cGVMb29rdXA8UmVnaXN0cnk+IHR5cGUgY29udHJhY3QgcHJvbWlzZXNcblx0Y29uc3QgY29sbGVjdGlvbiA9IHRoaXMuY29sbGVjdGlvbiBhcyBDb2xsZWN0aW9uRGVmO1xuXHQvLyBDb2xsZWN0aW9uRGVmLmxvb2t1cCBpcyB0aGUgcnVudGltZSBjb250cmFjdCAoQ29sbGVjdGlvbkxvb2t1cCksIHNvIGFcblx0Ly8gcGxhaW4gc3RyaW5nIHBhdGggeWllbGRzIFR5cGVDbGFzcyB8IHVuZGVmaW5lZCB3aXRoIG5vIGNhc3Rcblx0Y29uc3Qgcm9vdFJlc3VsdCA9IGNvbGxlY3Rpb24ubG9va3VwKFR5cGVOZXN0ZWRQYXRoKTtcblx0cmV0dXJuIHJvb3RSZXN1bHQ7XG59O1xuXG4vLyBwcm90b3R5cGUtbGV2ZWwgZ2V0dGVyIChub3QgYSBwbGFpbiBtZXRob2QpIHNvIHRoYXQgYm90aCBjYWxsXG4vLyBmb3JtcyBrZWVwIHdvcmtpbmc6IHR5cGUuZGVjb3JhdGUob3B0aW9ucykgYW5kIHRoZSBkZXN0cnVjdHVyZWRcbi8vIGNvbnN0IHsgZGVjb3JhdGUgfSA9IHR5cGUg4oCUIHRoZSBnZXR0ZXIgYmluZHMgdGhlIGN1cnJlbnRcbi8vIGRlc2NyaXB0b3IgYXQgYWNjZXNzIHRpbWUsIHNhbWUgYXMgdGhlIGNvbGxlY3Rpb24tbGV2ZWwgZGVjb3JhdGVcbm9kcChcblx0VHlwZURlc2NyaXB0b3IucHJvdG90eXBlLFxuXHQnZGVjb3JhdGUnLCB7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlKSB7XG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChvcHRpb25zPzogb2JqZWN0KSB7XG5cdFx0XHRcdGNvbnN0IGRlY29yYXRvciA9IGZ1bmN0aW9uIChjc3RyOiBEZWZpbmVOZXdhYmxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBuYW1lIH0gPSBjc3RyO1xuXHRcdFx0XHRcdC8vIGRlZmluZSgpIHJldHVybnMgdGhlIHJlZ2lzdGVyZWQgY29uc3RydWN0b3IgaXRzZWxmIOKAlFxuXHRcdFx0XHRcdC8vIHRoZSBmdWxsIFR5cGVDbGFzcyBpcyBhIHJpY2hlciBob25lc3QgdHlwZSB0aGFuIGFueSBjYXN0XG5cdFx0XHRcdFx0Y29uc3QgZGVmaW5lUmVzdWx0ID0gc2VsZi5kZWZpbmUoXG5cdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0Y3N0cixcblx0XHRcdFx0XHRcdG9wdGlvbnNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBkZWNvcmF0b3I7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZURlc2NyaXB0b3IucHJvdG90eXBlLFxuXHRTeW1ib2wuaGFzSW5zdGFuY2UsIHtcblx0XHRnZXQgKHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGdldENhY2hlZFR5cGVDaGVja2VyKHRoaXMuVHlwZU5hbWUpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUEFUSCBSRVNPTFVUSU9OXG4vLyBSZXNvbHZlcyBhIGRvdC1zZXBhcmF0ZWQgcGF0aCB0byB0aGUgdGFyZ2V0IHR5cGVzIG1hcCBhbmRcbi8vIHRoZSBmaW5hbCB0eXBlIG5hbWUuIFJlY3Vyc2VzIGludG8gcGFyZW50IHN1YnR5cGVzIGZvclxuLy8gbmVzdGVkIHBhdGhzIChlLmcuICdQYXJlbnQuQ2hpbGQnIOKGkiBQYXJlbnQuc3VidHlwZXMgKyAnQ2hpbGQnKS5cbi8vIFJldHVybnMgdGhlIHBhcmVudCBUeXBlQ2xhc3Mgd2hlbiB0aGUgaGVhZCBzZWdtZW50IHJlc29sdmVzXG4vLyB0byBhbiBleGlzdGluZyB0eXBlIOKAlCBuZWVkZWQgZm9yIGxhenktZ2V0dGVyIHN1YnR5cGUgZGVmaW5pdGlvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCByZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQgPSBmdW5jdGlvbiAoXG5cdHN1YnR5cGVzOiBUeXBlc01hcCxcblx0cGF0aDogc3RyaW5nXG4pOiB7XG5cdFx0dGFyZ2V0OiBUeXBlc01hcDtcblx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0cGFyZW50PzogVHlwZUNsYXNzO1xuXHR9IHtcblx0Y29uc3Qgc3BsaXQgPSBnZXRUeXBlU3BsaXRQYXRoKHBhdGgpO1xuXHRjb25zdCBbIGhlYWQsIC4uLnJlc3QgXSA9IHNwbGl0O1xuXHRjb25zdCBwYXJlbnQgPSBsb29rdXAuY2FsbChcblx0XHRzdWJ0eXBlcyxcblx0XHRoZWFkXG5cdCk7XG5cblx0aWYgKCFwYXJlbnQpIHtcblx0XHRpZiAocmVzdC5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKGBwYXJlbnQgJHtoZWFkfSBkZWZpbml0aW9uIGlzIG5vdCB5ZXQgZXhpc3RzIWApO1xuXHRcdH1cblx0XHRjb25zdCBub1BhcmVudFJlc3VsdCA9IHsgdGFyZ2V0IDogc3VidHlwZXMsIG5hbWUgOiBoZWFkIH07XG5cdFx0cmV0dXJuIG5vUGFyZW50UmVzdWx0O1xuXHR9XG5cblx0aWYgKHJlc3QubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IG5lc3RlZFJlc3VsdCA9IHJlc29sdmVEZWZpbml0aW9uQ29udGV4dChcblx0XHRcdHBhcmVudC5zdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdHJlc3Quam9pbignLicpXG5cdFx0KTtcblx0XHRyZXR1cm4gbmVzdGVkUmVzdWx0O1xuXHR9XG5cblx0Y29uc3QgcmVzb2x2ZWRSZXN1bHQgPSB7IHRhcmdldCA6IHN1YnR5cGVzLCBuYW1lIDogaGVhZCwgcGFyZW50IH07XG5cdHJldHVybiByZXNvbHZlZFJlc3VsdDtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRFVQTElDQVRFIEdVQVJEXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgY2hlY2tEdXBsaWNhdGUgPSBmdW5jdGlvbiAodGFyZ2V0OiBUeXBlc01hcCwgbmFtZTogc3RyaW5nKTogdm9pZCB7XG5cdGNvbnN0IGV4aXN0aW5nID0gbG9va3VwLmNhbGwoXG5cdFx0dGFyZ2V0LFxuXHRcdG5hbWVcblx0KTtcblx0aWYgKGV4aXN0aW5nKSB7XG5cdFx0dGhyb3cgbmV3IEFMUkVBRFlfREVDTEFSRUQobmFtZSk7XG5cdH1cbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gQ09OU1RSVUNUSU9OIFNUUkFURUdJRVNcbi8vIFR3byBicmFuY2hlcywgc2FtZSByZXR1cm4gdHlwZSwgbm8gcmVjdXJzaW9uLlxuLy8gQm90aCByZWNlaXZlIHRoZSByZXNvbHZlZCBjb250ZXh0IGFuZCByZXR1cm4gVHlwZURlc2NyaXB0b3IuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgY3JlYXRlRnJvbURpcmVjdEhhbmRsZXIgPSBmdW5jdGlvbiAoXG5cdGRlZmluZU9yaWdpbjogVHlwZUFic29yYmVyLFxuXHR0YXJnZXQ6IFR5cGVzTWFwLFxuXHRuYW1lOiBzdHJpbmcsXG5cdGhhbmRsZXI/OiBDb25zdHJ1Y3RIYW5kbGVyLFxuXHRjb25maWc/OiBjb25zdHJ1Y3Rvck9wdGlvbnMsXG5cdGxhenlHZXR0ZXI/OiBMYXp5RGVmPG9iamVjdD5cbikge1xuXHQvLyBmb3IgYSBsYXp5IHR5cGUgdGhlIGhhbmRsZXIgc3RheXMgdGhlIGVtcHR5IHNoaW06IHRoZSByZWFsIGNvbnN0cnVjdG9yXG5cdC8vIGlzIGdhdGhlcmVkIGZyb20gdGhlIGNhbGxiYWNrIG9uY2UgcGVyIGNvbnN0cnVjdGlvbiAoc2VlXG5cdC8vIGluc3RhbGxMYXp5RGVmaW5pdGlvbiBhYm92ZSBhbmQgbGF6eURlZmluaXRpb24udHMpXG5cdGhhbmRsZXIgPSBoYW5kbGVyIHx8IGZ1bmN0aW9uICgpIHsgfTtcblx0Y29uc3QgYXNDbGFzcyA9IGlzQ2xhc3MoaGFuZGxlcik7XG5cdGNvbnN0IG1vZGlmaWNhdG9yQm9keSA9IGNvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keShcblx0XHRuYW1lLFxuXHRcdGFzQ2xhc3Ncblx0KTtcblxuXHRjb25zdCBtYWtlQ29uc3RydWN0SGFuZGxlciA9IG1vZGlmaWNhdG9yQm9keShcblx0XHRoYW5kbGVyIGFzIENvbnN0cnVjdEhhbmRsZXIsXG5cdFx0Q3JlYXRpb25IYW5kbGVyLFxuXHRcdFN5bWJvbENvbnN0cnVjdG9yTmFtZVxuXHQpO1xuXG5cdGlmIChjb25maWcgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuXHRcdGNvbmZpZyA9IHtcblx0XHRcdE1vZGlmaWNhdGlvbkNvbnN0cnVjdG9yIDogY29uZmlnIGFzIE1vZGlmaWNhdGlvbkNvbnN0cnVjdG9yRmFjdG9yeVxuXHRcdH07XG5cdH1cblxuXHRjb25maWchLmFzQ2xhc3MgPSBhc0NsYXNzO1xuXG5cdGNvbnN0IHByb3RvID0gKFxuXHRcdGhvcChcblx0XHRcdGhhbmRsZXIsXG5cdFx0XHQncHJvdG90eXBlJ1xuXHRcdCkgJiZcblx0XHQodHlwZW9mIGhhbmRsZXIucHJvdG90eXBlID09PSAnb2JqZWN0Jylcblx0KSA/IGhhbmRsZXIucHJvdG90eXBlIDogZ2V0RGVmYXVsdFByb3RvdHlwZSgpO1xuXG5cdC8vIHJlamVjdCB0aGUgdW5zdXBwb3J0ZWQgaGFuZGxlciBzaGFwZXMgKGdlbmVyYXRvcnMsIHN5bmMgYXJyb3dzLFxuXHQvLyBzaG9ydGhhbmQgbWV0aG9kcywgYm91bmQgZnVuY3Rpb25zKSBCRUZPUkUgdGhlIHR5cGUgaXMgY3JlYXRlZCwgc29cblx0Ly8gYSByZWplY3RlZCBkZWZpbmUgbGVhdmVzIG5vdGhpbmcgcmVnaXN0ZXJlZC4gU2tpcHBlZCB3aGVuIHRoZSBuYW1lXG5cdC8vIGlzIHRha2VuOiB0aGUgVHlwZURlc2NyaXB0b3IgYmVsb3cgdGhyb3dzIHRoZSBjYW5vbmljYWxcblx0Ly8gQUxSRUFEWV9ERUNMQVJFRCwgd2hpY2ggd2lucyBvdmVyIHRoZSBzaGFwZSBlcnJvclxuXHRpZiAoICF0YXJnZXQuaGFzKCBuYW1lICkgKSB7XG5cdFx0Y2xhc3NpZnlDb25zdHJ1Y3RIYW5kbGVyKFxuXHRcdFx0bmFtZSxcblx0XHRcdGhhbmRsZXJcblx0XHQpO1xuXHR9XG5cblx0Y29uc3QgcmVzdWx0ID0gbmV3IFR5cGVEZXNjcmlwdG9yKFxuXHRcdGRlZmluZU9yaWdpbixcblx0XHR0YXJnZXQsXG5cdFx0bmFtZSxcblx0XHRtYWtlQ29uc3RydWN0SGFuZGxlcixcblx0XHRwcm90byxcblx0XHRjb25maWcsXG5cdFx0bGF6eUdldHRlclxuXHRcdC8vIG5ldyBUeXBlRGVzY3JpcHRvcigpIHJldHVybnMgdGhlIFR5cGVQcm94eSBpdCByZWdpc3RlcnMgaW4gdGhlXG5cdFx0Ly8gc3VidHlwZXMgbWFwIOKAlCBhIFByb3h5IG1hdGVyaWFsaXppbmcgdGhlIFR5cGVDbGFzcyBzdXJmYWNlXG5cdFx0Ly8gZHluYW1pY2FsbHkg4oCUIHNvIHRoZSBwdWJsaWMgY29uc3RydWN0b3IgY29udHJhY3QgaXMgbmFtZWQgaGVyZVxuXHRcdC8vIFRoZSBkZWNsYXJlZCBkZXNjcmlwdG9yIHJlc3VsdCBhbmQgZHluYW1pYyBwcm94eSBzdXJmYWNlIGRpZmZlcjtcblx0XHQvLyBjaGFuZ2luZyB0aGUgcHJvZHVjaW5nIHNpZ25hdHVyZSBicmVha3MgZGVzY3JpcHRvciBwcm90b3R5cGUgbWV0aG9kcy5cblx0KSBhcyB1bmtub3duIGFzIFR5cGVDbGFzcztcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIC5sYXp5KCkgaXMgYSByZWd1bGFyIGRlZmluZSB3aG9zZSBoYW5kbGVyIGlzIHRoZSBlbXB0eSBzaGltOyB0aGUgcmVhbFxuLy8gY29uc3RydWN0b3IgaXMgZ2F0aGVyZWQgZnJvbSB0aGUgY2FsbGJhY2sgb25jZSBwZXIgY29uc3RydWN0aW9uIOKAlCBzZWVcbi8vIGluc3RhbGxMYXp5RGVmaW5pdGlvbiBhYm92ZSBhbmQgbGF6eURlZmluaXRpb24udHMuIE5PVEhJTkcgaXMgZGVyaXZlZFxuLy8gZnJvbSB0aGUgY2FsbGJhY2sgaGVyZTogaXQgaXMgbmV2ZXIgY2FsbGVkIGF0IGRlZmluZSB0aW1lLCBzbyBmb3J3YXJkXG4vLyByZWZlcmVuY2VzIGFuZCBjaXJjdWxhciBpbXBvcnRzIHdvcmsg4oCUIHRoZSBjYWxsYmFjaydzIHRhcmdldCBvbmx5IGhhcyB0b1xuLy8gZXhpc3QgYnkgdGhlIGZpcnN0IGBuZXdgXG5jb25zdCBjcmVhdGVGcm9tTGF6eURlZmluaXRpb24gPSBmdW5jdGlvbiAoXG5cdGRlZmluZU9yaWdpbjogVHlwZUFic29yYmVyLFxuXHR0YXJnZXQ6IFR5cGVzTWFwLFxuXHRuYW1lOiBzdHJpbmcsXG5cdGdldHRlcjogTGF6eURlZjxvYmplY3Q+LFxuXHRjb25maWc6IGNvbnN0cnVjdG9yT3B0aW9uc1xuKSB7XG5cblx0Y29uc3QgcmVzdWx0ID0gY3JlYXRlRnJvbURpcmVjdEhhbmRsZXIoXG5cdFx0ZGVmaW5lT3JpZ2luLFxuXHRcdHRhcmdldCxcblx0XHRuYW1lLFxuXHRcdHVuZGVmaW5lZCxcblx0XHRjb25maWcsXG5cdFx0Z2V0dGVyXG5cdCk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIE1BSU4gRElTUEFUQ0hFUlxuLy8gQWxsIGJyYW5jaGVzIGZ1bm5lbCBoZXJlLiBSZWN1cnNpb24gaXMgaXNvbGF0ZWQgdG8gcGF0aFxuLy8gcmVzb2x1dGlvbiAocmVzb2x2ZURlZmluaXRpb25Db250ZXh0KSBhbmQgdGhlIHNpbmdsZSBjYXNlXG4vLyBvZiBhIG5hbWVkIGZ1bmN0aW9uIHBhc3NlZCBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IGRlZmluZSA9IGZ1bmN0aW9uIChcblx0dGhpczogdW5rbm93bixcblx0c3VidHlwZXM6IFR5cGVzTWFwLFxuXHRUeXBlT3JUeXBlTmFtZTogc3RyaW5nIHwgRGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUsXG5cdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZz86IERlZmluZU5ld2FibGVPckNhbGxhYmxlIHwgb2JqZWN0LFxuXHRjb25maWc/OiBvYmplY3Rcbik6IFR5cGVDbGFzcyB7XG5cblx0aWYgKCFjb25maWcgfHwgKHR5cGVvZiBjb25maWcgIT09ICdvYmplY3QnICYmIHR5cGVvZiBjb25maWcgIT09ICdmdW5jdGlvbicpKSB7XG5cdFx0Y29uZmlnID0ge307XG5cdH1cblxuXHQvLyAtLS0gQnJhbmNoOiBmdW5jdGlvbiBwYXNzZWQgYXMgZmlyc3QgYXJnIC0tLVxuXHRpZiAodHlwZW9mIFR5cGVPclR5cGVOYW1lID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0Y29uc3QgZm4gPSBUeXBlT3JUeXBlTmFtZTtcblx0XHRpZiAoZm4ubmFtZSkge1xuXHRcdFx0Y2hlY2tEdXBsaWNhdGUoXG5cdFx0XHRcdHN1YnR5cGVzLFxuXHRcdFx0XHRmbi5uYW1lXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgZGVmaW5lUmVzdWx0ID0gZGVmaW5lLmNhbGwoXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdHN1YnR5cGVzLFxuXHRcdFx0XHRmbi5uYW1lLFxuXHRcdFx0XHRmbixcblx0XHRcdFx0Y29uZmlnXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIGRlZmluZVJlc3VsdDtcblx0XHR9XG5cdFx0Ly8gQW5vbnltb3VzIGZ1bmN0aW9uIGFzIGZpcnN0IGFyZyBpcyBub3QgYSB2YWxpZCAuZGVmaW5lKCkgZm9ybS5cblx0XHQvLyBVc2UgLmxhenkoKCkgPT4gQ29uc3RydWN0b3IsIGNvbmZpZz8pIGZvciBsYXp5IGdldHRlcnMgaW5zdGVhZC5cblx0XHR0aHJvdyBuZXcgVFlQRU5BTUVfTVVTVF9CRV9BX1NUUklORztcblx0fVxuXG5cdC8vIC0tLSBCcmFuY2g6IHN0cmluZyBwYXRoIHBhc3NlZCBhcyBmaXJzdCBhcmcgLS0tXG5cdGlmICh0eXBlb2YgVHlwZU9yVHlwZU5hbWUgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignZGVmaW5pdGlvbiBpcyBub3QgcHJvdmlkZWQnKTtcblx0fVxuXHRjaGVja1R5cGVOYW1lKFR5cGVPclR5cGVOYW1lKTtcblxuXHRsZXQgaGFuZGxlcjogQ29uc3RydWN0SGFuZGxlciB8IHVuZGVmaW5lZDtcblx0aWYgKHR5cGVvZiBjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcgPT09ICdmdW5jdGlvbicpIHtcblx0XHRoYW5kbGVyID0gY29uc3RydWN0SGFuZGxlck9yQ29uZmlnIGFzIENvbnN0cnVjdEhhbmRsZXI7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyA9PT0gJ29iamVjdCcpIHtcblx0XHRjb25maWcgPSBjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcgYXMgY29uc3RydWN0b3JPcHRpb25zO1xuXHR9XG5cblx0Y29uc3Qge1xuXHRcdHRhcmdldCwgbmFtZSwgcGFyZW50XG5cdH0gPSByZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQoXG5cdFx0c3VidHlwZXMsXG5cdFx0VHlwZU9yVHlwZU5hbWVcblx0KTtcblxuXHQvLyBFeGlzdGluZyB0eXBlIHdpdGggbm8gaGFuZGxlcjogZXJyb3IgKG1hdGNoZXMgb3JpZ2luYWwgZmFsbHRocm91Z2gpXG5cdGlmIChwYXJlbnQgJiYgIWhhbmRsZXIpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdkZWZpbml0aW9uIGlzIG5vdCBwcm92aWRlZCcpO1xuXHR9XG5cblx0Y29uc3QgcmVzdWx0ID0gY3JlYXRlRnJvbURpcmVjdEhhbmRsZXIoXG5cdFx0dGhpcyBhcyBUeXBlQWJzb3JiZXIsXG5cdFx0dGFyZ2V0LFxuXHRcdG5hbWUsXG5cdFx0aGFuZGxlcixcblx0XHRjb25maWcgYXMgY29uc3RydWN0b3JPcHRpb25zXG5cdCk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnQgY29uc3QgbGF6eSA9IGZ1bmN0aW9uIChcblx0dGhpczogdW5rbm93bixcblx0c3VidHlwZXM6IFR5cGVzTWFwLFxuXHRUeXBlTmFtZTogc3RyaW5nLFxuXHRnZXR0ZXI/OiBMYXp5RGVmPG9iamVjdD4sXG5cdGNvbmZpZz86IG9iamVjdFxuKTogVHlwZUNsYXNzIHtcblxuXHQvLyB0aGUgdW5uYW1lZCBsYXp5KCgpID0+IENvbnN0cnVjdG9yKSBmb3JtIGlzIGRyb3BwZWQ6IHRoZSBjYWxsYmFjayBpc1xuXHQvLyBuZXZlciBjYWxsZWQgYXQgZGVmaW5lIHRpbWUsIHNvIHRoZXJlIGlzIG5vdGhpbmcgdG8gZGVyaXZlIHRoZSBuYW1lXG5cdC8vIGZyb20g4oCUIHRoZSBuYW1lIG11c3QgY29tZSBpbiBleHBsaWNpdGx5XG5cdGlmICh0eXBlb2YgVHlwZU5hbWUgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFRZUEVOQU1FX01VU1RfQkVfQV9TVFJJTkc7XG5cdH1cblxuXHRpZiAodHlwZW9mIGdldHRlciAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBIQU5ETEVSX01VU1RfQkVfQV9GVU5DVElPTjtcblx0fVxuXG5cdC8vIHRoZSBjYWxsYmFjayBydW5zIHBlciBjb25zdHJ1Y3Rpb24gYW5kIG11c3QgZGVsaXZlciB0aGUgY29uc3RydWN0b3Jcblx0Ly8gc3luY2hyb25vdXNseTogYW4gYXN5bmMgb3IgZ2VuZXJhdG9yIGNhbGxiYWNrIHdvdWxkIHByb2R1Y2UgYVxuXHQvLyBQcm9taXNlIC8gaXRlcmF0b3IgaW5zdGVhZFxuXHRjb25zdCBjYWxsYmFja0tpbmQgPSBnZXR0ZXIuY29uc3RydWN0b3IubmFtZTtcblx0aWYgKFxuXHRcdGNhbGxiYWNrS2luZCA9PT0gJ0FzeW5jRnVuY3Rpb24nIHx8XG5cdFx0Y2FsbGJhY2tLaW5kID09PSAnR2VuZXJhdG9yRnVuY3Rpb24nIHx8XG5cdFx0Y2FsbGJhY2tLaW5kID09PSAnQXN5bmNHZW5lcmF0b3JGdW5jdGlvbidcblx0KSB7XG5cdFx0Y29uc3QgbXNnID0gYCR7VHlwZU5hbWV9OiBsYXp5IGNhbGxiYWNrIG11c3QgYmUgYSBzeW5jIGZ1bmN0aW9uIGAgK1xuXHRcdFx0Jyhhc3luYyBhbmQgZ2VuZXJhdG9yIGNhbGxiYWNrcyBhcmUgbm90IHN1cHBvcnRlZCknO1xuXHRcdHRocm93IG5ldyBXUk9OR19NT0RJRklDQVRJT05fUEFUVEVSTiggbXNnICk7XG5cdH1cblxuXHRpZiAoIWNvbmZpZyB8fCAodHlwZW9mIGNvbmZpZyAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGNvbmZpZyAhPT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRjb25maWcgPSB7fTtcblx0fVxuXG5cdC8vIHRoZSBzYW1lIGRvdHRlZC1wYXRoIHJlc29sdXRpb24gYXMgZGVmaW5lJ3Mgc3RyaW5nIGJyYW5jaDpcblx0Ly8gbGF6eSgnUGFyZW50LkNoaWxkJywgLi4uKSBsYW5kcyB1bmRlciBQYXJlbnQsIGFuZCBhIHRha2VuIG5hbWUgZmFpbHNcblx0Ly8gd2l0aCB0aGUgZGVzY3JpcHRvcidzIEFMUkVBRFlfREVDTEFSRUQsIGV4YWN0bHkgbGlrZSBkZWZpbmVcblx0Y2hlY2tUeXBlTmFtZShUeXBlTmFtZSk7XG5cblx0Y29uc3QgeyB0YXJnZXQsIG5hbWUgfSA9IHJlc29sdmVEZWZpbml0aW9uQ29udGV4dChcblx0XHRzdWJ0eXBlcyxcblx0XHRUeXBlTmFtZVxuXHQpO1xuXG5cdGNvbnN0IGxhenlSZXN1bHQgPSBjcmVhdGVGcm9tTGF6eURlZmluaXRpb24oXG5cdFx0dGhpcyBhcyBUeXBlQWJzb3JiZXIsXG5cdFx0dGFyZ2V0LFxuXHRcdG5hbWUsXG5cdFx0Z2V0dGVyLFxuXHRcdGNvbmZpZyBhcyBjb25zdHJ1Y3Rvck9wdGlvbnNcblx0KTtcblx0cmV0dXJuIGxhenlSZXN1bHQ7XG59O1xuXG5leHBvcnQgY29uc3QgbG9va3VwID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlc01hcCxcblx0VHlwZU5lc3RlZFBhdGg6IHN0cmluZ1xuKTogVHlwZUNsYXNzIHwgdW5kZWZpbmVkIHtcblxuXHRpZiAodHlwZW9mIFR5cGVOZXN0ZWRQYXRoICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBXUk9OR19UWVBFX0RFRklOSVRJT04oJ2FyZyA6IHR5cGUgbmVzdGVkIHBhdGggbXVzdCBiZSBhIHN0cmluZycpO1xuXHR9XG5cblx0aWYgKCFUeXBlTmVzdGVkUGF0aC5sZW5ndGgpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdhcmcgOiB0eXBlIG5lc3RlZCBwYXRoIGhhcyBubyBwYXRoJyk7XG5cdH1cblxuXHRjb25zdCBzcGxpdCA9IGdldFR5cGVTcGxpdFBhdGgoVHlwZU5lc3RlZFBhdGgpO1xuXG5cdGNvbnN0IFsgbmFtZSBdID0gc3BsaXQ7XG5cdGNvbnN0IHR5cGUgPSB0aGlzLmdldChuYW1lKSBhcyBUeXBlQ2xhc3MgfCB1bmRlZmluZWQ7XG5cdGlmIChzcGxpdC5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdGNvbnN0IE5leHROZXN0ZWRQYXRoID0gc3BsaXQuc2xpY2UoMSkuam9pbignLicpO1xuXHRpZiAoIXR5cGUpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdC8vIGEgdHlwZSdzIHN1YnR5cGVzIG1hcCBJUyB0aGUgcnVudGltZSBUeXBlc01hcCAoU3ltYm9sUGFyZW50VHlwZSBhbmRcblx0Ly8gTU5FTU9TWU5FIGFyZSBpbnN0YWxsZWQgYXQgZGVmaW5pdGlvbiB0aW1lKSwgc28gdGhlIHNpbmdsZSBjYXN0IG9ubHlcblx0Ly8gbmFtZXMgdGhhdCB2aWV3XG5cdGNvbnN0IHJlc3VsdCA9IGxvb2t1cC5jYWxsKFxuXHRcdHR5cGUuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0TmV4dE5lc3RlZFBhdGhcblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcblxufTtcblxuXG5cbiJdfQ==