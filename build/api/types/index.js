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
const makeOwnConfig = function (config) {
    if (typeof config === 'boolean') {
        const strictChainResult = { strictChain: config };
        return strictChainResult;
    }
    if (typeof config === 'function') {
        const modificatorResult = {
            ModificationConstructor: config
        };
        return modificatorResult;
    }
    const result = typeof config === 'object' && config !== null ? config : {};
    return result;
};
const createFromDirectHandler = function (defineOrigin, target, name, handler, config, lazyGetter) {
    handler = handler || function () { };
    const asClass = isClass(handler);
    const modificatorBody = (0, compileNewModificatorFunctionBody_1.default)(name);
    const makeConstructHandler = modificatorBody(handler, utils_1.CreationHandler, SymbolConstructorName);
    const typeConfig = Object.assign({}, makeOwnConfig(config), { asClass });
    const proto = ((0, hop_1.hop)(handler, 'prototype') &&
        (typeof handler.prototype === 'object')) ? handler.prototype : getDefaultPrototype();
    if (!target.has(name)) {
        (0, compileNewModificatorFunctionBody_1.classifyConstructHandler)(name, handler);
    }
    const result = new TypeDescriptor(defineOrigin, target, name, makeConstructHandler, proto, typeConfig, lazyGetter);
    return result;
};
const createFromLazyDefinition = function (defineOrigin, target, name, getter, config) {
    const result = createFromDirectHandler(defineOrigin, target, name, undefined, config, getter);
    return result;
};
const define = function (subtypes, TypeOrTypeName, constructHandlerOrConfig, config) {
    if (typeof TypeOrTypeName === 'function') {
        const fn = TypeOrTypeName;
        if (fn.name) {
            checkDuplicate(subtypes, fn.name);
            const defineResult = exports.define.call(this, subtypes, fn.name, fn, constructHandlerOrConfig);
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
    else if (typeof constructHandlerOrConfig === 'object' || typeof constructHandlerOrConfig === 'boolean') {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3R5cGVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0NiLHlDQUFzQztBQUV0QywrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLFlBQVksRUFFWixpQkFBaUIsRUFDakIsU0FBUyxHQUVULEdBQUcscUJBQVMsQ0FBQztBQUVkLHFEQUF1RDtBQUd2RCw0REFBcUM7QUFDckMsTUFBTSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsbUJBQVUsQ0FBQztBQUUzQyxNQUFNLEVBQ0wsZ0JBQWdCLEVBQ2hCLHFCQUFxQixFQUNyQiwwQkFBMEIsRUFDMUIseUJBQXlCLEVBQ3pCLDBCQUEwQixFQUMxQixhQUFhLEdBQ2IsR0FBRyxvQkFBVyxDQUFDO0FBS2hCLG1EQUFxQztBQUNyQywyQ0FBd0M7QUFFeEMseUdBSTZDO0FBRTdDLHFEQUcwQjtBQUUxQixrREFBdUQ7QUFDdkQsTUFBTSxFQUNMLG9CQUFvQixFQUNwQixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLE9BQU8sR0FDUCxHQUFHLGVBQVUsQ0FBQztBQUVmLHNDQUdtQjtBQWFuQixNQUFNLHFCQUFxQixHQUFHLFVBQzdCLElBQTRCLEVBQzVCLFFBQWdCLEVBQ2hCLG9CQUFpRCxFQUNqRCxTQUF1QyxFQUN2QyxZQUEwQyxFQUMxQyxNQUF1QjtJQUt2QixNQUFNLElBQUksR0FBdUI7UUFDaEMsT0FBTyxFQUFHLFNBQVM7UUFDbkIsT0FBTyxFQUFHLEtBQUs7UUFDZixLQUFLLEVBQUssU0FBUztRQUNuQixNQUFNLEVBQUksS0FBSztRQUNmLEtBQUssRUFBSyxTQUFTO0tBQ25CLENBQUM7SUFJRixNQUFNLEtBQUssR0FBRztRQUNiLElBQUksQ0FBQyxPQUFPLEdB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QUNGLE9BQU8sTUFBTSxDQUFDO0FBRWYsQ0FBQyxDQUFDO0FBbENXLFFBQUEsTUFBTSxVQWtDakIiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29uc3RydWN0aW9uIFBpcGVsaW5lIChoaWdoLWxldmVsIGZsb3cpOlxuICpcbiAqICAgZGVmaW5lKFR5cGVOYW1lLCBjdG9yKSAg4oaSICBuZXcgVHlwZURlc2NyaXB0b3IoKSAg4oaSICBuZXcgVHlwZVByb3h5KClcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUglxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pa8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEluc3RhbmNlQ3JlYXRvcih0eXBlLCBwYXJlbnQsIGFyZ3MpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ha2VJbnN0YW5jZU1vZGlmaWNhdG9yKHNlbGYpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGlmaWNhdGlvbkNvbnN0cnVjdG9yLmNhbGwocGFyZW50LCBNb2RpZmljYXRvclR5cGUsIHByb3RvLCBfYWRkUHJvcHMpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIgY29uc3RydWN0b3IgcnVucyAobmV3IE1vZGlmaWNhdG9yVHlwZSguLi5hcmdzKSlcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUglxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pa8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFByb2Nlc3NpbmcoKSDihpIgaW52b2tlUG9zdEhvb2tzKClcbiAqL1xuXG5pbXBvcnQge1xuXHRUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRUeXBlQ2xhc3MsXG5cdFR5cGVEZWYsXG5cdENvbGxlY3Rpb25EZWYsXG5cdGNvbnN0cnVjdG9yT3B0aW9ucyxcblx0VHlwZUNvbmZpZyxcblx0VHlwZUFic29yYmVyLFxuXHRNb2RpZmljYXRpb25Db25zdHJ1Y3RvckZhY3RvcnksXG5cdE1uZW1vbmljYUNvbnN0cnVjdG9yRmFjdG9yeSxcblx0RGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUsXG5cdERlZmluZU5ld2FibGUsXG5cdExhenlEZWYsXG59IGZyb20gJy4uLy4uL3R5cGVzJztcblxuaW1wb3J0IHsgaG9wIH0gZnJvbSAnLi4vLi4vdXRpbHMvaG9wJztcblxuaW1wb3J0IHsgY29uc3RhbnRzIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcbmNvbnN0IHtcblx0b2RwLFxuXHRTeW1ib2xQYXJlbnRUeXBlLFxuXHRTeW1ib2xDb25zdHJ1Y3Rvck5hbWUsXG5cdFN5bWJvbENvbmZpZyxcblxuXHRUWVBFX1RJVExFX1BSRUZJWCxcblx0TU5FTU9TWU5FLFxuXG59ID0gY29uc3RhbnRzO1xuXG5pbXBvcnQgeyBFcnJvcnNUeXBlcyB9IGZyb20gJy4uLy4uL2Rlc2NyaXB0b3JzL2Vycm9ycyc7XG4vLyBpbXBvcnQgeyBkZXNjcmlwdG9ycyB9IGZyb20gJy4uLy4uL2Rlc2NyaXB0b3JzJztcblxuaW1wb3J0IG1uZW1vc3luZXMgZnJvbSAnLi9NbmVtb3N5bmUnO1xuY29uc3QgeyBnZXREZWZhdWx0UHJvdG90eXBlIH0gPSBtbmVtb3N5bmVzO1xuXG5jb25zdCB7XG5cdEFMUkVBRFlfREVDTEFSRUQsXG5cdFdST05HX1RZUEVfREVGSU5JVElPTixcblx0V1JPTkdfTU9ESUZJQ0FUSU9OX1BBVFRFUk4sXG5cdFRZUEVOQU1FX01VU1RfQkVfQV9TVFJJTkcsXG5cdEhBTkRMRVJfTVVTVF9CRV9BX0ZVTkNUSU9OLFxuXHRPUFRJT05TX0VSUk9SLFxufSA9IEVycm9yc1R5cGVzO1xuXG4vLyBpbnZva2VIb29rXG4vLyByZWdpc3Rlckhvb2tcbi8vIHJlZ2lzdGVyRmxvd0NoZWNrZXJcbmltcG9ydCAqIGFzIGhvb2tzQXBpIGZyb20gJy4uL2hvb2tzJztcbmltcG9ydCB7IFR5cGVQcm94eSB9IGZyb20gJy4vVHlwZVByb3h5JztcblxuaW1wb3J0IGNvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keSwge1xuXHRjbGFzc2lmeUNvbnN0cnVjdEhhbmRsZXIsXG5cdGlzQ2FsbGFibGVDYW5kaWRhdGUsXG5cdENvbnN0cnVjdEhhbmRsZXJcbn0gZnJvbSAnLi9jb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHknO1xuXG5pbXBvcnQge1xuXHRzZXRMYXp5RGVmaW5pdGlvbixcblx0TGF6eURlZmluaXRpb25DZWxsLFxufSBmcm9tICcuL2xhenlEZWZpbml0aW9uJztcblxuaW1wb3J0IFR5cGVzVXRpbHMsIHsgQ3JlYXRpb25IYW5kbGVyIH0gZnJvbSAnLi4vdXRpbHMnO1xuY29uc3Qge1xuXHRnZXRDYWNoZWRUeXBlQ2hlY2tlcixcblx0Z2V0VHlwZVNwbGl0UGF0aCxcblx0Y2hlY2tUeXBlTmFtZSxcblx0aXNDbGFzcyxcbn0gPSBUeXBlc1V0aWxzO1xuXG5pbXBvcnQge1xuXHRnZXRTdGFjayxcblx0U3RhY2thYmxlSW5zdGFuY2UsXG59IGZyb20gJy4uL2Vycm9ycyc7XG5cbmV4cG9ydCB0eXBlIFR5cGVzTWFwID0gTWFwPHN0cmluZywgb2JqZWN0PiAmIHtcblx0W1N5bWJvbFBhcmVudFR5cGVdPzogVHlwZURlZjtcblx0W01ORU1PU1lORV0/OiBDb2xsZWN0aW9uRGVmO1xufTtcblxuLy8gTGF6eSB0eXBlIGZhY2FkZXMuXG4vLyBBIGxhenkgdHlwZSBpcyBhIHJlZ3VsYXIgZGVmaW5lIHdob3NlIGhhbmRsZXIgaXMgdGhlIGVtcHR5IHNoaW07IHRoZSByZWFsXG4vLyBjb25zdHJ1Y3RvciBpcyBnYXRoZXJlZCBmcm9tIHRoZSBjYWxsYmFjayBvbmNlIHBlciBjb25zdHJ1Y3Rpb24gKHNlZVxuLy8gbGF6eURlZmluaXRpb24udHMpLiBUaGUgdHlwZSdzIHByb3RvIC8gY29uZmlnIC8gY29uc3RydWN0SGFuZGxlciByZWFkIHRoZVxuLy8gZ2F0aGVyIGNlbGwsIHNvIHRoZSBzYW1lIHR5cGUgb2JqZWN0IHNlcnZlcyBldmVyeSBjb25zdHJ1Y3Rpb24gd2l0aG91dFxuLy8gZXZlciBjYWxsaW5nIHRoZSBjYWxsYmFjayBhdCBkZWZpbmUgdGltZS5cbmNvbnN0IGluc3RhbGxMYXp5RGVmaW5pdGlvbiA9IGZ1bmN0aW9uIChcblx0dHlwZTogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0VHlwZU5hbWU6IHN0cmluZyxcblx0c2hpbUNvbnN0cnVjdEhhbmRsZXI6IE1uZW1vbmljYUNvbnN0cnVjdG9yRmFjdG9yeSxcblx0c2hpbVByb3RvOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRtZXJnZWRDb25maWc6IHsgW2luZGV4OiBzdHJpbmddOiB1bmtub3duIH0sXG5cdGdldHRlcjogTGF6eURlZjxvYmplY3Q+XG4pIHtcblxuXHQvLyBvdXRzaWRlIGFueSBjb25zdHJ1Y3Rpb24gdGhlIGNlbGwgaG9sZHMgdGhlIGRlZmluZS10aW1lIGZhbGxiYWNrOlxuXHQvLyBubyBoYW5kbGVyLCB0aGUgc2hpbSdzIGVtcHR5IHByb3RvdHlwZSwgYXNDbGFzcyBvZmYsIG5vIGZhaWx1cmVcblx0Y29uc3QgY2VsbDogTGF6eURlZmluaXRpb25DZWxsID0ge1xuXHRcdGhhbmRsZXIgOiB1bmRlZmluZWQsXG5cdFx0YXNDbGFzcyA6IGZhbHNlLFxuXHRcdHByb3RvICAgOiBzaGltUHJvdG8sXG5cdFx0ZmFpbGVkICA6IGZhbHNlLFxuXHRcdGVycm9yICAgOiB1bmRlZmluZWRcblx0fTtcblxuXHQvLyBiYWNrIHRvIHRoZSBkZWZpbmUtdGltZSBzdGF0ZTogbm8gaGFuZGxlciByZXRhaW5lZCwgdGhlIHNoaW0ncyBlbXB0eVxuXHQvLyBwcm90b3R5cGUsIGFzQ2xhc3Mgb2ZmLCBubyBlcnJvclxuXHRjb25zdCByZXNldCA9IGZ1bmN0aW9uICgpIHtcblx0XHRjZWxsLmhhbmRsZXIgPSB1bmRlZmluZWQ7XG5cdFx0Y2VsbC5hc0NsYXNzID0gZmFsc2U7XG5cdFx0Y2VsbC5wcm90byA9IHNoaW1Qcm90bztcblx0XHRjZWxsLmZhaWxlZCA9IGZhbHNlO1xuXHRcdGNlbGwuZXJyb3IgPSB1bmRlZmluZWQ7XG5cdH07XG5cblx0Ly8gdGhlIHNpbmdsZSBjYWxsYmFjayBjYWxsIHBlciBjb25zdHJ1Y3Rpb24g4oCUIGludm9rZWQgT05MWSBieVxuXHQvLyBnYXRoZXJMYXp5RGVmaW5pdGlvbiBhdCB0aGUgY29uc3RydWN0aW9uIGVudHJpZXNcblx0Y29uc3QgZ2F0aGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdHJlc2V0KCk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGdhdGhlcmVkID0gZ2V0dGVyKCk7XG5cdFx0XHRpZiAoIWlzQ2FsbGFibGVDYW5kaWRhdGUoZ2F0aGVyZWQpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBIQU5ETEVSX01VU1RfQkVfQV9GVU5DVElPTjtcblx0XHRcdH1cblx0XHRcdC8vIHRoZSBzaGFwZSBjaGVja3MgYXJlIHdoYXQgbWFrZSBpdCBhIENvbnN0cnVjdEhhbmRsZXJcblx0XHRcdGNsYXNzaWZ5Q29uc3RydWN0SGFuZGxlcihcblx0XHRcdFx0VHlwZU5hbWUsXG5cdFx0XHRcdGdhdGhlcmVkXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgaGFuZGxlciA9IGdhdGhlcmVkO1xuXHRcdFx0Y2VsbC5oYW5kbGVyID0gaGFuZGxlcjtcblx0XHRcdGNlbGwuYXNDbGFzcyA9IGlzQ2xhc3MoaGFuZGxlcik7XG5cdFx0XHQvLyBzYW1lIGZhbGxiYWNrIGFzIHRoZSBkaXJlY3QgcGF0aDogYW4gb3duIE5PTi1PQkpFQ1QgcHJvdG90eXBlXG5cdFx0XHQvLyAocHJvdG90eXBlID0gMTIzKSBpcyByZXBsYWNlZCBieSB0aGUgZGVmYXVsdFxuXHRcdFx0Y2VsbC5wcm90byA9IChcblx0XHRcdFx0aG9wKFxuXHRcdFx0XHRcdGhhbmRsZXIsXG5cdFx0XHRcdFx0J3Byb3RvdHlwZSdcblx0XHRcdFx0KSAmJlxuXHRcdFx0XHQodHlwZW9mIGhhbmRsZXIucHJvdG90eXBlID09PSAnb2JqZWN0Jylcblx0XHRcdCkgPyBoYW5kbGVyLnByb3RvdHlwZSA6IGdldERlZmF1bHRQcm90b3R5cGUoKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0Ly8gcGFzc3Rocm91Z2gsIGV4YWN0bHkgbGlrZSBydW5CdWlsZCdzIGNhdGNoOiB3aGF0ZXZlciB0aGVcblx0XHRcdC8vIGNhbGxiYWNrIHRocmV3IHJlYWNoZXMgdGhyb3dNb2RpZmljYXRpb25FcnJvciBhcy1pcyAoYSB0aHJvd25cblx0XHRcdC8vIG5vbi1FcnJvciBicmVha3MgdGhlIHByb3RvdHlwZSBzcGxpY2UgdGhlcmUgdGhlIHNhbWUgd2F5IGl0XG5cdFx0XHQvLyBkb2VzIGZvciBhIGNvbnN0cnVjdG9yIGJvZHkpLiBUaGUgZmxhZyBpcyBzZXBhcmF0ZSBmcm9tIHRoZVxuXHRcdFx0Ly8gdmFsdWU6IGEgY2FsbGJhY2sgbWF5IHRocm93IHVuZGVmaW5lZFxuXHRcdFx0Y2VsbC5mYWlsZWQgPSB0cnVlO1xuXHRcdFx0Y2VsbC5lcnJvciA9IGVycm9yO1xuXHRcdH1cblx0fTtcblxuXHQvLyBrZXllZCBieSB0aGUgdHlwZSBkZXNjcmlwdG9yIGhlcmU7IFR5cGVQcm94eSByZWdpc3RlcnMgaXRzIHByb3h5XG5cdC8vIGFnYWluc3QgdGhlIHNhbWUgZGVmaW5pdGlvbiB3aGVuIGl0IHdyYXBzIHRoaXMgdHlwZVxuXHRzZXRMYXp5RGVmaW5pdGlvbihcblx0XHR0eXBlLFxuXHRcdHtcblx0XHRcdGNlbGwsXG5cdFx0XHQvLyB0aGUgbWVyZ2VkIGNvbmZpZyB2YWx1ZSBhdCBkZWZpbmUgdGltZSDigJQgdGhlIGNhbGxiYWNrIG11c3Rcblx0XHRcdC8vIG5vdCBydW4gd2hlbiB0aGUgY29uc3RydWN0aW9uIHdpbGwgYmUgYmxvY2tlZFxuXHRcdFx0YmxvY2tFcnJvcnMgOiBtZXJnZWRDb25maWcuYmxvY2tFcnJvcnMgIT09IGZhbHNlLFxuXHRcdFx0Z2F0aGVyLFxuXHRcdFx0cmVzZXRcblx0XHR9XG5cdCk7XG5cblx0Ly8gemVyby1hcmcgZmFjdG9yeSwgdGhlIHNhbWUgY29udHJhY3QgYXMgYSBkaXJlY3QgdHlwZSdzXG5cdC8vIGNvbnN0cnVjdEhhbmRsZXI6IGJ1aWxkcyB0aGUgd3JhcHBlciBmcm9tIHRoZSBnYXRoZXJlZCBoYW5kbGVyLFxuXHQvLyByZWJ1aWx0IG9uIGV2ZXJ5IGNvbnN0cnVjdGlvbiAodGhlIGNhbGxiYWNrIG1heSByZXR1cm4gYSBuZXcgZnVuY3Rpb25cblx0Ly8gZWFjaCB0aW1lKTsgYmVmb3JlIHRoZSBnYXRoZXIg4oCUIGFuZCBhZnRlciBhIGZhaWxlZCBvbmUg4oCUIGl0IGJ1aWxkc1xuXHQvLyB0aGUgc2hpbSdzIHdyYXBwZXIsIHdoaWNoIHRoZSBlcnJvciBwYXRoIHRoZW4gcmVwbGFjZXNcblx0Y29uc3QgbGF6eUNvbnN0cnVjdEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKGNlbGwuaGFuZGxlciA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBzaGltUmVzdWx0ID0gc2hpbUNvbnN0cnVjdEhhbmRsZXIoKTtcblx0XHRcdHJldHVybiBzaGltUmVzdWx0O1xuXHRcdH1cblx0XHRjb25zdCB7IGhhbmRsZXIgfSA9IGNlbGw7XG5cdFx0Y29uc3QgbW9kaWZpY2F0b3JCb2R5ID0gY29tcGlsZU5ld01vZGlmaWNhdG9yRnVuY3Rpb25Cb2R5KFR5cGVOYW1lKTtcblx0XHRjb25zdCB3cmFwcGVkQm9keSA9IG1vZGlmaWNhdG9yQm9keShcblx0XHRcdGhhbmRsZXIsXG5cdFx0XHRDcmVhdGlvbkhhbmRsZXIsXG5cdFx0XHRTeW1ib2xDb25zdHJ1Y3Rvck5hbWVcblx0XHQpO1xuXHRcdGNvbnN0IGhhbmRsZXJSZXN1bHQgPSB3cmFwcGVkQm9keSgpO1xuXHRcdHJldHVybiBoYW5kbGVyUmVzdWx0O1xuXHR9O1xuXG5cdG9kcChcblx0XHR0eXBlLFxuXHRcdCdjb25zdHJ1Y3RIYW5kbGVyJywge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGxhenlDb25zdHJ1Y3RIYW5kbGVyO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGUgICA6IHRydWUsXG5cdFx0XHRjb25maWd1cmFibGUgOiB0cnVlXG5cdFx0fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0eXBlLFxuXHRcdCdwcm90bycsIHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGNlbGwucHJvdG87XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZSAgIDogdHJ1ZSxcblx0XHRcdGNvbmZpZ3VyYWJsZSA6IHRydWVcblx0XHR9XG5cdCk7XG5cblx0Ly8gYSBmcmVzaCBjb3B5IHBlciByZWFkOiBhc0NsYXNzIGlzIHBlci1jb25zdHJ1Y3Rpb24gYW5kIG11c3QgbmV2ZXJcblx0Ly8gbGVhayBpbnRvIHRoZSBzaGFyZWQgbWVyZ2VkIGNvbmZpZ1xuXHRvZHAoXG5cdFx0dHlwZSxcblx0XHQnY29uZmlnJywge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdFx0XHR7fSxcblx0XHRcdFx0XHRtZXJnZWRDb25maWcsXG5cdFx0XHRcdFx0eyBhc0NsYXNzIDogY2VsbC5hc0NsYXNzIH1cblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlICAgOiB0cnVlLFxuXHRcdFx0Y29uZmlndXJhYmxlIDogdHJ1ZVxuXHRcdH1cblx0KTtcblxufTtcblxuY29uc3QgdHlwZURlc2NyaXB0b3JDcmVhdG9yID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRkZWZpbmVPcmlnaW46IFR5cGVBYnNvcmJlcixcblx0dHlwZXM6IFR5cGVzTWFwLFxuXHRUeXBlTmFtZTogc3RyaW5nLFxuXHRjb25zdHJ1Y3RIYW5kbGVyOiBNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdHByb3RvOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRjb25maWc6IHsgW2luZGV4OiBzdHJpbmddOiB1bmtub3duIH0sXG5cdGxhenlHZXR0ZXI/OiBMYXp5RGVmPG9iamVjdD4sXG4pIHtcblxuXHQvLyBoZXJlIFwidHlwZXNcIiByZWZlcnMgdG8gc3VidHlwZXMgb2YgdHlwZSBvciBjb2xsZWN0aW9uIG9iamVjdCB7fVxuXG5cdGNvbnN0IHBhcmVudFR5cGUgPSB0eXBlc1sgU3ltYm9sUGFyZW50VHlwZSBdIHx8IG51bGw7XG5cblx0Y29uc3QgaXNTdWJUeXBlID0gcGFyZW50VHlwZSA/IHRydWUgOiBmYWxzZTtcblxuXHRjb25zdCBjb2xsZWN0aW9uID0gaXNTdWJUeXBlXG5cdFx0PyAocGFyZW50VHlwZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuY29sbGVjdGlvbiBhcyBvYmplY3Rcblx0XHQ6IHR5cGVzWyBNTkVNT1NZTkUgXTtcblxuXHRpZiAodHlwZXMuaGFzKFR5cGVOYW1lKSkge1xuXHRcdHRocm93IG5ldyBBTFJFQURZX0RFQ0xBUkVEKFR5cGVOYW1lKTtcblx0fVxuXG5cdC8vIGNvbnN0IHN1YnR5cGVzID0gZGVzY3JpcHRvcnMuY3JlYXRlVHlwZXNDb2xsZWN0aW9uKCk7XG5cdGNvbnN0IHN1YnR5cGVzID0gbmV3IE1hcDxzdHJpbmcsIG9iamVjdD4oKTtcblxuXHRjb25zdCB0aXRsZSA9IGAke1RZUEVfVElUTEVfUFJFRklYfSR7VHlwZU5hbWV9YDtcblxuXHQvLyAnbmFtZScgaXMgYSBDT0xMRUNUSU9OIG9wdGlvbiBvbmx5OiBhIHVzZXIgcGFzc2luZyBpdCBoZXJlIG1lYW50IHRvXG5cdC8vIG5hbWUgdGhlIGNvbGxlY3Rpb24sIG5vdCB0aGUgdHlwZSDigJQgc2F5IHNvIHJlYWRhYmx5XG5cdGlmICggY29uZmlnICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGNvbmZpZyA9PT0gJ29iamVjdCcgJiYgJ25hbWUnIGluIGNvbmZpZyApIHtcblx0XHRjb25zdCBuYW1lRXJyb3IgPSAnXFxcIm5hbWVcXFwiIGlzIGEgY29sbGVjdGlvbiBvcHRpb24gJyArXG5cdFx0XHQnKGNyZWF0ZVR5cGVzQ29sbGVjdGlvbih7IG5hbWUgfSkpIOKAlCBpdCBjYW5ub3QgYmUgc2V0IG9uIGEgdHlwZSc7XG5cdFx0dGhyb3cgbmV3IE9QVElPTlNfRVJST1IoIG5hbWVFcnJvciApO1xuXHR9XG5cdGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oXG5cdFx0e30sXG5cdFx0KGNvbGxlY3Rpb24gYXMgUmVjb3JkPHN5bWJvbCwgdW5rbm93bj4pWyBTeW1ib2xDb25maWcgXSxcblx0XHRjb25maWdcblx0KTtcblx0Ly8gbmV2ZXIgaW5oZXJpdGVkIGludG8gdGhlIHR5cGUncyBjb25maWcgZWl0aGVyXG5cdFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoIGNvbmZpZywgJ25hbWUnICk7XG5cblx0Y29uc3QgdHlwZSA9IE9iamVjdC5hc3NpZ24oXG5cdFx0dGhpcyxcblx0XHR7XG5cblx0XHRcdGdldCBjb25zdHJ1Y3RIYW5kbGVyICgpIHtcblx0XHRcdFx0cmV0dXJuIGNvbnN0cnVjdEhhbmRsZXI7XG5cdFx0XHR9LFxuXG5cblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0cHJvdG8sXG5cblx0XHRcdGlzU3ViVHlwZSxcblx0XHRcdHN1YnR5cGVzLFxuXHRcdFx0cGFyZW50VHlwZSxcblxuXHRcdFx0Y29sbGVjdGlvbixcblxuXHRcdFx0dGl0bGUsXG5cblx0XHRcdGNvbmZpZyxcblxuXHRcdFx0aG9va3MgOiBPYmplY3QuY3JlYXRlKG51bGwpXG5cblx0XHR9XG5cdCk7XG5cblx0Z2V0U3RhY2suY2FsbChcblx0XHR0aGlzIGFzIFN0YWNrYWJsZUluc3RhbmNlLFxuXHRcdGBEZWZpbml0aW9uIG9mIFsgJHtUeXBlTmFtZX0gXSBtYWRlIGF0OmAsXG5cdFx0W10sXG5cdFx0ZGVmaW5lT3JpZ2luXG5cdCk7XG5cblx0Ly8gbGF6eSB0eXBlczogcHJvdG8gLyBjb25maWcgLyBjb25zdHJ1Y3RIYW5kbGVyIGJlY29tZSBmYWNhZGVzIG92ZXIgdGhlXG5cdC8vIHBlci1jb25zdHJ1Y3Rpb24gZ2F0aGVyIGNlbGwg4oCUIHNlZSBpbnN0YWxsTGF6eURlZmluaXRpb24gYWJvdmUgYW5kXG5cdC8vIGxhenlEZWZpbml0aW9uLnRzXG5cdGlmIChsYXp5R2V0dGVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRpbnN0YWxsTGF6eURlZmluaXRpb24oXG5cdFx0XHR0eXBlLFxuXHRcdFx0VHlwZU5hbWUsXG5cdFx0XHRjb25zdHJ1Y3RIYW5kbGVyLFxuXHRcdFx0cHJvdG8sXG5cdFx0XHRjb25maWcsXG5cdFx0XHRsYXp5R2V0dGVyXG5cdFx0KTtcblx0fVxuXG5cdG9kcChcblx0XHRzdWJ0eXBlcyxcblx0XHRTeW1ib2xQYXJlbnRUeXBlLCB7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gdHlwZTtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Ly8gY29uc3QgYW5jZXN0b3IgPSBpc1N1YlR5cGUgPyBPYmplY3QuY3JlYXRlKG51bGwpIDogcHJvdG87XG5cdC8vIGEgbGF6eSByb290J3MgYW5jZXN0b3IgaXMgbm90IGtub3duIGF0IGRlZmluZSB0aW1lIGVpdGhlcjogVHlwZVByb3h5XG5cdC8vIGluc3RhbGxzIGEgZmFjYWRlIG92ZXIgdGhlIGdhdGhlciBjZWxsIHdoZW4gaXQgcmVjZWl2ZXMgdW5kZWZpbmVkIGZvclxuXHQvLyBhIG5vbi1zdWJ0eXBlIGhlcmVcblx0Y29uc3QgYW5jZXN0b3IgPSAoaXNTdWJUeXBlIHx8IGxhenlHZXR0ZXIgIT09IHVuZGVmaW5lZCkgPyB1bmRlZmluZWQgOiBwcm90bztcblx0dHlwZXMuc2V0KFxuXHRcdFR5cGVOYW1lLFxuXHRcdG5ldyBUeXBlUHJveHkoXG5cdFx0XHR0eXBlLFxuXHRcdFx0YW5jZXN0b3Jcblx0XHQpXG5cdCk7XG5cblx0Ly8gdHlwZXMuc2V0KCBUeXBlTmFtZSwgbmV3IFR5cGVQcm94eSggdHlwZSApICk7XG5cblx0Y29uc3QgcmVzdWx0ID0gdHlwZXMuZ2V0KFR5cGVOYW1lKTtcblx0cmV0dXJuIHJlc3VsdDtcblxufTtcblxuLy8gdGhlIGNyZWF0b3IsIGFzIGl0IGlzIHVzZWQ6IGludm9rZWQgd2l0aCBgbmV3YCAodGhlIGNyZWF0ZUZyb20qIGNhbGxcbi8vIHNpdGVzIGJlbG93KSwgaXQgcmV0dXJucyB0aGUgVHlwZVByb3h5IGl0IHJlZ2lzdGVycyBpbiB0aGUgc3VidHlwZXMgbWFwXG4vLyDigJQgYSBQcm94eSBtYXRlcmlhbGl6aW5nIHRoZSBUeXBlQ2xhc3Mgc3VyZmFjZSBkeW5hbWljYWxseSDigJQgd2hpbGUgaXRzXG4vLyBwcm90b3R5cGUgaXMgdGhlIGRlc2NyaXB0b3IncyBUeXBlRGVzY3JpcHRvckluc3RhbmNlIGNvbnRyYWN0XG50eXBlIFR5cGVEZXNjcmlwdG9yQXJncyA9IFBhcmFtZXRlcnM8dHlwZW9mIHR5cGVEZXNjcmlwdG9yQ3JlYXRvcj47XG5pbnRlcmZhY2UgVHlwZURlc2NyaXB0b3JDb25zdHJ1Y3RvciBleHRlbmRzIE5ld2FibGVGdW5jdGlvbiB7XG5cdG5ldyAoLi4uYXJnczogVHlwZURlc2NyaXB0b3JBcmdzKTogVHlwZUNsYXNzO1xuXHQodGhpczogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSwgLi4uYXJnczogVHlwZURlc2NyaXB0b3JBcmdzKTogUmV0dXJuVHlwZTx0eXBlb2YgdHlwZURlc2NyaXB0b3JDcmVhdG9yPjtcblx0cmVhZG9ubHkgcHJvdG90eXBlOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlO1xufVxuXG4vLyB0aGUgY3JlYXRvciBpcyBvbmx5IGV2ZXIgaW52b2tlZCB3aXRoIGBuZXdgOyBhIGZ1bmN0aW9uIGV4cHJlc3Npb25cbi8vIGNhcnJpZXMgbm8gY29uc3RydWN0IHNpZ25hdHVyZSwgc28gaXQgaXMgbmFtZWQgb25jZSBhcyB0aGUgY29uc3RydWN0b3Jcbi8vIGludGVyZmFjZSBpdCBpcyB1c2VkIHRocm91Z2gg4oCUIHRoZSBwcm90b3R5cGUgY29udHJhY3QgaXMgYXR0YWNoZWRcbi8vIGltbWVkaWF0ZWx5IGJlbG93XG5jb25zdCBUeXBlRGVzY3JpcHRvciA9IHR5cGVEZXNjcmlwdG9yQ3JlYXRvciBhcyBUeXBlRGVzY3JpcHRvckNvbnN0cnVjdG9yO1xuXG5PYmplY3QuYXNzaWduKFxuXHRUeXBlRGVzY3JpcHRvci5wcm90b3R5cGUsXG5cdGhvb2tzQXBpXG4pO1xuXG5UeXBlRGVzY3JpcHRvci5wcm90b3R5cGUuZGVmaW5lID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRUeXBlT3JUeXBlTmFtZTogc3RyaW5nIHwgRGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUsXG5cdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZz86IERlZmluZU5ld2FibGVPckNhbGxhYmxlIHwgb2JqZWN0IHwgYm9vbGVhbixcblx0Y29uZmlnPzogb2JqZWN0IHwgYm9vbGVhblxuKSB7XG5cdGNvbnN0IHJlc3VsdCA9IGRlZmluZS5jYWxsKFxuXHRcdGRlZmluZSxcblx0XHR0aGlzLnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFR5cGVPclR5cGVOYW1lLFxuXHRcdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyxcblx0XHRjb25maWdcblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cblR5cGVEZXNjcmlwdG9yLnByb3RvdHlwZS5sYXp5ID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRUeXBlTmFtZTogc3RyaW5nLFxuXHRnZXR0ZXI/OiBMYXp5RGVmPG9iamVjdD4sXG5cdGNvbmZpZz86IG9iamVjdCB8IGJvb2xlYW5cbikge1xuXHRjb25zdCByZXN1bHQgPSBsYXp5LmNhbGwoXG5cdFx0dGhpcyxcblx0XHR0aGlzLnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFR5cGVOYW1lLFxuXHRcdGdldHRlcixcblx0XHRjb25maWdcblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cblR5cGVEZXNjcmlwdG9yLnByb3RvdHlwZS5sb29rdXAgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsXG5cdFR5cGVOZXN0ZWRQYXRoOiBzdHJpbmdcbikge1xuXHQvLyByZWxhdGl2ZSBmaXJzdDogcmVzb2x2ZSBhbW9uZyB0aGlzIHR5cGUncyBvd24gc3VidHlwZXMsXG5cdC8vIGUuZy4gQWRtaW5UeXBlLmxvb2t1cCgnU3ViVHlwZScpIG9yICdTdWJUeXBlLkRlZXBTdWJUeXBlJ1xuXHRjb25zdCByZWxhdGl2ZVJlc3VsdCA9IGxvb2t1cC5jYWxsKFxuXHRcdHRoaXMuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0VHlwZU5lc3RlZFBhdGhcblx0KTtcblx0aWYgKHJlbGF0aXZlUmVzdWx0KSB7XG5cdFx0cmV0dXJuIHJlbGF0aXZlUmVzdWx0O1xuXHR9XG5cdC8vIHJvb3QgZmFsbGJhY2s6IHJlc29sdmUgYWJzb2x1dGUgcmVnaXN0cnkgcGF0aHMgZnJvbSB0aGVcblx0Ly8gY29sbGVjdGlvbiwgZS5nLiBBZG1pblR5cGUubG9va3VwKCdVc2VyVHlwZS5BZG1pblR5cGUnKSxcblx0Ly8gd2hpY2ggaXMgd2hhdCB0aGUgVHlwZUxvb2t1cDxSZWdpc3RyeT4gdHlwZSBjb250cmFjdCBwcm9taXNlc1xuXHRjb25zdCBjb2xsZWN0aW9uID0gdGhpcy5jb2xsZWN0aW9uIGFzIENvbGxlY3Rpb25EZWY7XG5cdC8vIENvbGxlY3Rpb25EZWYubG9va3VwIGlzIHRoZSBydW50aW1lIGNvbnRyYWN0IChDb2xsZWN0aW9uTG9va3VwKSwgc28gYVxuXHQvLyBwbGFpbiBzdHJpbmcgcGF0aCB5aWVsZHMgVHlwZUNsYXNzIHwgdW5kZWZpbmVkIHdpdGggbm8gY2FzdFxuXHRjb25zdCByb290UmVzdWx0ID0gY29sbGVjdGlvbi5sb29rdXAoVHlwZU5lc3RlZFBhdGgpO1xuXHRyZXR1cm4gcm9vdFJlc3VsdDtcbn07XG5cbi8vIHByb3RvdHlwZS1sZXZlbCBnZXR0ZXIgKG5vdCBhIHBsYWluIG1ldGhvZCkgc28gdGhhdCBib3RoIGNhbGxcbi8vIGZvcm1zIGtlZXAgd29ya2luZzogdHlwZS5kZWNvcmF0ZShvcHRpb25zKSBhbmQgdGhlIGRlc3RydWN0dXJlZFxuLy8gY29uc3QgeyBkZWNvcmF0ZSB9ID0gdHlwZSDigJQgdGhlIGdldHRlciBiaW5kcyB0aGUgY3VycmVudFxuLy8gZGVzY3JpcHRvciBhdCBhY2Nlc3MgdGltZSwgc2FtZSBhcyB0aGUgY29sbGVjdGlvbi1sZXZlbCBkZWNvcmF0ZVxub2RwKFxuXHRUeXBlRGVzY3JpcHRvci5wcm90b3R5cGUsXG5cdCdkZWNvcmF0ZScsIHtcblx0XHRnZXQgKHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UpIHtcblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKG9wdGlvbnM/OiBvYmplY3QgfCBib29sZWFuKSB7XG5cdFx0XHRcdGNvbnN0IGRlY29yYXRvciA9IGZ1bmN0aW9uIChjc3RyOiBEZWZpbmVOZXdhYmxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBuYW1lIH0gPSBjc3RyO1xuXHRcdFx0XHRcdC8vIGRlZmluZSgpIHJldHVybnMgdGhlIHJlZ2lzdGVyZWQgY29uc3RydWN0b3IgaXRzZWxmIOKAlFxuXHRcdFx0XHRcdC8vIHRoZSBmdWxsIFR5cGVDbGFzcyBpcyBhIHJpY2hlciBob25lc3QgdHlwZSB0aGFuIGFueSBjYXN0XG5cdFx0XHRcdFx0Y29uc3QgZGVmaW5lUmVzdWx0ID0gc2VsZi5kZWZpbmUoXG5cdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0Y3N0cixcblx0XHRcdFx0XHRcdG9wdGlvbnNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBkZWNvcmF0b3I7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZURlc2NyaXB0b3IucHJvdG90eXBlLFxuXHRTeW1ib2wuaGFzSW5zdGFuY2UsIHtcblx0XHRnZXQgKHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGdldENhY2hlZFR5cGVDaGVja2VyKHRoaXMuVHlwZU5hbWUpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUEFUSCBSRVNPTFVUSU9OXG4vLyBSZXNvbHZlcyBhIGRvdC1zZXBhcmF0ZWQgcGF0aCB0byB0aGUgdGFyZ2V0IHR5cGVzIG1hcCBhbmRcbi8vIHRoZSBmaW5hbCB0eXBlIG5hbWUuIFJlY3Vyc2VzIGludG8gcGFyZW50IHN1YnR5cGVzIGZvclxuLy8gbmVzdGVkIHBhdGhzIChlLmcuICdQYXJlbnQuQ2hpbGQnIOKGkiBQYXJlbnQuc3VidHlwZXMgKyAnQ2hpbGQnKS5cbi8vIFJldHVybnMgdGhlIHBhcmVudCBUeXBlQ2xhc3Mgd2hlbiB0aGUgaGVhZCBzZWdtZW50IHJlc29sdmVzXG4vLyB0byBhbiBleGlzdGluZyB0eXBlIOKAlCBuZWVkZWQgZm9yIGxhenktZ2V0dGVyIHN1YnR5cGUgZGVmaW5pdGlvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCByZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQgPSBmdW5jdGlvbiAoXG5cdHN1YnR5cGVzOiBUeXBlc01hcCxcblx0cGF0aDogc3RyaW5nXG4pOiB7XG5cdFx0dGFyZ2V0OiBUeXBlc01hcDtcblx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0cGFyZW50PzogVHlwZUNsYXNzO1xuXHR9IHtcblx0Y29uc3Qgc3BsaXQgPSBnZXRUeXBlU3BsaXRQYXRoKHBhdGgpO1xuXHRjb25zdCBbIGhlYWQsIC4uLnJlc3QgXSA9IHNwbGl0O1xuXHRjb25zdCBwYXJlbnQgPSBsb29rdXAuY2FsbChcblx0XHRzdWJ0eXBlcyxcblx0XHRoZWFkXG5cdCk7XG5cblx0aWYgKCFwYXJlbnQpIHtcblx0XHRpZiAocmVzdC5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKGBwYXJlbnQgJHtoZWFkfSBkZWZpbml0aW9uIGlzIG5vdCB5ZXQgZXhpc3RzIWApO1xuXHRcdH1cblx0XHRjb25zdCBub1BhcmVudFJlc3VsdCA9IHsgdGFyZ2V0IDogc3VidHlwZXMsIG5hbWUgOiBoZWFkIH07XG5cdFx0cmV0dXJuIG5vUGFyZW50UmVzdWx0O1xuXHR9XG5cblx0aWYgKHJlc3QubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IG5lc3RlZFJlc3VsdCA9IHJlc29sdmVEZWZpbml0aW9uQ29udGV4dChcblx0XHRcdHBhcmVudC5zdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdHJlc3Quam9pbignLicpXG5cdFx0KTtcblx0XHRyZXR1cm4gbmVzdGVkUmVzdWx0O1xuXHR9XG5cblx0Y29uc3QgcmVzb2x2ZWRSZXN1bHQgPSB7IHRhcmdldCA6IHN1YnR5cGVzLCBuYW1lIDogaGVhZCwgcGFyZW50IH07XG5cdHJldHVybiByZXNvbHZlZFJlc3VsdDtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRFVQTElDQVRFIEdVQVJEXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgY2hlY2tEdXBsaWNhdGUgPSBmdW5jdGlvbiAodGFyZ2V0OiBUeXBlc01hcCwgbmFtZTogc3RyaW5nKTogdm9pZCB7XG5cdGNvbnN0IGV4aXN0aW5nID0gbG9va3VwLmNhbGwoXG5cdFx0dGFyZ2V0LFxuXHRcdG5hbWVcblx0KTtcblx0aWYgKGV4aXN0aW5nKSB7XG5cdFx0dGhyb3cgbmV3IEFMUkVBRFlfREVDTEFSRUQobmFtZSk7XG5cdH1cbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gQ09OU1RSVUNUSU9OIFNUUkFURUdJRVNcbi8vIFR3byBicmFuY2hlcywgc2FtZSByZXR1cm4gdHlwZSwgbm8gcmVjdXJzaW9uLlxuLy8gQm90aCByZWNlaXZlIHRoZSByZXNvbHZlZCBjb250ZXh0IGFuZCByZXR1cm4gVHlwZURlc2NyaXB0b3IuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gd2hhdCBpcyBnaXZlbiBpbiB0aGUgY29uZmlnIHBsYWNlIG92ZXJsYXBzIGRlZmF1bHRPcHRpb25zIChzZWUgY29uc3RhbnRzKTpcbi8vIGFuIG9iamVjdCBpdHMgb3duIGtleXMsIGEgYm9vbGVhbiBzdHJpY3RDaGFpbiBhbG9uZSwgYW5kIGEgZnVuY3Rpb25cbi8vIE1vZGlmaWNhdGlvbkNvbnN0cnVjdG9yIGFsb25lLiBBbnl0aGluZyBlbHNlIG92ZXJsYXBzIG5vdGhpbmdcbmNvbnN0IG1ha2VPd25Db25maWcgPSBmdW5jdGlvbiAoY29uZmlnOiB1bmtub3duKTogY29uc3RydWN0b3JPcHRpb25zIHtcblx0aWYgKHR5cGVvZiBjb25maWcgPT09ICdib29sZWFuJykge1xuXHRcdGNvbnN0IHN0cmljdENoYWluUmVzdWx0ID0geyBzdHJpY3RDaGFpbiA6IGNvbmZpZyB9O1xuXHRcdHJldHVybiBzdHJpY3RDaGFpblJlc3VsdDtcblx0fVxuXHRpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGNvbnN0IG1vZGlmaWNhdG9yUmVzdWx0ID0ge1xuXHRcdFx0TW9kaWZpY2F0aW9uQ29uc3RydWN0b3IgOiBjb25maWcgYXMgTW9kaWZpY2F0aW9uQ29uc3RydWN0b3JGYWN0b3J5XG5cdFx0fTtcblx0XHRyZXR1cm4gbW9kaWZpY2F0b3JSZXN1bHQ7XG5cdH1cblx0Y29uc3QgcmVzdWx0ID0gdHlwZW9mIGNvbmZpZyA9PT0gJ29iamVjdCcgJiYgY29uZmlnICE9PSBudWxsID8gY29uZmlnIDoge307XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5jb25zdCBjcmVhdGVGcm9tRGlyZWN0SGFuZGxlciA9IGZ1bmN0aW9uIChcblx0ZGVmaW5lT3JpZ2luOiBUeXBlQWJzb3JiZXIsXG5cdHRhcmdldDogVHlwZXNNYXAsXG5cdG5hbWU6IHN0cmluZyxcblx0aGFuZGxlcjogQ29uc3RydWN0SGFuZGxlciB8IHVuZGVmaW5lZCxcblx0Y29uZmlnOiB1bmtub3duLFxuXHRsYXp5R2V0dGVyPzogTGF6eURlZjxvYmplY3Q+XG4pIHtcblx0Ly8gZm9yIGEgbGF6eSB0eXBlIHRoZSBoYW5kbGVyIHN0YXlzIHRoZSBlbXB0eSBzaGltOiB0aGUgcmVhbCBjb25zdHJ1Y3RvclxuXHQvLyBpcyBnYXRoZXJlZCBmcm9tIHRoZSBjYWxsYmFjayBvbmNlIHBlciBjb25zdHJ1Y3Rpb24gKHNlZVxuXHQvLyBpbnN0YWxsTGF6eURlZmluaXRpb24gYWJvdmUgYW5kIGxhenlEZWZpbml0aW9uLnRzKVxuXHRoYW5kbGVyID0gaGFuZGxlciB8fCBmdW5jdGlvbiAoKSB7IH07XG5cdGNvbnN0IGFzQ2xhc3MgPSBpc0NsYXNzKGhhbmRsZXIpO1xuXHRjb25zdCBtb2RpZmljYXRvckJvZHkgPSBjb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHkobmFtZSk7XG5cblx0Y29uc3QgbWFrZUNvbnN0cnVjdEhhbmRsZXIgPSBtb2RpZmljYXRvckJvZHkoXG5cdFx0aGFuZGxlciBhcyBDb25zdHJ1Y3RIYW5kbGVyLFxuXHRcdENyZWF0aW9uSGFuZGxlcixcblx0XHRTeW1ib2xDb25zdHJ1Y3Rvck5hbWVcblx0KTtcblxuXHQvLyB0aGUgZGV0ZWN0ZWQgbW9kZSBnb2VzIGludG8gdGhlIHR5cGUncyBvd24gY29weSwgbmV2ZXIgaW50byB0aGVcblx0Ly8gY2FsbGVyJ3Mgb3B0aW9ucyBvYmplY3Rcblx0Y29uc3QgdHlwZUNvbmZpZzogVHlwZUNvbmZpZyA9IE9iamVjdC5hc3NpZ24oXG5cdFx0e30sXG5cdFx0bWFrZU93bkNvbmZpZyhjb25maWcpLFxuXHRcdHsgYXNDbGFzcyB9XG5cdCk7XG5cblx0Y29uc3QgcHJvdG8gPSAoXG5cdFx0aG9wKFxuXHRcdFx0aGFuZGxlcixcblx0XHRcdCdwcm90b3R5cGUnXG5cdFx0KSAmJlxuXHRcdCh0eXBlb2YgaGFuZGxlci5wcm90b3R5cGUgPT09ICdvYmplY3QnKVxuXHQpID8gaGFuZGxlci5wcm90b3R5cGUgOiBnZXREZWZhdWx0UHJvdG90eXBlKCk7XG5cblx0Ly8gcmVqZWN0IHRoZSB1bnN1cHBvcnRlZCBoYW5kbGVyIHNoYXBlcyAoZ2VuZXJhdG9ycywgc3luYyBhcnJvd3MsXG5cdC8vIHNob3J0aGFuZCBtZXRob2RzLCBib3VuZCBmdW5jdGlvbnMpIEJFRk9SRSB0aGUgdHlwZSBpcyBjcmVhdGVkLCBzb1xuXHQvLyBhIHJlamVjdGVkIGRlZmluZSBsZWF2ZXMgbm90aGluZyByZWdpc3RlcmVkLiBTa2lwcGVkIHdoZW4gdGhlIG5hbWVcblx0Ly8gaXMgdGFrZW46IHRoZSBUeXBlRGVzY3JpcHRvciBiZWxvdyB0aHJvd3MgdGhlIGNhbm9uaWNhbFxuXHQvLyBBTFJFQURZX0RFQ0xBUkVELCB3aGljaCB3aW5zIG92ZXIgdGhlIHNoYXBlIGVycm9yXG5cdGlmICggIXRhcmdldC5oYXMoIG5hbWUgKSApIHtcblx0XHRjbGFzc2lmeUNvbnN0cnVjdEhhbmRsZXIoXG5cdFx0XHRuYW1lLFxuXHRcdFx0aGFuZGxlclxuXHRcdCk7XG5cdH1cblxuXHRjb25zdCByZXN1bHQgPSBuZXcgVHlwZURlc2NyaXB0b3IoXG5cdFx0ZGVmaW5lT3JpZ2luLFxuXHRcdHRhcmdldCxcblx0XHRuYW1lLFxuXHRcdG1ha2VDb25zdHJ1Y3RIYW5kbGVyLFxuXHRcdHByb3RvLFxuXHRcdHR5cGVDb25maWcsXG5cdFx0bGF6eUdldHRlclxuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gLmxhenkoKSBpcyBhIHJlZ3VsYXIgZGVmaW5lIHdob3NlIGhhbmRsZXIgaXMgdGhlIGVtcHR5IHNoaW07IHRoZSByZWFsXG4vLyBjb25zdHJ1Y3RvciBpcyBnYXRoZXJlZCBmcm9tIHRoZSBjYWxsYmFjayBvbmNlIHBlciBjb25zdHJ1Y3Rpb24g4oCUIHNlZVxuLy8gaW5zdGFsbExhenlEZWZpbml0aW9uIGFib3ZlIGFuZCBsYXp5RGVmaW5pdGlvbi50cy4gTk9USElORyBpcyBkZXJpdmVkXG4vLyBmcm9tIHRoZSBjYWxsYmFjayBoZXJlOiBpdCBpcyBuZXZlciBjYWxsZWQgYXQgZGVmaW5lIHRpbWUsIHNvIGZvcndhcmRcbi8vIHJlZmVyZW5jZXMgYW5kIGNpcmN1bGFyIGltcG9ydHMgd29yayDigJQgdGhlIGNhbGxiYWNrJ3MgdGFyZ2V0IG9ubHkgaGFzIHRvXG4vLyBleGlzdCBieSB0aGUgZmlyc3QgYG5ld2BcbmNvbnN0IGNyZWF0ZUZyb21MYXp5RGVmaW5pdGlvbiA9IGZ1bmN0aW9uIChcblx0ZGVmaW5lT3JpZ2luOiBUeXBlQWJzb3JiZXIsXG5cdHRhcmdldDogVHlwZXNNYXAsXG5cdG5hbWU6IHN0cmluZyxcblx0Z2V0dGVyOiBMYXp5RGVmPG9iamVjdD4sXG5cdGNvbmZpZzogdW5rbm93blxuKSB7XG5cblx0Y29uc3QgcmVzdWx0ID0gY3JlYXRlRnJvbURpcmVjdEhhbmRsZXIoXG5cdFx0ZGVmaW5lT3JpZ2luLFxuXHRcdHRhcmdldCxcblx0XHRuYW1lLFxuXHRcdHVuZGVmaW5lZCxcblx0XHRjb25maWcsXG5cdFx0Z2V0dGVyXG5cdCk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIE1BSU4gRElTUEFUQ0hFUlxuLy8gQWxsIGJyYW5jaGVzIGZ1bm5lbCBoZXJlLiBSZWN1cnNpb24gaXMgaXNvbGF0ZWQgdG8gcGF0aFxuLy8gcmVzb2x1dGlvbiAocmVzb2x2ZURlZmluaXRpb25Db250ZXh0KSBhbmQgdGhlIHNpbmdsZSBjYXNlXG4vLyBvZiBhIG5hbWVkIGZ1bmN0aW9uIHBhc3NlZCBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IGRlZmluZSA9IGZ1bmN0aW9uIChcblx0dGhpczogdW5rbm93bixcblx0c3VidHlwZXM6IFR5cGVzTWFwLFxuXHRUeXBlT3JUeXBlTmFtZTogc3RyaW5nIHwgRGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUsXG5cdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZz86IERlZmluZU5ld2FibGVPckNhbGxhYmxlIHwgb2JqZWN0IHwgYm9vbGVhbixcblx0Y29uZmlnPzogb2JqZWN0IHwgYm9vbGVhblxuKTogVHlwZUNsYXNzIHtcblxuXHQvLyAtLS0gQnJhbmNoOiBmdW5jdGlvbiBvciBjbGFzcyBwYXNzZWQgYXMgZmlyc3QgYXJnIC0tLVxuXHQvLyBpdHMgb3duIG5hbWUgaXMgdGhlIFR5cGVOYW1lLCBzbyB0aGUgYXJndW1lbnRzIHNoaWZ0IGxlZnQgYnkgb25lOlxuXHQvLyB0aGUgc2Vjb25kIGlzIHRoZSBjb25maWcsIGFuZCBub3RoaW5nIGFmdGVyIHRoZSBjb25maWcgaXMgcmVhZFxuXHRpZiAodHlwZW9mIFR5cGVPclR5cGVOYW1lID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0Y29uc3QgZm4gPSBUeXBlT3JUeXBlTmFtZTtcblx0XHRpZiAoZm4ubmFtZSkge1xuXHRcdFx0Y2hlY2tEdXBsaWNhdGUoXG5cdFx0XHRcdHN1YnR5cGVzLFxuXHRcdFx0XHRmbi5uYW1lXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgZGVmaW5lUmVzdWx0ID0gZGVmaW5lLmNhbGwoXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdHN1YnR5cGVzLFxuXHRcdFx0XHRmbi5uYW1lLFxuXHRcdFx0XHRmbixcblx0XHRcdFx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIGRlZmluZVJlc3VsdDtcblx0XHR9XG5cdFx0Ly8gQW5vbnltb3VzIGZ1bmN0aW9uIGFzIGZpcnN0IGFyZyBpcyBub3QgYSB2YWxpZCAuZGVmaW5lKCkgZm9ybS5cblx0XHQvLyBVc2UgLmxhenkoKCkgPT4gQ29uc3RydWN0b3IsIGNvbmZpZz8pIGZvciBsYXp5IGdldHRlcnMgaW5zdGVhZC5cblx0XHR0aHJvdyBuZXcgVFlQRU5BTUVfTVVTVF9CRV9BX1NUUklORztcblx0fVxuXG5cdC8vIC0tLSBCcmFuY2g6IHN0cmluZyBwYXRoIHBhc3NlZCBhcyBmaXJzdCBhcmcgLS0tXG5cdGlmICh0eXBlb2YgVHlwZU9yVHlwZU5hbWUgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignZGVmaW5pdGlvbiBpcyBub3QgcHJvdmlkZWQnKTtcblx0fVxuXHRjaGVja1R5cGVOYW1lKFR5cGVPclR5cGVOYW1lKTtcblxuXHRsZXQgaGFuZGxlcjogQ29uc3RydWN0SGFuZGxlciB8IHVuZGVmaW5lZDtcblx0aWYgKHR5cGVvZiBjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcgPT09ICdmdW5jdGlvbicpIHtcblx0XHRoYW5kbGVyID0gY29uc3RydWN0SGFuZGxlck9yQ29uZmlnIGFzIENvbnN0cnVjdEhhbmRsZXI7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0Y29uZmlnID0gY29uc3RydWN0SGFuZGxlck9yQ29uZmlnO1xuXHR9XG5cblx0Y29uc3Qge1xuXHRcdHRhcmdldCwgbmFtZSwgcGFyZW50XG5cdH0gPSByZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQoXG5cdFx0c3VidHlwZXMsXG5cdFx0VHlwZU9yVHlwZU5hbWVcblx0KTtcblxuXHQvLyBFeGlzdGluZyB0eXBlIHdpdGggbm8gaGFuZGxlcjogZXJyb3IgKG1hdGNoZXMgb3JpZ2luYWwgZmFsbHRocm91Z2gpXG5cdGlmIChwYXJlbnQgJiYgIWhhbmRsZXIpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdkZWZpbml0aW9uIGlzIG5vdCBwcm92aWRlZCcpO1xuXHR9XG5cblx0Y29uc3QgcmVzdWx0ID0gY3JlYXRlRnJvbURpcmVjdEhhbmRsZXIoXG5cdFx0dGhpcyBhcyBUeXBlQWJzb3JiZXIsXG5cdFx0dGFyZ2V0LFxuXHRcdG5hbWUsXG5cdFx0aGFuZGxlcixcblx0XHRjb25maWdcblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBjb25zdCBsYXp5ID0gZnVuY3Rpb24gKFxuXHR0aGlzOiB1bmtub3duLFxuXHRzdWJ0eXBlczogVHlwZXNNYXAsXG5cdFR5cGVOYW1lOiBzdHJpbmcsXG5cdGdldHRlcj86IExhenlEZWY8b2JqZWN0Pixcblx0Y29uZmlnPzogb2JqZWN0IHwgYm9vbGVhblxuKTogVHlwZUNsYXNzIHtcblxuXHQvLyB0aGUgdW5uYW1lZCBsYXp5KCgpID0+IENvbnN0cnVjdG9yKSBmb3JtIGlzIGRyb3BwZWQ6IHRoZSBjYWxsYmFjayBpc1xuXHQvLyBuZXZlciBjYWxsZWQgYXQgZGVmaW5lIHRpbWUsIHNvIHRoZXJlIGlzIG5vdGhpbmcgdG8gZGVyaXZlIHRoZSBuYW1lXG5cdC8vIGZyb20g4oCUIHRoZSBuYW1lIG11c3QgY29tZSBpbiBleHBsaWNpdGx5XG5cdGlmICh0eXBlb2YgVHlwZU5hbWUgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFRZUEVOQU1FX01VU1RfQkVfQV9TVFJJTkc7XG5cdH1cblxuXHRpZiAodHlwZW9mIGdldHRlciAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBIQU5ETEVSX01VU1RfQkVfQV9GVU5DVElPTjtcblx0fVxuXG5cdC8vIHRoZSBjYWxsYmFjayBydW5zIHBlciBjb25zdHJ1Y3Rpb24gYW5kIG11c3QgZGVsaXZlciB0aGUgY29uc3RydWN0b3Jcblx0Ly8gc3luY2hyb25vdXNseTogYW4gYXN5bmMgb3IgZ2VuZXJhdG9yIGNhbGxiYWNrIHdvdWxkIHByb2R1Y2UgYVxuXHQvLyBQcm9taXNlIC8gaXRlcmF0b3IgaW5zdGVhZFxuXHRjb25zdCBjYWxsYmFja0tpbmQgPSBnZXR0ZXIuY29uc3RydWN0b3IubmFtZTtcblx0aWYgKFxuXHRcdGNhbGxiYWNrS2luZCA9PT0gJ0FzeW5jRnVuY3Rpb24nIHx8XG5cdFx0Y2FsbGJhY2tLaW5kID09PSAnR2VuZXJhdG9yRnVuY3Rpb24nIHx8XG5cdFx0Y2FsbGJhY2tLaW5kID09PSAnQXN5bmNHZW5lcmF0b3JGdW5jdGlvbidcblx0KSB7XG5cdFx0Y29uc3QgbXNnID0gYCR7VHlwZU5hbWV9OiBsYXp5IGNhbGxiYWNrIG11c3QgYmUgYSBzeW5jIGZ1bmN0aW9uIGAgK1xuXHRcdFx0Jyhhc3luYyBhbmQgZ2VuZXJhdG9yIGNhbGxiYWNrcyBhcmUgbm90IHN1cHBvcnRlZCknO1xuXHRcdHRocm93IG5ldyBXUk9OR19NT0RJRklDQVRJT05fUEFUVEVSTiggbXNnICk7XG5cdH1cblxuXHQvLyB0aGUgc2FtZSBkb3R0ZWQtcGF0aCByZXNvbHV0aW9uIGFzIGRlZmluZSdzIHN0cmluZyBicmFuY2g6XG5cdC8vIGxhenkoJ1BhcmVudC5DaGlsZCcsIC4uLikgbGFuZHMgdW5kZXIgUGFyZW50LCBhbmQgYSB0YWtlbiBuYW1lIGZhaWxzXG5cdC8vIHdpdGggdGhlIGRlc2NyaXB0b3IncyBBTFJFQURZX0RFQ0xBUkVELCBleGFjdGx5IGxpa2UgZGVmaW5lXG5cdGNoZWNrVHlwZU5hbWUoVHlwZU5hbWUpO1xuXG5cdGNvbnN0IHsgdGFyZ2V0LCBuYW1lIH0gPSByZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQoXG5cdFx0c3VidHlwZXMsXG5cdFx0VHlwZU5hbWVcblx0KTtcblxuXHRjb25zdCBsYXp5UmVzdWx0ID0gY3JlYXRlRnJvbUxhenlEZWZpbml0aW9uKFxuXHRcdHRoaXMgYXMgVHlwZUFic29yYmVyLFxuXHRcdHRhcmdldCxcblx0XHRuYW1lLFxuXHRcdGdldHRlcixcblx0XHRjb25maWdcblx0KTtcblx0cmV0dXJuIGxhenlSZXN1bHQ7XG59O1xuXG5leHBvcnQgY29uc3QgbG9va3VwID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlc01hcCxcblx0VHlwZU5lc3RlZFBhdGg6IHN0cmluZ1xuKTogVHlwZUNsYXNzIHwgdW5kZWZpbmVkIHtcblxuXHRpZiAodHlwZW9mIFR5cGVOZXN0ZWRQYXRoICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBXUk9OR19UWVBFX0RFRklOSVRJT04oJ2FyZyA6IHR5cGUgbmVzdGVkIHBhdGggbXVzdCBiZSBhIHN0cmluZycpO1xuXHR9XG5cblx0aWYgKCFUeXBlTmVzdGVkUGF0aC5sZW5ndGgpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdhcmcgOiB0eXBlIG5lc3RlZCBwYXRoIGhhcyBubyBwYXRoJyk7XG5cdH1cblxuXHRjb25zdCBzcGxpdCA9IGdldFR5cGVTcGxpdFBhdGgoVHlwZU5lc3RlZFBhdGgpO1xuXG5cdGNvbnN0IFsgbmFtZSBdID0gc3BsaXQ7XG5cdGNvbnN0IHR5cGUgPSB0aGlzLmdldChuYW1lKSBhcyBUeXBlQ2xhc3MgfCB1bmRlZmluZWQ7XG5cdGlmIChzcGxpdC5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gdHlwZTtcblx0fVxuXG5cdGNvbnN0IE5leHROZXN0ZWRQYXRoID0gc3BsaXQuc2xpY2UoMSkuam9pbignLicpO1xuXHRpZiAoIXR5cGUpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdC8vIGEgdHlwZSdzIHN1YnR5cGVzIG1hcCBJUyB0aGUgcnVudGltZSBUeXBlc01hcCAoU3ltYm9sUGFyZW50VHlwZSBhbmRcblx0Ly8gTU5FTU9TWU5FIGFyZSBpbnN0YWxsZWQgYXQgZGVmaW5pdGlvbiB0aW1lKSwgc28gdGhlIHNpbmdsZSBjYXN0IG9ubHlcblx0Ly8gbmFtZXMgdGhhdCB2aWV3XG5cdGNvbnN0IHJlc3VsdCA9IGxvb2t1cC5jYWxsKFxuXHRcdHR5cGUuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0TmV4dE5lc3RlZFBhdGhcblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcblxufTtcblxuXG5cbiJdfQ==