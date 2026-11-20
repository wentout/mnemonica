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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3R5cGVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0NiLHlDQUFzQztBQUV0QywrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLFlBQVksRUFFWixpQkFBaUIsRUFDakIsU0FBUyxHQUVULEdBQUcscUJBQVMsQ0FBQztBQUVkLHFEQUF1RDtBQUd2RCw0REFBcUM7QUFDckMsTUFBTSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsbUJBQVUsQ0FBQztBQUUzQyxNQUFNLEVBQ0wsZ0JBQWdCLEVBQ2hCLHFCQUFxQixFQUNyQiwwQkFBMEIsRUFDMUIseUJBQXlCLEVBQ3pCLDBCQUEwQixFQUMxQixhQUFhLEdBQ2IsR0FBRyxvQkFBVyxDQUFDO0FBS2hCLG1EQUFxQztBQUNyQywyQ0FBd0M7QUFFeEMseUdBSTZDO0FBRTdDLHFEQUcwQjtBQUUxQixrREFBdUQ7QUFDdkQsTUFBTSxFQUNMLG9CQUFvQixFQUNwQixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLE9BQU8sR0FDUCxHQUFHLGVBQVUsQ0FBQztBQUVmLHNDQUdtQjtBQWFuQixNQUFNLHFCQUFxQixHQUFHLFVBQzdCLElBQTRCLEVBQzVCLFFBQWdCLEVBQ2hCLG9CQUFpRCxFQUNqRCxTQUF1QyxFQUN2QyxZQUEwQyxFQUMxQyxNQUF1QjtJQUt2QixNQUFNLElBQUksR0FBdUI7UUFDaEMsT0FBTyxFQUFHLFNBQVM7UUFDbkIsT0FBTyxFQUFHLEtBQUs7UUFDZixLQUFLLEVBQUssU0FBUztRQUNuQixNQUFNLEVBQUksS0FBSztRQUNmLEtBQUssRUFBSyxTQUFTO0tBQ25CLENBQUM7SUFJRixNQUFNLEtBQUssR0FBRztRQUNiLElBQUksQ0FBQyxPQUFPLEdB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T0FBTyxVQUFVLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBdkRXLFFBQUEsSUFBSSxRQXVEZjtBQUVLLE1BQU0sTUFBTSxHQUFHLFVBRXJCLGNBQXNCO0lBR3RCLElBQUksT0FBTyxjQUFjLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDeEMsTUFBTSxJQUFJLHFCQUFxQixDQUFDLHlDQUF5QyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUIsTUFBTSxJQUFJLHFCQUFxQixDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRS9DLE1BQU0sQ0FBRSxJQUFJLENBQUUsR0FBRyxLQUFLLENBQUM7SUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQTBCLENBQUM7SUFDckQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFJRCxNQUFNLE1BQU0sR0FBRyxjQUFNLENBQUMsSUFBSSxDQUN6QixJQUFJLENBQUMsUUFBb0IsRUFDekIsY0FBYyxDQUNkLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUVmLENBQUMsQ0FBQztBQWxDVyxRQUFBLE1BQU0sVUFrQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENvbnN0cnVjdGlvbiBQaXBlbGluZSAoaGlnaC1sZXZlbCBmbG93KTpcbiAqXG4gKiAgIGRlZmluZShUeXBlTmFtZSwgY3RvcikgIOKGkiAgbmV3IFR5cGVEZXNjcmlwdG9yKCkgIOKGkiAgbmV3IFR5cGVQcm94eSgpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnN0YW5jZUNyZWF0b3IodHlwZSwgcGFyZW50LCBhcmdzKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWtlSW5zdGFuY2VNb2RpZmljYXRvcihzZWxmKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RpZmljYXRpb25Db25zdHJ1Y3Rvci5jYWxsKHBhcmVudCwgTW9kaWZpY2F0b3JUeXBlLCBwcm90bywgX2FkZFByb3BzKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyIGNvbnN0cnVjdG9yIHJ1bnMgKG5ldyBNb2RpZmljYXRvclR5cGUoLi4uYXJncykpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQcm9jZXNzaW5nKCkg4oaSIGludm9rZVBvc3RIb29rcygpXG4gKi9cblxuaW1wb3J0IHtcblx0X0ludGVybmFsX1RDXyxcblx0VHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0VHlwZUNsYXNzLFxuXHRUeXBlRGVmLFxuXHRDb2xsZWN0aW9uRGVmLFxuXHRjb25zdHJ1Y3Rvck9wdGlvbnMsXG5cdFR5cGVBYnNvcmJlcixcblx0TW9kaWZpY2F0aW9uQ29uc3RydWN0b3JGYWN0b3J5LFxuXHRNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHREZWZpbmVOZXdhYmxlLFxuXHRMYXp5RGVmLFxufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGhvcCB9IGZyb20gJy4uLy4uL3V0aWxzL2hvcCc7XG5cbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5jb25zdCB7XG5cdG9kcCxcblx0U3ltYm9sUGFyZW50VHlwZSxcblx0U3ltYm9sQ29uc3RydWN0b3JOYW1lLFxuXHRTeW1ib2xDb25maWcsXG5cblx0VFlQRV9USVRMRV9QUkVGSVgsXG5cdE1ORU1PU1lORSxcblxufSA9IGNvbnN0YW50cztcblxuaW1wb3J0IHsgRXJyb3JzVHlwZXMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycy9lcnJvcnMnO1xuLy8gaW1wb3J0IHsgZGVzY3JpcHRvcnMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycyc7XG5cbmltcG9ydCBtbmVtb3N5bmVzIGZyb20gJy4vTW5lbW9zeW5lJztcbmNvbnN0IHsgZ2V0RGVmYXVsdFByb3RvdHlwZSB9ID0gbW5lbW9zeW5lcztcblxuY29uc3Qge1xuXHRBTFJFQURZX0RFQ0xBUkVELFxuXHRXUk9OR19UWVBFX0RFRklOSVRJT04sXG5cdFdST05HX01PRElGSUNBVElPTl9QQVRURVJOLFxuXHRUWVBFTkFNRV9NVVNUX0JFX0FfU1RSSU5HLFxuXHRIQU5ETEVSX01VU1RfQkVfQV9GVU5DVElPTixcblx0T1BUSU9OU19FUlJPUixcbn0gPSBFcnJvcnNUeXBlcztcblxuLy8gaW52b2tlSG9va1xuLy8gcmVnaXN0ZXJIb29rXG4vLyByZWdpc3RlckZsb3dDaGVja2VyXG5pbXBvcnQgKiBhcyBob29rc0FwaSBmcm9tICcuLi9ob29rcyc7XG5pbXBvcnQgeyBUeXBlUHJveHkgfSBmcm9tICcuL1R5cGVQcm94eSc7XG5cbmltcG9ydCBjb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHksIHtcblx0Y2xhc3NpZnlDb25zdHJ1Y3RIYW5kbGVyLFxuXHRpc0NhbGxhYmxlQ2FuZGlkYXRlLFxuXHRDb25zdHJ1Y3RIYW5kbGVyXG59IGZyb20gJy4vY29tcGlsZU5ld01vZGlmaWNhdG9yRnVuY3Rpb25Cb2R5JztcblxuaW1wb3J0IHtcblx0c2V0TGF6eURlZmluaXRpb24sXG5cdExhenlEZWZpbml0aW9uQ2VsbCxcbn0gZnJvbSAnLi9sYXp5RGVmaW5pdGlvbic7XG5cbmltcG9ydCBUeXBlc1V0aWxzLCB7IENyZWF0aW9uSGFuZGxlciB9IGZyb20gJy4uL3V0aWxzJztcbmNvbnN0IHtcblx0Z2V0Q2FjaGVkVHlwZUNoZWNrZXIsXG5cdGdldFR5cGVTcGxpdFBhdGgsXG5cdGNoZWNrVHlwZU5hbWUsXG5cdGlzQ2xhc3MsXG59ID0gVHlwZXNVdGlscztcblxuaW1wb3J0IHtcblx0Z2V0U3RhY2ssXG5cdFN0YWNrYWJsZUluc3RhbmNlLFxufSBmcm9tICcuLi9lcnJvcnMnO1xuXG5leHBvcnQgdHlwZSBUeXBlc01hcCA9IE1hcDxzdHJpbmcsIG9iamVjdD4gJiB7XG5cdFtTeW1ib2xQYXJlbnRUeXBlXT86IFR5cGVEZWY7XG5cdFtNTkVNT1NZTkVdPzogQ29sbGVjdGlvbkRlZjtcbn07XG5cbi8vIExhenkgdHlwZSBmYWNhZGVzLlxuLy8gQSBsYXp5IHR5cGUgaXMgYSByZWd1bGFyIGRlZmluZSB3aG9zZSBoYW5kbGVyIGlzIHRoZSBlbXB0eSBzaGltOyB0aGUgcmVhbFxuLy8gY29uc3RydWN0b3IgaXMgZ2F0aGVyZWQgZnJvbSB0aGUgY2FsbGJhY2sgb25jZSBwZXIgY29uc3RydWN0aW9uIChzZWVcbi8vIGxhenlEZWZpbml0aW9uLnRzKS4gVGhlIHR5cGUncyBwcm90byAvIGNvbmZpZyAvIGNvbnN0cnVjdEhhbmRsZXIgcmVhZCB0aGVcbi8vIGdhdGhlciBjZWxsLCBzbyB0aGUgc2FtZSB0eXBlIG9iamVjdCBzZXJ2ZXMgZXZlcnkgY29uc3RydWN0aW9uIHdpdGhvdXRcbi8vIGV2ZXIgY2FsbGluZyB0aGUgY2FsbGJhY2sgYXQgZGVmaW5lIHRpbWUuXG5jb25zdCBpbnN0YWxsTGF6eURlZmluaXRpb24gPSBmdW5jdGlvbiAoXG5cdHR5cGU6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsXG5cdFR5cGVOYW1lOiBzdHJpbmcsXG5cdHNoaW1Db25zdHJ1Y3RIYW5kbGVyOiBNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdHNoaW1Qcm90bzogeyBbaW5kZXg6IHN0cmluZ106IHVua25vd24gfSxcblx0bWVyZ2VkQ29uZmlnOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRnZXR0ZXI6IExhenlEZWY8b2JqZWN0PlxuKSB7XG5cblx0Ly8gb3V0c2lkZSBhbnkgY29uc3RydWN0aW9uIHRoZSBjZWxsIGhvbGRzIHRoZSBkZWZpbmUtdGltZSBmYWxsYmFjazpcblx0Ly8gbm8gaGFuZGxlciwgdGhlIHNoaW0ncyBlbXB0eSBwcm90b3R5cGUsIGFzQ2xhc3Mgb2ZmLCBubyBmYWlsdXJlXG5cdGNvbnN0IGNlbGw6IExhenlEZWZpbml0aW9uQ2VsbCA9IHtcblx0XHRoYW5kbGVyIDogdW5kZWZpbmVkLFxuXHRcdGFzQ2xhc3MgOiBmYWxzZSxcblx0XHRwcm90byAgIDogc2hpbVByb3RvLFxuXHRcdGZhaWxlZCAgOiBmYWxzZSxcblx0XHRlcnJvciAgIDogdW5kZWZpbmVkXG5cdH07XG5cblx0Ly8gYmFjayB0byB0aGUgZGVmaW5lLXRpbWUgc3RhdGU6IG5vIGhhbmRsZXIgcmV0YWluZWQsIHRoZSBzaGltJ3MgZW1wdHlcblx0Ly8gcHJvdG90eXBlLCBhc0NsYXNzIG9mZiwgbm8gZXJyb3Jcblx0Y29uc3QgcmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Y2VsbC5oYW5kbGVyID0gdW5kZWZpbmVkO1xuXHRcdGNlbGwuYXNDbGFzcyA9IGZhbHNlO1xuXHRcdGNlbGwucHJvdG8gPSBzaGltUHJvdG87XG5cdFx0Y2VsbC5mYWlsZWQgPSBmYWxzZTtcblx0XHRjZWxsLmVycm9yID0gdW5kZWZpbmVkO1xuXHR9O1xuXG5cdC8vIHRoZSBzaW5nbGUgY2FsbGJhY2sgY2FsbCBwZXIgY29uc3RydWN0aW9uIOKAlCBpbnZva2VkIE9OTFkgYnlcblx0Ly8gZ2F0aGVyTGF6eURlZmluaXRpb24gYXQgdGhlIGNvbnN0cnVjdGlvbiBlbnRyaWVzXG5cdGNvbnN0IGdhdGhlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXNldCgpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBnYXRoZXJlZCA9IGdldHRlcigpO1xuXHRcdFx0aWYgKCFpc0NhbGxhYmxlQ2FuZGlkYXRlKGdhdGhlcmVkKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgSEFORExFUl9NVVNUX0JFX0FfRlVOQ1RJT047XG5cdFx0XHR9XG5cdFx0XHQvLyB0aGUgc2hhcGUgY2hlY2tzIGFyZSB3aGF0IG1ha2UgaXQgYSBDb25zdHJ1Y3RIYW5kbGVyXG5cdFx0XHRjbGFzc2lmeUNvbnN0cnVjdEhhbmRsZXIoXG5cdFx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0XHRnYXRoZXJlZFxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGhhbmRsZXIgPSBnYXRoZXJlZDtcblx0XHRcdGNlbGwuaGFuZGxlciA9IGhhbmRsZXI7XG5cdFx0XHRjZWxsLmFzQ2xhc3MgPSBpc0NsYXNzKGhhbmRsZXIpO1xuXHRcdFx0Ly8gc2FtZSBmYWxsYmFjayBhcyB0aGUgZGlyZWN0IHBhdGg6IGFuIG93biBOT04tT0JKRUNUIHByb3RvdHlwZVxuXHRcdFx0Ly8gKHByb3RvdHlwZSA9IDEyMykgaXMgcmVwbGFjZWQgYnkgdGhlIGRlZmF1bHRcblx0XHRcdGNlbGwucHJvdG8gPSAoXG5cdFx0XHRcdGhvcChcblx0XHRcdFx0XHRoYW5kbGVyLFxuXHRcdFx0XHRcdCdwcm90b3R5cGUnXG5cdFx0XHRcdCkgJiZcblx0XHRcdFx0KHR5cGVvZiBoYW5kbGVyLnByb3RvdHlwZSA9PT0gJ29iamVjdCcpXG5cdFx0XHQpID8gaGFuZGxlci5wcm90b3R5cGUgOiBnZXREZWZhdWx0UHJvdG90eXBlKCk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdC8vIHBhc3N0aHJvdWdoLCBleGFjdGx5IGxpa2UgcnVuQnVpbGQncyBjYXRjaDogd2hhdGV2ZXIgdGhlXG5cdFx0XHQvLyBjYWxsYmFjayB0aHJldyByZWFjaGVzIHRocm93TW9kaWZpY2F0aW9uRXJyb3IgYXMtaXMgKGEgdGhyb3duXG5cdFx0XHQvLyBub24tRXJyb3IgYnJlYWtzIHRoZSBwcm90b3R5cGUgc3BsaWNlIHRoZXJlIHRoZSBzYW1lIHdheSBpdFxuXHRcdFx0Ly8gZG9lcyBmb3IgYSBjb25zdHJ1Y3RvciBib2R5KS4gVGhlIGZsYWcgaXMgc2VwYXJhdGUgZnJvbSB0aGVcblx0XHRcdC8vIHZhbHVlOiBhIGNhbGxiYWNrIG1heSB0aHJvdyB1bmRlZmluZWRcblx0XHRcdGNlbGwuZmFpbGVkID0gdHJ1ZTtcblx0XHRcdGNlbGwuZXJyb3IgPSBlcnJvcjtcblx0XHR9XG5cdH07XG5cblx0Ly8ga2V5ZWQgYnkgdGhlIHR5cGUgZGVzY3JpcHRvciBoZXJlOyBUeXBlUHJveHkgcmVnaXN0ZXJzIGl0cyBwcm94eVxuXHQvLyBhZ2FpbnN0IHRoZSBzYW1lIGRlZmluaXRpb24gd2hlbiBpdCB3cmFwcyB0aGlzIHR5cGVcblx0c2V0TGF6eURlZmluaXRpb24oXG5cdFx0dHlwZSxcblx0XHR7XG5cdFx0XHRjZWxsLFxuXHRcdFx0Ly8gdGhlIG1lcmdlZCBjb25maWcgdmFsdWUgYXQgZGVmaW5lIHRpbWUg4oCUIHRoZSBjYWxsYmFjayBtdXN0XG5cdFx0XHQvLyBub3QgcnVuIHdoZW4gdGhlIGNvbnN0cnVjdGlvbiB3aWxsIGJlIGJsb2NrZWRcblx0XHRcdGJsb2NrRXJyb3JzIDogbWVyZ2VkQ29uZmlnLmJsb2NrRXJyb3JzICE9PSBmYWxzZSxcblx0XHRcdGdhdGhlcixcblx0XHRcdHJlc2V0XG5cdFx0fVxuXHQpO1xuXG5cdC8vIHplcm8tYXJnIGZhY3RvcnksIHRoZSBzYW1lIGNvbnRyYWN0IGFzIGEgZGlyZWN0IHR5cGUnc1xuXHQvLyBjb25zdHJ1Y3RIYW5kbGVyOiBidWlsZHMgdGhlIHdyYXBwZXIgZnJvbSB0aGUgZ2F0aGVyZWQgaGFuZGxlcixcblx0Ly8gcmVidWlsdCBvbiBldmVyeSBjb25zdHJ1Y3Rpb24gKHRoZSBjYWxsYmFjayBtYXkgcmV0dXJuIGEgbmV3IGZ1bmN0aW9uXG5cdC8vIGVhY2ggdGltZSk7IGJlZm9yZSB0aGUgZ2F0aGVyIOKAlCBhbmQgYWZ0ZXIgYSBmYWlsZWQgb25lIOKAlCBpdCBidWlsZHNcblx0Ly8gdGhlIHNoaW0ncyB3cmFwcGVyLCB3aGljaCB0aGUgZXJyb3IgcGF0aCB0aGVuIHJlcGxhY2VzXG5cdGNvbnN0IGxhenlDb25zdHJ1Y3RIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmIChjZWxsLmhhbmRsZXIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3Qgc2hpbVJlc3VsdCA9IHNoaW1Db25zdHJ1Y3RIYW5kbGVyKCk7XG5cdFx0XHRyZXR1cm4gc2hpbVJlc3VsdDtcblx0XHR9XG5cdFx0Y29uc3QgeyBoYW5kbGVyIH0gPSBjZWxsO1xuXHRcdGNvbnN0IG1vZGlmaWNhdG9yQm9keSA9IGNvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keShUeXBlTmFtZSk7XG5cdFx0Y29uc3Qgd3JhcHBlZEJvZHkgPSBtb2RpZmljYXRvckJvZHkoXG5cdFx0XHRoYW5kbGVyLFxuXHRcdFx0Q3JlYXRpb25IYW5kbGVyLFxuXHRcdFx0U3ltYm9sQ29uc3RydWN0b3JOYW1lXG5cdFx0KTtcblx0XHRjb25zdCBoYW5kbGVyUmVzdWx0ID0gd3JhcHBlZEJvZHkoKTtcblx0XHRyZXR1cm4gaGFuZGxlclJlc3VsdDtcblx0fTtcblxuXHRvZHAoXG5cdFx0dHlwZSxcblx0XHQnY29uc3RydWN0SGFuZGxlcicsIHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBsYXp5Q29uc3RydWN0SGFuZGxlcjtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlICAgOiB0cnVlLFxuXHRcdFx0Y29uZmlndXJhYmxlIDogdHJ1ZVxuXHRcdH1cblx0KTtcblxuXHRvZHAoXG5cdFx0dHlwZSxcblx0XHQncHJvdG8nLCB7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSBjZWxsLnByb3RvO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGUgICA6IHRydWUsXG5cdFx0XHRjb25maWd1cmFibGUgOiB0cnVlXG5cdFx0fVxuXHQpO1xuXG5cdC8vIGEgZnJlc2ggY29weSBwZXIgcmVhZDogYXNDbGFzcyBpcyBwZXItY29uc3RydWN0aW9uIGFuZCBtdXN0IG5ldmVyXG5cdC8vIGxlYWsgaW50byB0aGUgc2hhcmVkIG1lcmdlZCBjb25maWdcblx0b2RwKFxuXHRcdHR5cGUsXG5cdFx0J2NvbmZpZycsIHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHRcdFx0e30sXG5cdFx0XHRcdFx0bWVyZ2VkQ29uZmlnLFxuXHRcdFx0XHRcdHsgYXNDbGFzcyA6IGNlbGwuYXNDbGFzcyB9XG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZSAgIDogdHJ1ZSxcblx0XHRcdGNvbmZpZ3VyYWJsZSA6IHRydWVcblx0XHR9XG5cdCk7XG5cbn07XG5cbmNvbnN0IHR5cGVEZXNjcmlwdG9yQ3JlYXRvciA9IGZ1bmN0aW9uIChcblx0dGhpczogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0ZGVmaW5lT3JpZ2luOiBUeXBlQWJzb3JiZXIsXG5cdHR5cGVzOiBUeXBlc01hcCxcblx0VHlwZU5hbWU6IHN0cmluZyxcblx0Y29uc3RydWN0SGFuZGxlcjogTW5lbW9uaWNhQ29uc3RydWN0b3JGYWN0b3J5LFxuXHRwcm90bzogeyBbaW5kZXg6IHN0cmluZ106IHVua25vd24gfSxcblx0Y29uZmlnOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRsYXp5R2V0dGVyPzogTGF6eURlZjxvYmplY3Q+LFxuKSB7XG5cblx0Ly8gaGVyZSBcInR5cGVzXCIgcmVmZXJzIHRvIHN1YnR5cGVzIG9mIHR5cGUgb3IgY29sbGVjdGlvbiBvYmplY3Qge31cblxuXHRjb25zdCBwYXJlbnRUeXBlID0gdHlwZXNbIFN5bWJvbFBhcmVudFR5cGUgXSB8fCBudWxsO1xuXG5cdGNvbnN0IGlzU3ViVHlwZSA9IHBhcmVudFR5cGUgPyB0cnVlIDogZmFsc2U7XG5cblx0Y29uc3QgY29sbGVjdGlvbiA9IGlzU3ViVHlwZVxuXHRcdD8gKHBhcmVudFR5cGUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmNvbGxlY3Rpb24gYXMgb2JqZWN0XG5cdFx0OiB0eXBlc1sgTU5FTU9TWU5FIF07XG5cblx0aWYgKHR5cGVzLmhhcyhUeXBlTmFtZSkpIHtcblx0XHR0aHJvdyBuZXcgQUxSRUFEWV9ERUNMQVJFRChUeXBlTmFtZSk7XG5cdH1cblxuXHQvLyBjb25zdCBzdWJ0eXBlcyA9IGRlc2NyaXB0b3JzLmNyZWF0ZVR5cGVzQ29sbGVjdGlvbigpO1xuXHRjb25zdCBzdWJ0eXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBvYmplY3Q+KCk7XG5cblx0Y29uc3QgdGl0bGUgPSBgJHtUWVBFX1RJVExFX1BSRUZJWH0ke1R5cGVOYW1lfWA7XG5cblx0Ly8gJ25hbWUnIGlzIGEgQ09MTEVDVElPTiBvcHRpb24gb25seTogYSB1c2VyIHBhc3NpbmcgaXQgaGVyZSBtZWFudCB0b1xuXHQvLyBuYW1lIHRoZSBjb2xsZWN0aW9uLCBub3QgdGhlIHR5cGUg4oCUIHNheSBzbyByZWFkYWJseVxuXHRpZiAoIGNvbmZpZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjb25maWcgPT09ICdvYmplY3QnICYmICduYW1lJyBpbiBjb25maWcgKSB7XG5cdFx0Y29uc3QgbmFtZUVycm9yID0gJ1xcXCJuYW1lXFxcIiBpcyBhIGNvbGxlY3Rpb24gb3B0aW9uICcgK1xuXHRcdFx0JyhjcmVhdGVUeXBlc0NvbGxlY3Rpb24oeyBuYW1lIH0pKSDigJQgaXQgY2Fubm90IGJlIHNldCBvbiBhIHR5cGUnO1xuXHRcdHRocm93IG5ldyBPUFRJT05TX0VSUk9SKCBuYW1lRXJyb3IgKTtcblx0fVxuXHRjb25maWcgPSBPYmplY3QuYXNzaWduKFxuXHRcdHt9LFxuXHRcdChjb2xsZWN0aW9uIGFzIFJlY29yZDxzeW1ib2wsIHVua25vd24+KVsgU3ltYm9sQ29uZmlnIF0sXG5cdFx0Y29uZmlnXG5cdCk7XG5cdC8vIG5ldmVyIGluaGVyaXRlZCBpbnRvIHRoZSB0eXBlJ3MgY29uZmlnIGVpdGhlclxuXHRSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KCBjb25maWcsICduYW1lJyApO1xuXG5cdGNvbnN0IHR5cGUgPSBPYmplY3QuYXNzaWduKFxuXHRcdHRoaXMsXG5cdFx0e1xuXG5cdFx0XHRnZXQgY29uc3RydWN0SGFuZGxlciAoKSB7XG5cdFx0XHRcdHJldHVybiBjb25zdHJ1Y3RIYW5kbGVyO1xuXHRcdFx0fSxcblxuXG5cdFx0XHRUeXBlTmFtZSxcblx0XHRcdHByb3RvLFxuXG5cdFx0XHRpc1N1YlR5cGUsXG5cdFx0XHRzdWJ0eXBlcyxcblx0XHRcdHBhcmVudFR5cGUsXG5cblx0XHRcdGNvbGxlY3Rpb24sXG5cblx0XHRcdHRpdGxlLFxuXG5cdFx0XHRjb25maWcsXG5cblx0XHRcdGhvb2tzIDogT2JqZWN0LmNyZWF0ZShudWxsKVxuXG5cdFx0fVxuXHQpO1xuXG5cdGdldFN0YWNrLmNhbGwoXG5cdFx0dGhpcyBhcyBTdGFja2FibGVJbnN0YW5jZSxcblx0XHRgRGVmaW5pdGlvbiBvZiBbICR7VHlwZU5hbWV9IF0gbWFkZSBhdDpgLFxuXHRcdFtdLFxuXHRcdGRlZmluZU9yaWdpblxuXHQpO1xuXG5cdC8vIGxhenkgdHlwZXM6IHByb3RvIC8gY29uZmlnIC8gY29uc3RydWN0SGFuZGxlciBiZWNvbWUgZmFjYWRlcyBvdmVyIHRoZVxuXHQvLyBwZXItY29uc3RydWN0aW9uIGdhdGhlciBjZWxsIOKAlCBzZWUgaW5zdGFsbExhenlEZWZpbml0aW9uIGFib3ZlIGFuZFxuXHQvLyBsYXp5RGVmaW5pdGlvbi50c1xuXHRpZiAobGF6eUdldHRlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aW5zdGFsbExhenlEZWZpbml0aW9uKFxuXHRcdFx0dHlwZSxcblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0Y29uc3RydWN0SGFuZGxlcixcblx0XHRcdHByb3RvLFxuXHRcdFx0Y29uZmlnLFxuXHRcdFx0bGF6eUdldHRlclxuXHRcdCk7XG5cdH1cblxuXHRvZHAoXG5cdFx0c3VidHlwZXMsXG5cdFx0U3ltYm9sUGFyZW50VHlwZSwge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIHR5cGU7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdC8vIGNvbnN0IGFuY2VzdG9yID0gaXNTdWJUeXBlID8gT2JqZWN0LmNyZWF0ZShudWxsKSA6IHByb3RvO1xuXHQvLyBhIGxhenkgcm9vdCdzIGFuY2VzdG9yIGlzIG5vdCBrbm93biBhdCBkZWZpbmUgdGltZSBlaXRoZXI6IFR5cGVQcm94eVxuXHQvLyBpbnN0YWxscyBhIGZhY2FkZSBvdmVyIHRoZSBnYXRoZXIgY2VsbCB3aGVuIGl0IHJlY2VpdmVzIHVuZGVmaW5lZCBmb3Jcblx0Ly8gYSBub24tc3VidHlwZSBoZXJlXG5cdGNvbnN0IGFuY2VzdG9yID0gKGlzU3ViVHlwZSB8fCBsYXp5R2V0dGVyICE9PSB1bmRlZmluZWQpID8gdW5kZWZpbmVkIDogcHJvdG87XG5cdHR5cGVzLnNldChcblx0XHRUeXBlTmFtZSxcblx0XHRuZXcgVHlwZVByb3h5KFxuXHRcdFx0dHlwZSxcblx0XHRcdGFuY2VzdG9yXG5cdFx0KVxuXHQpO1xuXG5cdC8vIHR5cGVzLnNldCggVHlwZU5hbWUsIG5ldyBUeXBlUHJveHkoIHR5cGUgKSApO1xuXG5cdGNvbnN0IHJlc3VsdCA9IHR5cGVzLmdldChUeXBlTmFtZSk7XG5cdHJldHVybiByZXN1bHQ7XG5cbn07XG5cbi8vIHRoZSBjcmVhdG9yIGlzIG9ubHkgZXZlciBpbnZva2VkIHdpdGggYG5ld2AgKHRoZSBjcmVhdGVGcm9tKiBjYWxsIHNpdGVzXG4vLyBiZWxvdyk7IGEgZnVuY3Rpb24gZXhwcmVzc2lvbiBjYXJyaWVzIG5vIGNvbnN0cnVjdCBzaWduYXR1cmUsIHNvIGl0IGlzXG4vLyBuYW1lZCBvbmNlIGFzIHRoZSBjb25zdHJ1Y3RvciBpbnRlcmZhY2UgaXQgaXMgdXNlZCB0aHJvdWdoIOKAlCB0aGVcbi8vIHByb3RvdHlwZSBjb250cmFjdCBpcyBhdHRhY2hlZCBpbW1lZGlhdGVseSBiZWxvd1xuLy8gVGhlIHJlZ2lzdGVyZWQgcmVzdWx0IGlzIGEgVHlwZVByb3h5LCBub3QgdGhlIGRlc2NyaXB0b3IncyBkZWNsYXJlZFxuLy8gVHlwZURlc2NyaXB0b3JJbnN0YW5jZSBzaGFwZS5cbmNvbnN0IFR5cGVEZXNjcmlwdG9yID0gdHlwZURlc2NyaXB0b3JDcmVhdG9yIGFzIF9JbnRlcm5hbF9UQ188VHlwZURlc2NyaXB0b3JJbnN0YW5jZT47XG5cbk9iamVjdC5hc3NpZ24oXG5cdFR5cGVEZXNjcmlwdG9yLnByb3RvdHlwZSxcblx0aG9va3NBcGlcbik7XG5cblR5cGVEZXNjcmlwdG9yLnByb3RvdHlwZS5kZWZpbmUgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsXG5cdFR5cGVPclR5cGVOYW1lOiBzdHJpbmcgfCBEZWZpbmVOZXdhYmxlT3JDYWxsYWJsZSxcblx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnPzogRGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUgfCBvYmplY3QsXG5cdGNvbmZpZz86IG9iamVjdFxuKSB7XG5cdGNvbnN0IHJlc3VsdCA9IGRlZmluZS5jYWxsKFxuXHRcdGRlZmluZSxcblx0XHR0aGlzLnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFR5cGVPclR5cGVOYW1lLFxuXHRcdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyxcblx0XHRjb25maWdcblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cblR5cGVEZXNjcmlwdG9yLnByb3RvdHlwZS5sYXp5ID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRUeXBlTmFtZTogc3RyaW5nLFxuXHRnZXR0ZXI/OiBMYXp5RGVmPG9iamVjdD4sXG5cdGNvbmZpZz86IG9iamVjdFxuKSB7XG5cdGNvbnN0IHJlc3VsdCA9IGxhenkuY2FsbChcblx0XHR0aGlzLFxuXHRcdHRoaXMuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0VHlwZU5hbWUsXG5cdFx0Z2V0dGVyLFxuXHRcdGNvbmZpZ1xuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuVHlwZURlc2NyaXB0b3IucHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uIChcblx0dGhpczogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0VHlwZU5lc3RlZFBhdGg6IHN0cmluZ1xuKSB7XG5cdC8vIHJlbGF0aXZlIGZpcnN0OiByZXNvbHZlIGFtb25nIHRoaXMgdHlwZSdzIG93biBzdWJ0eXBlcyxcblx0Ly8gZS5nLiBBZG1pblR5cGUubG9va3VwKCdTdWJUeXBlJykgb3IgJ1N1YlR5cGUuRGVlcFN1YlR5cGUnXG5cdGNvbnN0IHJlbGF0aXZlUmVzdWx0ID0gbG9va3VwLmNhbGwoXG5cdFx0dGhpcy5zdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRUeXBlTmVzdGVkUGF0aFxuXHQpO1xuXHRpZiAocmVsYXRpdmVSZXN1bHQpIHtcblx0XHRyZXR1cm4gcmVsYXRpdmVSZXN1bHQ7XG5cdH1cblx0Ly8gcm9vdCBmYWxsYmFjazogcmVzb2x2ZSBhYnNvbHV0ZSByZWdpc3RyeSBwYXRocyBmcm9tIHRoZVxuXHQvLyBjb2xsZWN0aW9uLCBlLmcuIEFkbWluVHlwZS5sb29rdXAoJ1VzZXJUeXBlLkFkbWluVHlwZScpLFxuXHQvLyB3aGljaCBpcyB3aGF0IHRoZSBUeXBlTG9va3VwPFJlZ2lzdHJ5PiB0eXBlIGNvbnRyYWN0IHByb21pc2VzXG5cdGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb24gYXMgQ29sbGVjdGlvbkRlZjtcblx0Ly8gQ29sbGVjdGlvbkRlZi5sb29rdXAgaXMgdGhlIHJ1bnRpbWUgY29udHJhY3QgKENvbGxlY3Rpb25Mb29rdXApLCBzbyBhXG5cdC8vIHBsYWluIHN0cmluZyBwYXRoIHlpZWxkcyBUeXBlQ2xhc3MgfCB1bmRlZmluZWQgd2l0aCBubyBjYXN0XG5cdGNvbnN0IHJvb3RSZXN1bHQgPSBjb2xsZWN0aW9uLmxvb2t1cChUeXBlTmVzdGVkUGF0aCk7XG5cdHJldHVybiByb290UmVzdWx0O1xufTtcblxuLy8gcHJvdG90eXBlLWxldmVsIGdldHRlciAobm90IGEgcGxhaW4gbWV0aG9kKSBzbyB0aGF0IGJvdGggY2FsbFxuLy8gZm9ybXMga2VlcCB3b3JraW5nOiB0eXBlLmRlY29yYXRlKG9wdGlvbnMpIGFuZCB0aGUgZGVzdHJ1Y3R1cmVkXG4vLyBjb25zdCB7IGRlY29yYXRlIH0gPSB0eXBlIOKAlCB0aGUgZ2V0dGVyIGJpbmRzIHRoZSBjdXJyZW50XG4vLyBkZXNjcmlwdG9yIGF0IGFjY2VzcyB0aW1lLCBzYW1lIGFzIHRoZSBjb2xsZWN0aW9uLWxldmVsIGRlY29yYXRlXG5vZHAoXG5cdFR5cGVEZXNjcmlwdG9yLnByb3RvdHlwZSxcblx0J2RlY29yYXRlJywge1xuXHRcdGdldCAodGhpczogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSkge1xuXHRcdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAob3B0aW9ucz86IG9iamVjdCkge1xuXHRcdFx0XHRjb25zdCBkZWNvcmF0b3IgPSBmdW5jdGlvbiAoY3N0cjogRGVmaW5lTmV3YWJsZSkge1xuXHRcdFx0XHRcdGNvbnN0IHsgbmFtZSB9ID0gY3N0cjtcblx0XHRcdFx0XHQvLyBkZWZpbmUoKSByZXR1cm5zIHRoZSByZWdpc3RlcmVkIGNvbnN0cnVjdG9yIGl0c2VsZiDigJRcblx0XHRcdFx0XHQvLyB0aGUgZnVsbCBUeXBlQ2xhc3MgaXMgYSByaWNoZXIgaG9uZXN0IHR5cGUgdGhhbiBhbnkgY2FzdFxuXHRcdFx0XHRcdGNvbnN0IGRlZmluZVJlc3VsdCA9IHNlbGYuZGVmaW5lKFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdGNzdHIsXG5cdFx0XHRcdFx0XHRvcHRpb25zXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm4gZGVmaW5lUmVzdWx0O1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gZGVjb3JhdG9yO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVEZXNjcmlwdG9yLnByb3RvdHlwZSxcblx0U3ltYm9sLmhhc0luc3RhbmNlLCB7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBnZXRDYWNoZWRUeXBlQ2hlY2tlcih0aGlzLlR5cGVOYW1lKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG4pO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFBBVEggUkVTT0xVVElPTlxuLy8gUmVzb2x2ZXMgYSBkb3Qtc2VwYXJhdGVkIHBhdGggdG8gdGhlIHRhcmdldCB0eXBlcyBtYXAgYW5kXG4vLyB0aGUgZmluYWwgdHlwZSBuYW1lLiBSZWN1cnNlcyBpbnRvIHBhcmVudCBzdWJ0eXBlcyBmb3Jcbi8vIG5lc3RlZCBwYXRocyAoZS5nLiAnUGFyZW50LkNoaWxkJyDihpIgUGFyZW50LnN1YnR5cGVzICsgJ0NoaWxkJykuXG4vLyBSZXR1cm5zIHRoZSBwYXJlbnQgVHlwZUNsYXNzIHdoZW4gdGhlIGhlYWQgc2VnbWVudCByZXNvbHZlc1xuLy8gdG8gYW4gZXhpc3RpbmcgdHlwZSDigJQgbmVlZGVkIGZvciBsYXp5LWdldHRlciBzdWJ0eXBlIGRlZmluaXRpb24uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgcmVzb2x2ZURlZmluaXRpb25Db250ZXh0ID0gZnVuY3Rpb24gKFxuXHRzdWJ0eXBlczogVHlwZXNNYXAsXG5cdHBhdGg6IHN0cmluZ1xuKToge1xuXHRcdHRhcmdldDogVHlwZXNNYXA7XG5cdFx0bmFtZTogc3RyaW5nO1xuXHRcdHBhcmVudD86IFR5cGVDbGFzcztcblx0fSB7XG5cdGNvbnN0IHNwbGl0ID0gZ2V0VHlwZVNwbGl0UGF0aChwYXRoKTtcblx0Y29uc3QgWyBoZWFkLCAuLi5yZXN0IF0gPSBzcGxpdDtcblx0Y29uc3QgcGFyZW50ID0gbG9va3VwLmNhbGwoXG5cdFx0c3VidHlwZXMsXG5cdFx0aGVhZFxuXHQpO1xuXG5cdGlmICghcGFyZW50KSB7XG5cdFx0aWYgKHJlc3QubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTihgcGFyZW50ICR7aGVhZH0gZGVmaW5pdGlvbiBpcyBub3QgeWV0IGV4aXN0cyFgKTtcblx0XHR9XG5cdFx0Y29uc3Qgbm9QYXJlbnRSZXN1bHQgPSB7IHRhcmdldCA6IHN1YnR5cGVzLCBuYW1lIDogaGVhZCB9O1xuXHRcdHJldHVybiBub1BhcmVudFJlc3VsdDtcblx0fVxuXG5cdGlmIChyZXN0Lmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBuZXN0ZWRSZXN1bHQgPSByZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQoXG5cdFx0XHRwYXJlbnQuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRyZXN0LmpvaW4oJy4nKVxuXHRcdCk7XG5cdFx0cmV0dXJuIG5lc3RlZFJlc3VsdDtcblx0fVxuXG5cdGNvbnN0IHJlc29sdmVkUmVzdWx0ID0geyB0YXJnZXQgOiBzdWJ0eXBlcywgbmFtZSA6IGhlYWQsIHBhcmVudCB9O1xuXHRyZXR1cm4gcmVzb2x2ZWRSZXN1bHQ7XG59O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIERVUExJQ0FURSBHVUFSRFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IGNoZWNrRHVwbGljYXRlID0gZnVuY3Rpb24gKHRhcmdldDogVHlwZXNNYXAsIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuXHRjb25zdCBleGlzdGluZyA9IGxvb2t1cC5jYWxsKFxuXHRcdHRhcmdldCxcblx0XHRuYW1lXG5cdCk7XG5cdGlmIChleGlzdGluZykge1xuXHRcdHRocm93IG5ldyBBTFJFQURZX0RFQ0xBUkVEKG5hbWUpO1xuXHR9XG59O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIENPTlNUUlVDVElPTiBTVFJBVEVHSUVTXG4vLyBUd28gYnJhbmNoZXMsIHNhbWUgcmV0dXJuIHR5cGUsIG5vIHJlY3Vyc2lvbi5cbi8vIEJvdGggcmVjZWl2ZSB0aGUgcmVzb2x2ZWQgY29udGV4dCBhbmQgcmV0dXJuIFR5cGVEZXNjcmlwdG9yLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IGNyZWF0ZUZyb21EaXJlY3RIYW5kbGVyID0gZnVuY3Rpb24gKFxuXHRkZWZpbmVPcmlnaW46IFR5cGVBYnNvcmJlcixcblx0dGFyZ2V0OiBUeXBlc01hcCxcblx0bmFtZTogc3RyaW5nLFxuXHRoYW5kbGVyPzogQ29uc3RydWN0SGFuZGxlcixcblx0Y29uZmlnPzogY29uc3RydWN0b3JPcHRpb25zLFxuXHRsYXp5R2V0dGVyPzogTGF6eURlZjxvYmplY3Q+XG4pIHtcblx0Ly8gZm9yIGEgbGF6eSB0eXBlIHRoZSBoYW5kbGVyIHN0YXlzIHRoZSBlbXB0eSBzaGltOiB0aGUgcmVhbCBjb25zdHJ1Y3RvclxuXHQvLyBpcyBnYXRoZXJlZCBmcm9tIHRoZSBjYWxsYmFjayBvbmNlIHBlciBjb25zdHJ1Y3Rpb24gKHNlZVxuXHQvLyBpbnN0YWxsTGF6eURlZmluaXRpb24gYWJvdmUgYW5kIGxhenlEZWZpbml0aW9uLnRzKVxuXHRoYW5kbGVyID0gaGFuZGxlciB8fCBmdW5jdGlvbiAoKSB7IH07XG5cdGNvbnN0IGFzQ2xhc3MgPSBpc0NsYXNzKGhhbmRsZXIpO1xuXHRjb25zdCBtb2RpZmljYXRvckJvZHkgPSBjb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHkobmFtZSk7XG5cblx0Y29uc3QgbWFrZUNvbnN0cnVjdEhhbmRsZXIgPSBtb2RpZmljYXRvckJvZHkoXG5cdFx0aGFuZGxlciBhcyBDb25zdHJ1Y3RIYW5kbGVyLFxuXHRcdENyZWF0aW9uSGFuZGxlcixcblx0XHRTeW1ib2xDb25zdHJ1Y3Rvck5hbWVcblx0KTtcblxuXHRpZiAoY29uZmlnIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRjb25maWcgPSB7XG5cdFx0XHRNb2RpZmljYXRpb25Db25zdHJ1Y3RvciA6IGNvbmZpZyBhcyBNb2RpZmljYXRpb25Db25zdHJ1Y3RvckZhY3Rvcnlcblx0XHR9O1xuXHR9XG5cblx0Y29uZmlnIS5hc0NsYXNzID0gYXNDbGFzcztcblxuXHRjb25zdCBwcm90byA9IChcblx0XHRob3AoXG5cdFx0XHRoYW5kbGVyLFxuXHRcdFx0J3Byb3RvdHlwZSdcblx0XHQpICYmXG5cdFx0KHR5cGVvZiBoYW5kbGVyLnByb3RvdHlwZSA9PT0gJ29iamVjdCcpXG5cdCkgPyBoYW5kbGVyLnByb3RvdHlwZSA6IGdldERlZmF1bHRQcm90b3R5cGUoKTtcblxuXHQvLyByZWplY3QgdGhlIHVuc3VwcG9ydGVkIGhhbmRsZXIgc2hhcGVzIChnZW5lcmF0b3JzLCBzeW5jIGFycm93cyxcblx0Ly8gc2hvcnRoYW5kIG1ldGhvZHMsIGJvdW5kIGZ1bmN0aW9ucykgQkVGT1JFIHRoZSB0eXBlIGlzIGNyZWF0ZWQsIHNvXG5cdC8vIGEgcmVqZWN0ZWQgZGVmaW5lIGxlYXZlcyBub3RoaW5nIHJlZ2lzdGVyZWQuIFNraXBwZWQgd2hlbiB0aGUgbmFtZVxuXHQvLyBpcyB0YWtlbjogdGhlIFR5cGVEZXNjcmlwdG9yIGJlbG93IHRocm93cyB0aGUgY2Fub25pY2FsXG5cdC8vIEFMUkVBRFlfREVDTEFSRUQsIHdoaWNoIHdpbnMgb3ZlciB0aGUgc2hhcGUgZXJyb3Jcblx0aWYgKCAhdGFyZ2V0LmhhcyggbmFtZSApICkge1xuXHRcdGNsYXNzaWZ5Q29uc3RydWN0SGFuZGxlcihcblx0XHRcdG5hbWUsXG5cdFx0XHRoYW5kbGVyXG5cdFx0KTtcblx0fVxuXG5cdGNvbnN0IHJlc3VsdCA9IG5ldyBUeXBlRGVzY3JpcHRvcihcblx0XHRkZWZpbmVPcmlnaW4sXG5cdFx0dGFyZ2V0LFxuXHRcdG5hbWUsXG5cdFx0bWFrZUNvbnN0cnVjdEhhbmRsZXIsXG5cdFx0cHJvdG8sXG5cdFx0Y29uZmlnLFxuXHRcdGxhenlHZXR0ZXJcblx0XHQvLyBuZXcgVHlwZURlc2NyaXB0b3IoKSByZXR1cm5zIHRoZSBUeXBlUHJveHkgaXQgcmVnaXN0ZXJzIGluIHRoZVxuXHRcdC8vIHN1YnR5cGVzIG1hcCDigJQgYSBQcm94eSBtYXRlcmlhbGl6aW5nIHRoZSBUeXBlQ2xhc3Mgc3VyZmFjZVxuXHRcdC8vIGR5bmFtaWNhbGx5IOKAlCBzbyB0aGUgcHVibGljIGNvbnN0cnVjdG9yIGNvbnRyYWN0IGlzIG5hbWVkIGhlcmVcblx0XHQvLyBUaGUgZGVjbGFyZWQgZGVzY3JpcHRvciByZXN1bHQgYW5kIGR5bmFtaWMgcHJveHkgc3VyZmFjZSBkaWZmZXI7XG5cdFx0Ly8gY2hhbmdpbmcgdGhlIHByb2R1Y2luZyBzaWduYXR1cmUgYnJlYWtzIGRlc2NyaXB0b3IgcHJvdG90eXBlIG1ldGhvZHMuXG5cdCkgYXMgdW5rbm93biBhcyBUeXBlQ2xhc3M7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyAubGF6eSgpIGlzIGEgcmVndWxhciBkZWZpbmUgd2hvc2UgaGFuZGxlciBpcyB0aGUgZW1wdHkgc2hpbTsgdGhlIHJlYWxcbi8vIGNvbnN0cnVjdG9yIGlzIGdhdGhlcmVkIGZyb20gdGhlIGNhbGxiYWNrIG9uY2UgcGVyIGNvbnN0cnVjdGlvbiDigJQgc2VlXG4vLyBpbnN0YWxsTGF6eURlZmluaXRpb24gYWJvdmUgYW5kIGxhenlEZWZpbml0aW9uLnRzLiBOT1RISU5HIGlzIGRlcml2ZWRcbi8vIGZyb20gdGhlIGNhbGxiYWNrIGhlcmU6IGl0IGlzIG5ldmVyIGNhbGxlZCBhdCBkZWZpbmUgdGltZSwgc28gZm9yd2FyZFxuLy8gcmVmZXJlbmNlcyBhbmQgY2lyY3VsYXIgaW1wb3J0cyB3b3JrIOKAlCB0aGUgY2FsbGJhY2sncyB0YXJnZXQgb25seSBoYXMgdG9cbi8vIGV4aXN0IGJ5IHRoZSBmaXJzdCBgbmV3YFxuY29uc3QgY3JlYXRlRnJvbUxhenlEZWZpbml0aW9uID0gZnVuY3Rpb24gKFxuXHRkZWZpbmVPcmlnaW46IFR5cGVBYnNvcmJlcixcblx0dGFyZ2V0OiBUeXBlc01hcCxcblx0bmFtZTogc3RyaW5nLFxuXHRnZXR0ZXI6IExhenlEZWY8b2JqZWN0Pixcblx0Y29uZmlnOiBjb25zdHJ1Y3Rvck9wdGlvbnNcbikge1xuXG5cdGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUZyb21EaXJlY3RIYW5kbGVyKFxuXHRcdGRlZmluZU9yaWdpbixcblx0XHR0YXJnZXQsXG5cdFx0bmFtZSxcblx0XHR1bmRlZmluZWQsXG5cdFx0Y29uZmlnLFxuXHRcdGdldHRlclxuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBNQUlOIERJU1BBVENIRVJcbi8vIEFsbCBicmFuY2hlcyBmdW5uZWwgaGVyZS4gUmVjdXJzaW9uIGlzIGlzb2xhdGVkIHRvIHBhdGhcbi8vIHJlc29sdXRpb24gKHJlc29sdmVEZWZpbml0aW9uQ29udGV4dCkgYW5kIHRoZSBzaW5nbGUgY2FzZVxuLy8gb2YgYSBuYW1lZCBmdW5jdGlvbiBwYXNzZWQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBkZWZpbmUgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IHVua25vd24sXG5cdHN1YnR5cGVzOiBUeXBlc01hcCxcblx0VHlwZU9yVHlwZU5hbWU6IHN0cmluZyB8IERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWc/OiBEZWZpbmVOZXdhYmxlT3JDYWxsYWJsZSB8IG9iamVjdCxcblx0Y29uZmlnPzogb2JqZWN0XG4pOiBUeXBlQ2xhc3Mge1xuXG5cdGlmICghY29uZmlnIHx8ICh0eXBlb2YgY29uZmlnICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgY29uZmlnICE9PSAnZnVuY3Rpb24nKSkge1xuXHRcdGNvbmZpZyA9IHt9O1xuXHR9XG5cblx0Ly8gLS0tIEJyYW5jaDogZnVuY3Rpb24gcGFzc2VkIGFzIGZpcnN0IGFyZyAtLS1cblx0aWYgKHR5cGVvZiBUeXBlT3JUeXBlTmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGNvbnN0IGZuID0gVHlwZU9yVHlwZU5hbWU7XG5cdFx0aWYgKGZuLm5hbWUpIHtcblx0XHRcdGNoZWNrRHVwbGljYXRlKFxuXHRcdFx0XHRzdWJ0eXBlcyxcblx0XHRcdFx0Zm4ubmFtZVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGRlZmluZVJlc3VsdCA9IGRlZmluZS5jYWxsKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRzdWJ0eXBlcyxcblx0XHRcdFx0Zm4ubmFtZSxcblx0XHRcdFx0Zm4sXG5cdFx0XHRcdGNvbmZpZ1xuXHRcdFx0KTtcblx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0fVxuXHRcdC8vIEFub255bW91cyBmdW5jdGlvbiBhcyBmaXJzdCBhcmcgaXMgbm90IGEgdmFsaWQgLmRlZmluZSgpIGZvcm0uXG5cdFx0Ly8gVXNlIC5sYXp5KCgpID0+IENvbnN0cnVjdG9yLCBjb25maWc/KSBmb3IgbGF6eSBnZXR0ZXJzIGluc3RlYWQuXG5cdFx0dGhyb3cgbmV3IFRZUEVOQU1FX01VU1RfQkVfQV9TVFJJTkc7XG5cdH1cblxuXHQvLyAtLS0gQnJhbmNoOiBzdHJpbmcgcGF0aCBwYXNzZWQgYXMgZmlyc3QgYXJnIC0tLVxuXHRpZiAodHlwZW9mIFR5cGVPclR5cGVOYW1lICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBXUk9OR19UWVBFX0RFRklOSVRJT04oJ2RlZmluaXRpb24gaXMgbm90IHByb3ZpZGVkJyk7XG5cdH1cblx0Y2hlY2tUeXBlTmFtZShUeXBlT3JUeXBlTmFtZSk7XG5cblx0bGV0IGhhbmRsZXI6IENvbnN0cnVjdEhhbmRsZXIgfCB1bmRlZmluZWQ7XG5cdGlmICh0eXBlb2YgY29uc3RydWN0SGFuZGxlck9yQ29uZmlnID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0aGFuZGxlciA9IGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyBhcyBDb25zdHJ1Y3RIYW5kbGVyO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcgPT09ICdvYmplY3QnKSB7XG5cdFx0Y29uZmlnID0gY29uc3RydWN0SGFuZGxlck9yQ29uZmlnIGFzIGNvbnN0cnVjdG9yT3B0aW9ucztcblx0fVxuXG5cdGNvbnN0IHtcblx0XHR0YXJnZXQsIG5hbWUsIHBhcmVudFxuXHR9ID0gcmVzb2x2ZURlZmluaXRpb25Db250ZXh0KFxuXHRcdHN1YnR5cGVzLFxuXHRcdFR5cGVPclR5cGVOYW1lXG5cdCk7XG5cblx0Ly8gRXhpc3RpbmcgdHlwZSB3aXRoIG5vIGhhbmRsZXI6IGVycm9yIChtYXRjaGVzIG9yaWdpbmFsIGZhbGx0aHJvdWdoKVxuXHRpZiAocGFyZW50ICYmICFoYW5kbGVyKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignZGVmaW5pdGlvbiBpcyBub3QgcHJvdmlkZWQnKTtcblx0fVxuXG5cdGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUZyb21EaXJlY3RIYW5kbGVyKFxuXHRcdHRoaXMgYXMgVHlwZUFic29yYmVyLFxuXHRcdHRhcmdldCxcblx0XHRuYW1lLFxuXHRcdGhhbmRsZXIsXG5cdFx0Y29uZmlnIGFzIGNvbnN0cnVjdG9yT3B0aW9uc1xuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGNvbnN0IGxhenkgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IHVua25vd24sXG5cdHN1YnR5cGVzOiBUeXBlc01hcCxcblx0VHlwZU5hbWU6IHN0cmluZyxcblx0Z2V0dGVyPzogTGF6eURlZjxvYmplY3Q+LFxuXHRjb25maWc/OiBvYmplY3Rcbik6IFR5cGVDbGFzcyB7XG5cblx0Ly8gdGhlIHVubmFtZWQgbGF6eSgoKSA9PiBDb25zdHJ1Y3RvcikgZm9ybSBpcyBkcm9wcGVkOiB0aGUgY2FsbGJhY2sgaXNcblx0Ly8gbmV2ZXIgY2FsbGVkIGF0IGRlZmluZSB0aW1lLCBzbyB0aGVyZSBpcyBub3RoaW5nIHRvIGRlcml2ZSB0aGUgbmFtZVxuXHQvLyBmcm9tIOKAlCB0aGUgbmFtZSBtdXN0IGNvbWUgaW4gZXhwbGljaXRseVxuXHRpZiAodHlwZW9mIFR5cGVOYW1lICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUWVBFTkFNRV9NVVNUX0JFX0FfU1RSSU5HO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBnZXR0ZXIgIT09ICdmdW5jdGlvbicpIHtcblx0XHR0aHJvdyBuZXcgSEFORExFUl9NVVNUX0JFX0FfRlVOQ1RJT047XG5cdH1cblxuXHQvLyB0aGUgY2FsbGJhY2sgcnVucyBwZXIgY29uc3RydWN0aW9uIGFuZCBtdXN0IGRlbGl2ZXIgdGhlIGNvbnN0cnVjdG9yXG5cdC8vIHN5bmNocm9ub3VzbHk6IGFuIGFzeW5jIG9yIGdlbmVyYXRvciBjYWxsYmFjayB3b3VsZCBwcm9kdWNlIGFcblx0Ly8gUHJvbWlzZSAvIGl0ZXJhdG9yIGluc3RlYWRcblx0Y29uc3QgY2FsbGJhY2tLaW5kID0gZ2V0dGVyLmNvbnN0cnVjdG9yLm5hbWU7XG5cdGlmIChcblx0XHRjYWxsYmFja0tpbmQgPT09ICdBc3luY0Z1bmN0aW9uJyB8fFxuXHRcdGNhbGxiYWNrS2luZCA9PT0gJ0dlbmVyYXRvckZ1bmN0aW9uJyB8fFxuXHRcdGNhbGxiYWNrS2luZCA9PT0gJ0FzeW5jR2VuZXJhdG9yRnVuY3Rpb24nXG5cdCkge1xuXHRcdGNvbnN0IG1zZyA9IGAke1R5cGVOYW1lfTogbGF6eSBjYWxsYmFjayBtdXN0IGJlIGEgc3luYyBmdW5jdGlvbiBgICtcblx0XHRcdCcoYXN5bmMgYW5kIGdlbmVyYXRvciBjYWxsYmFja3MgYXJlIG5vdCBzdXBwb3J0ZWQpJztcblx0XHR0aHJvdyBuZXcgV1JPTkdfTU9ESUZJQ0FUSU9OX1BBVFRFUk4oIG1zZyApO1xuXHR9XG5cblx0aWYgKCFjb25maWcgfHwgKHR5cGVvZiBjb25maWcgIT09ICdvYmplY3QnICYmIHR5cGVvZiBjb25maWcgIT09ICdmdW5jdGlvbicpKSB7XG5cdFx0Y29uZmlnID0ge307XG5cdH1cblxuXHQvLyB0aGUgc2FtZSBkb3R0ZWQtcGF0aCByZXNvbHV0aW9uIGFzIGRlZmluZSdzIHN0cmluZyBicmFuY2g6XG5cdC8vIGxhenkoJ1BhcmVudC5DaGlsZCcsIC4uLikgbGFuZHMgdW5kZXIgUGFyZW50LCBhbmQgYSB0YWtlbiBuYW1lIGZhaWxzXG5cdC8vIHdpdGggdGhlIGRlc2NyaXB0b3IncyBBTFJFQURZX0RFQ0xBUkVELCBleGFjdGx5IGxpa2UgZGVmaW5lXG5cdGNoZWNrVHlwZU5hbWUoVHlwZU5hbWUpO1xuXG5cdGNvbnN0IHsgdGFyZ2V0LCBuYW1lIH0gPSByZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQoXG5cdFx0c3VidHlwZXMsXG5cdFx0VHlwZU5hbWVcblx0KTtcblxuXHRjb25zdCBsYXp5UmVzdWx0ID0gY3JlYXRlRnJvbUxhenlEZWZpbml0aW9uKFxuXHRcdHRoaXMgYXMgVHlwZUFic29yYmVyLFxuXHRcdHRhcmdldCxcblx0XHRuYW1lLFxuXHRcdGdldHRlcixcblx0XHRjb25maWcgYXMgY29uc3RydWN0b3JPcHRpb25zXG5cdCk7XG5cdHJldHVybiBsYXp5UmVzdWx0O1xufTtcblxuZXhwb3J0IGNvbnN0IGxvb2t1cCA9IGZ1bmN0aW9uIChcblx0dGhpczogVHlwZXNNYXAsXG5cdFR5cGVOZXN0ZWRQYXRoOiBzdHJpbmdcbik6IFR5cGVDbGFzcyB8IHVuZGVmaW5lZCB7XG5cblx0aWYgKHR5cGVvZiBUeXBlTmVzdGVkUGF0aCAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdhcmcgOiB0eXBlIG5lc3RlZCBwYXRoIG11c3QgYmUgYSBzdHJpbmcnKTtcblx0fVxuXG5cdGlmICghVHlwZU5lc3RlZFBhdGgubGVuZ3RoKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignYXJnIDogdHlwZSBuZXN0ZWQgcGF0aCBoYXMgbm8gcGF0aCcpO1xuXHR9XG5cblx0Y29uc3Qgc3BsaXQgPSBnZXRUeXBlU3BsaXRQYXRoKFR5cGVOZXN0ZWRQYXRoKTtcblxuXHRjb25zdCBbIG5hbWUgXSA9IHNwbGl0O1xuXHRjb25zdCB0eXBlID0gdGhpcy5nZXQobmFtZSkgYXMgVHlwZUNsYXNzIHwgdW5kZWZpbmVkO1xuXHRpZiAoc3BsaXQubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIHR5cGU7XG5cdH1cblxuXHRjb25zdCBOZXh0TmVzdGVkUGF0aCA9IHNwbGl0LnNsaWNlKDEpLmpvaW4oJy4nKTtcblx0aWYgKCF0eXBlKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHQvLyBhIHR5cGUncyBzdWJ0eXBlcyBtYXAgSVMgdGhlIHJ1bnRpbWUgVHlwZXNNYXAgKFN5bWJvbFBhcmVudFR5cGUgYW5kXG5cdC8vIE1ORU1PU1lORSBhcmUgaW5zdGFsbGVkIGF0IGRlZmluaXRpb24gdGltZSksIHNvIHRoZSBzaW5nbGUgY2FzdCBvbmx5XG5cdC8vIG5hbWVzIHRoYXQgdmlld1xuXHRjb25zdCByZXN1bHQgPSBsb29rdXAuY2FsbChcblx0XHR0eXBlLnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdE5leHROZXN0ZWRQYXRoXG5cdCk7XG5cdHJldHVybiByZXN1bHQ7XG5cbn07XG5cblxuXG4iXX0=