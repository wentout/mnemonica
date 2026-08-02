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
            const defineResult = types_1.define.call(this, subtypes, TypeOrTypeName, constructHandlerOrConfig, config);
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
                lazyResult = types_1.lazy.call(this, subtypes, name, getter, config);
            }
            else {
                lazyResult = types_1.lazy.call(this, subtypes, getter, config);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVzY3JpcHRvcnMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFZYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxxQkFBcUIsRUFDckIsNEJBQTRCLEVBQzVCLFlBQVksRUFDWixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLFNBQVMsRUFDVCxTQUFTLEdBQ1QsR0FBRyxxQkFBUyxDQUFDO0FBR2QsMkNBRXlCO0FBRXpCLDBEQUE0QztBQUU1QyxNQUFNLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFDVixtQkFBbUIsR0FDbkIsR0FBRyxRQUFRLENBQUM7QUFFYixNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFbkMsTUFBTSxlQUFlLEdBQUcsVUFBVSxPQUFnQztJQUVqRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUczQixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQ3ZDLENBQUMsQ0FBMEIsRUFBRSxHQUFXLEVBQUUsRUFBRTtRQUMzQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDN0IsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sS0FBSyxDQUFDO1FBQzVCLE1BQU0sTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDO1FBQzdCLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLENBQUMsQ0FBRSxHQUFHLENBQUUsR0FBRyxLQUFLLENBQUM7UUFDbEIsQ0FBQzthQUFNLENBQUM7WUFDUCxDQUFDLENBQUUsR0FBRyxD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QU0sR0FBRyxhQUFnQyxDQUFDO1FBQ2hELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUVELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0eXBlIHtcblx0X0ludGVybmFsX1RDXyxcblx0Q3JlYXRlVHlwZXNDb2xsZWN0aW9uRnVuY3Rpb24sXG5cdFR5cGVzQ29sbGVjdGlvbixcblx0VHlwZUNsYXNzLFxuXHRJREVGLFxuXHRob29rc09wdHMsXG5cdGhvb2tcbn0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuY29uc3Qge1xuXHRvZHAsXG5cdFN5bWJvbENvbnN0cnVjdG9yTmFtZSxcblx0U3ltYm9sRGVmYXVsdFR5cGVzQ29sbGVjdGlvbixcblx0U3ltYm9sQ29uZmlnLFxuXHRkZWZhdWx0T3B0aW9ucyxcblx0ZGVmYXVsdE9wdGlvbnNLZXlzLFxuXHRNTkVNT05JQ0EsXG5cdE1ORU1PU1lORSxcbn0gPSBjb25zdGFudHM7XG5cbi8vIGhlcmUgaXMgVHlwZXNDb2xsZWN0aW9uLmRlZmluZSgpIG1ldGhvZFxuaW1wb3J0IHtcblx0ZGVmaW5lLCBsYXp5LCBsb29rdXAsIHR5cGUgVHlwZXNNYXAsIHR5cGUgTGF6eVR5cGVHZXR0ZXJcbn0gZnJvbSAnLi4vLi4vYXBpL3R5cGVzJztcblxuaW1wb3J0ICogYXMgaG9va3NBUEkgZnJvbSAnLi4vLi4vYXBpL2hvb2tzJztcblxuY29uc3Qge1xuXHRyZWdpc3Rlckhvb2ssXG5cdGludm9rZUhvb2ssXG5cdHJlZ2lzdGVyRmxvd0NoZWNrZXIsXG59ID0gaG9va3NBUEk7XG5cbmNvbnN0IHR5cGVzQ29sbGVjdGlvbnMgPSBuZXcgTWFwKCk7XG5cbmNvbnN0IFR5cGVzQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChfY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdGNvbnN0IHN1YnR5cGVzID0gbmV3IE1hcCgpO1xuXG5cdC8vIGRlZmF1bHQgY29uZmlnIGlzIGxlc3MgaW1wb3J0YW50IHRoYW4gdHlwZXMgY29sbGVjdGlvbiBjb25maWdcblx0Y29uc3QgY29uZmlnID0gZGVmYXVsdE9wdGlvbnNLZXlzLnJlZHVjZShcblx0XHQobzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IF9jb25maWdbIGtleSBdO1xuXHRcdFx0Y29uc3Qgb3B0aW9uID0gZGVmYXVsdE9wdGlvbnNbIGtleSBdO1xuXHRcdFx0Y29uc3QgdF9jb25mID0gdHlwZW9mIHZhbHVlO1xuXHRcdFx0Y29uc3QgdF9vcHRzID0gdHlwZW9mIG9wdGlvbjtcblx0XHRcdGlmICh0X2NvbmYgPT09IHRfb3B0cykge1xuXHRcdFx0XHRvWyBrZXkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1sga2V5IF0gPSBvcHRpb247XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbztcblx0XHR9LFxuXHRcdHt9XG5cdCk7XG5cblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0U3ltYm9sQ29uZmlnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdFN5bWJvbC5oYXNJbnN0YW5jZSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSAoaW5zdGFuY2U6IHsgW1N5bWJvbENvbnN0cnVjdG9yTmFtZV0/OiBzdHJpbmcgfSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGNoZWNrUmVzdWx0ID0gaW5zdGFuY2VbIFN5bWJvbENvbnN0cnVjdG9yTmFtZSBdID09PSBNTkVNT05JQ0E7XG5cdFx0XHRcdFx0cmV0dXJuIGNoZWNrUmVzdWx0O1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHQnc3VidHlwZXMnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBzdWJ0eXBlcztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Ly8gRm9yIGluc3RhbmNlb2YgTU5FTU9TWU5FXG5cdG9kcChcblx0XHRzdWJ0eXBlcyxcblx0XHRNTkVNT1NZTkUsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Ly8gcmV0dXJuaW5nIHByb3h5XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHNlbGYpO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHQvLyBGb3IgaW5zdGFuY2VvZiBNTkVNT1NZTkVcblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0TU5FTU9TWU5FLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdC8vIHJldHVybmluZyBwcm94eVxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldChzZWxmKTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Y29uc3QgaG9va3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHQnaG9va3MnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBob29rcztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cbn0gYXMgX0ludGVybmFsX1RDXzxvYmplY3Q+O1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdE1ORU1PTklDQSxcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldCh0aGlzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdkZWZpbmUnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHsgc3VidHlwZXMgfSA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IENhbGxhYmxlRnVuY3Rpb24sXG5cdFx0XHRcdFR5cGVPclR5cGVOYW1lOiBzdHJpbmcgfCBDYWxsYWJsZUZ1bmN0aW9uLFxuXHRcdFx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWc/OiBDYWxsYWJsZUZ1bmN0aW9uIHwgb2JqZWN0LFxuXHRcdFx0XHRjb25maWc/OiBvYmplY3Rcblx0XHRcdCkge1xuXHRcdFx0XHQvLyB0aGlzIC0gZGVmaW5lIGZ1bmN0aW9uIG9mIG1uZW1vbmljYSBpbnRlcmZhY2Vcblx0XHRcdFx0Y29uc3QgZGVmaW5lUmVzdWx0ID0gZGVmaW5lLmNhbGwoXG5cdFx0XHRcdFx0dGhpcyBhcyB1bmtub3duLFxuXHRcdFx0XHRcdHN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFx0XHRcdFR5cGVPclR5cGVOYW1lLFxuXHRcdFx0XHRcdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyxcblx0XHRcdFx0XHRjb25maWdcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGRlZmluZVJlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnbGF6eScsXG5cdHtcblx0XHRnZXQgKHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSkge1xuXHRcdFx0Y29uc3QgeyBzdWJ0eXBlcyB9ID0gdGhpcztcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChcblx0XHRcdFx0dGhpczogQ2FsbGFibGVGdW5jdGlvbixcblx0XHRcdFx0YXJnMTogc3RyaW5nIHwgQ2FsbGFibGVGdW5jdGlvbixcblx0XHRcdFx0YXJnMj86IENhbGxhYmxlRnVuY3Rpb24gfCBvYmplY3QsXG5cdFx0XHRcdGFyZzM/OiBvYmplY3Rcblx0XHRcdCkge1xuXHRcdFx0XHRsZXQgbmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRsZXQgZ2V0dGVyOiBMYXp5VHlwZUdldHRlcjtcblx0XHRcdFx0bGV0IGNvbmZpZzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRpZiAodHlwZW9mIGFyZzEgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0bmFtZSA9IGFyZzE7XG5cdFx0XHRcdFx0Z2V0dGVyID0gYXJnMiBhcyBMYXp5VHlwZUdldHRlcjtcblx0XHRcdFx0XHRjb25maWcgPSBhcmczO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGdldHRlciA9IGFyZzEgYXMgTGF6eVR5cGVHZXR0ZXI7XG5cdFx0XHRcdFx0Y29uZmlnID0gYXJnMiBhcyBvYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IGxhenlSZXN1bHQ6IFR5cGVDbGFzcztcblx0XHRcdFx0aWYgKG5hbWUpIHtcblx0XHRcdFx0XHRsYXp5UmVzdWx0ID0gbGF6eS5jYWxsKFxuXHRcdFx0XHRcdFx0dGhpcyBhcyB1bmtub3duLFxuXHRcdFx0XHRcdFx0c3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0Z2V0dGVyIGFzIExhenlUeXBlR2V0dGVyLFxuXHRcdFx0XHRcdFx0Y29uZmlnXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRsYXp5UmVzdWx0ID0gbGF6eS5jYWxsKFxuXHRcdFx0XHRcdFx0dGhpcyBhcyB1bmtub3duLFxuXHRcdFx0XHRcdFx0c3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRcdFx0XHRnZXR0ZXIgYXMgTGF6eVR5cGVHZXR0ZXIsXG5cdFx0XHRcdFx0XHRjb25maWdcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBsYXp5UmVzdWx0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdkZWNvcmF0ZScsXG5cdHtcblx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXHRcdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoY29uZmlnPzogb2JqZWN0KSB7XG5cdFx0XHRcdGNvbnN0IGRlY29yYXRvciA9IGZ1bmN0aW9uIChjc3RyOiBDYWxsYWJsZUZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBuYW1lIH0gPSBjc3RyO1xuXHRcdFx0XHRcdGNvbnN0IGRlZmluZVJlc3VsdCA9IHNlbGYuZGVmaW5lKFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdGNzdHIgYXMgSURFRjxvYmplY3Q+LFxuXHRcdFx0XHRcdFx0Y29uZmlnXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm4gZGVmaW5lUmVzdWx0O1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gZGVjb3JhdG9yO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdsb29rdXAnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChcblx0XHRcdFx0dGhpczogeyBzdWJ0eXBlczogTWFwPHN0cmluZywgb2JqZWN0PiB9LFxuXHRcdFx0XHRUeXBlTmVzdGVkUGF0aDogc3RyaW5nXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgbG9va3VwUmVzdWx0ID0gbG9va3VwLmNhbGwoXG5cdFx0XHRcdFx0dGhpcy5zdWJ0eXBlcyBhcyB1bmtub3duIGFzIFR5cGVzTWFwLFxuXHRcdFx0XHRcdFR5cGVOZXN0ZWRQYXRoXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBsb29rdXBSZXN1bHQ7XG5cdFx0XHR9LmJpbmQodGhpcyk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQncmVnaXN0ZXJIb29rJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKGhvb2tOYW1lOiBzdHJpbmcsIGhvb2tDYWxsYmFjazogaG9vaykge1xuXHRcdFx0XHQvLyByZXR1cm4gcHJvdG8ucmVnaXN0ZXJIb29rLmNhbGwoIHR5cGVzQ29sbGVjdGlvbnMuZ2V0KCBzZWxmICksIGhvb2tOYW1lLCBob29rQ2FsbGJhY2sgKTtcblx0XHRcdFx0Y29uc3QgaG9va1Jlc3VsdCA9IHJlZ2lzdGVySG9vay5jYWxsKFxuXHRcdFx0XHRcdHNlbGYsXG5cdFx0XHRcdFx0aG9va05hbWUsXG5cdFx0XHRcdFx0aG9va0NhbGxiYWNrXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBob29rUmVzdWx0O1xuXHRcdFx0fS5iaW5kKHRoaXMpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2ludm9rZUhvb2snLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IChob29rTmFtZTogc3RyaW5nLCBvcHRzOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGhvb2tSZXN1bHQgPSBpbnZva2VIb29rLmNhbGwoXG5cdFx0XHRcdFx0dHlwZXNDb2xsZWN0aW9ucy5nZXQodGhpcyksXG5cdFx0XHRcdFx0aG9va05hbWUsXG5cdFx0XHRcdFx0b3B0cyBhcyBob29rc09wdHNcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGhvb2tSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J3JlZ2lzdGVyRmxvd0NoZWNrZXInLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IChmbG93Q2hlY2tlckNhbGxiYWNrOiAoKSA9PiB1bmtub3duKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNoZWNrZXJSZXN1bHQgPSByZWdpc3RlckZsb3dDaGVja2VyLmNhbGwoXG5cdFx0XHRcdFx0dHlwZXNDb2xsZWN0aW9ucy5nZXQodGhpcyksXG5cdFx0XHRcdFx0Zmxvd0NoZWNrZXJDYWxsYmFja1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gY2hlY2tlclJlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuKTtcblxuXG5pbnRlcmZhY2UgVHlwZXNDb2xsZWN0aW9uVGFyZ2V0IHtcblx0c3VidHlwZXM6IFR5cGVzTWFwO1xuXHRkZWZpbmU6IChuYW1lOiBzdHJpbmcsIGN0b3I6IEZ1bmN0aW9uQ29uc3RydWN0b3IpID0+IG9iamVjdDtcbn1cblxuY29uc3QgdHlwZXNDb2xsZWN0aW9uUHJveHlIYW5kbGVyID0ge1xuXHRnZXQgKHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBwcm9wOiBzdHJpbmcpIHtcblx0XHRpZiAodGFyZ2V0LnN1YnR5cGVzLmhhcyhwcm9wKSkge1xuXHRcdFx0Ly8gYWNjZXNzIHRvIHN1YnR5cGVcblx0XHRcdC8vIGZvciBuZXcgY2FsbCBvciBkZWZpbmluZyBuZXcgdHlwZVxuXHRcdFx0Y29uc3Qgc3VidHlwZVJlc3VsdCA9IHRhcmdldC5zdWJ0eXBlcy5nZXQocHJvcCk7XG5cdFx0XHRyZXR1cm4gc3VidHlwZVJlc3VsdDtcblx0XHR9XG5cdFx0aWYgKHByb3AgPT09ICdkZWZpbmUnKSB7XG5cdFx0XHQvLyB3aWxsIGhvcGVmdWxseSBkZWZpbmUgbmV3IHR5cGVcblx0XHRcdHJldHVybiB0YXJnZXQuZGVmaW5lO1xuXHRcdH1cblx0XHRjb25zdCByZWZsZWN0UmVzdWx0ID0gUmVmbGVjdC5nZXQoXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRwcm9wXG5cdFx0KTtcblx0XHRyZXR1cm4gcmVmbGVjdFJlc3VsdDtcblx0fSxcblx0c2V0ICh0YXJnZXQ6IFR5cGVzQ29sbGVjdGlvblRhcmdldCwgVHlwZU5hbWU6IHN0cmluZywgQ29uc3RydWN0b3I6IEZ1bmN0aW9uQ29uc3RydWN0b3IpIHtcblx0XHR0YXJnZXQuZGVmaW5lKFxuXHRcdFx0VHlwZU5hbWUsXG5cdFx0XHRDb25zdHJ1Y3RvclxuXHRcdCk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuXHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgKHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBwcm9wOiBzdHJpbmcpIHtcblx0XHRpZiAodGFyZ2V0LnN1YnR5cGVzLmhhcyhwcm9wKSkge1xuXHRcdFx0Y29uc3QgZGVzY3JpcHRvclJlc3VsdCA9IHtcblx0XHRcdFx0Y29uZmlndXJhYmxlIDogdHJ1ZSxcblx0XHRcdFx0ZW51bWVyYWJsZSAgIDogdHJ1ZSxcblx0XHRcdFx0d3JpdGFibGUgICAgIDogZmFsc2UsXG5cdFx0XHRcdHZhbHVlICAgICAgICA6IHRhcmdldC5zdWJ0eXBlcy5nZXQocHJvcClcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gZGVzY3JpcHRvclJlc3VsdDtcblx0XHR9XG5cdFx0Y29uc3Qgb3duUHJvcFJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcCk7XG5cdFx0cmV0dXJuIG93blByb3BSZXN1bHQ7XG5cdH1cbn07XG5cbmNvbnN0IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiA9IChjb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge30pID0+IHtcblxuXHRjb25zdCB0eXBlc0NvbGxlY3Rpb24gPSBuZXcgVHlwZXNDb2xsZWN0aW9uKGNvbmZpZyk7XG5cdGNvbnN0IHR5cGVzQ29sbGVjdGlvblByb3h5ID0gbmV3IFByb3h5KFxuXHRcdHR5cGVzQ29sbGVjdGlvbixcblx0XHR0eXBlc0NvbGxlY3Rpb25Qcm94eUhhbmRsZXJcblx0KTtcblxuXHR0eXBlc0NvbGxlY3Rpb25zLnNldChcblx0XHR0eXBlc0NvbGxlY3Rpb24sXG5cdFx0dHlwZXNDb2xsZWN0aW9uUHJveHlcblx0KTtcblxuXHRyZXR1cm4gdHlwZXNDb2xsZWN0aW9uUHJveHk7XG5cbn07XG5cbmNvbnN0IERFRkFVTFRfVFlQRVMgPSBjcmVhdGVUeXBlc0NvbGxlY3Rpb24oKTtcbm9kcChcblx0REVGQVVMVF9UWVBFUyxcblx0U3ltYm9sRGVmYXVsdFR5cGVzQ29sbGVjdGlvbixcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cbik7XG5cbmV4cG9ydCBjb25zdCB0eXBlcyA9IHtcblx0Z2V0IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiAoKTogQ3JlYXRlVHlwZXNDb2xsZWN0aW9uRnVuY3Rpb24ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IDxcblx0XHRcdFx0VCBleHRlbmRzIG9iamVjdCA9IHt9LFxuXHRcdFx0XHRQYXJlbnQgZXh0ZW5kcyBvYmplY3QgPSBvYmplY3Rcblx0XHRcdFx0PiAoXG5cdFx0XHRcdGNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fVxuXHRcdFx0KTogVHlwZXNDb2xsZWN0aW9uPFQsIFBhcmVudD4gPT4ge1xuXHRcdFx0Y29uc3QgY29sbGVjdGlvblJlc3VsdCA9IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbihjb25maWcpIGFzIFR5cGVzQ29sbGVjdGlvbjxULCBQYXJlbnQ+O1xuXHRcdFx0cmV0dXJuIGNvbGxlY3Rpb25SZXN1bHQ7XG5cdFx0fTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRnZXQgZGVmYXVsdFR5cGVzICgpOiBUeXBlc0NvbGxlY3Rpb24ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IERFRkFVTFRfVFlQRVMgYXMgVHlwZXNDb2xsZWN0aW9uO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxufTtcbiJdfQ==