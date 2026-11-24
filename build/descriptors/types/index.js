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
const { registerHook, unregisterHook, invokeHook, registerFlowChecker, } = hooksAPI;
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
                if (typeof instance !== 'object' || instance === null) {
                    return false;
                }
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
        const result = function (TypeName, getter, config) {
            const lazyResult = types_1.lazy.call(result, subtypes, TypeName, getter, config);
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
Object.entries({
    registerHook,
    on: registerHook,
    unregisterHook,
    off: unregisterHook,
}).forEach(([methodName, hookMethod]) => {
    odp(TypesCollection.prototype, methodName, {
        get() {
            const self = this;
            const result = function (hookName, hookCallback) {
                const hookResult = hookMethod.call(self, hookName, hookCallback);
                return hookResult;
            }.bind(this);
            return result;
        },
        enumerable: true
    });
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
let defaultCollectionNamed = false;
let unnamedCollections = 0;
const createTypesCollection = (config = {}) => {
    const typesCollection = new TypesCollection(config);
    const collectionConfig = typesCollection[SymbolConfig];
    if (collectionConfig && !collectionConfig.name) {
        if (!defaultCollectionNamed) {
            collectionConfig.name = 'defaultTypes';
            defaultCollectionNamed = true;
        }
        else {
            unnamedCollections += 1;
            collectionConfig.name = `collection_${unnamedCollections}`;
        }
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVzY3JpcHRvcnMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQmIsK0NBQTRDO0FBQzVDLE1BQU0sRUFDTCxHQUFHLEVBQ0gscUJBQXFCLEVBQ3JCLDRCQUE0QixFQUM1QixZQUFZLEVBQ1osY0FBYyxFQUNkLGtCQUFrQixFQUNsQixTQUFTLEVBQ1QsU0FBUyxHQUNULEdBQUcscUJBQVMsQ0FBQztBQUdkLDJDQUV5QjtBQUV6QiwwREFBNEM7QUFFNUMsTUFBTSxFQUNMLFlBQVksRUFDWixjQUFjLEVBQ2QsVUFBVSxFQUNWLG1CQUFtQixHQUNuQixHQUFHLFFBQVEsQ0FBQztBQUViLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUVuQyxNQUFNLGVBQWUsR0FBRyxVQUFVLE9BQWdDO0lBRWpFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztJQUVsQixNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRzNCLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FDdkMsQ0FBQyxDQUEwQixFQUFFLEdBQVcsRUFBRSxFQUFFO1FBQzNDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBRSxHQUFHLENBQUUsQ0FBQztRQUM3QixNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDckMsTUFBTSxNQUFNLEdBQUcsT0FBTyxLQUFLLENBQUM7UUFDNUIsTUFBTSxNQUFNLEdBQUcsT0FBTyxNQUFNLENBQUM7UUFDN0IsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDdkIsQ0FBQyxDQUFFLEdBQUcsQ0FBRSxHQUFHLEtBQUssQ0FBQztRQUNsQixDQUFDO2FBQU0sQ0FBQztZQUNQLENBQUMs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O0FBRVcsUUFBQSxLQUFLLEdBQUc7SUFDcEIsSUFBSSxxQkFBcUI7UUFDeEIsTUFBTSxNQUFNLEdBQUcsQ0FJYixTQUFrQyxFQUFFLEVBQ1AsRUFBRTtZQUNoQyxNQUFNLGdCQUFnQixHQUFHLHFCQUFxQixDQUFDLE1BQU0sQ0FBK0IsQ0FBQztZQUNyRixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUMsQ0FBQztRQUNGLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUNELElBQUksWUFBWTtRQUNmLE1BQU0sTUFBTSxHQUFHLGFBQWdDLENBQUM7UUFDaEQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBRUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHR5cGUge1xuXHRfSW50ZXJuYWxfVENfLFxuXHRDcmVhdGVUeXBlc0NvbGxlY3Rpb25GdW5jdGlvbixcblx0VHlwZXNDb2xsZWN0aW9uLFxuXHRJREVGLFxuXHRob29rc09wdHMsXG5cdGhvb2ssXG5cdFN0YWNrQm91bmRhcnksXG5cdERlZmluZU5ld2FibGUsXG5cdERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHRGbG93Q2hlY2tlcixcblx0TGF6eURlZlxufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5jb25zdCB7XG5cdG9kcCxcblx0U3ltYm9sQ29uc3RydWN0b3JOYW1lLFxuXHRTeW1ib2xEZWZhdWx0VHlwZXNDb2xsZWN0aW9uLFxuXHRTeW1ib2xDb25maWcsXG5cdGRlZmF1bHRPcHRpb25zLFxuXHRkZWZhdWx0T3B0aW9uc0tleXMsXG5cdE1ORU1PTklDQSxcblx0TU5FTU9TWU5FLFxufSA9IGNvbnN0YW50cztcblxuLy8gaGVyZSBpcyBUeXBlc0NvbGxlY3Rpb24uZGVmaW5lKCkgbWV0aG9kXG5pbXBvcnQge1xuXHRkZWZpbmUsIGxhenksIGxvb2t1cCwgdHlwZSBUeXBlc01hcFxufSBmcm9tICcuLi8uLi9hcGkvdHlwZXMnO1xuXG5pbXBvcnQgKiBhcyBob29rc0FQSSBmcm9tICcuLi8uLi9hcGkvaG9va3MnO1xuXG5jb25zdCB7XG5cdHJlZ2lzdGVySG9vayxcblx0dW5yZWdpc3Rlckhvb2ssXG5cdGludm9rZUhvb2ssXG5cdHJlZ2lzdGVyRmxvd0NoZWNrZXIsXG59ID0gaG9va3NBUEk7XG5cbmNvbnN0IHR5cGVzQ29sbGVjdGlvbnMgPSBuZXcgTWFwKCk7XG5cbmNvbnN0IFR5cGVzQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChfY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdGNvbnN0IHN1YnR5cGVzID0gbmV3IE1hcCgpO1xuXG5cdC8vIGRlZmF1bHQgY29uZmlnIGlzIGxlc3MgaW1wb3J0YW50IHRoYW4gdHlwZXMgY29sbGVjdGlvbiBjb25maWdcblx0Y29uc3QgY29uZmlnID0gZGVmYXVsdE9wdGlvbnNLZXlzLnJlZHVjZShcblx0XHQobzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IF9jb25maWdbIGtleSBdO1xuXHRcdFx0Y29uc3Qgb3B0aW9uID0gZGVmYXVsdE9wdGlvbnNbIGtleSBdO1xuXHRcdFx0Y29uc3QgdF9jb25mID0gdHlwZW9mIHZhbHVlO1xuXHRcdFx0Y29uc3QgdF9vcHRzID0gdHlwZW9mIG9wdGlvbjtcblx0XHRcdGlmICh0X2NvbmYgPT09IHRfb3B0cykge1xuXHRcdFx0XHRvWyBrZXkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1sga2V5IF0gPSBvcHRpb247XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbztcblx0XHR9LFxuXHRcdHt9XG5cdCk7XG5cblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0U3ltYm9sQ29uZmlnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBjb25maWc7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdFN5bWJvbC5oYXNJbnN0YW5jZSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSAoaW5zdGFuY2U6IHsgW1N5bWJvbENvbnN0cnVjdG9yTmFtZV0/OiBzdHJpbmcgfSkgPT4ge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgaW5zdGFuY2UgIT09ICdvYmplY3QnIHx8IGluc3RhbmNlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGNoZWNrUmVzdWx0ID0gaW5zdGFuY2VbIFN5bWJvbENvbnN0cnVjdG9yTmFtZSBdID09PSBNTkVNT05JQ0E7XG5cdFx0XHRcdFx0cmV0dXJuIGNoZWNrUmVzdWx0O1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHQnc3VidHlwZXMnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBzdWJ0eXBlcztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Ly8gRm9yIGluc3RhbmNlb2YgTU5FTU9TWU5FXG5cdG9kcChcblx0XHRzdWJ0eXBlcyxcblx0XHRNTkVNT1NZTkUsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Ly8gcmV0dXJuaW5nIHByb3h5XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHNlbGYpO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHQvLyBGb3IgaW5zdGFuY2VvZiBNTkVNT1NZTkVcblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0TU5FTU9TWU5FLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdC8vIHJldHVybmluZyBwcm94eVxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldChzZWxmKTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Y29uc3QgaG9va3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHQnaG9va3MnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBob29rcztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cbn0gYXMgX0ludGVybmFsX1RDXzxvYmplY3Q+O1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdE1ORU1PTklDQSxcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldCh0aGlzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdkZWZpbmUnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHsgc3VidHlwZXMgfSA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IFN0YWNrQm91bmRhcnksXG5cdFx0XHRcdFR5cGVPclR5cGVOYW1lOiBzdHJpbmcgfCBEZWZpbmVOZXdhYmxlT3JDYWxsYWJsZSxcblx0XHRcdFx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnPzogRGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUgfCBvYmplY3QsXG5cdFx0XHRcdGNvbmZpZz86IG9iamVjdFxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIHBhc3MgYHJlc3VsdGAgaXRzZWxmIGFzIHRoZSBzdGFjay1jYXB0dXJlIGJvdW5kYXJ5IChTdGFja0JvdW5kYXJ5KTpcblx0XHRcdFx0Ly8gaXQgaXMgYSByZWFsIGNhbGxhYmxlIG9uIHRoZSBzdGFjaywgc28gY2FwdHVyZVN0YWNrVHJhY2Vcblx0XHRcdFx0Ly8gdHJ1bmNhdGVzIGF0IHRoZSB1c2VyJ3MgY2FsbCBzaXRlIGluc3RlYWQgb2Yga2VlcGluZyBpbnRlcm5hbCBmcmFtZXNcblx0XHRcdFx0Y29uc3QgZGVmaW5lUmVzdWx0ID0gZGVmaW5lLmNhbGwoXG5cdFx0XHRcdFx0cmVzdWx0LFxuXHRcdFx0XHRcdHN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFx0XHRcdFR5cGVPclR5cGVOYW1lLFxuXHRcdFx0XHRcdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZyxcblx0XHRcdFx0XHRjb25maWdcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGRlZmluZVJlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnbGF6eScsXG5cdHtcblx0XHRnZXQgKHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSkge1xuXHRcdFx0Y29uc3QgeyBzdWJ0eXBlcyB9ID0gdGhpcztcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChcblx0XHRcdFx0dGhpczogU3RhY2tCb3VuZGFyeSxcblx0XHRcdFx0VHlwZU5hbWU6IHN0cmluZyxcblx0XHRcdFx0Z2V0dGVyPzogTGF6eURlZjxvYmplY3Q+LFxuXHRcdFx0XHRjb25maWc/OiBvYmplY3Rcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBzYW1lIGFzIGluIGBkZWZpbmVgIGFib3ZlOiBwYXNzIGByZXN1bHRgIGl0c2VsZiBhcyB0aGVcblx0XHRcdFx0Ly8gc3RhY2stY2FwdHVyZSBib3VuZGFyeSwgbm90IHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuXHRcdFx0XHRjb25zdCBsYXp5UmVzdWx0ID0gbGF6eS5jYWxsKFxuXHRcdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0XHRzdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdFx0XHRUeXBlTmFtZSxcblx0XHRcdFx0XHRnZXR0ZXIsXG5cdFx0XHRcdFx0Y29uZmlnXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBsYXp5UmVzdWx0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdkZWNvcmF0ZScsXG5cdHtcblx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXHRcdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoY29uZmlnPzogb2JqZWN0IHwgYm9vbGVhbikge1xuXHRcdFx0XHRjb25zdCBkZWNvcmF0b3IgPSBmdW5jdGlvbiAoY3N0cjogRGVmaW5lTmV3YWJsZSkge1xuXHRcdFx0XHRcdGNvbnN0IHsgbmFtZSB9ID0gY3N0cjtcblx0XHRcdFx0XHRjb25zdCBkZWZpbmVSZXN1bHQgPSBzZWxmLmRlZmluZShcblx0XHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0XHRjc3RyIGFzIElERUY8b2JqZWN0Pixcblx0XHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIGRlZmluZVJlc3VsdDtcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIGRlY29yYXRvcjtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnbG9va3VwJyxcblx0e1xuXHRcdGdldCAodGhpczogeyBzdWJ0eXBlczogTWFwPHN0cmluZywgb2JqZWN0PiB9KSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSxcblx0XHRcdFx0VHlwZU5lc3RlZFBhdGg6IHN0cmluZ1xuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGxvb2t1cFJlc3VsdCA9IGxvb2t1cC5jYWxsKFxuXHRcdFx0XHRcdC8vIGEgY29sbGVjdGlvbidzIHN1YnR5cGVzIG1hcCBJUyB0aGUgcnVudGltZSBUeXBlc01hcCAodGhlXG5cdFx0XHRcdFx0Ly8gTU5FTU9TWU5FL1N5bWJvbFBhcmVudFR5cGUgcHJvcHMgYXJlIGluc3RhbGxlZCBhdFxuXHRcdFx0XHRcdC8vIGNvbnN0cnVjdGlvbiksIHNvIHRoZSBzaW5nbGUgY2FzdCBvbmx5IG5hbWVzIHRoYXQgdmlld1xuXHRcdFx0XHRcdHRoaXMuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRcdFx0VHlwZU5lc3RlZFBhdGhcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGxvb2t1cFJlc3VsdDtcblx0XHRcdH0uYmluZCh0aGlzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG4vLyBvbiAvIG9mZiBhcmUgdGhlIHNhbWUgdHdvIGZ1bmN0aW9ucyB1bmRlciBzaG9ydCBuYW1lc1xuT2JqZWN0LmVudHJpZXMoe1xuXHRyZWdpc3Rlckhvb2ssXG5cdG9uICA6IHJlZ2lzdGVySG9vayxcblx0dW5yZWdpc3Rlckhvb2ssXG5cdG9mZiA6IHVucmVnaXN0ZXJIb29rLFxufSkuZm9yRWFjaCgoWyBtZXRob2ROYW1lLCBob29rTWV0aG9kIF0pID0+IHtcblx0b2RwKFxuXHRcdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdFx0bWV0aG9kTmFtZSxcblx0XHR7XG5cdFx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXG5cdFx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoaG9va05hbWU6IHN0cmluZywgaG9va0NhbGxiYWNrOiBob29rKSB7XG5cdFx0XHRcdFx0Ly8gcmV0dXJuIHByb3RvLnJlZ2lzdGVySG9vay5jYWxsKCB0eXBlc0NvbGxlY3Rpb25zLmdldCggc2VsZiApLCBob29rTmFtZSwgaG9va0NhbGxiYWNrICk7XG5cdFx0XHRcdFx0Y29uc3QgaG9va1Jlc3VsdCA9IGhvb2tNZXRob2QuY2FsbChcblx0XHRcdFx0XHRcdHNlbGYsXG5cdFx0XHRcdFx0XHRob29rTmFtZSxcblx0XHRcdFx0XHRcdGhvb2tDYWxsYmFja1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIGhvb2tSZXN1bHQ7XG5cdFx0XHRcdH0uYmluZCh0aGlzKTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHRcdH1cblx0KTtcbn0pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdpbnZva2VIb29rJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSAoaG9va05hbWU6IHN0cmluZywgb3B0czogeyBbaW5kZXg6IHN0cmluZ106IHVua25vd24gfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBob29rUmVzdWx0ID0gaW52b2tlSG9vay5jYWxsKFxuXHRcdFx0XHRcdHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHRoaXMpLFxuXHRcdFx0XHRcdGhvb2tOYW1lLFxuXHRcdFx0XHRcdG9wdHMgYXMgaG9va3NPcHRzXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBob29rUmVzdWx0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdyZWdpc3RlckZsb3dDaGVja2VyJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSAoZmxvd0NoZWNrZXJDYWxsYmFjazogRmxvd0NoZWNrZXIpID0+IHtcblx0XHRcdFx0Y29uc3QgY2hlY2tlclJlc3VsdCA9IHJlZ2lzdGVyRmxvd0NoZWNrZXIuY2FsbChcblx0XHRcdFx0XHR0eXBlc0NvbGxlY3Rpb25zLmdldCh0aGlzKSxcblx0XHRcdFx0XHRmbG93Q2hlY2tlckNhbGxiYWNrXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBjaGVja2VyUmVzdWx0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG4pO1xuXG5cbmludGVyZmFjZSBUeXBlc0NvbGxlY3Rpb25UYXJnZXQge1xuXHRzdWJ0eXBlczogVHlwZXNNYXA7XG5cdGRlZmluZTogKG5hbWU6IHN0cmluZywgY3RvcjogRnVuY3Rpb25Db25zdHJ1Y3RvcikgPT4gb2JqZWN0O1xufVxuXG5jb25zdCB0eXBlc0NvbGxlY3Rpb25Qcm94eUhhbmRsZXIgPSB7XG5cdGdldCAodGFyZ2V0OiBUeXBlc0NvbGxlY3Rpb25UYXJnZXQsIHByb3A6IHN0cmluZykge1xuXHRcdGlmICh0YXJnZXQuc3VidHlwZXMuaGFzKHByb3ApKSB7XG5cdFx0XHQvLyBhY2Nlc3MgdG8gc3VidHlwZVxuXHRcdFx0Ly8gZm9yIG5ldyBjYWxsIG9yIGRlZmluaW5nIG5ldyB0eXBlXG5cdFx0XHRjb25zdCBzdWJ0eXBlUmVzdWx0ID0gdGFyZ2V0LnN1YnR5cGVzLmdldChwcm9wKTtcblx0XHRcdHJldHVybiBzdWJ0eXBlUmVzdWx0O1xuXHRcdH1cblx0XHRpZiAocHJvcCA9PT0gJ2RlZmluZScpIHtcblx0XHRcdC8vIHdpbGwgaG9wZWZ1bGx5IGRlZmluZSBuZXcgdHlwZVxuXHRcdFx0cmV0dXJuIHRhcmdldC5kZWZpbmU7XG5cdFx0fVxuXHRcdGNvbnN0IHJlZmxlY3RSZXN1bHQgPSBSZWZsZWN0LmdldChcblx0XHRcdHRhcmdldCxcblx0XHRcdHByb3Bcblx0XHQpO1xuXHRcdHJldHVybiByZWZsZWN0UmVzdWx0O1xuXHR9LFxuXHRzZXQgKHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBUeXBlTmFtZTogc3RyaW5nLCBDb25zdHJ1Y3RvcjogRnVuY3Rpb25Db25zdHJ1Y3Rvcikge1xuXHRcdHRhcmdldC5kZWZpbmUoXG5cdFx0XHRUeXBlTmFtZSxcblx0XHRcdENvbnN0cnVjdG9yXG5cdFx0KTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG5cdGdldE93blByb3BlcnR5RGVzY3JpcHRvciAodGFyZ2V0OiBUeXBlc0NvbGxlY3Rpb25UYXJnZXQsIHByb3A6IHN0cmluZykge1xuXHRcdGlmICh0YXJnZXQuc3VidHlwZXMuaGFzKHByb3ApKSB7XG5cdFx0XHRjb25zdCBkZXNjcmlwdG9yUmVzdWx0ID0ge1xuXHRcdFx0XHRjb25maWd1cmFibGUgOiB0cnVlLFxuXHRcdFx0XHRlbnVtZXJhYmxlICAgOiB0cnVlLFxuXHRcdFx0XHR3cml0YWJsZSAgICAgOiBmYWxzZSxcblx0XHRcdFx0dmFsdWUgICAgICAgIDogdGFyZ2V0LnN1YnR5cGVzLmdldChwcm9wKVxuXHRcdFx0fTtcblx0XHRcdHJldHVybiBkZXNjcmlwdG9yUmVzdWx0O1xuXHRcdH1cblx0XHRjb25zdCBvd25Qcm9wUmVzdWx0ID0gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wKTtcblx0XHRyZXR1cm4gb3duUHJvcFJlc3VsdDtcblx0fVxufTtcblxuLy8gZXZlcnkgY29sbGVjdGlvbiBleHBvcnRzIHVuZGVyIGV4YWN0bHkgb25lIG5hbWUgKGxldGhlIHR5cGUuY29sbGVjdGlvbik6XG4vLyB0aGUgZmlyc3QgY29sbGVjdGlvbiDigJQgdGhlIGRlZmF1bHQgb25lIOKAlCBpcyAnZGVmYXVsdFR5cGVzJzsgbGF0ZXJcbi8vIHVubmFtZWQgY29sbGVjdGlvbnMgZ2V0ICdjb2xsZWN0aW9uXzEnLCAnY29sbGVjdGlvbl8yJywg4oCmIGluIGNyZWF0aW9uXG4vLyBvcmRlciAodGhlIHNjaGVtZSB0YWN0aWNhIHdyaXRlcyBmb3IgbW5lbW9ncmFwaGljYSkuIE5vIHR3byBjb2xsZWN0aW9uc1xuLy8gbWF5IGV2ZXIgZXhwb3J0IHRoZSBzYW1lIG5hbWUuXG5sZXQgZGVmYXVsdENvbGxlY3Rpb25OYW1lZCA9IGZhbHNlO1xubGV0IHVubmFtZWRDb2xsZWN0aW9ucyA9IDA7XG5cbmNvbnN0IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiA9IChjb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge30pID0+IHtcblxuXHRjb25zdCB0eXBlc0NvbGxlY3Rpb24gPSBuZXcgVHlwZXNDb2xsZWN0aW9uKGNvbmZpZyk7XG5cdGNvbnN0IGNvbGxlY3Rpb25Db25maWcgPSAodHlwZXNDb2xsZWN0aW9uIGFzIHsgWyBTeW1ib2xDb25maWcgXT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+IH0pW1xuXHRcdFN5bWJvbENvbmZpZ1xuXHRdO1xuXHRpZiAoIGNvbGxlY3Rpb25Db25maWcgJiYgIWNvbGxlY3Rpb25Db25maWcubmFtZSApIHtcblx0XHRpZiAoICFkZWZhdWx0Q29sbGVjdGlvbk5hbWVkICkge1xuXHRcdFx0Y29sbGVjdGlvbkNvbmZpZy5uYW1lID0gJ2RlZmF1bHRUeXBlcyc7XG5cdFx0XHRkZWZhdWx0Q29sbGVjdGlvbk5hbWVkID0gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dW5uYW1lZENvbGxlY3Rpb25zICs9IDE7XG5cdFx0XHRjb2xsZWN0aW9uQ29uZmlnLm5hbWUgPSBgY29sbGVjdGlvbl8ke3VubmFtZWRDb2xsZWN0aW9uc31gO1xuXHRcdH1cblx0fVxuXHRjb25zdCB0eXBlc0NvbGxlY3Rpb25Qcm94eSA9IG5ldyBQcm94eShcblx0XHR0eXBlc0NvbGxlY3Rpb24sXG5cdFx0dHlwZXNDb2xsZWN0aW9uUHJveHlIYW5kbGVyXG5cdCk7XG5cblx0dHlwZXNDb2xsZWN0aW9ucy5zZXQoXG5cdFx0dHlwZXNDb2xsZWN0aW9uLFxuXHRcdHR5cGVzQ29sbGVjdGlvblByb3h5XG5cdCk7XG5cblx0cmV0dXJuIHR5cGVzQ29sbGVjdGlvblByb3h5O1xuXG59O1xuXG5jb25zdCBERUZBVUxUX1RZUEVTID0gY3JlYXRlVHlwZXNDb2xsZWN0aW9uKCk7XG5vZHAoXG5cdERFRkFVTFRfVFlQRVMsXG5cdFN5bWJvbERlZmF1bHRUeXBlc0NvbGxlY3Rpb24sXG5cdHtcblx0XHRnZXQgKCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG4pO1xuXG5leHBvcnQgY29uc3QgdHlwZXMgPSB7XG5cdGdldCBjcmVhdGVUeXBlc0NvbGxlY3Rpb24gKCk6IENyZWF0ZVR5cGVzQ29sbGVjdGlvbkZ1bmN0aW9uIHtcblx0XHRjb25zdCByZXN1bHQgPSA8XG5cdFx0XHRcdFQgZXh0ZW5kcyBvYmplY3QgPSB7fSxcblx0XHRcdFx0UGFyZW50IGV4dGVuZHMgb2JqZWN0ID0gb2JqZWN0XG5cdFx0XHRcdD4gKFxuXHRcdFx0XHRjb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge31cblx0XHRcdCk6IFR5cGVzQ29sbGVjdGlvbjxULCBQYXJlbnQ+ID0+IHtcblx0XHRcdGNvbnN0IGNvbGxlY3Rpb25SZXN1bHQgPSBjcmVhdGVUeXBlc0NvbGxlY3Rpb24oY29uZmlnKSBhcyBUeXBlc0NvbGxlY3Rpb248VCwgUGFyZW50Pjtcblx0XHRcdHJldHVybiBjb2xsZWN0aW9uUmVzdWx0O1xuXHRcdH07XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0Z2V0IGRlZmF1bHRUeXBlcyAoKTogVHlwZXNDb2xsZWN0aW9uIHtcblx0XHRjb25zdCByZXN1bHQgPSBERUZBVUxUX1RZUEVTIGFzIFR5cGVzQ29sbGVjdGlvbjtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cbn07XG4iXX0=