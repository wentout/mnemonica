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
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
const constants_1 = require("../../constants");
const { odp, SymbolConstructorName, SymbolDefaultTypesCollection, SymbolConfig, defaultOptions, defaultOptionsKeys, MNEMONICA, MNEMOSYNE, } = constants_1.constants;
const types_1 = require("../../api/types");
const hooksAPI = __importStar(require("../../api/hooks"));
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
            const result = (instance) => {
                const checkResult = instance[SymbolConstructorName] === MNEMONICA;
                return checkResult;
            };
            return result;
        }
    });
    odp(this, 'subtypes', {
        get() {
            return subtypes;
        }
    });
    odp(subtypes, MNEMOSYNE, {
        get() {
            const result = typesCollections.get(self);
            return result;
        }
    });
    odp(this, MNEMOSYNE, {
        get() {
            const result = typesCollections.get(self);
            return result;
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
        const result = typesCollections.get(this);
        return result;
    }
});
odp(TypesCollection.prototype, 'define', {
    get() {
        const { subtypes } = this;
        const result = function (TypeOrTypeName, constructHandlerOrConfig, config) {
            const defineResult = types_1.define.call(result, subtypes, TypeOrTypeName, constructHandlerOrConfig, config);
            return defineResult;
        };
        return result;
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'lazy', {
    get() {
        const { subtypes } = this;
        const result = function (arg1, arg2, arg3) {
            let name;
            let getter;
            let config;
            if (typeof arg1 === 'string') {
                name = arg1;
                getter = arg2;
                config = arg3;
            }
            else {
                getter = arg1;
                config = arg2;
            }
            let lazyResult;
            if (name) {
                lazyResult = types_1.lazy.call(result, subtypes, name, getter, config);
            }
            else {
                lazyResult = types_1.lazy.call(result, subtypes, getter, config);
            }
            return lazyResult;
        };
        return result;
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'decorate', {
    get() {
        const self = this;
        const result = function (config) {
            const decorator = function (cstr) {
                const { name } = cstr;
                const defineResult = self.define(name, cstr, config);
                return defineResult;
            };
            return decorator;
        };
        return result;
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'lookup', {
    get() {
        const result = function (TypeNestedPath) {
            const lookupResult = types_1.lookup.call(this.subtypes, TypeNestedPath);
            return lookupResult;
        }.bind(this);
        return result;
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'registerHook', {
    get() {
        const self = this;
        const result = function (hookName, hookCallback) {
            const hookResult = registerHook.call(self, hookName, hookCallback);
            return hookResult;
        }.bind(this);
        return result;
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'invokeHook', {
    get() {
        const result = (hookName, opts) => {
            const hookResult = invokeHook.call(typesCollections.get(this), hookName, opts);
            return hookResult;
        };
        return result;
    }
});
odp(TypesCollection.prototype, 'registerFlowChecker', {
    get() {
        const result = (flowCheckerCallback) => {
            const checkerResult = registerFlowChecker.call(typesCollections.get(this), flowCheckerCallback);
            return checkerResult;
        };
        return result;
    }
});
const typesCollectionProxyHandler = {
    get(target, prop) {
        if (target.subtypes.has(prop)) {
            const subtypeResult = target.subtypes.get(prop);
            return subtypeResult;
        }
        if (prop === 'define') {
            return target.define;
        }
        const reflectResult = Reflect.get(target, prop);
        return reflectResult;
    },
    set(target, TypeName, Constructor) {
        target.define(TypeName, Constructor);
        return true;
    },
    getOwnPropertyDescriptor(target, prop) {
        if (target.subtypes.has(prop)) {
            const descriptorResult = {
                configurable: true,
                enumerable: true,
                writable: false,
                value: target.subtypes.get(prop)
            };
            return descriptorResult;
        }
        const ownPropResult = Reflect.getOwnPropertyDescriptor(target, prop);
        return ownPropResult;
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
        const result = (config = {}) => {
            const collectionResult = createTypesCollection(config);
            return collectionResult;
        };
        return result;
    },
    get defaultTypes() {
        const result = DEFAULT_TYPES;
        return result;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVzY3JpcHRvcnMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFZYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxxQkFBcUIsRUFDckIsNEJBQTRCLEVBQzVCLFlBQVksRUFDWixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLFNBQVMsRUFDVCxTQUFTLEdBQ1QsR0FBRyxxQkFBUyxDQUFDO0FBR2QsMkNBRXlCO0FBRXpCLDBEQUE0QztBQUU1QyxNQUFNLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFDVixtQkFBbUIsR0FDbkIsR0FBRyxRQUFRLENBQUM7QUFFYixNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFbkMsTUFBTSxlQUFlLEdBQUcsVUFBVSxPQUFnQztJQUVqRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUczQixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQ3ZDLENBQUMsQ0FBMEIsRUFBRSxHQUFXLEVBQUUsRUFBRTtRQUMzQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDN0IsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sS0FBSyxDQUFDO1FBQzVCLE1BQU0sTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDO1FBQzdCLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLENBQUMsQ0FBRSxHQUFHLENBQUUsR0FBRyxLQUFLLENBQUM7UUFDbEIsQ0FBQzthQUFNLENBQUM7WUFDUCxDQUFDLENBQUUsR0FBRyxD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QU0sR0FBRyxhQUFnQyxDQUFDO1FBQ2hELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUVELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0eXBlIHtcblx0X0ludGVybmFsX1RDXyxcblx0Q3JlYXRlVHlwZXNDb2xsZWN0aW9uRnVuY3Rpb24sXG5cdFR5cGVzQ29sbGVjdGlvbixcblx0VHlwZUNsYXNzLFxuXHRJREVGLFxuXHRob29rc09wdHMsXG5cdGhvb2tcbn0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuY29uc3Qge1xuXHRvZHAsXG5cdFN5bWJvbENvbnN0cnVjdG9yTmFtZSxcblx0U3ltYm9sRGVmYXVsdFR5cGVzQ29sbGVjdGlvbixcblx0U3ltYm9sQ29uZmlnLFxuXHRkZWZhdWx0T3B0aW9ucyxcblx0ZGVmYXVsdE9wdGlvbnNLZXlzLFxuXHRNTkVNT05JQ0EsXG5cdE1ORU1PU1lORSxcbn0gPSBjb25zdGFudHM7XG5cbi8vIGhlcmUgaXMgVHlwZXNDb2xsZWN0aW9uLmRlZmluZSgpIG1ldGhvZFxuaW1wb3J0IHtcblx0ZGVmaW5lLCBsYXp5LCBsb29rdXAsIHR5cGUgVHlwZXNNYXAsIHR5cGUgTGF6eVR5cGVHZXR0ZXJcbn0gZnJvbSAnLi4vLi4vYXBpL3R5cGVzJztcblxuaW1wb3J0ICogYXMgaG9va3NBUEkgZnJvbSAnLi4vLi4vYXBpL2hvb2tzJztcblxuY29uc3Qge1xuXHRyZWdpc3Rlckhvb2ssXG5cdGludm9rZUhvb2ssXG5cdHJlZ2lzdGVyRmxvd0NoZWNrZXIsXG59ID0gaG9va3NBUEk7XG5cbmNvbnN0IHR5cGVzQ29sbGVjdGlvbnMgPSBuZXcgTWFwKCk7XG5cbmNvbnN0IFR5cGVzQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChfY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdGNvbnN0IHN1YnR5cGVzID0gbmV3IE1hcCgpO1xuXG5cdC8vIGRlZmF1bHQgY29uZmlnIGlzIGxlc3MgaW1wb3J0YW50IHRoYW4gdHlwZXMgY29sbGVjdGlvbiBjb25maWdcblx0Y29uc3QgY29uZmlnID0gZGVmYXVsdE9wdGlvbnNLZXlzLnJlZHVjZShcblx0XHQobzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IF9jb25maWdbIGtleSBdO1xuXHRcdFx0Y29uc3Qgb3B0aW9uID0gZGVmYXVsdE9wdGlvbnNbIGtleSBdO1xuXHRcdFx0Y29uc3QgdF9jb25mID0gdHlwZW9mIHZhbHVlO1xuXHRcdFx0Y29uc3QgdF9vcHRzID0gdHlwZW9mIG9wdGlvbjtcblx0XHRcdGlmICh0X2NvbmYgPT09IHRfb3B0cykge1xuXHRcdFx0XHRvWyBrZXkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1sga2V5IF0gPSBvcHRpb247XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbztcblx0XHR9LFxuXHRcdHt9XG5cdCk7XG5cblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0U3ltYm9sQ29uZmlnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdFN5bWJvbC5oYXNJbnN0YW5jZSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSAoaW5zdGFuY2U6IHsgW1N5bWJvbENvbnN0cnVjdG9yTmFtZV0/OiBzdHJpbmcgfSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGNoZWNrUmVzdWx0ID0gaW5zdGFuY2VbIFN5bWJvbENvbnN0cnVjdG9yTmFtZSBdID09PSBNTkVNT05JQ0E7XG5cdFx0XHRcdFx0cmV0dXJuIGNoZWNrUmVzdWx0O1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHQnc3VidHlwZXMnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBzdWJ0eXBlcztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Ly8gRm9yIGluc3RhbmNlb2YgTU5FTU9TWU5FXG5cdG9kcChcblx0XHRzdWJ0eXBlcyxcblx0XHRNTkVNT1NZTkUsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Ly8gcmV0dXJuaW5nIHByb3h5XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHNlbGYpO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHQvLyBGb3IgaW5zdGFuY2VvZiBNTkVNT1NZTkVcblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0TU5FTU9TWU5FLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdC8vIHJldHVybmluZyBwcm94eVxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldChzZWxmKTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Y29uc3QgaG9va3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHQnaG9va3MnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBob29rcztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cbn0gYXMgX0ludGVybmFsX1RDXzxvYmplY3Q+O1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdE1ORU1PTklDQSxcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldCh0aGlzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdkZWZpbmUnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHsgc3VidHlwZXMgfSA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IENhbGxhYmxlRnVuY3Rpb24sXG5cdFx0XHRcdFR5cGVPclR5cGVOYW1lOiBzdHJpbmcgfCBDYWxsYWJsZUZ1bmN0aW9uLFxuXHRcdFx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWc/OiBDYWxsYWJsZUZ1bmN0aW9uIHwgb2JqZWN0LFxuXHRcdFx0XHRjb25maWc/OiBvYmplY3Rcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBwYXNzIGByZXN1bHRgIGl0c2VsZiBhcyB0aGUgc3RhY2stY2FwdHVyZSBib3VuZGFyeSAoU3RhY2tCb3VuZGFyeSk6XG5cdFx0XHRcdC8vIGl0IGlzIGEgcmVhbCBjYWxsYWJsZSBvbiB0aGUgc3RhY2ssIHNvIGNhcHR1cmVTdGFja1RyYWNlXG5cdFx0XHRcdC8vIHRydW5jYXRlcyBhdCB0aGUgdXNlcidzIGNhbGwgc2l0ZSBpbnN0ZWFkIG9mIGtlZXBpbmcgaW50ZXJuYWwgZnJhbWVzXG5cdFx0XHRcdGNvbnN0IGRlZmluZVJlc3VsdCA9IGRlZmluZS5jYWxsKFxuXHRcdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0XHRzdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdFx0XHRUeXBlT3JUeXBlTmFtZSxcblx0XHRcdFx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcsXG5cdFx0XHRcdFx0Y29uZmlnXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2xhenknLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHsgc3VidHlwZXMgfSA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IENhbGxhYmxlRnVuY3Rpb24sXG5cdFx0XHRcdGFyZzE6IHN0cmluZyB8IENhbGxhYmxlRnVuY3Rpb24sXG5cdFx0XHRcdGFyZzI/OiBDYWxsYWJsZUZ1bmN0aW9uIHwgb2JqZWN0LFxuXHRcdFx0XHRhcmczPzogb2JqZWN0XG5cdFx0XHQpIHtcblx0XHRcdFx0bGV0IG5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0bGV0IGdldHRlcjogTGF6eVR5cGVHZXR0ZXI7XG5cdFx0XHRcdGxldCBjb25maWc6IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdFx0aWYgKHR5cGVvZiBhcmcxID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdG5hbWUgPSBhcmcxO1xuXHRcdFx0XHRcdGdldHRlciA9IGFyZzIgYXMgTGF6eVR5cGVHZXR0ZXI7XG5cdFx0XHRcdFx0Y29uZmlnID0gYXJnMztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRnZXR0ZXIgPSBhcmcxIGFzIExhenlUeXBlR2V0dGVyO1xuXHRcdFx0XHRcdGNvbmZpZyA9IGFyZzIgYXMgb2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBsYXp5UmVzdWx0OiBUeXBlQ2xhc3M7XG5cdFx0XHRcdC8vIHNhbWUgYXMgaW4gYGRlZmluZWAgYWJvdmU6IHBhc3MgYHJlc3VsdGAgaXRzZWxmIGFzIHRoZVxuXHRcdFx0XHQvLyBzdGFjay1jYXB0dXJlIGJvdW5kYXJ5LCBub3QgdGhlIGNvbGxlY3Rpb24gb2JqZWN0XG5cdFx0XHRcdGlmIChuYW1lKSB7XG5cdFx0XHRcdFx0bGF6eVJlc3VsdCA9IGxhenkuY2FsbChcblx0XHRcdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0XHRcdHN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdGdldHRlciBhcyBMYXp5VHlwZUdldHRlcixcblx0XHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bGF6eVJlc3VsdCA9IGxhenkuY2FsbChcblx0XHRcdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0XHRcdHN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFx0XHRcdFx0Z2V0dGVyIGFzIExhenlUeXBlR2V0dGVyLFxuXHRcdFx0XHRcdFx0Y29uZmlnXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbGF6eVJlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnZGVjb3JhdGUnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKGNvbmZpZz86IG9iamVjdCkge1xuXHRcdFx0XHRjb25zdCBkZWNvcmF0b3IgPSBmdW5jdGlvbiAoY3N0cjogQ2FsbGFibGVGdW5jdGlvbikge1xuXHRcdFx0XHRcdGNvbnN0IHsgbmFtZSB9ID0gY3N0cjtcblx0XHRcdFx0XHRjb25zdCBkZWZpbmVSZXN1bHQgPSBzZWxmLmRlZmluZShcblx0XHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0XHRjc3RyIGFzIElERUY8b2JqZWN0Pixcblx0XHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIGRlZmluZVJlc3VsdDtcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIGRlY29yYXRvcjtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnbG9va3VwJyxcblx0e1xuXHRcdGdldCAodGhpczogeyBzdWJ0eXBlczogTWFwPHN0cmluZywgb2JqZWN0PiB9KSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSxcblx0XHRcdFx0VHlwZU5lc3RlZFBhdGg6IHN0cmluZ1xuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGxvb2t1cFJlc3VsdCA9IGxvb2t1cC5jYWxsKFxuXHRcdFx0XHRcdC8vIGEgY29sbGVjdGlvbidzIHN1YnR5cGVzIG1hcCBJUyB0aGUgcnVudGltZSBUeXBlc01hcCAodGhlXG5cdFx0XHRcdFx0Ly8gTU5FTU9TWU5FL1N5bWJvbFBhcmVudFR5cGUgcHJvcHMgYXJlIGluc3RhbGxlZCBhdFxuXHRcdFx0XHRcdC8vIGNvbnN0cnVjdGlvbiksIHNvIHRoZSBzaW5nbGUgY2FzdCBvbmx5IG5hbWVzIHRoYXQgdmlld1xuXHRcdFx0XHRcdHRoaXMuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRcdFx0VHlwZU5lc3RlZFBhdGhcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGxvb2t1cFJlc3VsdDtcblx0XHRcdH0uYmluZCh0aGlzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdyZWdpc3Rlckhvb2snLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblxuXHRcdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoaG9va05hbWU6IHN0cmluZywgaG9va0NhbGxiYWNrOiBob29rKSB7XG5cdFx0XHRcdC8vIHJldHVybiBwcm90by5yZWdpc3Rlckhvb2suY2FsbCggdHlwZXNDb2xsZWN0aW9ucy5nZXQoIHNlbGYgKSwgaG9va05hbWUsIGhvb2tDYWxsYmFjayApO1xuXHRcdFx0XHRjb25zdCBob29rUmVzdWx0ID0gcmVnaXN0ZXJIb29rLmNhbGwoXG5cdFx0XHRcdFx0c2VsZixcblx0XHRcdFx0XHRob29rTmFtZSxcblx0XHRcdFx0XHRob29rQ2FsbGJhY2tcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGhvb2tSZXN1bHQ7XG5cdFx0XHR9LmJpbmQodGhpcyk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnaW52b2tlSG9vaycsXG5cdHtcblx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gKGhvb2tOYW1lOiBzdHJpbmcsIG9wdHM6IHsgW2luZGV4OiBzdHJpbmddOiB1bmtub3duIH0pID0+IHtcblx0XHRcdFx0Y29uc3QgaG9va1Jlc3VsdCA9IGludm9rZUhvb2suY2FsbChcblx0XHRcdFx0XHR0eXBlc0NvbGxlY3Rpb25zLmdldCh0aGlzKSxcblx0XHRcdFx0XHRob29rTmFtZSxcblx0XHRcdFx0XHRvcHRzIGFzIGhvb2tzT3B0c1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gaG9va1Jlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQncmVnaXN0ZXJGbG93Q2hlY2tlcicsXG5cdHtcblx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gKGZsb3dDaGVja2VyQ2FsbGJhY2s6ICgpID0+IHVua25vd24pID0+IHtcblx0XHRcdFx0Y29uc3QgY2hlY2tlclJlc3VsdCA9IHJlZ2lzdGVyRmxvd0NoZWNrZXIuY2FsbChcblx0XHRcdFx0XHR0eXBlc0NvbGxlY3Rpb25zLmdldCh0aGlzKSxcblx0XHRcdFx0XHRmbG93Q2hlY2tlckNhbGxiYWNrXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBjaGVja2VyUmVzdWx0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG4pO1xuXG5cbmludGVyZmFjZSBUeXBlc0NvbGxlY3Rpb25UYXJnZXQge1xuXHRzdWJ0eXBlczogVHlwZXNNYXA7XG5cdGRlZmluZTogKG5hbWU6IHN0cmluZywgY3RvcjogRnVuY3Rpb25Db25zdHJ1Y3RvcikgPT4gb2JqZWN0O1xufVxuXG5jb25zdCB0eXBlc0NvbGxlY3Rpb25Qcm94eUhhbmRsZXIgPSB7XG5cdGdldCAodGFyZ2V0OiBUeXBlc0NvbGxlY3Rpb25UYXJnZXQsIHByb3A6IHN0cmluZykge1xuXHRcdGlmICh0YXJnZXQuc3VidHlwZXMuaGFzKHByb3ApKSB7XG5cdFx0XHQvLyBhY2Nlc3MgdG8gc3VidHlwZVxuXHRcdFx0Ly8gZm9yIG5ldyBjYWxsIG9yIGRlZmluaW5nIG5ldyB0eXBlXG5cdFx0XHRjb25zdCBzdWJ0eXBlUmVzdWx0ID0gdGFyZ2V0LnN1YnR5cGVzLmdldChwcm9wKTtcblx0XHRcdHJldHVybiBzdWJ0eXBlUmVzdWx0O1xuXHRcdH1cblx0XHRpZiAocHJvcCA9PT0gJ2RlZmluZScpIHtcblx0XHRcdC8vIHdpbGwgaG9wZWZ1bGx5IGRlZmluZSBuZXcgdHlwZVxuXHRcdFx0cmV0dXJuIHRhcmdldC5kZWZpbmU7XG5cdFx0fVxuXHRcdGNvbnN0IHJlZmxlY3RSZXN1bHQgPSBSZWZsZWN0LmdldChcblx0XHRcdHRhcmdldCxcblx0XHRcdHByb3Bcblx0XHQpO1xuXHRcdHJldHVybiByZWZsZWN0UmVzdWx0O1xuXHR9LFxuXHRzZXQgKHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBUeXBlTmFtZTogc3RyaW5nLCBDb25zdHJ1Y3RvcjogRnVuY3Rpb25Db25zdHJ1Y3Rvcikge1xuXHRcdHRhcmdldC5kZWZpbmUoXG5cdFx0XHRUeXBlTmFtZSxcblx0XHRcdENvbnN0cnVjdG9yXG5cdFx0KTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG5cdGdldE93blByb3BlcnR5RGVzY3JpcHRvciAodGFyZ2V0OiBUeXBlc0NvbGxlY3Rpb25UYXJnZXQsIHByb3A6IHN0cmluZykge1xuXHRcdGlmICh0YXJnZXQuc3VidHlwZXMuaGFzKHByb3ApKSB7XG5cdFx0XHRjb25zdCBkZXNjcmlwdG9yUmVzdWx0ID0ge1xuXHRcdFx0XHRjb25maWd1cmFibGUgOiB0cnVlLFxuXHRcdFx0XHRlbnVtZXJhYmxlICAgOiB0cnVlLFxuXHRcdFx0XHR3cml0YWJsZSAgICAgOiBmYWxzZSxcblx0XHRcdFx0dmFsdWUgICAgICAgIDogdGFyZ2V0LnN1YnR5cGVzLmdldChwcm9wKVxuXHRcdFx0fTtcblx0XHRcdHJldHVybiBkZXNjcmlwdG9yUmVzdWx0O1xuXHRcdH1cblx0XHRjb25zdCBvd25Qcm9wUmVzdWx0ID0gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wKTtcblx0XHRyZXR1cm4gb3duUHJvcFJlc3VsdDtcblx0fVxufTtcblxuY29uc3QgY3JlYXRlVHlwZXNDb2xsZWN0aW9uID0gKGNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fSkgPT4ge1xuXG5cdGNvbnN0IHR5cGVzQ29sbGVjdGlvbiA9IG5ldyBUeXBlc0NvbGxlY3Rpb24oY29uZmlnKTtcblx0Y29uc3QgdHlwZXNDb2xsZWN0aW9uUHJveHkgPSBuZXcgUHJveHkoXG5cdFx0dHlwZXNDb2xsZWN0aW9uLFxuXHRcdHR5cGVzQ29sbGVjdGlvblByb3h5SGFuZGxlclxuXHQpO1xuXG5cdHR5cGVzQ29sbGVjdGlvbnMuc2V0KFxuXHRcdHR5cGVzQ29sbGVjdGlvbixcblx0XHR0eXBlc0NvbGxlY3Rpb25Qcm94eVxuXHQpO1xuXG5cdHJldHVybiB0eXBlc0NvbGxlY3Rpb25Qcm94eTtcblxufTtcblxuY29uc3QgREVGQVVMVF9UWVBFUyA9IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbigpO1xub2RwKFxuXHRERUZBVUxUX1RZUEVTLFxuXHRTeW1ib2xEZWZhdWx0VHlwZXNDb2xsZWN0aW9uLFxuXHR7XG5cdFx0Z2V0ICgpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuKTtcblxuZXhwb3J0IGNvbnN0IHR5cGVzID0ge1xuXHRnZXQgY3JlYXRlVHlwZXNDb2xsZWN0aW9uICgpOiBDcmVhdGVUeXBlc0NvbGxlY3Rpb25GdW5jdGlvbiB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gPFxuXHRcdFx0XHRUIGV4dGVuZHMgb2JqZWN0ID0ge30sXG5cdFx0XHRcdFBhcmVudCBleHRlbmRzIG9iamVjdCA9IG9iamVjdFxuXHRcdFx0XHQ+IChcblx0XHRcdFx0Y29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9XG5cdFx0XHQpOiBUeXBlc0NvbGxlY3Rpb248VCwgUGFyZW50PiA9PiB7XG5cdFx0XHRjb25zdCBjb2xsZWN0aW9uUmVzdWx0ID0gY3JlYXRlVHlwZXNDb2xsZWN0aW9uKGNvbmZpZykgYXMgVHlwZXNDb2xsZWN0aW9uPFQsIFBhcmVudD47XG5cdFx0XHRyZXR1cm4gY29sbGVjdGlvblJlc3VsdDtcblx0XHR9O1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGdldCBkZWZhdWx0VHlwZXMgKCk6IFR5cGVzQ29sbGVjdGlvbiB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gREVGQVVMVF9UWVBFUyBhcyBUeXBlc0NvbGxlY3Rpb247XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG59O1xuIl19