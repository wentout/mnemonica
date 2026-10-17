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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3R5cGVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0NiLHlDQUFzQztBQUV0QywrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLFlBQVksRUFFWixpQkFBaUIsRUFDakIsU0FBUyxHQUVULEdBQUcscUJBQVMsQ0FBQztBQUVkLHFEQUF1RDtBQUd2RCw0REFBcUM7QUFDckMsTUFBTSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsbUJBQVUsQ0FBQztBQUUzQyxNQUFNLEVBQ0wsZ0JBQWdCLEVBQ2hCLHFCQUFxQixFQUNyQiwwQkFBMEIsRUFDMUIseUJBQXlCLEVBQ3pCLDBCQUEwQixFQUMxQixhQUFhLEdBQ2IsR0FBRyxvQkFBVyxDQUFDO0FBS2hCLG1EQUFxQztBQUNyQywyQ0FBd0M7QUFFeEMseUdBSTZDO0FBRTdDLHFEQUcwQjtBQUUxQixrREFBdUQ7QUFDdkQsTUFBTSxFQUNMLG9CQUFvQixFQUNwQixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLE9BQU8sR0FDUCxHQUFHLGVBQVUsQ0FBQztBQUVmLHNDQUdtQjtBQWFuQixNQUFNLHFCQUFxQixHQUFHLFVBQzdCLElBQTRCLEVBQzVCLFFBQWdCLEVBQ2hCLG9CQUFpRCxFQUNqRCxTQUF1QyxFQUN2QyxZQUEwQyxFQUMxQyxNQUF1QjtJQUt2QixNQUFNLElBQUksR0FBdUI7UUFDaEMsT0FBTyxFQUFHLFNBQVM7UUFDbkIsT0FBTyxFQUFHLEtBQUs7UUFDZixLQUFLLEVBQUssU0FBUztRQUNuQixNQUFNLEVBQUksS0FBSztRQUNmLEtBQUssRUFBSyxTQUFTO0tBQ25CLENBQUM7SUFJRixNQUFNLEtBQUssR0FBRztRQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0lBQ3hCLENBQUMsQ0FBQztJQUlGLE1BQU0sTUFBTSxHQUFHO1FBQ2QsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUM7WUFDSixNQUFNLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsSUFBQSx1REFBbUIsRUFBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLElBQUksMEJBQTBCLENBQUM7WUFDdEMsQ0FBQztZQUVELElBQUEsNERBQXdCLEVBQ3ZCLFFBQVEsRUFDUixRQUFRLENBQ1IsQ0FBQztZQUNGLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUdoQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQ1osSUFBQSxTQUFHLEVBQ0YsT0FBTyxFQUNQLFdBQVcsQ0FDWDtnQkFDRCxDQUFDLE9BQU8sT0FBTyxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsQ0FDdkMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMvQyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQU1oQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNwQixDQUFDO0lBQ0YsQ0FBQyxDQUFDO0lBSUYsSUFBQSxrQ0FBaUIsRUFDaEIsSUFBSSxFQUNKO1FBQ0MsSUFBSTtRQUdKLFdBQVcsRUFBRyxZQUFZLENBQUMsV0FBVyxLQUFLLEtBQUs7UUFDaEQsTUFBTTtRQUNOLEtBQUs7S0FDTCxDQUNELENBQUM7SUFPRixNQUFNLG9CQUFvQixHQUFHO1FBQzVCLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNoQyxNQUFNLFVBQVUsR0FBRyxvQkFBb0IsRUFBRSxDQUFDO1lBQzFDLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFDRCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLE1BQU0sZUFBZSxHQUFHLElBQUEsMkNBQWlDLEVBQ3hELFFBQVEsRUFDUixJQUFJLENBQUMsT0FBTyxDQUNaLENBQUM7UUFDRixNQUFNLFdBQVcsR0FBRyxlQUFlLENBQ2xDLE9BQU8sRUFDUCx1QkFBZSxFQUNmLHFCQUFxQixDQUNyQixDQUFDO1FBQ0YsTUFBTSxhQUFhLEdBQUcsV0FBVyxFQUFFLENBQUM7UUFDcEMsT0FBTyxhQUFhLENBQUM7SUFDdEIsQ0FBQyxDQUFDO0lBRUYsR0FBRyxDQUNGLElBQUksRUFDSixrQkFBa0IsRUFBRTtRQUNuQixHQUFHO1lBQ0YsT0FBTyxvQkFBb0IsQ0FBQztRQUM3QixDQUFDO1FBQ0QsVUFBVSxFQUFLLElBQUk7UUFDbkIsWUFBWSxFQUFHLElBQUk7S0FDbkIsQ0FDRCxDQUFDO0lBRUYsR0FBRyxDQUNGLElBQUksRUFDSixPQUFPLEVBQUU7UUFDUixHQUFHO1lBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUMxQixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFDRCxVQUFVLEVBQUssSUFBSTtRQUNuQixZQUFZLEVBQUcsSUFBSTtLQUNuQixDQUNELENBQUM7SUFJRixHQUFHLENBQ0YsSUFBSSxFQUNKLFFBQVEsRUFBRTtRQUNULEdBQUc7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUMzQixFQUFFLEVBQ0YsWUFBWSxFQUNaLEVBQUUsT0FBTyxFQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FDMUIsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUNELFVBQVUsRUFBSyxJQUFJO1FBQ25CLFlBQVksRUFBRyxJQUFJO0tBQ25CLENBQ0QsQ0FBQztBQUVILENBQUMsQ0FBQztBQUVGLE1BQU0scUJBQXFCLEdBQUcsVUFFN0IsWUFBMEIsRUFDMUIsS0FBZSxFQUNmLFFBQWdCLEVBQ2hCLGdCQUE2QyxFQUM3QyxLQUFtQyxFQUNuQyxNQUFvQyxFQUNwQyxVQUE0QjtJQUs1QixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUUsZ0JBQWdCLENBQUUsSUFBSSxJQUFJLENBQUM7SUFFckQsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUU1QyxNQUFNLFVBQVUsR0FBRyxTQUFTO1FBQzNCLENBQUMsQ0FBRSxVQUFzQyxDQUFDLFVBQW9CO1FBQzlELENBQUMsQ0FBQyxLQUFLLENBQUUsU0FBUyxDQUFFLENBQUM7SUFFdEIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDekIsTUFBTSxJQUFJLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFHRCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztJQUUzQyxNQUFNLEtBQUssR0FBRyxHQUFHLGlCQUFpQixHQUFHLFFBQVEsRUFBRSxDQUFDO0lBSWhELElBQUssTUFBTSxLQUFLLFNBQVMsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksTUFBTSxJQUFJLE1BQU0sRUFBRyxDQUFDO1FBQzlFLE1BQU0sU0FBUyxHQUFHLGtDQUFrQztZQUNuRCxnRUFBZ0UsQ0FBQztRQUNsRSxNQUFNLElBQUksYUFBYSxDQUFFLFNBQVMsQ0FBRSxDQUFDO0lBQ3RDLENBQUM7SUFDRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FDckIsRUFBRSxFQUNELFVBQXNDLENBQUUsWUFBWSxDQUFFLEVBQ3ZELE1BQU0sQ0FDTixDQUFDO0lBRUYsT0FBTyxDQUFDLGNBQWMsQ0FBRSxNQUFNLEVBQUUsTUFBTSxDQUFFLENBQUM7SUFFekMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FDekIsSUFBSSxFQUNKO1FBRUMsSUFBSSxnQkFBZ0I7WUFDbkIsT0FBTyxnQkFBZ0IsQ0FBQztRQUN6QixDQUFDO1FBR0QsUUFBUTtRQUNSLEtBQUs7UUFFTCxTQUFTO1FBQ1QsUUFBUTtRQUNSLFVBQVU7UUFFVixVQUFVO1FBRVYsS0FBSztRQUVMLE1BQU07UUFFTixLQUFLLEVBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7S0FFM0IsQ0FDRCxDQUFDO0lBRUYsaUJBQVEsQ0FBQyxJQUFJLENBQ1osSUFBeUIsRUFDekIsbUJBQW1CLFFBQVEsYUFBYSxFQUN4QyxFQUFFLEVBQ0YsWUFBWSxDQUNaLENBQUM7SUFLRixJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUM5QixxQkFBcUIsQ0FDcEIsSUFBSSxFQUNKLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsS0FBSyxFQUNMLE1BQU0sRUFDTixVQUFVLENBQ1YsQ0FBQztJQUNILENBQUM7SUFFRCxHQUFHLENBQ0YsUUFBUSxFQUNSLGdCQUFnQixFQUFFO1FBQ2pCLEdBQUc7WUFDRixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FDRCxDQUNELENBQUM7SUFNRixNQUFNLFFBQVEsR0FBRyxDQUFDLFNBQVMsSUFBSSxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzdFLEtBQUssQ0FBQyxHQUFHLENBQ1IsUUFBUSxFQUNSLElBQUkscUJBQVMsQ0FDWixJQUFJLEVBQ0osUUFBUSxDQUNSLENBQ0QsQ0FBQztJQUlGLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsT0FBTyxNQUFNLENBQUM7QUFFZixDQUFDLENBQUM7QUFNRixNQUFNLGNBQWMsR0FBRyxxQkFBOEQsQ0FBQztBQUV0RixNQUFNLENBQUMsTUFBTSxDQUNaLGNBQWMsQ0FBQyxTQUFTLEVBQ3hCLFFBQVEsQ0FDUixDQUFDO0FBRUYsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFFakMsY0FBZ0QsRUFDaEQsd0JBQTJELEVBQzNELE1BQWU7SUFFZixNQUFNLE1BQU0sR0FBRyxjQUFNLENBQUMsSUFBSSxDQUN6QixjQUFNLEVBQ04sSUFBSSxDQUFDLFFBQW9CLEVBQ3pCLGNBQWMsRUFDZCx3QkFBd0IsRUFDeEIsTUFBTSxDQUNOLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBRS9CLFFBQWdCLEVBQ2hCLE1BQXdCLEVBQ3hCLE1BQWU7SUFFZixNQUFNLE1BQU0sR0FBRyxZQUFJLENBQUMsSUFBSSxDQUN2QixJQUFJLEVBQ0osSUFBSSxDQUFDLFFBQW9CLEVBQ3pCLFFBQVEsRUFDUixNQUFNLEVBQ04sTUFBTSxDQUNOLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBRWpDLGNBQXNCO0lBSXRCLE1BQU0sY0FBYyxHQUFHLGNBQU0sQ0FBQyxJQUFJLENBQ2pDLElBQUksQ0FBQyxRQUFvQixFQUN6QixjQUFjLENBQ2QsQ0FBQztJQUNGLElBQUksY0FBYyxFQUFFLENBQUM7UUFDcEIsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQztJQUlELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUEyQixDQUFDO0lBR3BELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDckQsT0FBTyxVQUFVLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBTUYsR0FBRyxDQUNGLGNBQWMsQ0FBQyxTQUFTLEVBQ3hCLFVBQVUsRUFBRTtJQUNYLEdBQUc7UUFDRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFDbEIsTUFBTSxNQUFNLEdBQUcsVUFBVSxPQUFnQjtZQUN4QyxNQUFNLFNBQVMsR0FBRyxVQUFVLElBQW1CO2dCQUM5QyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO2dCQUd0QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUMvQixJQUFJLEVBQ0osSUFBSSxFQUNKLE9BQU8sQ0FDUCxDQUFDO2dCQUNGLE9BQU8sWUFBWSxDQUFDO1lBQ3JCLENBQUMsQ0FBQztZQUNGLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUMsQ0FBQztRQUNGLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUNELFVBQVUsRUFBRyxJQUFJO0NBQ2pCLENBQ0QsQ0FBQztBQUVGLEdBQUcsQ0FDRixjQUFjLENBQUMsU0FBUyxFQUN4QixNQUFNLENBQUMsV0FBVyxFQUFFO0lBQ25CLEdBQUc7UUFDRixNQUFNLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBQ0QsQ0FDRCxDQUFDO0FBV0YsTUFBTSx3QkFBd0IsR0FBRyxVQUNoQyxRQUFrQixFQUNsQixJQUFZO0lBTVosTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsTUFBTSxDQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBRSxHQUFHLEtBQUssQ0FBQztJQUNoQyxNQUFNLE1BQU0sR0FBRyxjQUFNLENBQUMsSUFBSSxDQUN6QixRQUFRLEVBQ1IsSUFBSSxDQUNKLENBQUM7SUFFRixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDYixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDckIsTUFBTSxJQUFJLHFCQUFxQixDQUFDLFVBQVUsSUFBSSxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFDRCxNQUFNLGNBQWMsR0FBRyxFQUFFLE1BQU0sRUFBRyxRQUFRLEVBQUUsSUFBSSxFQUFHLElBQUksRUFBRSxDQUFDO1FBQzFELE9BQU8sY0FBYyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDckIsTUFBTSxZQUFZLEdBQUcsd0JBQXdCLENBQzVDLE1BQU0sQ0FBQyxRQUFvQixFQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUNkLENBQUM7UUFDRixPQUFPLFlBQVksQ0FBQztJQUNyQixDQUFDO0lBRUQsTUFBTSxjQUFjLEdBQUcsRUFBRSxNQUFNLEVBQUcsUUFBUSxFQUFFLElBQUksRUFBRyxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFDbEUsT0FBTyxjQUFjLENBQUM7QUFDdkIsQ0FBQyxDQUFDO0FBTUYsTUFBTSxjQUFjLEdBQUcsVUFBVSxNQUFnQixFQUFFLElBQVk7SUFDOUQsTUFBTSxRQUFRLEdBQUcsY0FBTSxDQUFDLElBQUksQ0FDM0IsTUFBTSxFQUNOLElBQUksQ0FDSixDQUFDO0lBQ0YsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNkLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0FBQ0YsQ0FBQyxDQUFDO0FBUUYsTUFBTSx1QkFBdUIsR0FBRyxVQUMvQixZQUEwQixFQUMxQixNQUFnQixFQUNoQixJQUFZLEVBQ1osT0FBMEIsRUFDMUIsTUFBMkIsRUFDM0IsVUFBNEI7SUFLNUIsT0FBTyxHQUFHLE9BQU8sSUFBSSxjQUFjLENBQUMsQ0FBQztJQUNyQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakMsTUFBTSxlQUFlLEdBQUcsSUFBQSwyQ0FBaUMsRUFDeEQsSUFBSSxFQUNKLE9BQU8sQ0FDUCxDQUFDO0lBRUYsTUFBTSxvQkFBb0IsR0FBRyxlQUFlLENBQzNDLE9BQTJCLEVBQzNCLHVCQUFlLEVBQ2YscUJBQXFCLENBQ3JCLENBQUM7SUFFRixJQUFJLE1BQU0sWUFBWSxRQUFRLEVBQUUsQ0FBQztRQUNoQyxNQUFNLEdBQUc7WUFDUix1QkFBdUIsRUFBRyxNQUF3QztTQUNsRSxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBRTFCLE1BQU0sS0FBSyxHQUFHLENBQ2IsSUFBQSxTQUFHLEVBQ0YsT0FBTyxFQUNQLFdBQVcsQ0FDWDtRQUNELENBQUMsT0FBTyxPQUFPLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUN2QyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBTzlDLElBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxFQUFHLENBQUM7UUFDM0IsSUFBQSw0REFBd0IsRUFDdkIsSUFBSSxFQUNKLE9BQU8sQ0FDUCxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLElBQUksY0FBYyxDQUNoQyxZQUFZLEVBQ1osTUFBTSxFQUNOLElBQUksRUFDSixvQkFBb0IsRUFDcEIsS0FBSyxFQUNMLE1BQU0sRUFDTixVQUFVLENBSWMsQ0FBQztJQUMxQixPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUMsQ0FBQztBQVFGLE1BQU0sd0JBQXdCLEdBQUcsVUFDaEMsWUFBMEIsRUFDMUIsTUFBZ0IsRUFDaEIsSUFBWSxFQUNaLE1BQXVCLEVBQ3ZCLE1BQTBCO0lBRzFCLE1BQU0sTUFBTSxHQUFHLHVCQUF1QixDQUNyQyxZQUFZLEVBQ1osTUFBTSxFQUNOLElBQUksRUFDSixTQUFTLEVBQ1QsTUFBTSxFQUNOLE1BQU0sQ0FDTixDQUFDO0lBQ0YsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDLENBQUM7QUFTSyxNQUFNLE1BQU0sR0FBRyxVQUVyQixRQUFrQixFQUNsQixjQUFnRCxFQUNoRCx3QkFBMkQsRUFDM0QsTUFBZTtJQUdmLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUM3RSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2IsQ0FBQztJQUdELElBQUksT0FBTyxjQUFjLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDMUMsTUFBTSxFQUFFLEdBQUcsY0FBYyxDQUFDO1FBQzFCLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2IsY0FBYyxDQUNiLFFBQVEsRUFDUixFQUFFLENBQUMsSUFBSSxDQUNQLENBQUM7WUFDRixNQUFNLFlBQVksR0FBRyxjQUFNLENBQUMsSUFBSSxDQUMvQixJQUFJLEVBQ0osUUFBUSxFQUNSLEVBQUUsQ0FBQyxJQUFJLEVBQ1AsRUFBRSxFQUNGLE1BQU0sQ0FDTixDQUFDO1lBQ0YsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQztRQUdELE1BQU0sSUFBSSx5QkFBeUIsQ0FBQztJQUNyQyxDQUFDO0lBR0QsSUFBSSxPQUFPLGNBQWMsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUN4QyxNQUFNLElBQUkscUJBQXFCLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBQ0QsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRTlCLElBQUksT0FBcUMsQ0FBQztJQUMxQyxJQUFJLE9BQU8sd0JBQXdCLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDcEQsT0FBTyxHQUFHLHdCQUE0QyxDQUFDO0lBQ3hELENBQUM7U0FBTSxJQUFJLE9BQU8sd0JBQXdCLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDekQsTUFBTSxHQUFHLHdCQUE4QyxDQUFDO0lBQ3pELENBQUM7SUFFRCxNQUFNLEVBQ0wsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQ3BCLEdBQUcsd0JBQXdCLENBQzNCLFFBQVEsRUFDUixjQUFjLENBQ2QsQ0FBQztJQUdGLElBQUksTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEIsTUFBTSxJQUFJLHFCQUFxQixDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLHVCQUF1QixDQUNyQyxJQUFvQixFQUNwQixNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxNQUE0QixDQUM1QixDQUFDO0lBQ0YsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDLENBQUM7QUFuRVcsUUFBQSxNQUFNLFVBbUVqQjtBQUVLLE1BQU0sSUFBSSxHQUFHLFVBRW5CLFFBQWtCLEVBQ2xCLFFBQWdCLEVBQ2hCLE1BQXdCLEVBQ3hCLE1BQWU7SUFNZixJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sSUFBSSx5QkFBeUIsQ0FBQztJQUNyQyxDQUFDO0lBRUQsSUFBSSxPQUFPLE1BQU0sS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUNsQyxNQUFNLElBQUksMEJBQTBCLENBQUM7SUFDdEMsQ0FBQztJQUtELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0lBQzdDLElBQ0MsWUFBWSxLQUFLLGVBQWU7UUFDaEMsWUFBWSxLQUFLLG1CQUFtQjtRQUNwQyxZQUFZLEtBQUssd0JBQXdCLEVBQ3hDLENBQUM7UUFDRixNQUFNLEdBQUcsR0FBRyxHQUFHLFFBQVEsMENBQTBDO1lBQ2hFLG1EQUFtRCxDQUFDO1FBQ3JELE1BQU0sSUFBSSwwQkFBMEIsQ0FBRSxHQUFHLENBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRUQsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sS0FBSyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQzdFLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDYixDQUFDO0lBS0QsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXhCLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsd0JBQXdCLENBQ2hELFFBQVEsRUFDUixRQUFRLENBQ1IsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUFHLHdCQUF3QixDQUMxQyxJQUFvQixFQUNwQixNQUFNLEVBQ04sSUFBSSxFQUNKLE1BQU0sRUFDTixNQUE0QixDQUM1QixDQUFDO0lBQ0YsT0FBTyxVQUFVLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBdkRXLFFBQUEsSUFBSSxRQXVEZjtBQUVLLE1BQU0sTUFBTSxHQUFHLFVBRXJCLGNBQXNCO0lBR3RCLElBQUksT0FBTyxjQUFjLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDeEMsTUFBTSxJQUFJLHFCQUFxQixDQUFDLHlDQUF5QyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUIsTUFBTSxJQUFJLHFCQUFxQixDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRS9DLE1BQU0sQ0FBRSxJQUFJLENBQUUsR0FBRyxLQUFLLENBQUM7SUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQTBCLENBQUM7SUFDckQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFJRCxNQUFNLE1BQU0sR0FBRyxjQUFNLENBQUMsSUFBSSxDQUN6QixJQUFJLENBQUMsUUFBb0IsRUFDekIsY0FBYyxDQUNkLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUVmLENBQUMsQ0FBQztBQWxDVyxRQUFBLE1BQU0sVUFrQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENvbnN0cnVjdGlvbiBQaXBlbGluZSAoaGlnaC1sZXZlbCBmbG93KTpcbiAqXG4gKiAgIGRlZmluZShUeXBlTmFtZSwgY3RvcikgIOKGkiAgbmV3IFR5cGVEZXNjcmlwdG9yKCkgIOKGkiAgbmV3IFR5cGVQcm94eSgpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnN0YW5jZUNyZWF0b3IodHlwZSwgcGFyZW50LCBhcmdzKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWtlSW5zdGFuY2VNb2RpZmljYXRvcihzZWxmKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RpZmljYXRpb25Db25zdHJ1Y3Rvci5jYWxsKHBhcmVudCwgTW9kaWZpY2F0b3JUeXBlLCBwcm90bywgX2FkZFByb3BzKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilrxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyIGNvbnN0cnVjdG9yIHJ1bnMgKG5ldyBNb2RpZmljYXRvclR5cGUoLi4uYXJncykpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQcm9jZXNzaW5nKCkg4oaSIGludm9rZVBvc3RIb29rcygpXG4gKi9cblxuaW1wb3J0IHtcblx0X0ludGVybmFsX1RDXyxcblx0VHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0VHlwZUNsYXNzLFxuXHRUeXBlRGVmLFxuXHRDb2xsZWN0aW9uRGVmLFxuXHRjb25zdHJ1Y3Rvck9wdGlvbnMsXG5cdFR5cGVBYnNvcmJlcixcblx0TW9kaWZpY2F0aW9uQ29uc3RydWN0b3JGYWN0b3J5LFxuXHRNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHREZWZpbmVOZXdhYmxlLFxuXHRMYXp5RGVmLFxufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGhvcCB9IGZyb20gJy4uLy4uL3V0aWxzL2hvcCc7XG5cbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5jb25zdCB7XG5cdG9kcCxcblx0U3ltYm9sUGFyZW50VHlwZSxcblx0U3ltYm9sQ29uc3RydWN0b3JOYW1lLFxuXHRTeW1ib2xDb25maWcsXG5cblx0VFlQRV9USVRMRV9QUkVGSVgsXG5cdE1ORU1PU1lORSxcblxufSA9IGNvbnN0YW50cztcblxuaW1wb3J0IHsgRXJyb3JzVHlwZXMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycy9lcnJvcnMnO1xuLy8gaW1wb3J0IHsgZGVzY3JpcHRvcnMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycyc7XG5cbmltcG9ydCBtbmVtb3N5bmVzIGZyb20gJy4vTW5lbW9zeW5lJztcbmNvbnN0IHsgZ2V0RGVmYXVsdFByb3RvdHlwZSB9ID0gbW5lbW9zeW5lcztcblxuY29uc3Qge1xuXHRBTFJFQURZX0RFQ0xBUkVELFxuXHRXUk9OR19UWVBFX0RFRklOSVRJT04sXG5cdFdST05HX01PRElGSUNBVElPTl9QQVRURVJOLFxuXHRUWVBFTkFNRV9NVVNUX0JFX0FfU1RSSU5HLFxuXHRIQU5ETEVSX01VU1RfQkVfQV9GVU5DVElPTixcblx0T1BUSU9OU19FUlJPUixcbn0gPSBFcnJvcnNUeXBlcztcblxuLy8gaW52b2tlSG9va1xuLy8gcmVnaXN0ZXJIb29rXG4vLyByZWdpc3RlckZsb3dDaGVja2VyXG5pbXBvcnQgKiBhcyBob29rc0FwaSBmcm9tICcuLi9ob29rcyc7XG5pbXBvcnQgeyBUeXBlUHJveHkgfSBmcm9tICcuL1R5cGVQcm94eSc7XG5cbmltcG9ydCBjb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHksIHtcblx0Y2xhc3NpZnlDb25zdHJ1Y3RIYW5kbGVyLFxuXHRpc0NhbGxhYmxlQ2FuZGlkYXRlLFxuXHRDb25zdHJ1Y3RIYW5kbGVyXG59IGZyb20gJy4vY29tcGlsZU5ld01vZGlmaWNhdG9yRnVuY3Rpb25Cb2R5JztcblxuaW1wb3J0IHtcblx0c2V0TGF6eURlZmluaXRpb24sXG5cdExhenlEZWZpbml0aW9uQ2VsbCxcbn0gZnJvbSAnLi9sYXp5RGVmaW5pdGlvbic7XG5cbmltcG9ydCBUeXBlc1V0aWxzLCB7IENyZWF0aW9uSGFuZGxlciB9IGZyb20gJy4uL3V0aWxzJztcbmNvbnN0IHtcblx0Z2V0Q2FjaGVkVHlwZUNoZWNrZXIsXG5cdGdldFR5cGVTcGxpdFBhdGgsXG5cdGNoZWNrVHlwZU5hbWUsXG5cdGlzQ2xhc3MsXG59ID0gVHlwZXNVdGlscztcblxuaW1wb3J0IHtcblx0Z2V0U3RhY2ssXG5cdFN0YWNrYWJsZUluc3RhbmNlLFxufSBmcm9tICcuLi9lcnJvcnMnO1xuXG5leHBvcnQgdHlwZSBUeXBlc01hcCA9IE1hcDxzdHJpbmcsIG9iamVjdD4gJiB7XG5cdFtTeW1ib2xQYXJlbnRUeXBlXT86IFR5cGVEZWY7XG5cdFtNTkVNT1NZTkVdPzogQ29sbGVjdGlvbkRlZjtcbn07XG5cbi8vIExhenkgdHlwZSBmYWNhZGVzLlxuLy8gQSBsYXp5IHR5cGUgaXMgYSByZWd1bGFyIGRlZmluZSB3aG9zZSBoYW5kbGVyIGlzIHRoZSBlbXB0eSBzaGltOyB0aGUgcmVhbFxuLy8gY29uc3RydWN0b3IgaXMgZ2F0aGVyZWQgZnJvbSB0aGUgY2FsbGJhY2sgb25jZSBwZXIgY29uc3RydWN0aW9uIChzZWVcbi8vIGxhenlEZWZpbml0aW9uLnRzKS4gVGhlIHR5cGUncyBwcm90byAvIGNvbmZpZyAvIGNvbnN0cnVjdEhhbmRsZXIgcmVhZCB0aGVcbi8vIGdhdGhlciBjZWxsLCBzbyB0aGUgc2FtZSB0eXBlIG9iamVjdCBzZXJ2ZXMgZXZlcnkgY29uc3RydWN0aW9uIHdpdGhvdXRcbi8vIGV2ZXIgY2FsbGluZyB0aGUgY2FsbGJhY2sgYXQgZGVmaW5lIHRpbWUuXG5jb25zdCBpbnN0YWxsTGF6eURlZmluaXRpb24gPSBmdW5jdGlvbiAoXG5cdHR5cGU6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsXG5cdFR5cGVOYW1lOiBzdHJpbmcsXG5cdHNoaW1Db25zdHJ1Y3RIYW5kbGVyOiBNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdHNoaW1Qcm90bzogeyBbaW5kZXg6IHN0cmluZ106IHVua25vd24gfSxcblx0bWVyZ2VkQ29uZmlnOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRnZXR0ZXI6IExhenlEZWY8b2JqZWN0PlxuKSB7XG5cblx0Ly8gb3V0c2lkZSBhbnkgY29uc3RydWN0aW9uIHRoZSBjZWxsIGhvbGRzIHRoZSBkZWZpbmUtdGltZSBmYWxsYmFjazpcblx0Ly8gbm8gaGFuZGxlciwgdGhlIHNoaW0ncyBlbXB0eSBwcm90b3R5cGUsIGFzQ2xhc3Mgb2ZmLCBubyBmYWlsdXJlXG5cdGNvbnN0IGNlbGw6IExhenlEZWZpbml0aW9uQ2VsbCA9IHtcblx0XHRoYW5kbGVyIDogdW5kZWZpbmVkLFxuXHRcdGFzQ2xhc3MgOiBmYWxzZSxcblx0XHRwcm90byAgIDogc2hpbVByb3RvLFxuXHRcdGZhaWxlZCAgOiBmYWxzZSxcblx0XHRlcnJvciAgIDogdW5kZWZpbmVkXG5cdH07XG5cblx0Ly8gYmFjayB0byB0aGUgZGVmaW5lLXRpbWUgc3RhdGU6IG5vIGhhbmRsZXIgcmV0YWluZWQsIHRoZSBzaGltJ3MgZW1wdHlcblx0Ly8gcHJvdG90eXBlLCBhc0NsYXNzIG9mZiwgbm8gZXJyb3Jcblx0Y29uc3QgcmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Y2VsbC5oYW5kbGVyID0gdW5kZWZpbmVkO1xuXHRcdGNlbGwuYXNDbGFzcyA9IGZhbHNlO1xuXHRcdGNlbGwucHJvdG8gPSBzaGltUHJvdG87XG5cdFx0Y2VsbC5mYWlsZWQgPSBmYWxzZTtcblx0XHRjZWxsLmVycm9yID0gdW5kZWZpbmVkO1xuXHR9O1xuXG5cdC8vIHRoZSBzaW5nbGUgY2FsbGJhY2sgY2FsbCBwZXIgY29uc3RydWN0aW9uIOKAlCBpbnZva2VkIE9OTFkgYnlcblx0Ly8gZ2F0aGVyTGF6eURlZmluaXRpb24gYXQgdGhlIGNvbnN0cnVjdGlvbiBlbnRyaWVzXG5cdGNvbnN0IGdhdGhlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXNldCgpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBnYXRoZXJlZCA9IGdldHRlcigpO1xuXHRcdFx0aWYgKCFpc0NhbGxhYmxlQ2FuZGlkYXRlKGdhdGhlcmVkKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgSEFORExFUl9NVVNUX0JFX0FfRlVOQ1RJT047XG5cdFx0XHR9XG5cdFx0XHQvLyB0aGUgc2hhcGUgY2hlY2tzIGFyZSB3aGF0IG1ha2UgaXQgYSBDb25zdHJ1Y3RIYW5kbGVyXG5cdFx0XHRjbGFzc2lmeUNvbnN0cnVjdEhhbmRsZXIoXG5cdFx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0XHRnYXRoZXJlZFxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGhhbmRsZXIgPSBnYXRoZXJlZDtcblx0XHRcdGNlbGwuaGFuZGxlciA9IGhhbmRsZXI7XG5cdFx0XHRjZWxsLmFzQ2xhc3MgPSBpc0NsYXNzKGhhbmRsZXIpO1xuXHRcdFx0Ly8gc2FtZSBmYWxsYmFjayBhcyB0aGUgZGlyZWN0IHBhdGg6IGFuIG93biBOT04tT0JKRUNUIHByb3RvdHlwZVxuXHRcdFx0Ly8gKHByb3RvdHlwZSA9IDEyMykgaXMgcmVwbGFjZWQgYnkgdGhlIGRlZmF1bHRcblx0XHRcdGNlbGwucHJvdG8gPSAoXG5cdFx0XHRcdGhvcChcblx0XHRcdFx0XHRoYW5kbGVyLFxuXHRcdFx0XHRcdCdwcm90b3R5cGUnXG5cdFx0XHRcdCkgJiZcblx0XHRcdFx0KHR5cGVvZiBoYW5kbGVyLnByb3RvdHlwZSA9PT0gJ29iamVjdCcpXG5cdFx0XHQpID8gaGFuZGxlci5wcm90b3R5cGUgOiBnZXREZWZhdWx0UHJvdG90eXBlKCk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdC8vIHBhc3N0aHJvdWdoLCBleGFjdGx5IGxpa2UgcnVuQnVpbGQncyBjYXRjaDogd2hhdGV2ZXIgdGhlXG5cdFx0XHQvLyBjYWxsYmFjayB0aHJldyByZWFjaGVzIHRocm93TW9kaWZpY2F0aW9uRXJyb3IgYXMtaXMgKGEgdGhyb3duXG5cdFx0XHQvLyBub24tRXJyb3IgYnJlYWtzIHRoZSBwcm90b3R5cGUgc3BsaWNlIHRoZXJlIHRoZSBzYW1lIHdheSBpdFxuXHRcdFx0Ly8gZG9lcyBmb3IgYSBjb25zdHJ1Y3RvciBib2R5KS4gVGhlIGZsYWcgaXMgc2VwYXJhdGUgZnJvbSB0aGVcblx0XHRcdC8vIHZhbHVlOiBhIGNhbGxiYWNrIG1heSB0aHJvdyB1bmRlZmluZWRcblx0XHRcdGNlbGwuZmFpbGVkID0gdHJ1ZTtcblx0XHRcdGNlbGwuZXJyb3IgPSBlcnJvcjtcblx0XHR9XG5cdH07XG5cblx0Ly8ga2V5ZWQgYnkgdGhlIHR5cGUgZGVzY3JpcHRvciBoZXJlOyBUeXBlUHJveHkgcmVnaXN0ZXJzIGl0cyBwcm94eVxuXHQvLyBhZ2FpbnN0IHRoZSBzYW1lIGRlZmluaXRpb24gd2hlbiBpdCB3cmFwcyB0aGlzIHR5cGVcblx0c2V0TGF6eURlZmluaXRpb24oXG5cdFx0dHlwZSxcblx0XHR7XG5cdFx0XHRjZWxsLFxuXHRcdFx0Ly8gdGhlIG1lcmdlZCBjb25maWcgdmFsdWUgYXQgZGVmaW5lIHRpbWUg4oCUIHRoZSBjYWxsYmFjayBtdXN0XG5cdFx0XHQvLyBub3QgcnVuIHdoZW4gdGhlIGNvbnN0cnVjdGlvbiB3aWxsIGJlIGJsb2NrZWRcblx0XHRcdGJsb2NrRXJyb3JzIDogbWVyZ2VkQ29uZmlnLmJsb2NrRXJyb3JzICE9PSBmYWxzZSxcblx0XHRcdGdhdGhlcixcblx0XHRcdHJlc2V0XG5cdFx0fVxuXHQpO1xuXG5cdC8vIHplcm8tYXJnIGZhY3RvcnksIHRoZSBzYW1lIGNvbnRyYWN0IGFzIGEgZGlyZWN0IHR5cGUnc1xuXHQvLyBjb25zdHJ1Y3RIYW5kbGVyOiBidWlsZHMgdGhlIHdyYXBwZXIgZnJvbSB0aGUgZ2F0aGVyZWQgaGFuZGxlcixcblx0Ly8gcmVidWlsdCBvbiBldmVyeSBjb25zdHJ1Y3Rpb24gKHRoZSBjYWxsYmFjayBtYXkgcmV0dXJuIGEgbmV3IGZ1bmN0aW9uXG5cdC8vIGVhY2ggdGltZSk7IGJlZm9yZSB0aGUgZ2F0aGVyIOKAlCBhbmQgYWZ0ZXIgYSBmYWlsZWQgb25lIOKAlCBpdCBidWlsZHNcblx0Ly8gdGhlIHNoaW0ncyB3cmFwcGVyLCB3aGljaCB0aGUgZXJyb3IgcGF0aCB0aGVuIHJlcGxhY2VzXG5cdGNvbnN0IGxhenlDb25zdHJ1Y3RIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmIChjZWxsLmhhbmRsZXIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3Qgc2hpbVJlc3VsdCA9IHNoaW1Db25zdHJ1Y3RIYW5kbGVyKCk7XG5cdFx0XHRyZXR1cm4gc2hpbVJlc3VsdDtcblx0XHR9XG5cdFx0Y29uc3QgeyBoYW5kbGVyIH0gPSBjZWxsO1xuXHRcdGNvbnN0IG1vZGlmaWNhdG9yQm9keSA9IGNvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keShcblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0Y2VsbC5hc0NsYXNzXG5cdFx0KTtcblx0XHRjb25zdCB3cmFwcGVkQm9keSA9IG1vZGlmaWNhdG9yQm9keShcblx0XHRcdGhhbmRsZXIsXG5cdFx0XHRDcmVhdGlvbkhhbmRsZXIsXG5cdFx0XHRTeW1ib2xDb25zdHJ1Y3Rvck5hbWVcblx0XHQpO1xuXHRcdGNvbnN0IGhhbmRsZXJSZXN1bHQgPSB3cmFwcGVkQm9keSgpO1xuXHRcdHJldHVybiBoYW5kbGVyUmVzdWx0O1xuXHR9O1xuXG5cdG9kcChcblx0XHR0eXBlLFxuXHRcdCdjb25zdHJ1Y3RIYW5kbGVyJywge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGxhenlDb25zdHJ1Y3RIYW5kbGVyO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGUgICA6IHRydWUsXG5cdFx0XHRjb25maWd1cmFibGUgOiB0cnVlXG5cdFx0fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0eXBlLFxuXHRcdCdwcm90bycsIHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGNlbGwucHJvdG87XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZSAgIDogdHJ1ZSxcblx0XHRcdGNvbmZpZ3VyYWJsZSA6IHRydWVcblx0XHR9XG5cdCk7XG5cblx0Ly8gYSBmcmVzaCBjb3B5IHBlciByZWFkOiBhc0NsYXNzIGlzIHBlci1jb25zdHJ1Y3Rpb24gYW5kIG11c3QgbmV2ZXJcblx0Ly8gbGVhayBpbnRvIHRoZSBzaGFyZWQgbWVyZ2VkIGNvbmZpZ1xuXHRvZHAoXG5cdFx0dHlwZSxcblx0XHQnY29uZmlnJywge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdFx0XHR7fSxcblx0XHRcdFx0XHRtZXJnZWRDb25maWcsXG5cdFx0XHRcdFx0eyBhc0NsYXNzIDogY2VsbC5hc0NsYXNzIH1cblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlICAgOiB0cnVlLFxuXHRcdFx0Y29uZmlndXJhYmxlIDogdHJ1ZVxuXHRcdH1cblx0KTtcblxufTtcblxuY29uc3QgdHlwZURlc2NyaXB0b3JDcmVhdG9yID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRkZWZpbmVPcmlnaW46IFR5cGVBYnNvcmJlcixcblx0dHlwZXM6IFR5cGVzTWFwLFxuXHRUeXBlTmFtZTogc3RyaW5nLFxuXHRjb25zdHJ1Y3RIYW5kbGVyOiBNbmVtb25pY2FDb25zdHJ1Y3RvckZhY3RvcnksXG5cdHByb3RvOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9LFxuXHRjb25maWc6IHsgW2luZGV4OiBzdHJpbmddOiB1bmtub3duIH0sXG5cdGxhenlHZXR0ZXI/OiBMYXp5RGVmPG9iamVjdD4sXG4pIHtcblxuXHQvLyBoZXJlIFwidHlwZXNcIiByZWZlcnMgdG8gc3VidHlwZXMgb2YgdHlwZSBvciBjb2xsZWN0aW9uIG9iamVjdCB7fVxuXG5cdGNvbnN0IHBhcmVudFR5cGUgPSB0eXBlc1sgU3ltYm9sUGFyZW50VHlwZSBdIHx8IG51bGw7XG5cblx0Y29uc3QgaXNTdWJUeXBlID0gcGFyZW50VHlwZSA/IHRydWUgOiBmYWxzZTtcblxuXHRjb25zdCBjb2xsZWN0aW9uID0gaXNTdWJUeXBlXG5cdFx0PyAocGFyZW50VHlwZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuY29sbGVjdGlvbiBhcyBvYmplY3Rcblx0XHQ6IHR5cGVzWyBNTkVNT1NZTkUgXTtcblxuXHRpZiAodHlwZXMuaGFzKFR5cGVOYW1lKSkge1xuXHRcdHRocm93IG5ldyBBTFJFQURZX0RFQ0xBUkVEKFR5cGVOYW1lKTtcblx0fVxuXG5cdC8vIGNvbnN0IHN1YnR5cGVzID0gZGVzY3JpcHRvcnMuY3JlYXRlVHlwZXNDb2xsZWN0aW9uKCk7XG5cdGNvbnN0IHN1YnR5cGVzID0gbmV3IE1hcDxzdHJpbmcsIG9iamVjdD4oKTtcblxuXHRjb25zdCB0aXRsZSA9IGAke1RZUEVfVElUTEVfUFJFRklYfSR7VHlwZU5hbWV9YDtcblxuXHQvLyAnbmFtZScgaXMgYSBDT0xMRUNUSU9OIG9wdGlvbiBvbmx5OiBhIHVzZXIgcGFzc2luZyBpdCBoZXJlIG1lYW50IHRvXG5cdC8vIG5hbWUgdGhlIGNvbGxlY3Rpb24sIG5vdCB0aGUgdHlwZSDigJQgc2F5IHNvIHJlYWRhYmx5XG5cdGlmICggY29uZmlnICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGNvbmZpZyA9PT0gJ29iamVjdCcgJiYgJ25hbWUnIGluIGNvbmZpZyApIHtcblx0XHRjb25zdCBuYW1lRXJyb3IgPSAnXFxcIm5hbWVcXFwiIGlzIGEgY29sbGVjdGlvbiBvcHRpb24gJyArXG5cdFx0XHQnKGNyZWF0ZVR5cGVzQ29sbGVjdGlvbih7IG5hbWUgfSkpIOKAlCBpdCBjYW5ub3QgYmUgc2V0IG9uIGEgdHlwZSc7XG5cdFx0dGhyb3cgbmV3IE9QVElPTlNfRVJST1IoIG5hbWVFcnJvciApO1xuXHR9XG5cdGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oXG5cdFx0e30sXG5cdFx0KGNvbGxlY3Rpb24gYXMgUmVjb3JkPHN5bWJvbCwgdW5rbm93bj4pWyBTeW1ib2xDb25maWcgXSxcblx0XHRjb25maWdcblx0KTtcblx0Ly8gbmV2ZXIgaW5oZXJpdGVkIGludG8gdGhlIHR5cGUncyBjb25maWcgZWl0aGVyXG5cdFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoIGNvbmZpZywgJ25hbWUnICk7XG5cblx0Y29uc3QgdHlwZSA9IE9iamVjdC5hc3NpZ24oXG5cdFx0dGhpcyxcblx0XHR7XG5cblx0XHRcdGdldCBjb25zdHJ1Y3RIYW5kbGVyICgpIHtcblx0XHRcdFx0cmV0dXJuIGNvbnN0cnVjdEhhbmRsZXI7XG5cdFx0XHR9LFxuXG5cblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0cHJvdG8sXG5cblx0XHRcdGlzU3ViVHlwZSxcblx0XHRcdHN1YnR5cGVzLFxuXHRcdFx0cGFyZW50VHlwZSxcblxuXHRcdFx0Y29sbGVjdGlvbixcblxuXHRcdFx0dGl0bGUsXG5cblx0XHRcdGNvbmZpZyxcblxuXHRcdFx0aG9va3MgOiBPYmplY3QuY3JlYXRlKG51bGwpXG5cblx0XHR9XG5cdCk7XG5cblx0Z2V0U3RhY2suY2FsbChcblx0XHR0aGlzIGFzIFN0YWNrYWJsZUluc3RhbmNlLFxuXHRcdGBEZWZpbml0aW9uIG9mIFsgJHtUeXBlTmFtZX0gXSBtYWRlIGF0OmAsXG5cdFx0W10sXG5cdFx0ZGVmaW5lT3JpZ2luXG5cdCk7XG5cblx0Ly8gbGF6eSB0eXBlczogcHJvdG8gLyBjb25maWcgLyBjb25zdHJ1Y3RIYW5kbGVyIGJlY29tZSBmYWNhZGVzIG92ZXIgdGhlXG5cdC8vIHBlci1jb25zdHJ1Y3Rpb24gZ2F0aGVyIGNlbGwg4oCUIHNlZSBpbnN0YWxsTGF6eURlZmluaXRpb24gYWJvdmUgYW5kXG5cdC8vIGxhenlEZWZpbml0aW9uLnRzXG5cdGlmIChsYXp5R2V0dGVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRpbnN0YWxsTGF6eURlZmluaXRpb24oXG5cdFx0XHR0eXBlLFxuXHRcdFx0VHlwZU5hbWUsXG5cdFx0XHRjb25zdHJ1Y3RIYW5kbGVyLFxuXHRcdFx0cHJvdG8sXG5cdFx0XHRjb25maWcsXG5cdFx0XHRsYXp5R2V0dGVyXG5cdFx0KTtcblx0fVxuXG5cdG9kcChcblx0XHRzdWJ0eXBlcyxcblx0XHRTeW1ib2xQYXJlbnRUeXBlLCB7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gdHlwZTtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Ly8gY29uc3QgYW5jZXN0b3IgPSBpc1N1YlR5cGUgPyBPYmplY3QuY3JlYXRlKG51bGwpIDogcHJvdG87XG5cdC8vIGEgbGF6eSByb290J3MgYW5jZXN0b3IgaXMgbm90IGtub3duIGF0IGRlZmluZSB0aW1lIGVpdGhlcjogVHlwZVByb3h5XG5cdC8vIGluc3RhbGxzIGEgZmFjYWRlIG92ZXIgdGhlIGdhdGhlciBjZWxsIHdoZW4gaXQgcmVjZWl2ZXMgdW5kZWZpbmVkIGZvclxuXHQvLyBhIG5vbi1zdWJ0eXBlIGhlcmVcblx0Y29uc3QgYW5jZXN0b3IgPSAoaXNTdWJUeXBlIHx8IGxhenlHZXR0ZXIgIT09IHVuZGVmaW5lZCkgPyB1bmRlZmluZWQgOiBwcm90bztcblx0dHlwZXMuc2V0KFxuXHRcdFR5cGVOYW1lLFxuXHRcdG5ldyBUeXBlUHJveHkoXG5cdFx0XHR0eXBlLFxuXHRcdFx0YW5jZXN0b3Jcblx0XHQpXG5cdCk7XG5cblx0Ly8gdHlwZXMuc2V0KCBUeXBlTmFtZSwgbmV3IFR5cGVQcm94eSggdHlwZSApICk7XG5cblx0Y29uc3QgcmVzdWx0ID0gdHlwZXMuZ2V0KFR5cGVOYW1lKTtcblx0cmV0dXJuIHJlc3VsdDtcblxufTtcblxuLy8gdGhlIGNyZWF0b3IgaXMgb25seSBldmVyIGludm9rZWQgd2l0aCBgbmV3YCAodGhlIGNyZWF0ZUZyb20qIGNhbGwgc2l0ZXNcbi8vIGJlbG93KTsgYSBmdW5jdGlvbiBleHByZXNzaW9uIGNhcnJpZXMgbm8gY29uc3RydWN0IHNpZ25hdHVyZSwgc28gaXQgaXNcbi8vIG5hbWVkIG9uY2UgYXMgdGhlIGNvbnN0cnVjdG9yIGludGVyZmFjZSBpdCBpcyB1c2VkIHRocm91Z2gg4oCUIHRoZVxuLy8gcHJvdG90eXBlIGNvbnRyYWN0IGlzIGF0dGFjaGVkIGltbWVkaWF0ZWx5IGJlbG93XG5jb25zdCBUeXBlRGVzY3JpcHRvciA9IHR5cGVEZXNjcmlwdG9yQ3JlYXRvciBhcyBfSW50ZXJuYWxfVENfPFR5cGVEZXNjcmlwdG9ySW5zdGFuY2U+O1xuXG5PYmplY3QuYXNzaWduKFxuXHRUeXBlRGVzY3JpcHRvci5wcm90b3R5cGUsXG5cdGhvb2tzQXBpXG4pO1xuXG5UeXBlRGVzY3JpcHRvci5wcm90b3R5cGUuZGVmaW5lID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBUeXBlRGVzY3JpcHRvckluc3RhbmNlLFxuXHRUeXBlT3JUeXBlTmFtZTogc3RyaW5nIHwgRGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUsXG5cdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZz86IERlZmluZU5ld2FibGVPckNhbGxhYmxlIHwgb2JqZWN0LFxuXHRjb25maWc/OiBvYmplY3Rcbikge1xuXHRjb25zdCByZXN1bHQgPSBkZWZpbmUuY2FsbChcblx0XHRkZWZpbmUsXG5cdFx0dGhpcy5zdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRUeXBlT3JUeXBlTmFtZSxcblx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcsXG5cdFx0Y29uZmlnXG5cdCk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5UeXBlRGVzY3JpcHRvci5wcm90b3R5cGUubGF6eSA9IGZ1bmN0aW9uIChcblx0dGhpczogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSxcblx0VHlwZU5hbWU6IHN0cmluZyxcblx0Z2V0dGVyPzogTGF6eURlZjxvYmplY3Q+LFxuXHRjb25maWc/OiBvYmplY3Rcbikge1xuXHRjb25zdCByZXN1bHQgPSBsYXp5LmNhbGwoXG5cdFx0dGhpcyxcblx0XHR0aGlzLnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFR5cGVOYW1lLFxuXHRcdGdldHRlcixcblx0XHRjb25maWdcblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cblR5cGVEZXNjcmlwdG9yLnByb3RvdHlwZS5sb29rdXAgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UsXG5cdFR5cGVOZXN0ZWRQYXRoOiBzdHJpbmdcbikge1xuXHQvLyByZWxhdGl2ZSBmaXJzdDogcmVzb2x2ZSBhbW9uZyB0aGlzIHR5cGUncyBvd24gc3VidHlwZXMsXG5cdC8vIGUuZy4gQWRtaW5UeXBlLmxvb2t1cCgnU3ViVHlwZScpIG9yICdTdWJUeXBlLkRlZXBTdWJUeXBlJ1xuXHRjb25zdCByZWxhdGl2ZVJlc3VsdCA9IGxvb2t1cC5jYWxsKFxuXHRcdHRoaXMuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0VHlwZU5lc3RlZFBhdGhcblx0KTtcblx0aWYgKHJlbGF0aXZlUmVzdWx0KSB7XG5cdFx0cmV0dXJuIHJlbGF0aXZlUmVzdWx0O1xuXHR9XG5cdC8vIHJvb3QgZmFsbGJhY2s6IHJlc29sdmUgYWJzb2x1dGUgcmVnaXN0cnkgcGF0aHMgZnJvbSB0aGVcblx0Ly8gY29sbGVjdGlvbiwgZS5nLiBBZG1pblR5cGUubG9va3VwKCdVc2VyVHlwZS5BZG1pblR5cGUnKSxcblx0Ly8gd2hpY2ggaXMgd2hhdCB0aGUgVHlwZUxvb2t1cDxSZWdpc3RyeT4gdHlwZSBjb250cmFjdCBwcm9taXNlc1xuXHRjb25zdCBjb2xsZWN0aW9uID0gdGhpcy5jb2xsZWN0aW9uIGFzIENvbGxlY3Rpb25EZWY7XG5cdC8vIENvbGxlY3Rpb25EZWYubG9va3VwIGlzIHRoZSBydW50aW1lIGNvbnRyYWN0IChDb2xsZWN0aW9uTG9va3VwKSwgc28gYVxuXHQvLyBwbGFpbiBzdHJpbmcgcGF0aCB5aWVsZHMgVHlwZUNsYXNzIHwgdW5kZWZpbmVkIHdpdGggbm8gY2FzdFxuXHRjb25zdCByb290UmVzdWx0ID0gY29sbGVjdGlvbi5sb29rdXAoVHlwZU5lc3RlZFBhdGgpO1xuXHRyZXR1cm4gcm9vdFJlc3VsdDtcbn07XG5cbi8vIHByb3RvdHlwZS1sZXZlbCBnZXR0ZXIgKG5vdCBhIHBsYWluIG1ldGhvZCkgc28gdGhhdCBib3RoIGNhbGxcbi8vIGZvcm1zIGtlZXAgd29ya2luZzogdHlwZS5kZWNvcmF0ZShvcHRpb25zKSBhbmQgdGhlIGRlc3RydWN0dXJlZFxuLy8gY29uc3QgeyBkZWNvcmF0ZSB9ID0gdHlwZSDigJQgdGhlIGdldHRlciBiaW5kcyB0aGUgY3VycmVudFxuLy8gZGVzY3JpcHRvciBhdCBhY2Nlc3MgdGltZSwgc2FtZSBhcyB0aGUgY29sbGVjdGlvbi1sZXZlbCBkZWNvcmF0ZVxub2RwKFxuXHRUeXBlRGVzY3JpcHRvci5wcm90b3R5cGUsXG5cdCdkZWNvcmF0ZScsIHtcblx0XHRnZXQgKHRoaXM6IFR5cGVEZXNjcmlwdG9ySW5zdGFuY2UpIHtcblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKG9wdGlvbnM/OiBvYmplY3QpIHtcblx0XHRcdFx0Y29uc3QgZGVjb3JhdG9yID0gZnVuY3Rpb24gKGNzdHI6IERlZmluZU5ld2FibGUpIHtcblx0XHRcdFx0XHRjb25zdCB7IG5hbWUgfSA9IGNzdHI7XG5cdFx0XHRcdFx0Ly8gZGVmaW5lKCkgcmV0dXJucyB0aGUgcmVnaXN0ZXJlZCBjb25zdHJ1Y3RvciBpdHNlbGYg4oCUXG5cdFx0XHRcdFx0Ly8gdGhlIGZ1bGwgVHlwZUNsYXNzIGlzIGEgcmljaGVyIGhvbmVzdCB0eXBlIHRoYW4gYW55IGNhc3Rcblx0XHRcdFx0XHRjb25zdCBkZWZpbmVSZXN1bHQgPSBzZWxmLmRlZmluZShcblx0XHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0XHRjc3RyLFxuXHRcdFx0XHRcdFx0b3B0aW9uc1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIGRlZmluZVJlc3VsdDtcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIGRlY29yYXRvcjtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlRGVzY3JpcHRvci5wcm90b3R5cGUsXG5cdFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuXHRcdGdldCAodGhpczogVHlwZURlc2NyaXB0b3JJbnN0YW5jZSkge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZ2V0Q2FjaGVkVHlwZUNoZWNrZXIodGhpcy5UeXBlTmFtZSk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuKTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBQQVRIIFJFU09MVVRJT05cbi8vIFJlc29sdmVzIGEgZG90LXNlcGFyYXRlZCBwYXRoIHRvIHRoZSB0YXJnZXQgdHlwZXMgbWFwIGFuZFxuLy8gdGhlIGZpbmFsIHR5cGUgbmFtZS4gUmVjdXJzZXMgaW50byBwYXJlbnQgc3VidHlwZXMgZm9yXG4vLyBuZXN0ZWQgcGF0aHMgKGUuZy4gJ1BhcmVudC5DaGlsZCcg4oaSIFBhcmVudC5zdWJ0eXBlcyArICdDaGlsZCcpLlxuLy8gUmV0dXJucyB0aGUgcGFyZW50IFR5cGVDbGFzcyB3aGVuIHRoZSBoZWFkIHNlZ21lbnQgcmVzb2x2ZXNcbi8vIHRvIGFuIGV4aXN0aW5nIHR5cGUg4oCUIG5lZWRlZCBmb3IgbGF6eS1nZXR0ZXIgc3VidHlwZSBkZWZpbml0aW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IHJlc29sdmVEZWZpbml0aW9uQ29udGV4dCA9IGZ1bmN0aW9uIChcblx0c3VidHlwZXM6IFR5cGVzTWFwLFxuXHRwYXRoOiBzdHJpbmdcbik6IHtcblx0XHR0YXJnZXQ6IFR5cGVzTWFwO1xuXHRcdG5hbWU6IHN0cmluZztcblx0XHRwYXJlbnQ/OiBUeXBlQ2xhc3M7XG5cdH0ge1xuXHRjb25zdCBzcGxpdCA9IGdldFR5cGVTcGxpdFBhdGgocGF0aCk7XG5cdGNvbnN0IFsgaGVhZCwgLi4ucmVzdCBdID0gc3BsaXQ7XG5cdGNvbnN0IHBhcmVudCA9IGxvb2t1cC5jYWxsKFxuXHRcdHN1YnR5cGVzLFxuXHRcdGhlYWRcblx0KTtcblxuXHRpZiAoIXBhcmVudCkge1xuXHRcdGlmIChyZXN0Lmxlbmd0aCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBXUk9OR19UWVBFX0RFRklOSVRJT04oYHBhcmVudCAke2hlYWR9IGRlZmluaXRpb24gaXMgbm90IHlldCBleGlzdHMhYCk7XG5cdFx0fVxuXHRcdGNvbnN0IG5vUGFyZW50UmVzdWx0ID0geyB0YXJnZXQgOiBzdWJ0eXBlcywgbmFtZSA6IGhlYWQgfTtcblx0XHRyZXR1cm4gbm9QYXJlbnRSZXN1bHQ7XG5cdH1cblxuXHRpZiAocmVzdC5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3QgbmVzdGVkUmVzdWx0ID0gcmVzb2x2ZURlZmluaXRpb25Db250ZXh0KFxuXHRcdFx0cGFyZW50LnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFx0cmVzdC5qb2luKCcuJylcblx0XHQpO1xuXHRcdHJldHVybiBuZXN0ZWRSZXN1bHQ7XG5cdH1cblxuXHRjb25zdCByZXNvbHZlZFJlc3VsdCA9IHsgdGFyZ2V0IDogc3VidHlwZXMsIG5hbWUgOiBoZWFkLCBwYXJlbnQgfTtcblx0cmV0dXJuIHJlc29sdmVkUmVzdWx0O1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBEVVBMSUNBVEUgR1VBUkRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCBjaGVja0R1cGxpY2F0ZSA9IGZ1bmN0aW9uICh0YXJnZXQ6IFR5cGVzTWFwLCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcblx0Y29uc3QgZXhpc3RpbmcgPSBsb29rdXAuY2FsbChcblx0XHR0YXJnZXQsXG5cdFx0bmFtZVxuXHQpO1xuXHRpZiAoZXhpc3RpbmcpIHtcblx0XHR0aHJvdyBuZXcgQUxSRUFEWV9ERUNMQVJFRChuYW1lKTtcblx0fVxufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBDT05TVFJVQ1RJT04gU1RSQVRFR0lFU1xuLy8gVHdvIGJyYW5jaGVzLCBzYW1lIHJldHVybiB0eXBlLCBubyByZWN1cnNpb24uXG4vLyBCb3RoIHJlY2VpdmUgdGhlIHJlc29sdmVkIGNvbnRleHQgYW5kIHJldHVybiBUeXBlRGVzY3JpcHRvci5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCBjcmVhdGVGcm9tRGlyZWN0SGFuZGxlciA9IGZ1bmN0aW9uIChcblx0ZGVmaW5lT3JpZ2luOiBUeXBlQWJzb3JiZXIsXG5cdHRhcmdldDogVHlwZXNNYXAsXG5cdG5hbWU6IHN0cmluZyxcblx0aGFuZGxlcj86IENvbnN0cnVjdEhhbmRsZXIsXG5cdGNvbmZpZz86IGNvbnN0cnVjdG9yT3B0aW9ucyxcblx0bGF6eUdldHRlcj86IExhenlEZWY8b2JqZWN0PlxuKSB7XG5cdC8vIGZvciBhIGxhenkgdHlwZSB0aGUgaGFuZGxlciBzdGF5cyB0aGUgZW1wdHkgc2hpbTogdGhlIHJlYWwgY29uc3RydWN0b3Jcblx0Ly8gaXMgZ2F0aGVyZWQgZnJvbSB0aGUgY2FsbGJhY2sgb25jZSBwZXIgY29uc3RydWN0aW9uIChzZWVcblx0Ly8gaW5zdGFsbExhenlEZWZpbml0aW9uIGFib3ZlIGFuZCBsYXp5RGVmaW5pdGlvbi50cylcblx0aGFuZGxlciA9IGhhbmRsZXIgfHwgZnVuY3Rpb24gKCkgeyB9O1xuXHRjb25zdCBhc0NsYXNzID0gaXNDbGFzcyhoYW5kbGVyKTtcblx0Y29uc3QgbW9kaWZpY2F0b3JCb2R5ID0gY29tcGlsZU5ld01vZGlmaWNhdG9yRnVuY3Rpb25Cb2R5KFxuXHRcdG5hbWUsXG5cdFx0YXNDbGFzc1xuXHQpO1xuXG5cdGNvbnN0IG1ha2VDb25zdHJ1Y3RIYW5kbGVyID0gbW9kaWZpY2F0b3JCb2R5KFxuXHRcdGhhbmRsZXIgYXMgQ29uc3RydWN0SGFuZGxlcixcblx0XHRDcmVhdGlvbkhhbmRsZXIsXG5cdFx0U3ltYm9sQ29uc3RydWN0b3JOYW1lXG5cdCk7XG5cblx0aWYgKGNvbmZpZyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0Y29uZmlnID0ge1xuXHRcdFx0TW9kaWZpY2F0aW9uQ29uc3RydWN0b3IgOiBjb25maWcgYXMgTW9kaWZpY2F0aW9uQ29uc3RydWN0b3JGYWN0b3J5XG5cdFx0fTtcblx0fVxuXG5cdGNvbmZpZyEuYXNDbGFzcyA9IGFzQ2xhc3M7XG5cblx0Y29uc3QgcHJvdG8gPSAoXG5cdFx0aG9wKFxuXHRcdFx0aGFuZGxlcixcblx0XHRcdCdwcm90b3R5cGUnXG5cdFx0KSAmJlxuXHRcdCh0eXBlb2YgaGFuZGxlci5wcm90b3R5cGUgPT09ICdvYmplY3QnKVxuXHQpID8gaGFuZGxlci5wcm90b3R5cGUgOiBnZXREZWZhdWx0UHJvdG90eXBlKCk7XG5cblx0Ly8gcmVqZWN0IHRoZSB1bnN1cHBvcnRlZCBoYW5kbGVyIHNoYXBlcyAoZ2VuZXJhdG9ycywgc3luYyBhcnJvd3MsXG5cdC8vIHNob3J0aGFuZCBtZXRob2RzLCBib3VuZCBmdW5jdGlvbnMpIEJFRk9SRSB0aGUgdHlwZSBpcyBjcmVhdGVkLCBzb1xuXHQvLyBhIHJlamVjdGVkIGRlZmluZSBsZWF2ZXMgbm90aGluZyByZWdpc3RlcmVkLiBTa2lwcGVkIHdoZW4gdGhlIG5hbWVcblx0Ly8gaXMgdGFrZW46IHRoZSBUeXBlRGVzY3JpcHRvciBiZWxvdyB0aHJvd3MgdGhlIGNhbm9uaWNhbFxuXHQvLyBBTFJFQURZX0RFQ0xBUkVELCB3aGljaCB3aW5zIG92ZXIgdGhlIHNoYXBlIGVycm9yXG5cdGlmICggIXRhcmdldC5oYXMoIG5hbWUgKSApIHtcblx0XHRjbGFzc2lmeUNvbnN0cnVjdEhhbmRsZXIoXG5cdFx0XHRuYW1lLFxuXHRcdFx0aGFuZGxlclxuXHRcdCk7XG5cdH1cblxuXHRjb25zdCByZXN1bHQgPSBuZXcgVHlwZURlc2NyaXB0b3IoXG5cdFx0ZGVmaW5lT3JpZ2luLFxuXHRcdHRhcmdldCxcblx0XHRuYW1lLFxuXHRcdG1ha2VDb25zdHJ1Y3RIYW5kbGVyLFxuXHRcdHByb3RvLFxuXHRcdGNvbmZpZyxcblx0XHRsYXp5R2V0dGVyXG5cdFx0Ly8gbmV3IFR5cGVEZXNjcmlwdG9yKCkgcmV0dXJucyB0aGUgVHlwZVByb3h5IGl0IHJlZ2lzdGVycyBpbiB0aGVcblx0XHQvLyBzdWJ0eXBlcyBtYXAg4oCUIGEgUHJveHkgbWF0ZXJpYWxpemluZyB0aGUgVHlwZUNsYXNzIHN1cmZhY2Vcblx0XHQvLyBkeW5hbWljYWxseSDigJQgc28gdGhlIHB1YmxpYyBjb25zdHJ1Y3RvciBjb250cmFjdCBpcyBuYW1lZCBoZXJlXG5cdCkgYXMgdW5rbm93biBhcyBUeXBlQ2xhc3M7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyAubGF6eSgpIGlzIGEgcmVndWxhciBkZWZpbmUgd2hvc2UgaGFuZGxlciBpcyB0aGUgZW1wdHkgc2hpbTsgdGhlIHJlYWxcbi8vIGNvbnN0cnVjdG9yIGlzIGdhdGhlcmVkIGZyb20gdGhlIGNhbGxiYWNrIG9uY2UgcGVyIGNvbnN0cnVjdGlvbiDigJQgc2VlXG4vLyBpbnN0YWxsTGF6eURlZmluaXRpb24gYWJvdmUgYW5kIGxhenlEZWZpbml0aW9uLnRzLiBOT1RISU5HIGlzIGRlcml2ZWRcbi8vIGZyb20gdGhlIGNhbGxiYWNrIGhlcmU6IGl0IGlzIG5ldmVyIGNhbGxlZCBhdCBkZWZpbmUgdGltZSwgc28gZm9yd2FyZFxuLy8gcmVmZXJlbmNlcyBhbmQgY2lyY3VsYXIgaW1wb3J0cyB3b3JrIOKAlCB0aGUgY2FsbGJhY2sncyB0YXJnZXQgb25seSBoYXMgdG9cbi8vIGV4aXN0IGJ5IHRoZSBmaXJzdCBgbmV3YFxuY29uc3QgY3JlYXRlRnJvbUxhenlEZWZpbml0aW9uID0gZnVuY3Rpb24gKFxuXHRkZWZpbmVPcmlnaW46IFR5cGVBYnNvcmJlcixcblx0dGFyZ2V0OiBUeXBlc01hcCxcblx0bmFtZTogc3RyaW5nLFxuXHRnZXR0ZXI6IExhenlEZWY8b2JqZWN0Pixcblx0Y29uZmlnOiBjb25zdHJ1Y3Rvck9wdGlvbnNcbikge1xuXG5cdGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUZyb21EaXJlY3RIYW5kbGVyKFxuXHRcdGRlZmluZU9yaWdpbixcblx0XHR0YXJnZXQsXG5cdFx0bmFtZSxcblx0XHR1bmRlZmluZWQsXG5cdFx0Y29uZmlnLFxuXHRcdGdldHRlclxuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBNQUlOIERJU1BBVENIRVJcbi8vIEFsbCBicmFuY2hlcyBmdW5uZWwgaGVyZS4gUmVjdXJzaW9uIGlzIGlzb2xhdGVkIHRvIHBhdGhcbi8vIHJlc29sdXRpb24gKHJlc29sdmVEZWZpbml0aW9uQ29udGV4dCkgYW5kIHRoZSBzaW5nbGUgY2FzZVxuLy8gb2YgYSBuYW1lZCBmdW5jdGlvbiBwYXNzZWQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBkZWZpbmUgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IHVua25vd24sXG5cdHN1YnR5cGVzOiBUeXBlc01hcCxcblx0VHlwZU9yVHlwZU5hbWU6IHN0cmluZyB8IERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWc/OiBEZWZpbmVOZXdhYmxlT3JDYWxsYWJsZSB8IG9iamVjdCxcblx0Y29uZmlnPzogb2JqZWN0XG4pOiBUeXBlQ2xhc3Mge1xuXG5cdGlmICghY29uZmlnIHx8ICh0eXBlb2YgY29uZmlnICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgY29uZmlnICE9PSAnZnVuY3Rpb24nKSkge1xuXHRcdGNvbmZpZyA9IHt9O1xuXHR9XG5cblx0Ly8gLS0tIEJyYW5jaDogZnVuY3Rpb24gcGFzc2VkIGFzIGZpcnN0IGFyZyAtLS1cblx0aWYgKHR5cGVvZiBUeXBlT3JUeXBlTmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGNvbnN0IGZuID0gVHlwZU9yVHlwZU5hbWU7XG5cdFx0aWYgKGZuLm5hbWUpIHtcblx0XHRcdGNoZWNrRHVwbGljYXRlKFxuXHRcdFx0XHRzdWJ0eXBlcyxcblx0XHRcdFx0Zm4ubmFtZVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGRlZmluZVJlc3VsdCA9IGRlZmluZS5jYWxsKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRzdWJ0eXBlcyxcblx0XHRcdFx0Zm4ubmFtZSxcblx0XHRcdFx0Zm4sXG5cdFx0XHRcdGNvbmZpZ1xuXHRcdFx0KTtcblx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0fVxuXHRcdC8vIEFub255bW91cyBmdW5jdGlvbiBhcyBmaXJzdCBhcmcgaXMgbm90IGEgdmFsaWQgLmRlZmluZSgpIGZvcm0uXG5cdFx0Ly8gVXNlIC5sYXp5KCgpID0+IENvbnN0cnVjdG9yLCBjb25maWc/KSBmb3IgbGF6eSBnZXR0ZXJzIGluc3RlYWQuXG5cdFx0dGhyb3cgbmV3IFRZUEVOQU1FX01VU1RfQkVfQV9TVFJJTkc7XG5cdH1cblxuXHQvLyAtLS0gQnJhbmNoOiBzdHJpbmcgcGF0aCBwYXNzZWQgYXMgZmlyc3QgYXJnIC0tLVxuXHRpZiAodHlwZW9mIFR5cGVPclR5cGVOYW1lICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBXUk9OR19UWVBFX0RFRklOSVRJT04oJ2RlZmluaXRpb24gaXMgbm90IHByb3ZpZGVkJyk7XG5cdH1cblx0Y2hlY2tUeXBlTmFtZShUeXBlT3JUeXBlTmFtZSk7XG5cblx0bGV0IGhhbmRsZXI6IENvbnN0cnVjdEhhbmRsZXIgfCB1bmRlZmluZWQ7XG5cdGlmICh0eXBlb2YgY29uc3RydWN0SGFuZGxlck9yQ29uZmlnID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0aGFuZGxlciA9IGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyBhcyBDb25zdHJ1Y3RIYW5kbGVyO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcgPT09ICdvYmplY3QnKSB7XG5cdFx0Y29uZmlnID0gY29uc3RydWN0SGFuZGxlck9yQ29uZmlnIGFzIGNvbnN0cnVjdG9yT3B0aW9ucztcblx0fVxuXG5cdGNvbnN0IHtcblx0XHR0YXJnZXQsIG5hbWUsIHBhcmVudFxuXHR9ID0gcmVzb2x2ZURlZmluaXRpb25Db250ZXh0KFxuXHRcdHN1YnR5cGVzLFxuXHRcdFR5cGVPclR5cGVOYW1lXG5cdCk7XG5cblx0Ly8gRXhpc3RpbmcgdHlwZSB3aXRoIG5vIGhhbmRsZXI6IGVycm9yIChtYXRjaGVzIG9yaWdpbmFsIGZhbGx0aHJvdWdoKVxuXHRpZiAocGFyZW50ICYmICFoYW5kbGVyKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignZGVmaW5pdGlvbiBpcyBub3QgcHJvdmlkZWQnKTtcblx0fVxuXG5cdGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUZyb21EaXJlY3RIYW5kbGVyKFxuXHRcdHRoaXMgYXMgVHlwZUFic29yYmVyLFxuXHRcdHRhcmdldCxcblx0XHRuYW1lLFxuXHRcdGhhbmRsZXIsXG5cdFx0Y29uZmlnIGFzIGNvbnN0cnVjdG9yT3B0aW9uc1xuXHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGNvbnN0IGxhenkgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IHVua25vd24sXG5cdHN1YnR5cGVzOiBUeXBlc01hcCxcblx0VHlwZU5hbWU6IHN0cmluZyxcblx0Z2V0dGVyPzogTGF6eURlZjxvYmplY3Q+LFxuXHRjb25maWc/OiBvYmplY3Rcbik6IFR5cGVDbGFzcyB7XG5cblx0Ly8gdGhlIHVubmFtZWQgbGF6eSgoKSA9PiBDb25zdHJ1Y3RvcikgZm9ybSBpcyBkcm9wcGVkOiB0aGUgY2FsbGJhY2sgaXNcblx0Ly8gbmV2ZXIgY2FsbGVkIGF0IGRlZmluZSB0aW1lLCBzbyB0aGVyZSBpcyBub3RoaW5nIHRvIGRlcml2ZSB0aGUgbmFtZVxuXHQvLyBmcm9tIOKAlCB0aGUgbmFtZSBtdXN0IGNvbWUgaW4gZXhwbGljaXRseVxuXHRpZiAodHlwZW9mIFR5cGVOYW1lICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUWVBFTkFNRV9NVVNUX0JFX0FfU1RSSU5HO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBnZXR0ZXIgIT09ICdmdW5jdGlvbicpIHtcblx0XHR0aHJvdyBuZXcgSEFORExFUl9NVVNUX0JFX0FfRlVOQ1RJT047XG5cdH1cblxuXHQvLyB0aGUgY2FsbGJhY2sgcnVucyBwZXIgY29uc3RydWN0aW9uIGFuZCBtdXN0IGRlbGl2ZXIgdGhlIGNvbnN0cnVjdG9yXG5cdC8vIHN5bmNocm9ub3VzbHk6IGFuIGFzeW5jIG9yIGdlbmVyYXRvciBjYWxsYmFjayB3b3VsZCBwcm9kdWNlIGFcblx0Ly8gUHJvbWlzZSAvIGl0ZXJhdG9yIGluc3RlYWRcblx0Y29uc3QgY2FsbGJhY2tLaW5kID0gZ2V0dGVyLmNvbnN0cnVjdG9yLm5hbWU7XG5cdGlmIChcblx0XHRjYWxsYmFja0tpbmQgPT09ICdBc3luY0Z1bmN0aW9uJyB8fFxuXHRcdGNhbGxiYWNrS2luZCA9PT0gJ0dlbmVyYXRvckZ1bmN0aW9uJyB8fFxuXHRcdGNhbGxiYWNrS2luZCA9PT0gJ0FzeW5jR2VuZXJhdG9yRnVuY3Rpb24nXG5cdCkge1xuXHRcdGNvbnN0IG1zZyA9IGAke1R5cGVOYW1lfTogbGF6eSBjYWxsYmFjayBtdXN0IGJlIGEgc3luYyBmdW5jdGlvbiBgICtcblx0XHRcdCcoYXN5bmMgYW5kIGdlbmVyYXRvciBjYWxsYmFja3MgYXJlIG5vdCBzdXBwb3J0ZWQpJztcblx0XHR0aHJvdyBuZXcgV1JPTkdfTU9ESUZJQ0FUSU9OX1BBVFRFUk4oIG1zZyApO1xuXHR9XG5cblx0aWYgKCFjb25maWcgfHwgKHR5cGVvZiBjb25maWcgIT09ICdvYmplY3QnICYmIHR5cGVvZiBjb25maWcgIT09ICdmdW5jdGlvbicpKSB7XG5cdFx0Y29uZmlnID0ge307XG5cdH1cblxuXHQvLyB0aGUgc2FtZSBkb3R0ZWQtcGF0aCByZXNvbHV0aW9uIGFzIGRlZmluZSdzIHN0cmluZyBicmFuY2g6XG5cdC8vIGxhenkoJ1BhcmVudC5DaGlsZCcsIC4uLikgbGFuZHMgdW5kZXIgUGFyZW50LCBhbmQgYSB0YWtlbiBuYW1lIGZhaWxzXG5cdC8vIHdpdGggdGhlIGRlc2NyaXB0b3IncyBBTFJFQURZX0RFQ0xBUkVELCBleGFjdGx5IGxpa2UgZGVmaW5lXG5cdGNoZWNrVHlwZU5hbWUoVHlwZU5hbWUpO1xuXG5cdGNvbnN0IHsgdGFyZ2V0LCBuYW1lIH0gPSByZXNvbHZlRGVmaW5pdGlvbkNvbnRleHQoXG5cdFx0c3VidHlwZXMsXG5cdFx0VHlwZU5hbWVcblx0KTtcblxuXHRjb25zdCBsYXp5UmVzdWx0ID0gY3JlYXRlRnJvbUxhenlEZWZpbml0aW9uKFxuXHRcdHRoaXMgYXMgVHlwZUFic29yYmVyLFxuXHRcdHRhcmdldCxcblx0XHRuYW1lLFxuXHRcdGdldHRlcixcblx0XHRjb25maWcgYXMgY29uc3RydWN0b3JPcHRpb25zXG5cdCk7XG5cdHJldHVybiBsYXp5UmVzdWx0O1xufTtcblxuZXhwb3J0IGNvbnN0IGxvb2t1cCA9IGZ1bmN0aW9uIChcblx0dGhpczogVHlwZXNNYXAsXG5cdFR5cGVOZXN0ZWRQYXRoOiBzdHJpbmdcbik6IFR5cGVDbGFzcyB8IHVuZGVmaW5lZCB7XG5cblx0aWYgKHR5cGVvZiBUeXBlTmVzdGVkUGF0aCAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdhcmcgOiB0eXBlIG5lc3RlZCBwYXRoIG11c3QgYmUgYSBzdHJpbmcnKTtcblx0fVxuXG5cdGlmICghVHlwZU5lc3RlZFBhdGgubGVuZ3RoKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignYXJnIDogdHlwZSBuZXN0ZWQgcGF0aCBoYXMgbm8gcGF0aCcpO1xuXHR9XG5cblx0Y29uc3Qgc3BsaXQgPSBnZXRUeXBlU3BsaXRQYXRoKFR5cGVOZXN0ZWRQYXRoKTtcblxuXHRjb25zdCBbIG5hbWUgXSA9IHNwbGl0O1xuXHRjb25zdCB0eXBlID0gdGhpcy5nZXQobmFtZSkgYXMgVHlwZUNsYXNzIHwgdW5kZWZpbmVkO1xuXHRpZiAoc3BsaXQubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIHR5cGU7XG5cdH1cblxuXHRjb25zdCBOZXh0TmVzdGVkUGF0aCA9IHNwbGl0LnNsaWNlKDEpLmpvaW4oJy4nKTtcblx0aWYgKCF0eXBlKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHQvLyBhIHR5cGUncyBzdWJ0eXBlcyBtYXAgSVMgdGhlIHJ1bnRpbWUgVHlwZXNNYXAgKFN5bWJvbFBhcmVudFR5cGUgYW5kXG5cdC8vIE1ORU1PU1lORSBhcmUgaW5zdGFsbGVkIGF0IGRlZmluaXRpb24gdGltZSksIHNvIHRoZSBzaW5nbGUgY2FzdCBvbmx5XG5cdC8vIG5hbWVzIHRoYXQgdmlld1xuXHRjb25zdCByZXN1bHQgPSBsb29rdXAuY2FsbChcblx0XHR0eXBlLnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdE5leHROZXN0ZWRQYXRoXG5cdCk7XG5cdHJldHVybiByZXN1bHQ7XG5cbn07XG5cblxuXG4iXX0=