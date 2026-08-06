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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVzY3JpcHRvcnMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFZYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxxQkFBcUIsRUFDckIsNEJBQTRCLEVBQzVCLFlBQVksRUFDWixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLFNBQVMsRUFDVCxTQUFTLEdBQ1QsR0FBRyxxQkFBUyxDQUFDO0FBR2QsMkNBRXlCO0FBRXpCLDBEQUE0QztBQUU1QyxNQUFNLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFDVixtQkFBbUIsR0FDbkIsR0FBRyxRQUFRLENBQUM7QUFFYixNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFbkMsTUFBTSxlQUFlLEdBQUcsVUFBVSxPQUFnQztJQUVqRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUczQixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQ3ZDLENBQUMsQ0FBMEIsRUFBRSxHQUFXLEVBQUUsRUFBRTtRQUMzQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDN0IsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sS0FBSyxDQUFDO1FBQzVCLE1BQU0sTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDO1FBQzdCLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLENBQUMsQ0FBRSxHQUFHLENBQUUsR0FBRyxLQUFLLENBQUM7UUFDbEIsQ0FBQzthQUFNLENBQUM7WUFDUCxDQUFDLENBQUUsR0FBRyxD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QU0sR0FBRyxhQUFnQyxDQUFDO1FBQ2hELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUVELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0eXBlIHtcblx0X0ludGVybmFsX1RDXyxcblx0Q3JlYXRlVHlwZXNDb2xsZWN0aW9uRnVuY3Rpb24sXG5cdFR5cGVzQ29sbGVjdGlvbixcblx0VHlwZUNsYXNzLFxuXHRJREVGLFxuXHRob29rc09wdHMsXG5cdGhvb2tcbn0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuY29uc3Qge1xuXHRvZHAsXG5cdFN5bWJvbENvbnN0cnVjdG9yTmFtZSxcblx0U3ltYm9sRGVmYXVsdFR5cGVzQ29sbGVjdGlvbixcblx0U3ltYm9sQ29uZmlnLFxuXHRkZWZhdWx0T3B0aW9ucyxcblx0ZGVmYXVsdE9wdGlvbnNLZXlzLFxuXHRNTkVNT05JQ0EsXG5cdE1ORU1PU1lORSxcbn0gPSBjb25zdGFudHM7XG5cbi8vIGhlcmUgaXMgVHlwZXNDb2xsZWN0aW9uLmRlZmluZSgpIG1ldGhvZFxuaW1wb3J0IHtcblx0ZGVmaW5lLCBsYXp5LCBsb29rdXAsIHR5cGUgVHlwZXNNYXAsIHR5cGUgTGF6eVR5cGVHZXR0ZXJcbn0gZnJvbSAnLi4vLi4vYXBpL3R5cGVzJztcblxuaW1wb3J0ICogYXMgaG9va3NBUEkgZnJvbSAnLi4vLi4vYXBpL2hvb2tzJztcblxuY29uc3Qge1xuXHRyZWdpc3Rlckhvb2ssXG5cdGludm9rZUhvb2ssXG5cdHJlZ2lzdGVyRmxvd0NoZWNrZXIsXG59ID0gaG9va3NBUEk7XG5cbmNvbnN0IHR5cGVzQ29sbGVjdGlvbnMgPSBuZXcgTWFwKCk7XG5cbmNvbnN0IFR5cGVzQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChfY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdGNvbnN0IHN1YnR5cGVzID0gbmV3IE1hcCgpO1xuXG5cdC8vIGRlZmF1bHQgY29uZmlnIGlzIGxlc3MgaW1wb3J0YW50IHRoYW4gdHlwZXMgY29sbGVjdGlvbiBjb25maWdcblx0Y29uc3QgY29uZmlnID0gZGVmYXVsdE9wdGlvbnNLZXlzLnJlZHVjZShcblx0XHQobzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IF9jb25maWdbIGtleSBdO1xuXHRcdFx0Y29uc3Qgb3B0aW9uID0gZGVmYXVsdE9wdGlvbnNbIGtleSBdO1xuXHRcdFx0Y29uc3QgdF9jb25mID0gdHlwZW9mIHZhbHVlO1xuXHRcdFx0Y29uc3QgdF9vcHRzID0gdHlwZW9mIG9wdGlvbjtcblx0XHRcdGlmICh0X2NvbmYgPT09IHRfb3B0cykge1xuXHRcdFx0XHRvWyBrZXkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1sga2V5IF0gPSBvcHRpb247XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbztcblx0XHR9LFxuXHRcdHt9XG5cdCk7XG5cblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0U3ltYm9sQ29uZmlnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdFN5bWJvbC5oYXNJbnN0YW5jZSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSAoaW5zdGFuY2U6IHsgW1N5bWJvbENvbnN0cnVjdG9yTmFtZV0/OiBzdHJpbmcgfSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGNoZWNrUmVzdWx0ID0gaW5zdGFuY2VbIFN5bWJvbENvbnN0cnVjdG9yTmFtZSBdID09PSBNTkVNT05JQ0E7XG5cdFx0XHRcdFx0cmV0dXJuIGNoZWNrUmVzdWx0O1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHQnc3VidHlwZXMnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBzdWJ0eXBlcztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Ly8gRm9yIGluc3RhbmNlb2YgTU5FTU9TWU5FXG5cdG9kcChcblx0XHRzdWJ0eXBlcyxcblx0XHRNTkVNT1NZTkUsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Ly8gcmV0dXJuaW5nIHByb3h5XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHNlbGYpO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHQvLyBGb3IgaW5zdGFuY2VvZiBNTkVNT1NZTkVcblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0TU5FTU9TWU5FLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdC8vIHJldHVybmluZyBwcm94eVxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldChzZWxmKTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Y29uc3QgaG9va3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHQnaG9va3MnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBob29rcztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cbn0gYXMgX0ludGVybmFsX1RDXzxvYmplY3Q+O1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdE1ORU1PTklDQSxcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldCh0aGlzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdkZWZpbmUnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHsgc3VidHlwZXMgfSA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IENhbGxhYmxlRnVuY3Rpb24sXG5cdFx0XHRcdFR5cGVPclR5cGVOYW1lOiBzdHJpbmcgfCBDYWxsYWJsZUZ1bmN0aW9uLFxuXHRcdFx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWc/OiBDYWxsYWJsZUZ1bmN0aW9uIHwgb2JqZWN0LFxuXHRcdFx0XHRjb25maWc/OiBvYmplY3Rcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBwYXNzIGByZXN1bHRgIGl0c2VsZiBhcyB0aGUgc3RhY2stY2FwdHVyZSBib3VuZGFyeSAoU3RhY2tCb3VuZGFyeSk6XG5cdFx0XHRcdC8vIGl0IGlzIGEgcmVhbCBjYWxsYWJsZSBvbiB0aGUgc3RhY2ssIHNvIGNhcHR1cmVTdGFja1RyYWNlXG5cdFx0XHRcdC8vIHRydW5jYXRlcyBhdCB0aGUgdXNlcidzIGNhbGwgc2l0ZSBpbnN0ZWFkIG9mIGtlZXBpbmcgaW50ZXJuYWwgZnJhbWVzXG5cdFx0XHRcdGNvbnN0IGRlZmluZVJlc3VsdCA9IGRlZmluZS5jYWxsKFxuXHRcdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0XHRzdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdFx0XHRUeXBlT3JUeXBlTmFtZSxcblx0XHRcdFx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcsXG5cdFx0XHRcdFx0Y29uZmlnXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2xhenknLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHsgc3VidHlwZXMgfSA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IENhbGxhYmxlRnVuY3Rpb24sXG5cdFx0XHRcdGFyZzE6IHN0cmluZyB8IENhbGxhYmxlRnVuY3Rpb24sXG5cdFx0XHRcdGFyZzI/OiBDYWxsYWJsZUZ1bmN0aW9uIHwgb2JqZWN0LFxuXHRcdFx0XHRhcmczPzogb2JqZWN0XG5cdFx0XHQpIHtcblx0XHRcdFx0bGV0IG5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0bGV0IGdldHRlcjogTGF6eVR5cGVHZXR0ZXI7XG5cdFx0XHRcdGxldCBjb25maWc6IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdFx0aWYgKHR5cGVvZiBhcmcxID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdG5hbWUgPSBhcmcxO1xuXHRcdFx0XHRcdGdldHRlciA9IGFyZzIgYXMgTGF6eVR5cGVHZXR0ZXI7XG5cdFx0XHRcdFx0Y29uZmlnID0gYXJnMztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRnZXR0ZXIgPSBhcmcxIGFzIExhenlUeXBlR2V0dGVyO1xuXHRcdFx0XHRcdGNvbmZpZyA9IGFyZzIgYXMgb2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBsYXp5UmVzdWx0OiBUeXBlQ2xhc3M7XG5cdFx0XHRcdC8vIHNhbWUgYXMgaW4gYGRlZmluZWAgYWJvdmU6IHBhc3MgYHJlc3VsdGAgaXRzZWxmIGFzIHRoZVxuXHRcdFx0XHQvLyBzdGFjay1jYXB0dXJlIGJvdW5kYXJ5LCBub3QgdGhlIGNvbGxlY3Rpb24gb2JqZWN0XG5cdFx0XHRcdGlmIChuYW1lKSB7XG5cdFx0XHRcdFx0bGF6eVJlc3VsdCA9IGxhenkuY2FsbChcblx0XHRcdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0XHRcdHN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdGdldHRlciBhcyBMYXp5VHlwZUdldHRlcixcblx0XHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bGF6eVJlc3VsdCA9IGxhenkuY2FsbChcblx0XHRcdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0XHRcdHN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFx0XHRcdFx0Z2V0dGVyIGFzIExhenlUeXBlR2V0dGVyLFxuXHRcdFx0XHRcdFx0Y29uZmlnXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbGF6eVJlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnZGVjb3JhdGUnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKGNvbmZpZz86IG9iamVjdCkge1xuXHRcdFx0XHRjb25zdCBkZWNvcmF0b3IgPSBmdW5jdGlvbiAoY3N0cjogQ2FsbGFibGVGdW5jdGlvbikge1xuXHRcdFx0XHRcdGNvbnN0IHsgbmFtZSB9ID0gY3N0cjtcblx0XHRcdFx0XHRjb25zdCBkZWZpbmVSZXN1bHQgPSBzZWxmLmRlZmluZShcblx0XHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0XHRjc3RyIGFzIElERUY8b2JqZWN0Pixcblx0XHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIGRlZmluZVJlc3VsdDtcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIGRlY29yYXRvcjtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnbG9va3VwJyxcblx0e1xuXHRcdGdldCAodGhpczogeyBzdWJ0eXBlczogTWFwPHN0cmluZywgb2JqZWN0PiB9KSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSxcblx0XHRcdFx0VHlwZU5lc3RlZFBhdGg6IHN0cmluZ1xuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGxvb2t1cFJlc3VsdCA9IGxvb2t1cC5jYWxsKFxuXHRcdFx0XHRcdHRoaXMuc3VidHlwZXMgYXMgdW5rbm93biBhcyBUeXBlc01hcCxcblx0XHRcdFx0XHRUeXBlTmVzdGVkUGF0aFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gbG9va3VwUmVzdWx0O1xuXHRcdFx0fS5iaW5kKHRoaXMpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J3JlZ2lzdGVySG9vaycsXG5cdHtcblx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChob29rTmFtZTogc3RyaW5nLCBob29rQ2FsbGJhY2s6IGhvb2spIHtcblx0XHRcdFx0Ly8gcmV0dXJuIHByb3RvLnJlZ2lzdGVySG9vay5jYWxsKCB0eXBlc0NvbGxlY3Rpb25zLmdldCggc2VsZiApLCBob29rTmFtZSwgaG9va0NhbGxiYWNrICk7XG5cdFx0XHRcdGNvbnN0IGhvb2tSZXN1bHQgPSByZWdpc3Rlckhvb2suY2FsbChcblx0XHRcdFx0XHRzZWxmLFxuXHRcdFx0XHRcdGhvb2tOYW1lLFxuXHRcdFx0XHRcdGhvb2tDYWxsYmFja1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gaG9va1Jlc3VsdDtcblx0XHRcdH0uYmluZCh0aGlzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdpbnZva2VIb29rJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSAoaG9va05hbWU6IHN0cmluZywgb3B0czogeyBbaW5kZXg6IHN0cmluZ106IHVua25vd24gfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBob29rUmVzdWx0ID0gaW52b2tlSG9vay5jYWxsKFxuXHRcdFx0XHRcdHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHRoaXMpLFxuXHRcdFx0XHRcdGhvb2tOYW1lLFxuXHRcdFx0XHRcdG9wdHMgYXMgaG9va3NPcHRzXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBob29rUmVzdWx0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdyZWdpc3RlckZsb3dDaGVja2VyJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSAoZmxvd0NoZWNrZXJDYWxsYmFjazogKCkgPT4gdW5rbm93bikgPT4ge1xuXHRcdFx0XHRjb25zdCBjaGVja2VyUmVzdWx0ID0gcmVnaXN0ZXJGbG93Q2hlY2tlci5jYWxsKFxuXHRcdFx0XHRcdHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHRoaXMpLFxuXHRcdFx0XHRcdGZsb3dDaGVja2VyQ2FsbGJhY2tcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGNoZWNrZXJSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cblxuaW50ZXJmYWNlIFR5cGVzQ29sbGVjdGlvblRhcmdldCB7XG5cdHN1YnR5cGVzOiBUeXBlc01hcDtcblx0ZGVmaW5lOiAobmFtZTogc3RyaW5nLCBjdG9yOiBGdW5jdGlvbkNvbnN0cnVjdG9yKSA9PiBvYmplY3Q7XG59XG5cbmNvbnN0IHR5cGVzQ29sbGVjdGlvblByb3h5SGFuZGxlciA9IHtcblx0Z2V0ICh0YXJnZXQ6IFR5cGVzQ29sbGVjdGlvblRhcmdldCwgcHJvcDogc3RyaW5nKSB7XG5cdFx0aWYgKHRhcmdldC5zdWJ0eXBlcy5oYXMocHJvcCkpIHtcblx0XHRcdC8vIGFjY2VzcyB0byBzdWJ0eXBlXG5cdFx0XHQvLyBmb3IgbmV3IGNhbGwgb3IgZGVmaW5pbmcgbmV3IHR5cGVcblx0XHRcdGNvbnN0IHN1YnR5cGVSZXN1bHQgPSB0YXJnZXQuc3VidHlwZXMuZ2V0KHByb3ApO1xuXHRcdFx0cmV0dXJuIHN1YnR5cGVSZXN1bHQ7XG5cdFx0fVxuXHRcdGlmIChwcm9wID09PSAnZGVmaW5lJykge1xuXHRcdFx0Ly8gd2lsbCBob3BlZnVsbHkgZGVmaW5lIG5ldyB0eXBlXG5cdFx0XHRyZXR1cm4gdGFyZ2V0LmRlZmluZTtcblx0XHR9XG5cdFx0Y29uc3QgcmVmbGVjdFJlc3VsdCA9IFJlZmxlY3QuZ2V0KFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0cHJvcFxuXHRcdCk7XG5cdFx0cmV0dXJuIHJlZmxlY3RSZXN1bHQ7XG5cdH0sXG5cdHNldCAodGFyZ2V0OiBUeXBlc0NvbGxlY3Rpb25UYXJnZXQsIFR5cGVOYW1lOiBzdHJpbmcsIENvbnN0cnVjdG9yOiBGdW5jdGlvbkNvbnN0cnVjdG9yKSB7XG5cdFx0dGFyZ2V0LmRlZmluZShcblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0Q29uc3RydWN0b3Jcblx0XHQpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcblx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICh0YXJnZXQ6IFR5cGVzQ29sbGVjdGlvblRhcmdldCwgcHJvcDogc3RyaW5nKSB7XG5cdFx0aWYgKHRhcmdldC5zdWJ0eXBlcy5oYXMocHJvcCkpIHtcblx0XHRcdGNvbnN0IGRlc2NyaXB0b3JSZXN1bHQgPSB7XG5cdFx0XHRcdGNvbmZpZ3VyYWJsZSA6IHRydWUsXG5cdFx0XHRcdGVudW1lcmFibGUgICA6IHRydWUsXG5cdFx0XHRcdHdyaXRhYmxlICAgICA6IGZhbHNlLFxuXHRcdFx0XHR2YWx1ZSAgICAgICAgOiB0YXJnZXQuc3VidHlwZXMuZ2V0KHByb3ApXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIGRlc2NyaXB0b3JSZXN1bHQ7XG5cdFx0fVxuXHRcdGNvbnN0IG93blByb3BSZXN1bHQgPSBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3ApO1xuXHRcdHJldHVybiBvd25Qcm9wUmVzdWx0O1xuXHR9XG59O1xuXG5jb25zdCBjcmVhdGVUeXBlc0NvbGxlY3Rpb24gPSAoY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9KSA9PiB7XG5cblx0Y29uc3QgdHlwZXNDb2xsZWN0aW9uID0gbmV3IFR5cGVzQ29sbGVjdGlvbihjb25maWcpO1xuXHRjb25zdCB0eXBlc0NvbGxlY3Rpb25Qcm94eSA9IG5ldyBQcm94eShcblx0XHR0eXBlc0NvbGxlY3Rpb24sXG5cdFx0dHlwZXNDb2xsZWN0aW9uUHJveHlIYW5kbGVyXG5cdCk7XG5cblx0dHlwZXNDb2xsZWN0aW9ucy5zZXQoXG5cdFx0dHlwZXNDb2xsZWN0aW9uLFxuXHRcdHR5cGVzQ29sbGVjdGlvblByb3h5XG5cdCk7XG5cblx0cmV0dXJuIHR5cGVzQ29sbGVjdGlvblByb3h5O1xuXG59O1xuXG5jb25zdCBERUZBVUxUX1RZUEVTID0gY3JlYXRlVHlwZXNDb2xsZWN0aW9uKCk7XG5vZHAoXG5cdERFRkFVTFRfVFlQRVMsXG5cdFN5bWJvbERlZmF1bHRUeXBlc0NvbGxlY3Rpb24sXG5cdHtcblx0XHRnZXQgKCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG4pO1xuXG5leHBvcnQgY29uc3QgdHlwZXMgPSB7XG5cdGdldCBjcmVhdGVUeXBlc0NvbGxlY3Rpb24gKCk6IENyZWF0ZVR5cGVzQ29sbGVjdGlvbkZ1bmN0aW9uIHtcblx0XHRjb25zdCByZXN1bHQgPSA8XG5cdFx0XHRcdFQgZXh0ZW5kcyBvYmplY3QgPSB7fSxcblx0XHRcdFx0UGFyZW50IGV4dGVuZHMgb2JqZWN0ID0gb2JqZWN0XG5cdFx0XHRcdD4gKFxuXHRcdFx0XHRjb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge31cblx0XHRcdCk6IFR5cGVzQ29sbGVjdGlvbjxULCBQYXJlbnQ+ID0+IHtcblx0XHRcdGNvbnN0IGNvbGxlY3Rpb25SZXN1bHQgPSBjcmVhdGVUeXBlc0NvbGxlY3Rpb24oY29uZmlnKSBhcyBUeXBlc0NvbGxlY3Rpb248VCwgUGFyZW50Pjtcblx0XHRcdHJldHVybiBjb2xsZWN0aW9uUmVzdWx0O1xuXHRcdH07XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0Z2V0IGRlZmF1bHRUeXBlcyAoKTogVHlwZXNDb2xsZWN0aW9uIHtcblx0XHRjb25zdCByZXN1bHQgPSBERUZBVUxUX1RZUEVTIGFzIFR5cGVzQ29sbGVjdGlvbjtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cbn07XG4iXX0=