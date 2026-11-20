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
        const modificatorBody = (0, compileNewModificatorFunctionBody_1.default)(TypeName);
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
    const modificatorBody = (0, compileNewModificatorFunctionBody_1.default)(name);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3R5cGVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUNiLHlDQUFzQztBQUV0QywrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLFlBQVksRUFFWixpQkFBaUIsRUFDakIsU0FBUyxHQUVULEdBQUcscUJBQVMsQ0FBQztBQUVkLHFEQUF1RDtBQUd2RCw0REFBcUM7QUFDckMsTUFBTSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsbUJBQVUsQ0FBQztBQUUzQyxNQUFNLEVBQ0wsZ0JBQWdCLEVBQ2hCLHFCQUFxQixFQUNyQiwwQkFBMEIsRUFDMUIseUJBQXlCLEVBQ3pCLDBCQUEwQixFQUMxQixhQUFhLEdBQ2IsR0FBRyxvQkFBVyxDQUFDO0FBS2hCLG1EQUFxQztBQUNyQywyQ0FBd0M7QUFFeEMseUdBSTZDO0FBRTdDLHFEQUcwQjtBQUUxQixrREFBdUQ7QUFDdkQsTUFBTSxFQUNMLG9CQUFvQixFQUNwQixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLE9BQU8sR0FDUCxHQUFHLGVBQVUsQ0FBQztBQUVmLHNDQUdtQjtBQWFuQixNQUFNLHFCQUFxQixHQUFHLFVBQzdCLElBQTRCLEVBQzVCLFFBQWdCLEVBQ2hCLG9CQUFpRCxFQUNqRCxTQUF1QyxFQUN2QyxZQUEwQyxFQUMxQyxNQUF1QjtJQUt2QixNQUFNLElBQUksR0FBdUI7UUFDaEMsT0FBTyxFQUFHLFNBQVM7UUFDbkIsT0FBTyxFQUFHLEtBQUs7UUFDZixLQUFLLEVBQUssU0FBUztRQUNuQixNQUFNLEVBQUksS0FBSztRQUNmLEtBQUssRUFBSyxTQUFTO0tBQ25CLENBQUM7SUFJRixNQUFNLEtBQUssR0FBRztRQUNiLElBQUksQ0FBQyxPQUFPLEdB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T0FBTyxVQUFVLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBdkRXLFFBQUEsSUFBSSxRQXVEZjtBQUVLLE1BQU0sTUFBTSxHQUFHLFVBRXJCLGNBQXNCO0lBR3RCLElBQUksT0FBTyxjQUFjLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDeEMsTUFBTSxJQUFJLHFCQUFxQixDQUFDLHlDQUF5QyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUIsTUFBTSxJQUFJLHFCQUFxQixDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRS9DLE1BQU0sQ0FBRSxJQUFJLENBQUUsR0FBRyxLQUFLLENBQUM7SUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQTBCLENBQUM7SUFDckQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFJRCxNQUFNLE1BQU0sR0FBRyxjQUFNLENBQUMsSUFBSSxDQUN6QixJQUFJLENBQUMsUUFBb0IsRUFDekIsY0FBYyxDQUNkLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUVmLENBQUMsQ0FBQztBQWxDVyxRQUFBLE1BQU0sVUFrQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENvbnN0cnVjdGlvbiBQaXBlbGluZSAoaGlnaC1sZXZlbCBmbG93KTpcbiAqXG4gKiAgIGRlZmluZShUeXBlTmFtZSwgY3RvcikgIOKGkiAgbmV3IFR5cGVEZXNjcmlwdG9yKCkgIOKGkiAgbmV3IFR5cGVQcm94eSgpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnN0YW5jZUNyZWF0b3IodHlwZSwgcGFyZW50LCBhcmdzKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWtlSW5zdGFuY2VNb2RpZmljYXRvcihzZWxmKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RpZmljYXRpb25Db25zdHJ1Y3Rvci5jYWxsKHBhcmVudCwgTW9kaWZpY2F0b3JUeXBlLCBwcm90bywgX2FkZFByb3BzKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyIGNvbnN0cnVjdG9yIHJ1bnMgKG5ldyBNb2RpZmljYXRvclR5cGUoLi4uYXJncykpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQcm9jZXNzaW5nKCkg4oaSIGludm9rZVBvc3RIb29rcygpXG4gKi9cblxuaW1wb3J0IHtcblx0VHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0VHlwZUNsYXNzLFxuXHRUeXBlRGVmLFxuXHRDb2xsZWN0aW9uRGVmLFxuXHRjb25zdHJ1Y3Rvck9wdGlvbnMsXG5cdFR5cGVBYnNvcmJlcixcblx0TW9kaWZpY2F0aW9uQ29uc3RydWN0b3JGYWN0b3J5LFxuXHRNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHREZWZpbmVOZXdhYmxlLFxuXHRMYXp5RGVmLFxufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGhvcCB9IGZyb20gJy4uLy4uL3V0aWxzL2hvcCc7XG5cbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5jb25zdCB7XG5cdG9kcCxcblx0U3ltYm9sUGFyZW50VHlwZSxcblx0U3ltYm9sQ29uc3RydWN0b3JOYW1lLFxuXHRTeW1ib2xDb25maWcsXG5cblx0VFlQRV9USVRMRV9QUkVGSVgsXG5cdE1ORU1PU1lORSxcblxufSA9IGNvbnN0YW50cztcblxuaW1wb3J0IHsgRXJyb3JzVHlwZXMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycy9lcnJvcnMnO1xuLy8gaW1wb3J0IHsgZGVzY3JpcHRvcnMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycyc7XG5cbmltcG9ydCBtbmVtb3N5bmVzIGZyb20gJy4vTW5lbW9zeW5lJztcbmNvbnN0IHsgZ2V0RGVmYXVsdFByb3RvdHlwZSB9ID0gbW5lbW9zeW5lcztcblxuY29uc3Qge1xuXHRBTFJFQURZX0RFQ0xBUkVELFxuXHRXUk9OR19UWVBFX0RFRklOSVRJT04sXG5cdFdST05HX01PRElGSUNBVElPTl9QQVRURVJOLFxuXHRUWVBFTkFNRV9NVVNUX0JFX0FfU1RSSU5HLFxuXHRIQU5ETEVSX01VU1RfQkVfQV9GVU5DVElPTixcblx0T1BUSU9OU19FUlJPUixcbn0gPSBFcnJvcnNUeXBlcztcblxuLy8gaW52b2tlSG9va1xuLy8gcmVnaXN0ZXJIb29rXG4vLyByZWdpc3RlckZsb3dDaGVja2VyXG5pbXBvcnQgKiBhcyBob29rc0FwaSBmcm9tICcuLi9ob29rcyc7XG5pbXBvcnQgeyBUeXBlUHJveHkgfSBmcm9tICcuL1R5cGVQcm94eSc7XG5cbmltcG9ydCBjb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHksIHtcblx0Y2xhc3NpZnlDb25zdHJ1Y3RIYW5kbGVyLFxuXHRpc0NhbGxhYmxlQ2FuZGlkYXRlLFxuXHRDb25zdHJ1Y3RIYW5kbGVyXG59IGZyb20gJy4vY29tcGlsZU5ld01vZGlmaWNhdG9yRnVuY3Rpb25Cb2R5JztcblxuaW1wb3J0IHtcblx0c2V0TGF6eURlZmluaXRpb24sXG5cdExhenlEZWZpbml0aW9uQ2VsbCxcbn0gZnJvbSAnLi9sYXp5RGVmaW5pdGlvbic7XG5cbmltcG9ydCBUeXBlc1V0aWxzLCB7IENyZWF0aW9uSGFuZGxlciB9IGZyb20gJy4uL3V0aWxzJztcbmNvbnN0IHtcblx0Z2V0Q2FjaGVkVHlwZUNoZWNrZXIsXG5cdGdldFR5cGVTcGxpdFBhdGgsXG5cdGNoZWNrVHlwZU5hbWUsXG5cdGlzQ2xhc3MsXG59ID0gVHlwZXNVdGlscztcblxuaW1wb3J0IHtcblx0Z2V0U3RhY2ssXG5cdFN0YWNrYWJsZUluc3RhbmNlLFxufSBmcm9tICcuLi9lcnJvcnMnO1xuXG5leHBvcnQgdHlwZSBUeXBlc01hcCA9IE1hcDxzdHJpbmcsIG9iamVjdD4gJiB7XG5cdFtTeW1ib2xQYXJlbnRUeXBlXT86IFR5cGVEZWY7XG5cdFtNTkVNT1NZTkVdPzogQ29sbGVjdGlvbkRlZjtcbn07XG5cbi8vIExhenkgdHlwZSBmYWNhZGVzLlxuLy8gQSBsYXp5IHR5cGUgaXMgYSByZWd1bGFyIGRlZmluZSB3aG9zZSBoYW5kbGVyIGlzIHRoZSBlbXB0eSBzaGltOyB0aGUgcmVhbFxuLy8gY29uc3RydWN0b3IgaXMgZ2F0aGVyZWQgZnJvbSB0aGUgY2FsbGJhY2sgb25jZSBwZXIgY29uc3RydWN0aW9uIChzZWVcbi8vIGxhenlEZWZpbml0aW9uLnRzKS4gVGhlIHR5cGUncyBwcm90byAvIGNvbmZpZyAvIGNvbnN0cnVjdEhhbmRsZXIgcmVhZCB0aGVcbi8vIGdhdGhlciBjZWxsLCBzbyB0aGUgc2FtZSB0eXBlIG9iamVjdCBzZXJ2ZXMgZXZlcnkgY29uc3RydWN0aW9uIHdpdGhvdXRcbi8vIGV2ZXIgY2FsbGluZyB0aGUgY2FsbGJhY2sgYXQgZGVmaW5lIHRpbWUuXG5jb25zdCBpbnN0YWxsTGF6eURlZmluaXRpb24gPSBmdW5jdGlvbiAoXG5cdHR5cGU6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsXG5cdFR5cGVOYW1lOiBzdHJpbmcsXG5cdHNoaW1Db25zdHJ1Y3RIYW5kbGVyOiBNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdHNoaW1Qcm90bzogeyBbaW5kZXg6IHN0cmluZ106IHVua25vd24gfSxcblx0bWVyZ2VkQ29uZmlnOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRnZXR0ZXI6IExhenlEZWY8b2JqZWN0PlxuKSB7XG5cblx0Ly8gb3V0c2lkZSBhbnkgY29uc3RydWN0aW9uIHRoZSBjZWxsIGhvbGRzIHRoZSBkZWZpbmUtdGltZSBmYWxsYmFjazpcblx0Ly8gbm8gaGFuZGxlciwgdGhlIHNoaW0ncyBlbXB0eSBwcm90b3R5cGUsIGFzQ2xhc3Mgb2ZmLCBubyBmYWlsdXJlXG5cdGNvbnN0IGNlbGw6IExhenlEZWZpbml0aW9uQ2VsbCA9IHtcblx0XHRoYW5kbGVyIDogdW5kZWZpbmVkLFxuXHRcdGFzQ2xhc3MgOiBmYWxzZSxcblx0XHRwcm90byAgIDogc2hpbVByb3RvLFxuXHRcdGZhaWxlZCAgOiBmYWxzZSxcblx0XHRlcnJvciAgIDogdW5kZWZpbmVkXG5cdH07XG5cblx0Ly8gYmFjayB0byB0aGUgZGVmaW5lLXRpbWUgc3RhdGU6IG5vIGhhbmRsZXIgcmV0YWluZWQsIHRoZSBzaGltJ3MgZW1wdHlcblx0Ly8gcHJvdG90eXBlLCBhc0NsYXNzIG9mZiwgbm8gZXJyb3Jcblx0Y29uc3QgcmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Y2VsbC5oYW5kbGVyID0gdW5kZWZpbmVkO1xuXHRcdGNlbGwuYXNDbGFzcyA9IGZhbHNlO1xuXHRcdGNlbGwucHJvdG8gPSBzaGltUHJvdG87XG5cdFx0Y2VsbC5mYWlsZWQgPSBmYWxzZTtcblx0XHRjZWxsLmVycm9yID0gdW5kZWZpbmVkO1xuXHR9O1xuXG5cdC8vIHRoZSBzaW5nbGUgY2FsbGJhY2sgY2FsbCBwZXIgY29uc3RydWN0aW9uIOKAlCBpbnZva2VkIE9OTFkgYnlcblx0Ly8gZ2F0aGVyTGF6eURlZmluaXRpb24gYXQgdGhlIGNvbnN0cnVjdGlvbiBlbnRyaWVzXG5cdGNvbnN0IGdhdGhlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXNldCgpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBnYXRoZXJlZCA9IGdldHRlcigpO1xuXHRcdFx0aWYgKCFpc0NhbGxhYmxlQ2FuZGlkYXRlKGdhdGhlcmVkKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgSEFORExFUl9NVVNUX0JFX0FfRlVOQ1RJT047XG5cdFx0XHR9XG5cdFx0XHQvLyB0aGUgc2hhcGUgY2hlY2tzIGFyZSB3aGF0IG1ha2UgaXQgYSBDb25zdHJ1Y3RIYW5kbGVyXG5cdFx0XHRjbGFzc2lmeUNvbnN0cnVjdEhhbmRsZXIoXG5cdFx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0XHRnYXRoZXJlZFxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGhhbmRsZXIgPSBnYXRoZXJlZDtcblx0XHRcdGNlbGwuaGFuZGxlciA9IGhhbmRsZXI7XG5cdFx0XHRjZWxsLmFzQ2xhc3MgPSBpc0NsYXNzKGhhbmRsZXIpO1xuXHRcdFx0Ly8gc2FtZSBmYWxsYmFjayBhcyB0aGUgZGlyZWN0IHBhdGg6IGFuIG93biBOT04tT0JKRUNUIHByb3RvdHlwZVxuXHRcdFx0Ly8gKHByb3RvdHlwZSA9IDEyMykgaXMgcmVwbGFjZWQgYnkgdGhlIGRlZmF1bHRcblx0XHRcdGNlbGwucHJvdG8gPSAoXG5cdFx0XHRcdGhvcChcblx0XHRcdFx0XHRoYW5kbGVyLFxuXHRcdFx0XHRcdCdwcm90b3R5cGUnXG5cdFx0XHRcdCkgJiZcblx0XHRcdFx0KHR5cGVvZiBoYW5kbGVyLnByb3RvdHlwZSA9PT0gJ29iamVjdCcpXG5cdFx0XHQpID8gaGFuZGxlci5wcm90b3R5cGUgOiBnZXREZWZhdWx0UHJvdG90eXBlKCk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdC8vIHBhc3N0aHJvdWdoLCBleGFjdGx5IGxpa2UgcnVuQnVpbGQncyBjYXRjaDogd2hhdGV2ZXIgdGhlXG5cdFx0XHQvLyBjYWxsYmFjayB0aHJldyByZWFjaGVzIHRocm93TW9kaWZpY2F0aW9uRXJyb3IgYXMtaXMgKGEgdGhyb3duXG5cdFx0XHQvLyBub24tRXJyb3IgYnJlYWtzIHRoZSBwcm90b3R5cGUgc3BsaWNlIHRoZXJlIHRoZSBzYW1lIHdheSBpdFxuXHRcdFx0Ly8gZG9lcyBmb3IgYSBjb25zdHJ1Y3RvciBib2R5KS4gVGhlIGZsYWcgaXMgc2VwYXJhdGUgZnJvbSB0aGVcblx0XHRcdC8vIHZhbHVlOiBhIGNhbGxiYWNrIG1heSB0aHJvdyB1bmRlZmluZWRcblx0XHRcdGNlbGwuZmFpbGVkID0gdHJ1ZTtcblx0XHRcdGNlbGwuZXJyb3IgPSBlcnJvcjtcblx0XHR9XG5cdH07XG5cblx0Ly8ga2V5ZWQgYnkgdGhlIHR5cGUgZGVzY3JpcHRvciBoZXJlOyBUeXBlUHJveHkgcmVnaXN0ZXJzIGl0cyBwcm94eVxuXHQvLyBhZ2FpbnN0IHRoZSBzYW1lIGRlZmluaXRpb24gd2hlbiBpdCB3cmFwcyB0aGlzIHR5cGVcblx0c2V0TGF6eURlZmluaXRpb24oXG5cdFx0dHlwZSxcblx0XHR7XG5cdFx0XHRjZWxsLFxuXHRcdFx0Ly8gdGhlIG1lcmdlZCBjb25maWcgdmFsdWUgYXQgZGVmaW5lIHRpbWUg4oCUIHRoZSBjYWxsYmFjayBtdXN0XG5cdFx0XHQvLyBub3QgcnVuIHdoZW4gdGhlIGNvbnN0cnVjdGlvbiB3aWxsIGJlIGJsb2NrZWRcblx0XHRcdGJsb2NrRXJyb3JzIDogbWVyZ2VkQ29uZmlnLmJsb2NrRXJyb3JzICE9PSBmYWxzZSxcblx0XHRcdGdhdGhlcixcblx0XHRcdHJlc2V0XG5cdFx0fVxuXHQpO1xuXG5cdC8vIHplcm8tYXJnIGZhY3RvcnksIHRoZSBzYW1lIGNvbnRyYWN0IGFzIGEgZGlyZWN0IHR5cGUnc1xuXHQvLyBjb25zdHJ1Y3RIYW5kbGVyOiBidWlsZHMgdGhlIHdyYXBwZXIgZnJvbSB0aGUgZ2F0aGVyZWQgaGFuZGxlcixcblx0Ly8gcmVidWlsdCBvbiBldmVyeSBjb25zdHJ1Y3Rpb24gKHRoZSBjYWxsYmFjayBtYXkgcmV0dXJuIGEgbmV3IGZ1bmN0aW9uXG5cdC8vIGVhY2ggdGltZSk7IGJlZm9yZSB0aGUgZ2F0aGVyIOKAlCBhbmQgYWZ0ZXIgYSBmYWlsZWQgb25lIOKAlCBpdCBidWlsZHNcblx0Ly8gdGhlIHNoaW0ncyB3cmFwcGVyLCB3aGljaCB0aGUgZXJyb3IgcGF0aCB0aGVuIHJlcGxhY2VzXG5cdGNvbnN0IGxhenlDb25zdHJ1Y3RIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmIChjZWxsLmhhbmRsZXIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3Qgc2hpbVJlc3VsdCA9IHNoaW1Db25zdHJ1Y3RIYW5kbGVyKCk7XG5cdFx0XHRyZXR1cm4gc2hpbVJlc3VsdDtcblx0XHR9XG5cdFx0Y29uc3QgeyBoYW5kbGVyIH0gPSBjZWxsO1xuXHRcdGNvbnN0IG1vZGlmaWNhdG9yQm9keSA9IGNvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keShUeXBlTmFtZSk7XG5cdFx0Y29uc3Qgd3JhcHBlZEJvZHkgPSBtb2RpZmljYXRvckJvZHkoXG5cdFx0XHRoYW5kbGVyLFxuXHRcdFx0Q3JlYXRpb25IYW5kbGVyLFxuXHRcdFx0U3ltYm9sQ29uc3RydWN0b3JOYW1lXG5cdFx0KTtcblx0XHRjb25zdCBoYW5kbGVyUmVzdWx0ID0gd3JhcHBlZEJvZHkoKTtcblx0XHRyZXR1cm4gaGFuZGxlclJlc3VsdDtcblx0fTtcblxuXHRvZHAoXG5cdFx0dHlwZSxcblx0XHQnY29uc3RydWN0SGFuZGxlcicsIHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBsYXp5Q29uc3RydWN0SGFuZGxlcjtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlICAgOiB0cnVlLFxuXHRcdFx0Y29uZmlndXJhYmxlIDogdHJ1ZVxuXHRcdH1cblx0KTtcblxuXHRvZHAoXG5cdFx0dHlwZSxcblx0XHQncHJvdG8nLCB7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSBjZWxsLnByb3RvO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGUgICA6IHRydWUsXG5cdFx0XHRjb25maWd1cmFibGUgOiB0cnVlXG5cdFx0fVxuXHQpO1xuXG5cdC8vIGEgZnJlc2ggY29weSBwZXIgcmVhZDogYXNDbGFzcyBpcyBwZXItY29uc3RydWN0aW9uIGFuZCBtdXN0IG5ldmVyXG5cdC8vIGxlYWsgaW50byB0aGUgc2hhcmVkIG1lcmdlZCBjb25maWdcblx0b2RwKFxuXHRcdHR5cGUsXG5cdFx0J2NvbmZpZycsIHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHRcdFx0e30sXG5cdFx0XHRcdFx0bWVyZ2VkQ29uZmlnLFxuXHRcdFx0XHRcdHsgYXNDbGFzcyA6IGNlbGwuYXNDbGFzcyB9XG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZSAgIDogdHJ1ZSxcblx0XHRcdGNvbmZpZ3VyYWJsZSA6IHRydWVcblx0XHR9XG5cdCk7XG5cbn07XG5cbmNvbnN0IHR5cGVEZXNjcmlwdG9yQ3JlYXRvciA9IGZ1bmN0aW9uIChcblx0dGhpczogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0ZGVmaW5lT3JpZ2luOiBUeXBlQWJzb3JiZXIsXG5cdHR5cGVzOiBUeXBlc01hcCxcblx0VHlwZU5hbWU6IHN0cmluZyxcblx0Y29uc3RydWN0SGFuZGxlcjogTW5lbW9uaWNhQ29uc3RydWN0b3JGYWN0b3J5LFxuXHRwcm90bzogeyBbaW5kZXg6IHN0cmluZ106IHVua25vd24gfSxcblx0Y29uZmlnOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRsYXp5R2V0dGVyPzogTGF6eURlZjxvYmplY3Q+LFxuKSB7XG5cblx0Ly8gaGVyZSBcInR5cGVzXCIgcmVmZXJzIHRvIHN1YnR5cGVzIG9mIHR5cGUgb3IgY29sbGVjdGlvbiBvYmplY3Qge31cblxuXHRjb25zdCBwYXJlbnRUeXBlID0gdHlwZXNbIFN5bWJvbFBhcmVudFR5cGUgXSB8fCBudWxsO1xuXG5cdGNvbnN0IGlzU3ViVHlwZSA9IHBhcmVudFR5cGUgPyB0cnVlIDogZmFsc2U7XG5cblx0Y29uc3QgY29sbGVjdGlvbiA9IGlzU3ViVHlwZVxuXHRcdD8gKHBhcmVudFR5cGUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmNvbGxlY3Rpb24gYXMgb2JqZWN0XG5cdFx0OiB0eXBlc1sgTU5FTU9TWU5FIF07XG5cblx0aWYgKHR5cGVzLmhhcyhUeXBlTmFtZSkpIHtcblx0XHR0aHJvdyBuZXcgQUxSRUFEWV9ERUNMQVJFRChUeXBlTmFtZSk7XG5cdH1cblxuXHQvLyBjb25zdCBzdWJ0eXBlcyA9IGRlc2NyaXB0b3JzLmNyZWF0ZVR5cGVzQ29sbGVjdGlvbigpO1xuXHRjb25zdCBzdWJ0eXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBvYmplY3Q+KCk7XG5cblx0Y29uc3QgdGl0bGUgPSBgJHtUWVBFX1RJVExFX1BSRUZJWH0ke1R5cGVOYW1lfWA7XG5cblx0Ly8gJ25hbWUnIGlzIGEgQ09MTEVDVElPTiBvcHRpb24gb25seTogYSB1c2VyIHBhc3NpbmcgaXQgaGVyZSBtZWFudCB0b1xuXHQvLyBuYW1lIHRoZSBjb2xsZWN0aW9uLCBub3QgdGhlIHR5cGUg4oCUIHNheSBzbyByZWFkYWJseVxuXHRpZiAoIGNvbmZpZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjb25maWcgPT09ICdvYmplY3QnICYmICduYW1lJyBpbiBjb25maWcgKSB7XG5cdFx0Y29uc3QgbmFtZUVycm9yID0gJ1xcXCJuYW1lXFxcIiBpcyBhIGNvbGxlY3Rpb24gb3B0aW9uICcgK1xuXHRcdFx0JyhjcmVhdGVUeXBlc0NvbGxlY3Rpb24oeyBuYW1lIH0pKSDigJQgaXQgY2Fubm90IGJlIHNldCBvbiBhIHR5cGUnO1xuXHRcdHRocm93IG5ldyBPUFRJT05TX0VSUk9SKCBuYW1lRXJyb3IgKTtcblx0fVxuXHRjb25maWcgPSBPYmplY3QuYXNzaWduKFxuXHRcdHt9LFxuXHRcdChjb2xsZWN0aW9uIGFzIFJlY29yZDxzeW1ib2wsIHVua25vd24+KVsgU3ltYm9sQ29uZmlnIF0sXG5cdFx0Y29uZmlnXG5cdCk7XG5cdC8vIG5ldmVyIGluaGVyaXRlZCBpbnRvIHRoZSB0eXBlJ3MgY29uZmlnIGVpdGhlclxuXHRSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KCBjb25maWcsICduYW1lJyApO1xuXG5cdGNvbnN0IHR5cGUgPSBPYmplY3QuYXNzaWduKFxuXHRcdHRoaXMsXG5cdFx0e1xuXG5cdFx0XHRnZXQgY29uc3RydWN0SGFuZGxlciAoKSB7XG5cdFx0XHRcdHJldHVybiBjb25zdHJ1Y3RIYW5kbGVyO1xuXHRcdFx0fSxcblxuXG5cdFx0XHRUeXBlTmFtZSxcblx0XHRcdHByb3RvLFxuXG5cdFx0XHRpc1N1YlR5cGUsXG5cdFx0XHRzdWJ0eXBlcyxcblx0XHRcdHBhcmVudFR5cGUsXG5cblx0XHRcdGNvbGxlY3Rpb24sXG5cblx0XHRcdHRpdGxlLFxuXG5cdFx0XHRjb25maWcsXG5cblx0XHRcdGhvb2tzIDogT2JqZWN0LmNyZWF0ZShudWxsKVxuXG5cdFx0fVxuXHQpO1xuXG5cdGdldFN0YWNrLmNhbGwoXG5cdFx0dGhpcyBhcyBTdGFja2FibGVJbnN0YW5jZSxcblx0XHRgRGVmaW5pdGlvbiBvZiBbICR7VHlwZU5hbWV9IF0gbWFkZSBhdDpgLFxuXHRcdFtdLFxuXHRcdGRlZmluZU9yaWdpblxuXHQpO1xuXG5cdC8vIGxhenkgdHlwZXM6IHByb3RvIC8gY29uZmlnIC8gY29uc3RydWN0SGFuZGxlciBiZWNvbWUgZmFjYWRlcyBvdmVyIHRoZVxuXHQvLyBwZXItY29uc3RydWN0aW9uIGdhdGhlciBjZWxsIOKAlCBzZWUgaW5zdGFsbExhenlEZWZpbml0aW9uIGFib3ZlIGFuZFxuXHQvLyBsYXp5RGVmaW5pdGlvbi50c1xuXHRpZiAobGF6eUdldHRlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aW5zdGFsbExhenlEZWZpbml0aW9uKFxuXHRcdFx0dHlwZSxcblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0Y29uc3RydWN0SGFuZGxlcixcblx0XHRcdHByb3RvLFxuXHRcdFx0Y29uZmlnLFxuXHRcdFx0bGF6eUdldHRlclxuXHRcdCk7XG5cdH1cblxuXHRvZHAoXG5cdFx0c3VidHlwZXMsXG5cdFx0U3ltYm9sUGFyZW50VHlwZSwge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIHR5cGU7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdC8vIGNvbnN0IGFuY2VzdG9yID0gaXNTdWJUeXBlID8gT2JqZWN0LmNyZWF0ZShudWxsKSA6IHByb3RvO1xuXHQvLyBhIGxhenkgcm9vdCdzIGFuY2VzdG9yIGlzIG5vdCBrbm93biBhdCBkZWZpbmUgdGltZSBlaXRoZXI6IFR5cGVQcm94eVxuXHQvLyBpbnN0YWxscyBhIGZhY2FkZSBvdmVyIHRoZSBnYXRoZXIgY2VsbCB3aGVuIGl0IHJlY2VpdmVzIHVuZGVmaW5lZCBmb3Jcblx0Ly8gYSBub24tc3VidHlwZSBoZXJlXG5cdGNvbnN0IGFuY2VzdG9yID0gKGlzU3ViVHlwZSB8fCBsYXp5R2V0dGVyICE9PSB1bmRlZmluZWQpID8gdW5kZWZpbmVkIDogcHJvdG87XG5cdHR5cGVzLnNldChcblx0XHRUeXBlTmFtZSxcblx0XHRuZXcgVHlwZVByb3h5KFxuXHRcdFx0dHlwZSxcblx0XHRcdGFuY2VzdG9yXG5cdFx0KVxuXHQpO1xuXG5cdC8vIHR5cGVzLnNldCggVHlwZU5hbWUsIG5ldyBUeXBlUHJveHkoIHR5cGUgKSApO1xuXG5cdGNvbnN0IHJlc3VsdCA9IHR5cGVzLmdldChUeXBlTmFtZSk7XG5cdHJldHVybiByZXN1bHQ7XG5cbn07XG5cbi8vIHRoZSBjcmVhdG9yLCBhcyBpdCBpcyB1c2VkOiBpbnZva2VkIHdpdGggYG5ld2AgKHRoZSBjcmVhdGVGcm9tKiBjYWxsXG4vLyBzaXRlcyBiZWxvdyksIGl0IHJldHVybnMgdGhlIFR5cGVQcm94eSBpdCByZWdpc3RlcnMgaW4gdGhlIHN1YnR5cGVzIG1hcFxuLy8g4oCUIGEgUHJveHkgbWF0ZXJpYWxpemluZyB0aGUgVHlwZUNsYXNzIHN1cmZhY2UgZHluYW1pY2FsbHkg4oCUIHdoaWxlIGl0c1xuLy8gcHJvdG90eXBlIGlzIHRoZSBkZXNjcmlwdG9yJ3MgVHlwZURlc2NyaXB0b3JJbnN0YW5jZSBjb250cmFjdFxudHlwZSBUeXBlRGVzY3JpcHRvckFyZ3MgPSBQYXJhbWV0ZXJzPHR5cGVvZiB0eXBlRGVzY3JpcHRvckNyZWF0b3I+O1xuaW50ZXJmYWNlIFR5cGVEZXNjcmlwdG9yQ29uc3RydWN0b3IgZXh0ZW5kcyBOZXdhYmxlRnVuY3Rpb24ge1xuXHRuZXcgKC4uLmFyZ3M6IFR5cGVEZXNjcmlwdG9yQXJncyk6IFR5cGVDbGFzcztcblx0KHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsIC4uLmFyZ3M6IFR5cGVEZXNjcmlwdG9yQXJncyk6IFJldHVyblR5cGU8dHlwZW9mIHR5cGVEZXNjcmlwdG9yQ3JlYXRvcj47XG5cdHJlYWRvbmx5IHByb3RvdHlwZTogVHlwZURlc2NyaXB0b3JJbnN0YW5jZTtcbn1cblxuLy8gdGhlIGNyZWF0b3IgaXMgb25seSBldmVyIGludm9rZWQgd2l0aCBgbmV3YDsgYSBmdW5jdGlvbiBleHByZXNzaW9uXG4vLyBjYXJyaWVzIG5vIGNvbnN0cnVjdCBzaWduYXR1cmUsIHNvIGl0IGlzIG5hbWVkIG9uY2UgYXMgdGhlIGNvbnN0cnVjdG9yXG4vLyBpbnRlcmZhY2UgaXQgaXMgdXNlZCB0aHJvdWdoIOKAlCB0aGUgcHJvdG90eXBlIGNvbnRyYWN0IGlzIGF0dGFjaGVkXG4vLyBpbW1lZGlhdGVseSBiZWxvd1xuY29uc3QgVHlwZURlc2NyaXB0b3IgPSB0eXBlRGVzY3JpcHRvckNyZWF0b3IgYXMgVHlwZURlc2NyaXB0b3JDb25zdHJ1Y3RvcjtcblxuT2JqZWN0LmFzc2lnbihcblx0VHlwZURlc2NyaXB0b3IucHJvdG90eXBlLFxuXHRob29rc0FwaVxuKTtcblxuVHlwZURlc2NyaXB0b3IucHJvdG90eXBlLmRlZmluZSA9IGZ1bmN0aW9uIChcblx0dGhpczogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0VHlwZU9yVHlwZU5hbWU6IHN0cmluZyB8IERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWc/OiBEZWZpbmVOZXdhYmxlT3JDYWxsYWJsZSB8IG9iamVjdCxcblx0Y29uZmlnPzogb2JqZWN0XG4pIHtcblx0Y29uc3QgcmVzdWx0ID0gZGVmaW5lLmNhbGwoXG5cdFx0ZGVmaW5lLFxuXHRcdHRoaXMuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0VHlwZU9yVHlwZU5hbWUsXG5cdFx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnLFxuXHRcdGNvbmZpZ1xuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuVHlwZURlc2NyaXB0b3IucHJvdG90eXBlLmxhenkgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsXG5cdFR5cGVOYW1lOiBzdHJpbmcsXG5cdGdldHRlcj86IExhenlEZWY8b2JqZWN0Pixcblx0Y29uZmlnPzogb2JqZWN0XG4pIHtcblx0Y29uc3QgcmVzdWx0ID0gbGF6eS5jYWxsKFxuXHRcdHRoaXMsXG5cdFx0dGhpcy5zdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRUeXBlTmFtZSxcblx0XHRnZXR0ZXIsXG5cdFx0Y29uZmlnXG5cdCk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5UeXBlRGVzY3JpcHRvci5wcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRUeXBlTmVzdGVkUGF0aDogc3RyaW5nXG4pIHtcblx0Ly8gcmVsYXRpdmUgZmlyc3Q6IHJlc29sdmUgYW1vbmcgdGhpcyB0eXBlJ3Mgb3duIHN1YnR5cGVzLFxuXHQvLyBlLmcuIEFkbWluVHlwZS5sb29rdXAoJ1N1YlR5cGUnKSBvciAnU3ViVHlwZS5EZWVwU3ViVHlwZSdcblx0Y29uc3QgcmVsYXRpdmVSZXN1bHQgPSBsb29rdXAuY2FsbChcblx0XHR0aGlzLnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFR5cGVOZXN0ZWRQYXRoXG5cdCk7XG5cdGlmIChyZWxhdGl2ZVJlc3VsdCkge1xuXHRcdHJldHVybiByZWxhdGl2ZVJlc3VsdDtcblx0fVxuXHQvLyByb290IGZhbGxiYWNrOiByZXNvbHZlIGFic29sdXRlIHJlZ2lzdHJ5IHBhdGhzIGZyb20gdGhlXG5cdC8vIGNvbGxlY3Rpb24sIGUuZy4gQWRtaW5UeXBlLmxvb2t1cCgnVXNlclR5cGUuQWRtaW5UeXBlJyksXG5cdC8vIHdoaWNoIGlzIHdoYXQgdGhlIFR5cGVMb29rdXA8UmVnaXN0cnk+IHR5cGUgY29udHJhY3QgcHJvbWlzZXNcblx0Y29uc3QgY29sbGVjdGlvbiA9IHRoaXMuY29sbGVjdGlvbiBhcyBDb2xsZWN0aW9uRGVmO1xuXHQvLyBDb2xsZWN0aW9uRGVmLmxvb2t1cCBpcyB0aGUgcnVudGltZSBjb250cmFjdCAoQ29sbGVjdGlvbkxvb2t1cCksIHNvIGFcblx0Ly8gcGxhaW4gc3RyaW5nIHBhdGggeWllbGRzIFR5cGVDbGFzcyB8IHVuZGVmaW5lZCB3aXRoIG5vIGNhc3Rcblx0Y29uc3Qgcm9vdFJlc3VsdCA9IGNvbGxlY3Rpb24ubG9va3VwKFR5cGVOZXN0ZWRQYXRoKTtcblx0cmV0dXJuIHJvb3RSZXN1bHQ7XG59O1xuXG4vLyBwcm90b3R5cGUtbGV2ZWwgZ2V0dGVyIChub3QgYSBwbGFpbiBtZXRob2QpIHNvIHRoYXQgYm90aCBjYWxsXG4vLyBmb3JtcyBrZWVwIHdvcmtpbmc6IHR5cGUuZGVjb3JhdGUob3B0aW9ucykgYW5kIHRoZSBkZXN0cnVjdHVyZWRcbi8vIGNvbnN0IHsgZGVjb3JhdGUgfSA9IHR5cGUg4oCUIHRoZSBnZXR0ZXIgYmluZHMgdGhlIGN1cnJlbnRcbi8vIGRlc2NyaXB0b3IgYXQgYWNjZXNzIHRpbWUsIHNhbWUgYXMgdGhlIGNvbGxlY3Rpb24tbGV2ZWwgZGVjb3JhdGVcbm9kcChcblx0VHlwZURlc2NyaXB0b3IucHJvdG90eXBlLFxuXHQnZGVjb3JhdGUnLCB7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlKSB7XG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChvcHRpb25zPzogb2JqZWN0KSB7XG5cdFx0XHRcdGNvbnN0IGRlY29yYXRvciA9IGZ1bmN0aW9uIChjc3RyOiBEZWZpbmVOZXdhYmxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBuYW1lIH0gPSBjc3RyO1xuXHRcdFx0XHRcdC8vIGRlZmluZSgpIHJldHVybnMgdGhlIHJlZ2lzdGVyZWQgY29uc3RydWN0b3IgaXRzZWxmIOKAlFxuXHRcdFx0XHRcdC8vIHRoZSBmdWxsIFR5cGVDbGFzcyBpcyBhIHJpY2hlciBob25lc3QgdHlwZSB0aGFuIGFueSBjYXN0XG5cdFx0XHRcdFx0Y29uc3QgZGVmaW5lUmVzdWx0ID0gc2VsZi5kZWZpbmUoXG5cdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0Y3N0cixcblx0XHRcdFx0XHRcdG9wdGlvbnNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBkZWNvcmF0b3I7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZURlc2NyaXB0b3IucHJvdG90eXBlLFxuXHRTeW1ib2wuaGFzSW5zdGFuY2UsIHtcblx0XHRnZXQgKHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGdldENhY2hlZFR5cGVDaGVja2VyKHRoaXMuVHlwZU5hbWUpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUEFUSCBSRVNPTFVUSU9OXG4vLyBSZXNvbHZlcyBhIGRvdC1zZXBhcmF0ZWQgcGF0aCB0byB0aGUgdGFyZ2V0IHR5cGVzIG1hcCBhbmRcbi8vIHRoZSBmaW5hbCB0eXBlIG5hbWUuIFJlY3Vyc2VzIGludG8gcGFyZW50IHN1YnR5cGVzIGZvclxuLy8gbmVzdGVkIHBhdGhzIChlLmcuICdQYXJlbnQuQ2hpbGQnIOKGkiBQYXJlbnQuc3VidHlwZXMgKyAnQ2hpbGQnKS5cbi8vIFJldHVybnMgdGhlIHBhcmVudCBUeXBlQ2xhc3Mgd2hlbiB0aGUgaGVhZCBzZWdtZW50IHJlc29sdmVzXG4vLyB0byBhbiBleGlzdGluZyB0eXBlIOKAlCBuZWVkZWQgZm9yIGxhenktZ2V0dGVyIHN1YnR5cGUgZGVmaW5pdGlvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCByZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQgPSBmdW5jdGlvbiAoXG5cdHN1YnR5cGVzOiBUeXBlc01hcCxcblx0cGF0aDogc3RyaW5nXG4pOiB7XG5cdFx0dGFyZ2V0OiBUeXBlc01hcDtcblx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0cGFyZW50PzogVHlwZUNsYXNzO1xuXHR9IHtcblx0Y29uc3Qgc3BsaXQgPSBnZXRUeXBlU3BsaXRQYXRoKHBhdGgpO1xuXHRjb25zdCBbIGhlYWQsIC4uLnJlc3QgXSA9IHNwbGl0O1xuXHRjb25zdCBwYXJlbnQgPSBsb29rdXAuY2FsbChcblx0XHRzdWJ0eXBlcyxcblx0XHRoZWFkXG5cdCk7XG5cblx0aWYgKCFwYXJlbnQpIHtcblx0XHRpZiAocmVzdC5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKGBwYXJlbnQgJHtoZWFkfSBkZWZpbml0aW9uIGlzIG5vdCB5ZXQgZXhpc3RzIWApO1xuXHRcdH1cblx0XHRjb25zdCBub1BhcmVudFJlc3VsdCA9IHsgdGFyZ2V0IDogc3VidHlwZXMsIG5hbWUgOiBoZWFkIH07XG5cdFx0cmV0dXJuIG5vUGFyZW50UmVzdWx0O1xuXHR9XG5cblx0aWYgKHJlc3QubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IG5lc3RlZFJlc3VsdCA9IHJlc29sdmVEZWZpbml0aW9uQ29udGV4dChcblx0XHRcdHBhcmVudC5zdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdHJlc3Quam9pbignLicpXG5cdFx0KTtcblx0XHRyZXR1cm4gbmVzdGVkUmVzdWx0O1xuXHR9XG5cblx0Y29uc3QgcmVzb2x2ZWRSZXN1bHQgPSB7IHRhcmdldCA6IHN1YnR5cGVzLCBuYW1lIDogaGVhZCwgcGFyZW50IH07XG5cdHJldHVybiByZXNvbHZlZFJlc3VsdDtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRFVQTElDQVRFIEdVQVJEXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgY2hlY2tEdXBsaWNhdGUgPSBmdW5jdGlvbiAodGFyZ2V0OiBUeXBlc01hcCwgbmFtZTogc3RyaW5nKTogdm9pZCB7XG5cdGNvbnN0IGV4aXN0aW5nID0gbG9va3VwLmNhbGwoXG5cdFx0dGFyZ2V0LFxuXHRcdG5hbWVcblx0KTtcblx0aWYgKGV4aXN0aW5nKSB7XG5cdFx0dGhyb3cgbmV3IEFMUkVBRFlfREVDTEFSRUQobmFtZSk7XG5cdH1cbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gQ09OU1RSVUNUSU9OIFNUUkFURUdJRVNcbi8vIFR3byBicmFuY2hlcywgc2FtZSByZXR1cm4gdHlwZSwgbm8gcmVjdXJzaW9uLlxuLy8gQm90aCByZWNlaXZlIHRoZSByZXNvbHZlZCBjb250ZXh0IGFuZCByZXR1cm4gVHlwZURlc2NyaXB0b3IuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgY3JlYXRlRnJvbURpcmVjdEhhbmRsZXIgPSBmdW5jdGlvbiAoXG5cdGRlZmluZU9yaWdpbjogVHlwZUFic29yYmVyLFxuXHR0YXJnZXQ6IFR5cGVzTWFwLFxuXHRuYW1lOiBzdHJpbmcsXG5cdGhhbmRsZXI6IENvbnN0cnVjdEhhbmRsZXIgfCB1bmRlZmluZWQsXG5cdC8vIGFsd2F5cyBhbiBvYmplY3QgaGVyZTogdGhlIGRlZmluZSgpIGRpc3BhdGNoZXIgcmVwbGFjZXMgYSBtaXNzaW5nXG5cdC8vIGNvbmZpZyB3aXRoIHt9LCB0aGUgbGF6eSBwYXRoIHBhc3NlcyBpdHMgb3duXG5cdGNvbmZpZzogY29uc3RydWN0b3JPcHRpb25zLFxuXHRsYXp5R2V0dGVyPzogTGF6eURlZjxvYmplY3Q+XG4pIHtcblx0Ly8gZm9yIGEgbGF6eSB0eXBlIHRoZSBoYW5kbGVyIHN0YXlzIHRoZSBlbXB0eSBzaGltOiB0aGUgcmVhbCBjb25zdHJ1Y3RvclxuXHQvLyBpcyBnYXRoZXJlZCBmcm9tIHRoZSBjYWxsYmFjayBvbmNlIHBlciBjb25zdHJ1Y3Rpb24gKHNlZVxuXHQvLyBpbnN0YWxsTGF6eURlZmluaXRpb24gYWJvdmUgYW5kIGxhenlEZWZpbml0aW9uLnRzKVxuXHRoYW5kbGVyID0gaGFuZGxlciB8fCBmdW5jdGlvbiAoKSB7IH07XG5cdGNvbnN0IGFzQ2xhc3MgPSBpc0NsYXNzKGhhbmRsZXIpO1xuXHRjb25zdCBtb2RpZmljYXRvckJvZHkgPSBjb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHkobmFtZSk7XG5cblx0Y29uc3QgbWFrZUNvbnN0cnVjdEhhbmRsZXIgPSBtb2RpZmljYXRvckJvZHkoXG5cdFx0aGFuZGxlciBhcyBDb25zdHJ1Y3RIYW5kbGVyLFxuXHRcdENyZWF0aW9uSGFuZGxlcixcblx0XHRTeW1ib2xDb25zdHJ1Y3Rvck5hbWVcblx0KTtcblxuXHRpZiAoY29uZmlnIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRjb25maWcgPSB7XG5cdFx0XHRNb2RpZmljYXRpb25Db25zdHJ1Y3RvciA6IGNvbmZpZyBhcyBNb2RpZmljYXRpb25Db25zdHJ1Y3RvckZhY3Rvcnlcblx0XHR9O1xuXHR9XG5cblx0Y29uZmlnLmFzQ2xhc3MgPSBhc0NsYXNzO1xuXG5cdGNvbnN0IHByb3RvID0gKFxuXHRcdGhvcChcblx0XHRcdGhhbmRsZXIsXG5cdFx0XHQncHJvdG90eXBlJ1xuXHRcdCkgJiZcblx0XHQodHlwZW9mIGhhbmRsZXIucHJvdG90eXBlID09PSAnb2JqZWN0Jylcblx0KSA/IGhhbmRsZXIucHJvdG90eXBlIDogZ2V0RGVmYXVsdFByb3RvdHlwZSgpO1xuXG5cdC8vIHJlamVjdCB0aGUgdW5zdXBwb3J0ZWQgaGFuZGxlciBzaGFwZXMgKGdlbmVyYXRvcnMsIHN5bmMgYXJyb3dzLFxuXHQvLyBzaG9ydGhhbmQgbWV0aG9kcywgYm91bmQgZnVuY3Rpb25zKSBCRUZPUkUgdGhlIHR5cGUgaXMgY3JlYXRlZCwgc29cblx0Ly8gYSByZWplY3RlZCBkZWZpbmUgbGVhdmVzIG5vdGhpbmcgcmVnaXN0ZXJlZC4gU2tpcHBlZCB3aGVuIHRoZSBuYW1lXG5cdC8vIGlzIHRha2VuOiB0aGUgVHlwZURlc2NyaXB0b3IgYmVsb3cgdGhyb3dzIHRoZSBjYW5vbmljYWxcblx0Ly8gQUxSRUFEWV9ERUNMQVJFRCwgd2hpY2ggd2lucyBvdmVyIHRoZSBzaGFwZSBlcnJvclxuXHRpZiAoICF0YXJnZXQuaGFzKCBuYW1lICkgKSB7XG5cdFx0Y2xhc3NpZnlDb25zdHJ1Y3RIYW5kbGVyKFxuXHRcdFx0bmFtZSxcblx0XHRcdGhhbmRsZXJcblx0XHQpO1xuXHR9XG5cblx0Y29uc3QgcmVzdWx0ID0gbmV3IFR5cGVEZXNjcmlwdG9yKFxuXHRcdGRlZmluZU9yaWdpbixcblx0XHR0YXJnZXQsXG5cdFx0bmFtZSxcblx0XHRtYWtlQ29uc3RydWN0SGFuZGxlcixcblx0XHRwcm90byxcblx0XHRjb25maWcsXG5cdFx0bGF6eUdldHRlclxuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gLmxhenkoKSBpcyBhIHJlZ3VsYXIgZGVmaW5lIHdob3NlIGhhbmRsZXIgaXMgdGhlIGVtcHR5IHNoaW07IHRoZSByZWFsXG4vLyBjb25zdHJ1Y3RvciBpcyBnYXRoZXJlZCBmcm9tIHRoZSBjYWxsYmFjayBvbmNlIHBlciBjb25zdHJ1Y3Rpb24g4oCUIHNlZVxuLy8gaW5zdGFsbExhenlEZWZpbml0aW9uIGFib3ZlIGFuZCBsYXp5RGVmaW5pdGlvbi50cy4gTk9USElORyBpcyBkZXJpdmVkXG4vLyBmcm9tIHRoZSBjYWxsYmFjayBoZXJlOiBpdCBpcyBuZXZlciBjYWxsZWQgYXQgZGVmaW5lIHRpbWUsIHNvIGZvcndhcmRcbi8vIHJlZmVyZW5jZXMgYW5kIGNpcmN1bGFyIGltcG9ydHMgd29yayDigJQgdGhlIGNhbGxiYWNrJ3MgdGFyZ2V0IG9ubHkgaGFzIHRvXG4vLyBleGlzdCBieSB0aGUgZmlyc3QgYG5ld2BcbmNvbnN0IGNyZWF0ZUZyb21MYXp5RGVmaW5pdGlvbiA9IGZ1bmN0aW9uIChcblx0ZGVmaW5lT3JpZ2luOiBUeXBlQWJzb3JiZXIsXG5cdHRhcmdldDogVHlwZXNNYXAsXG5cdG5hbWU6IHN0cmluZyxcblx0Z2V0dGVyOiBMYXp5RGVmPG9iamVjdD4sXG5cdGNvbmZpZzogY29uc3RydWN0b3JPcHRpb25zXG4pIHtcblxuXHRjb25zdCByZXN1bHQgPSBjcmVhdGVGcm9tRGlyZWN0SGFuZGxlcihcblx0XHRkZWZpbmVPcmlnaW4sXG5cdFx0dGFyZ2V0LFxuXHRcdG5hbWUsXG5cdFx0dW5kZWZpbmVkLFxuXHRcdGNvbmZpZyxcblx0XHRnZXR0ZXJcblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTUFJTiBESVNQQVRDSEVSXG4vLyBBbGwgYnJhbmNoZXMgZnVubmVsIGhlcmUuIFJlY3Vyc2lvbiBpcyBpc29sYXRlZCB0byBwYXRoXG4vLyByZXNvbHV0aW9uIChyZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQpIGFuZCB0aGUgc2luZ2xlIGNhc2Vcbi8vIG9mIGEgbmFtZWQgZnVuY3Rpb24gcGFzc2VkIGFzIHRoZSBmaXJzdCBhcmd1bWVudC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgZGVmaW5lID0gZnVuY3Rpb24gKFxuXHR0aGlzOiB1bmtub3duLFxuXHRzdWJ0eXBlczogVHlwZXNNYXAsXG5cdFR5cGVPclR5cGVOYW1lOiBzdHJpbmcgfCBEZWZpbmVOZXdhYmxlT3JDYWxsYWJsZSxcblx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnPzogRGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUgfCBvYmplY3QsXG5cdGNvbmZpZz86IG9iamVjdFxuKTogVHlwZUNsYXNzIHtcblxuXHRpZiAoIWNvbmZpZyB8fCAodHlwZW9mIGNvbmZpZyAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGNvbmZpZyAhPT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRjb25maWcgPSB7fTtcblx0fVxuXG5cdC8vIC0tLSBCcmFuY2g6IGZ1bmN0aW9uIHBhc3NlZCBhcyBmaXJzdCBhcmcgLS0tXG5cdGlmICh0eXBlb2YgVHlwZU9yVHlwZU5hbWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRjb25zdCBmbiA9IFR5cGVPclR5cGVOYW1lO1xuXHRcdGlmIChmbi5uYW1lKSB7XG5cdFx0XHRjaGVja0R1cGxpY2F0ZShcblx0XHRcdFx0c3VidHlwZXMsXG5cdFx0XHRcdGZuLm5hbWVcblx0XHRcdCk7XG5cdFx0XHRjb25zdCBkZWZpbmVSZXN1bHQgPSBkZWZpbmUuY2FsbChcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0c3VidHlwZXMsXG5cdFx0XHRcdGZuLm5hbWUsXG5cdFx0XHRcdGZuLFxuXHRcdFx0XHRjb25maWdcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gZGVmaW5lUmVzdWx0O1xuXHRcdH1cblx0XHQvLyBBbm9ueW1vdXMgZnVuY3Rpb24gYXMgZmlyc3QgYXJnIGlzIG5vdCBhIHZhbGlkIC5kZWZpbmUoKSBmb3JtLlxuXHRcdC8vIFVzZSAubGF6eSgoKSA9PiBDb25zdHJ1Y3RvciwgY29uZmlnPykgZm9yIGxhenkgZ2V0dGVycyBpbnN0ZWFkLlxuXHRcdHRocm93IG5ldyBUWVBFTkFNRV9NVVNUX0JFX0FfU1RSSU5HO1xuXHR9XG5cblx0Ly8gLS0tIEJyYW5jaDogc3RyaW5nIHBhdGggcGFzc2VkIGFzIGZpcnN0IGFyZyAtLS1cblx0aWYgKHR5cGVvZiBUeXBlT3JUeXBlTmFtZSAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdkZWZpbml0aW9uIGlzIG5vdCBwcm92aWRlZCcpO1xuXHR9XG5cdGNoZWNrVHlwZU5hbWUoVHlwZU9yVHlwZU5hbWUpO1xuXG5cdGxldCBoYW5kbGVyOiBDb25zdHJ1Y3RIYW5kbGVyIHwgdW5kZWZpbmVkO1xuXHRpZiAodHlwZW9mIGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGhhbmRsZXIgPSBjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcgYXMgQ29uc3RydWN0SGFuZGxlcjtcblx0fSBlbHNlIGlmICh0eXBlb2YgY29uc3RydWN0SGFuZGxlck9yQ29uZmlnID09PSAnb2JqZWN0Jykge1xuXHRcdGNvbmZpZyA9IGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyBhcyBjb25zdHJ1Y3Rvck9wdGlvbnM7XG5cdH1cblxuXHRjb25zdCB7XG5cdFx0dGFyZ2V0LCBuYW1lLCBwYXJlbnRcblx0fSA9IHJlc29sdmVEZWZpbml0aW9uQ29udGV4dChcblx0XHRzdWJ0eXBlcyxcblx0XHRUeXBlT3JUeXBlTmFtZVxuXHQpO1xuXG5cdC8vIEV4aXN0aW5nIHR5cGUgd2l0aCBubyBoYW5kbGVyOiBlcnJvciAobWF0Y2hlcyBvcmlnaW5hbCBmYWxsdGhyb3VnaClcblx0aWYgKHBhcmVudCAmJiAhaGFuZGxlcikge1xuXHRcdHRocm93IG5ldyBXUk9OR19UWVBFX0RFRklOSVRJT04oJ2RlZmluaXRpb24gaXMgbm90IHByb3ZpZGVkJyk7XG5cdH1cblxuXHRjb25zdCByZXN1bHQgPSBjcmVhdGVGcm9tRGlyZWN0SGFuZGxlcihcblx0XHR0aGlzIGFzIFR5cGVBYnNvcmJlcixcblx0XHR0YXJnZXQsXG5cdFx0bmFtZSxcblx0XHRoYW5kbGVyLFxuXHRcdGNvbmZpZyBhcyBjb25zdHJ1Y3Rvck9wdGlvbnNcblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBjb25zdCBsYXp5ID0gZnVuY3Rpb24gKFxuXHR0aGlzOiB1bmtub3duLFxuXHRzdWJ0eXBlczogVHlwZXNNYXAsXG5cdFR5cGVOYW1lOiBzdHJpbmcsXG5cdGdldHRlcj86IExhenlEZWY8b2JqZWN0Pixcblx0Y29uZmlnPzogb2JqZWN0XG4pOiBUeXBlQ2xhc3Mge1xuXG5cdC8vIHRoZSB1bm5hbWVkIGxhenkoKCkgPT4gQ29uc3RydWN0b3IpIGZvcm0gaXMgZHJvcHBlZDogdGhlIGNhbGxiYWNrIGlzXG5cdC8vIG5ldmVyIGNhbGxlZCBhdCBkZWZpbmUgdGltZSwgc28gdGhlcmUgaXMgbm90aGluZyB0byBkZXJpdmUgdGhlIG5hbWVcblx0Ly8gZnJvbSDigJQgdGhlIG5hbWUgbXVzdCBjb21lIGluIGV4cGxpY2l0bHlcblx0aWYgKHR5cGVvZiBUeXBlTmFtZSAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVFlQRU5BTUVfTVVTVF9CRV9BX1NUUklORztcblx0fVxuXG5cdGlmICh0eXBlb2YgZ2V0dGVyICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgbmV3IEhBTkRMRVJfTVVTVF9CRV9BX0ZVTkNUSU9OO1xuXHR9XG5cblx0Ly8gdGhlIGNhbGxiYWNrIHJ1bnMgcGVyIGNvbnN0cnVjdGlvbiBhbmQgbXVzdCBkZWxpdmVyIHRoZSBjb25zdHJ1Y3RvclxuXHQvLyBzeW5jaHJvbm91c2x5OiBhbiBhc3luYyBvciBnZW5lcmF0b3IgY2FsbGJhY2sgd291bGQgcHJvZHVjZSBhXG5cdC8vIFByb21pc2UgLyBpdGVyYXRvciBpbnN0ZWFkXG5cdGNvbnN0IGNhbGxiYWNrS2luZCA9IGdldHRlci5jb25zdHJ1Y3Rvci5uYW1lO1xuXHRpZiAoXG5cdFx0Y2FsbGJhY2tLaW5kID09PSAnQXN5bmNGdW5jdGlvbicgfHxcblx0XHRjYWxsYmFja0tpbmQgPT09ICdHZW5lcmF0b3JGdW5jdGlvbicgfHxcblx0XHRjYWxsYmFja0tpbmQgPT09ICdBc3luY0dlbmVyYXRvckZ1bmN0aW9uJ1xuXHQpIHtcblx0XHRjb25zdCBtc2cgPSBgJHtUeXBlTmFtZX06IGxhenkgY2FsbGJhY2sgbXVzdCBiZSBhIHN5bmMgZnVuY3Rpb24gYCArXG5cdFx0XHQnKGFzeW5jIGFuZCBnZW5lcmF0b3IgY2FsbGJhY2tzIGFyZSBub3Qgc3VwcG9ydGVkKSc7XG5cdFx0dGhyb3cgbmV3IFdST05HX01PRElGSUNBVElPTl9QQVRURVJOKCBtc2cgKTtcblx0fVxuXG5cdGlmICghY29uZmlnIHx8ICh0eXBlb2YgY29uZmlnICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgY29uZmlnICE9PSAnZnVuY3Rpb24nKSkge1xuXHRcdGNvbmZpZyA9IHt9O1xuXHR9XG5cblx0Ly8gdGhlIHNhbWUgZG90dGVkLXBhdGggcmVzb2x1dGlvbiBhcyBkZWZpbmUncyBzdHJpbmcgYnJhbmNoOlxuXHQvLyBsYXp5KCdQYXJlbnQuQ2hpbGQnLCAuLi4pIGxhbmRzIHVuZGVyIFBhcmVudCwgYW5kIGEgdGFrZW4gbmFtZSBmYWlsc1xuXHQvLyB3aXRoIHRoZSBkZXNjcmlwdG9yJ3MgQUxSRUFEWV9ERUNMQVJFRCwgZXhhY3RseSBsaWtlIGRlZmluZVxuXHRjaGVja1R5cGVOYW1lKFR5cGVOYW1lKTtcblxuXHRjb25zdCB7IHRhcmdldCwgbmFtZSB9ID0gcmVzb2x2ZURlZmluaXRpb25Db250ZXh0KFxuXHRcdHN1YnR5cGVzLFxuXHRcdFR5cGVOYW1lXG5cdCk7XG5cblx0Y29uc3QgbGF6eVJlc3VsdCA9IGNyZWF0ZUZyb21MYXp5RGVmaW5pdGlvbihcblx0XHR0aGlzIGFzIFR5cGVBYnNvcmJlcixcblx0XHR0YXJnZXQsXG5cdFx0bmFtZSxcblx0XHRnZXR0ZXIsXG5cdFx0Y29uZmlnIGFzIGNvbnN0cnVjdG9yT3B0aW9uc1xuXHQpO1xuXHRyZXR1cm4gbGF6eVJlc3VsdDtcbn07XG5cbmV4cG9ydCBjb25zdCBsb29rdXAgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IFR5cGVzTWFwLFxuXHRUeXBlTmVzdGVkUGF0aDogc3RyaW5nXG4pOiBUeXBlQ2xhc3MgfCB1bmRlZmluZWQge1xuXG5cdGlmICh0eXBlb2YgVHlwZU5lc3RlZFBhdGggIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignYXJnIDogdHlwZSBuZXN0ZWQgcGF0aCBtdXN0IGJlIGEgc3RyaW5nJyk7XG5cdH1cblxuXHRpZiAoIVR5cGVOZXN0ZWRQYXRoLmxlbmd0aCkge1xuXHRcdHRocm93IG5ldyBXUk9OR19UWVBFX0RFRklOSVRJT04oJ2FyZyA6IHR5cGUgbmVzdGVkIHBhdGggaGFzIG5vIHBhdGgnKTtcblx0fVxuXG5cdGNvbnN0IHNwbGl0ID0gZ2V0VHlwZVNwbGl0UGF0aChUeXBlTmVzdGVkUGF0aCk7XG5cblx0Y29uc3QgWyBuYW1lIF0gPSBzcGxpdDtcblx0Y29uc3QgdHlwZSA9IHRoaXMuZ2V0KG5hbWUpIGFzIFR5cGVDbGFzcyB8IHVuZGVmaW5lZDtcblx0aWYgKHNwbGl0Lmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiB0eXBlO1xuXHR9XG5cblx0Y29uc3QgTmV4dE5lc3RlZFBhdGggPSBzcGxpdC5zbGljZSgxKS5qb2luKCcuJyk7XG5cdGlmICghdHlwZSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0Ly8gYSB0eXBlJ3Mgc3VidHlwZXMgbWFwIElTIHRoZSBydW50aW1lIFR5cGVzTWFwIChTeW1ib2xQYXJlbnRUeXBlIGFuZFxuXHQvLyBNTkVNT1NZTkUgYXJlIGluc3RhbGxlZCBhdCBkZWZpbml0aW9uIHRpbWUpLCBzbyB0aGUgc2luZ2xlIGNhc3Qgb25seVxuXHQvLyBuYW1lcyB0aGF0IHZpZXdcblx0Y29uc3QgcmVzdWx0ID0gbG9va3VwLmNhbGwoXG5cdFx0dHlwZS5zdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHROZXh0TmVzdGVkUGF0aFxuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xuXG59O1xuXG5cblxuIl19