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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVzY3JpcHRvcnMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQmIsK0NBQTRDO0FBQzVDLE1BQU0sRUFDTCxHQUFHLEVBQ0gscUJBQXFCLEVBQ3JCLDRCQUE0QixFQUM1QixZQUFZLEVBQ1osY0FBYyxFQUNkLGtCQUFrQixFQUNsQixTQUFTLEVBQ1QsU0FBUyxHQUNULEdBQUcscUJBQVMsQ0FBQztBQUdkLDJDQUV5QjtBQUV6QiwwREFBNEM7QUFFNUMsTUFBTSxFQUNMLFlBQVksRUFDWixVQUFVLEVBQ1YsbUJBQW1CLEdBQ25CLEdBQUcsUUFBUSxDQUFDO0FBRWIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRW5DLE1BQU0sZUFBZSxHQUFHLFVBQVUsT0FBZ0M7SUFFakUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBRWxCLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFHM0IsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUN2QyxDQUFDLENBQTBCLEVBQUUsR0FBVyxFQUFFLEVBQUU7UUFDM0MsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQzdCLE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBRSxHQUFHLENBQUUsQ0FBQztRQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLEtBQUssQ0FBQztRQUM1QixNQUFNLE1BQU0sR0FBRyxPQUFPLE1BQU0sQ0FBQztRQUM3QixJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUN2QixDQUFDLENBQUUsR0FBRyxDQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLENBQUM7YUFBTSxDQUFDO1lBQ1AsQ0FBQyxDQUFFLEdBQUcs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QUM7Q0FFRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdHlwZSB7XG5cdF9JbnRlcm5hbF9UQ18sXG5cdENyZWF0ZVR5cGVzQ29sbGVjdGlvbkZ1bmN0aW9uLFxuXHRUeXBlc0NvbGxlY3Rpb24sXG5cdElERUYsXG5cdGhvb2tzT3B0cyxcblx0aG9vayxcblx0U3RhY2tCb3VuZGFyeSxcblx0RGVmaW5lTmV3YWJsZSxcblx0RGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUsXG5cdEZsb3dDaGVja2VyLFxuXHRMYXp5RGVmXG59IGZyb20gJy4uLy4uL3R5cGVzJztcblxuaW1wb3J0IHsgY29uc3RhbnRzIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcbmNvbnN0IHtcblx0b2RwLFxuXHRTeW1ib2xDb25zdHJ1Y3Rvck5hbWUsXG5cdFN5bWJvbERlZmF1bHRUeXBlc0NvbGxlY3Rpb24sXG5cdFN5bWJvbENvbmZpZyxcblx0ZGVmYXVsdE9wdGlvbnMsXG5cdGRlZmF1bHRPcHRpb25zS2V5cyxcblx0TU5FTU9OSUNBLFxuXHRNTkVNT1NZTkUsXG59ID0gY29uc3RhbnRzO1xuXG4vLyBoZXJlIGlzIFR5cGVzQ29sbGVjdGlvbi5kZWZpbmUoKSBtZXRob2RcbmltcG9ydCB7XG5cdGRlZmluZSwgbGF6eSwgbG9va3VwLCB0eXBlIFR5cGVzTWFwXG59IGZyb20gJy4uLy4uL2FwaS90eXBlcyc7XG5cbmltcG9ydCAqIGFzIGhvb2tzQVBJIGZyb20gJy4uLy4uL2FwaS9ob29rcyc7XG5cbmNvbnN0IHtcblx0cmVnaXN0ZXJIb29rLFxuXHRpbnZva2VIb29rLFxuXHRyZWdpc3RlckZsb3dDaGVja2VyLFxufSA9IGhvb2tzQVBJO1xuXG5jb25zdCB0eXBlc0NvbGxlY3Rpb25zID0gbmV3IE1hcCgpO1xuXG5jb25zdCBUeXBlc0NvbGxlY3Rpb24gPSBmdW5jdGlvbiAoX2NvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pIHtcblxuXHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRjb25zdCBzdWJ0eXBlcyA9IG5ldyBNYXAoKTtcblxuXHQvLyBkZWZhdWx0IGNvbmZpZyBpcyBsZXNzIGltcG9ydGFudCB0aGFuIHR5cGVzIGNvbGxlY3Rpb24gY29uZmlnXG5cdGNvbnN0IGNvbmZpZyA9IGRlZmF1bHRPcHRpb25zS2V5cy5yZWR1Y2UoXG5cdFx0KG86IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBrZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBfY29uZmlnWyBrZXkgXTtcblx0XHRcdGNvbnN0IG9wdGlvbiA9IGRlZmF1bHRPcHRpb25zWyBrZXkgXTtcblx0XHRcdGNvbnN0IHRfY29uZiA9IHR5cGVvZiB2YWx1ZTtcblx0XHRcdGNvbnN0IHRfb3B0cyA9IHR5cGVvZiBvcHRpb247XG5cdFx0XHRpZiAodF9jb25mID09PSB0X29wdHMpIHtcblx0XHRcdFx0b1sga2V5IF0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9bIGtleSBdID0gb3B0aW9uO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG87XG5cdFx0fSxcblx0XHR7fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdFN5bWJvbENvbmZpZyxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gY29uZmlnO1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHRTeW1ib2wuaGFzSW5zdGFuY2UsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gKGluc3RhbmNlOiB7IFtTeW1ib2xDb25zdHJ1Y3Rvck5hbWVdPzogc3RyaW5nIH0pID0+IHtcblx0XHRcdFx0XHRjb25zdCBjaGVja1Jlc3VsdCA9IGluc3RhbmNlWyBTeW1ib2xDb25zdHJ1Y3Rvck5hbWUgXSA9PT0gTU5FTU9OSUNBO1xuXHRcdFx0XHRcdHJldHVybiBjaGVja1Jlc3VsdDtcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0J3N1YnR5cGVzJyxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gc3VidHlwZXM7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdC8vIEZvciBpbnN0YW5jZW9mIE1ORU1PU1lORVxuXHRvZHAoXG5cdFx0c3VidHlwZXMsXG5cdFx0TU5FTU9TWU5FLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdC8vIHJldHVybmluZyBwcm94eVxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldChzZWxmKTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0Ly8gRm9yIGluc3RhbmNlb2YgTU5FTU9TWU5FXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdE1ORU1PU1lORSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHQvLyByZXR1cm5pbmcgcHJveHlcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gdHlwZXNDb2xsZWN0aW9ucy5nZXQoc2VsZik7XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdGNvbnN0IGhvb2tzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0J2hvb2tzJyxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gaG9va3M7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG59IGFzIF9JbnRlcm5hbF9UQ188b2JqZWN0Pjtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHRNTkVNT05JQ0EsXG5cdHtcblx0XHRnZXQgKCkge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gdHlwZXNDb2xsZWN0aW9ucy5nZXQodGhpcyk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnZGVmaW5lJyxcblx0e1xuXHRcdGdldCAodGhpczogeyBzdWJ0eXBlczogTWFwPHN0cmluZywgb2JqZWN0PiB9KSB7XG5cdFx0XHRjb25zdCB7IHN1YnR5cGVzIH0gPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKFxuXHRcdFx0XHR0aGlzOiBTdGFja0JvdW5kYXJ5LFxuXHRcdFx0XHRUeXBlT3JUeXBlTmFtZTogc3RyaW5nIHwgRGVmaW5lTmV3YWJsZU9yQ2FsbGFibGUsXG5cdFx0XHRcdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZz86IERlZmluZU5ld2FibGVPckNhbGxhYmxlIHwgb2JqZWN0LFxuXHRcdFx0XHRjb25maWc/OiBvYmplY3Rcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBwYXNzIGByZXN1bHRgIGl0c2VsZiBhcyB0aGUgc3RhY2stY2FwdHVyZSBib3VuZGFyeSAoU3RhY2tCb3VuZGFyeSk6XG5cdFx0XHRcdC8vIGl0IGlzIGEgcmVhbCBjYWxsYWJsZSBvbiB0aGUgc3RhY2ssIHNvIGNhcHR1cmVTdGFja1RyYWNlXG5cdFx0XHRcdC8vIHRydW5jYXRlcyBhdCB0aGUgdXNlcidzIGNhbGwgc2l0ZSBpbnN0ZWFkIG9mIGtlZXBpbmcgaW50ZXJuYWwgZnJhbWVzXG5cdFx0XHRcdGNvbnN0IGRlZmluZVJlc3VsdCA9IGRlZmluZS5jYWxsKFxuXHRcdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0XHRzdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdFx0XHRUeXBlT3JUeXBlTmFtZSxcblx0XHRcdFx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcsXG5cdFx0XHRcdFx0Y29uZmlnXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2xhenknLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHsgc3VidHlwZXMgfSA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IFN0YWNrQm91bmRhcnksXG5cdFx0XHRcdFR5cGVOYW1lOiBzdHJpbmcsXG5cdFx0XHRcdGdldHRlcj86IExhenlEZWY8b2JqZWN0Pixcblx0XHRcdFx0Y29uZmlnPzogb2JqZWN0XG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gc2FtZSBhcyBpbiBgZGVmaW5lYCBhYm92ZTogcGFzcyBgcmVzdWx0YCBpdHNlbGYgYXMgdGhlXG5cdFx0XHRcdC8vIHN0YWNrLWNhcHR1cmUgYm91bmRhcnksIG5vdCB0aGUgY29sbGVjdGlvbiBvYmplY3Rcblx0XHRcdFx0Y29uc3QgbGF6eVJlc3VsdCA9IGxhenkuY2FsbChcblx0XHRcdFx0XHRyZXN1bHQsXG5cdFx0XHRcdFx0c3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRcdFx0VHlwZU5hbWUsXG5cdFx0XHRcdFx0Z2V0dGVyLFxuXHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gbGF6eVJlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnZGVjb3JhdGUnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKGNvbmZpZz86IG9iamVjdCkge1xuXHRcdFx0XHRjb25zdCBkZWNvcmF0b3IgPSBmdW5jdGlvbiAoY3N0cjogRGVmaW5lTmV3YWJsZSkge1xuXHRcdFx0XHRcdGNvbnN0IHsgbmFtZSB9ID0gY3N0cjtcblx0XHRcdFx0XHRjb25zdCBkZWZpbmVSZXN1bHQgPSBzZWxmLmRlZmluZShcblx0XHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0XHRjc3RyIGFzIElERUY8b2JqZWN0Pixcblx0XHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIGRlZmluZVJlc3VsdDtcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIGRlY29yYXRvcjtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnbG9va3VwJyxcblx0e1xuXHRcdGdldCAodGhpczogeyBzdWJ0eXBlczogTWFwPHN0cmluZywgb2JqZWN0PiB9KSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSxcblx0XHRcdFx0VHlwZU5lc3RlZFBhdGg6IHN0cmluZ1xuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGxvb2t1cFJlc3VsdCA9IGxvb2t1cC5jYWxsKFxuXHRcdFx0XHRcdC8vIGEgY29sbGVjdGlvbidzIHN1YnR5cGVzIG1hcCBJUyB0aGUgcnVudGltZSBUeXBlc01hcCAodGhlXG5cdFx0XHRcdFx0Ly8gTU5FTU9TWU5FL1N5bWJvbFBhcmVudFR5cGUgcHJvcHMgYXJlIGluc3RhbGxlZCBhdFxuXHRcdFx0XHRcdC8vIGNvbnN0cnVjdGlvbiksIHNvIHRoZSBzaW5nbGUgY2FzdCBvbmx5IG5hbWVzIHRoYXQgdmlld1xuXHRcdFx0XHRcdHRoaXMuc3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRcdFx0VHlwZU5lc3RlZFBhdGhcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGxvb2t1cFJlc3VsdDtcblx0XHRcdH0uYmluZCh0aGlzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdyZWdpc3Rlckhvb2snLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblxuXHRcdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoaG9va05hbWU6IHN0cmluZywgaG9va0NhbGxiYWNrOiBob29rKSB7XG5cdFx0XHRcdC8vIHJldHVybiBwcm90by5yZWdpc3Rlckhvb2suY2FsbCggdHlwZXNDb2xsZWN0aW9ucy5nZXQoIHNlbGYgKSwgaG9va05hbWUsIGhvb2tDYWxsYmFjayApO1xuXHRcdFx0XHRjb25zdCBob29rUmVzdWx0ID0gcmVnaXN0ZXJIb29rLmNhbGwoXG5cdFx0XHRcdFx0c2VsZixcblx0XHRcdFx0XHRob29rTmFtZSxcblx0XHRcdFx0XHRob29rQ2FsbGJhY2tcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGhvb2tSZXN1bHQ7XG5cdFx0XHR9LmJpbmQodGhpcyk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQnaW52b2tlSG9vaycsXG5cdHtcblx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gKGhvb2tOYW1lOiBzdHJpbmcsIG9wdHM6IHsgW2luZGV4OiBzdHJpbmddOiB1bmtub3duIH0pID0+IHtcblx0XHRcdFx0Y29uc3QgaG9va1Jlc3VsdCA9IGludm9rZUhvb2suY2FsbChcblx0XHRcdFx0XHR0eXBlc0NvbGxlY3Rpb25zLmdldCh0aGlzKSxcblx0XHRcdFx0XHRob29rTmFtZSxcblx0XHRcdFx0XHRvcHRzIGFzIGhvb2tzT3B0c1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gaG9va1Jlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQncmVnaXN0ZXJGbG93Q2hlY2tlcicsXG5cdHtcblx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gKGZsb3dDaGVja2VyQ2FsbGJhY2s6IEZsb3dDaGVja2VyKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNoZWNrZXJSZXN1bHQgPSByZWdpc3RlckZsb3dDaGVja2VyLmNhbGwoXG5cdFx0XHRcdFx0dHlwZXNDb2xsZWN0aW9ucy5nZXQodGhpcyksXG5cdFx0XHRcdFx0Zmxvd0NoZWNrZXJDYWxsYmFja1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gY2hlY2tlclJlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuKTtcblxuXG5pbnRlcmZhY2UgVHlwZXNDb2xsZWN0aW9uVGFyZ2V0IHtcblx0c3VidHlwZXM6IFR5cGVzTWFwO1xuXHRkZWZpbmU6IChuYW1lOiBzdHJpbmcsIGN0b3I6IEZ1bmN0aW9uQ29uc3RydWN0b3IpID0+IG9iamVjdDtcbn1cblxuY29uc3QgdHlwZXNDb2xsZWN0aW9uUHJveHlIYW5kbGVyID0ge1xuXHRnZXQgKHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBwcm9wOiBzdHJpbmcpIHtcblx0XHRpZiAodGFyZ2V0LnN1YnR5cGVzLmhhcyhwcm9wKSkge1xuXHRcdFx0Ly8gYWNjZXNzIHRvIHN1YnR5cGVcblx0XHRcdC8vIGZvciBuZXcgY2FsbCBvciBkZWZpbmluZyBuZXcgdHlwZVxuXHRcdFx0Y29uc3Qgc3VidHlwZVJlc3VsdCA9IHRhcmdldC5zdWJ0eXBlcy5nZXQocHJvcCk7XG5cdFx0XHRyZXR1cm4gc3VidHlwZVJlc3VsdDtcblx0XHR9XG5cdFx0aWYgKHByb3AgPT09ICdkZWZpbmUnKSB7XG5cdFx0XHQvLyB3aWxsIGhvcGVmdWxseSBkZWZpbmUgbmV3IHR5cGVcblx0XHRcdHJldHVybiB0YXJnZXQuZGVmaW5lO1xuXHRcdH1cblx0XHRjb25zdCByZWZsZWN0UmVzdWx0ID0gUmVmbGVjdC5nZXQoXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRwcm9wXG5cdFx0KTtcblx0XHRyZXR1cm4gcmVmbGVjdFJlc3VsdDtcblx0fSxcblx0c2V0ICh0YXJnZXQ6IFR5cGVzQ29sbGVjdGlvblRhcmdldCwgVHlwZU5hbWU6IHN0cmluZywgQ29uc3RydWN0b3I6IEZ1bmN0aW9uQ29uc3RydWN0b3IpIHtcblx0XHR0YXJnZXQuZGVmaW5lKFxuXHRcdFx0VHlwZU5hbWUsXG5cdFx0XHRDb25zdHJ1Y3RvclxuXHRcdCk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuXHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgKHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBwcm9wOiBzdHJpbmcpIHtcblx0XHRpZiAodGFyZ2V0LnN1YnR5cGVzLmhhcyhwcm9wKSkge1xuXHRcdFx0Y29uc3QgZGVzY3JpcHRvclJlc3VsdCA9IHtcblx0XHRcdFx0Y29uZmlndXJhYmxlIDogdHJ1ZSxcblx0XHRcdFx0ZW51bWVyYWJsZSAgIDogdHJ1ZSxcblx0XHRcdFx0d3JpdGFibGUgICAgIDogZmFsc2UsXG5cdFx0XHRcdHZhbHVlICAgICAgICA6IHRhcmdldC5zdWJ0eXBlcy5nZXQocHJvcClcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gZGVzY3JpcHRvclJlc3VsdDtcblx0XHR9XG5cdFx0Y29uc3Qgb3duUHJvcFJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcCk7XG5cdFx0cmV0dXJuIG93blByb3BSZXN1bHQ7XG5cdH1cbn07XG5cbi8vIGV2ZXJ5IGNvbGxlY3Rpb24gZXhwb3J0cyB1bmRlciBleGFjdGx5IG9uZSBuYW1lIChsZXRoZSB0eXBlLmNvbGxlY3Rpb24pOlxuLy8gdGhlIGZpcnN0IGNvbGxlY3Rpb24g4oCUIHRoZSBkZWZhdWx0IG9uZSDigJQgaXMgJ2RlZmF1bHRUeXBlcyc7IGxhdGVyXG4vLyB1bm5hbWVkIGNvbGxlY3Rpb25zIGdldCAnY29sbGVjdGlvbl8xJywgJ2NvbGxlY3Rpb25fMicsIOKApiBpbiBjcmVhdGlvblxuLy8gb3JkZXIgKHRoZSBzY2hlbWUgdGFjdGljYSB3cml0ZXMgZm9yIG1uZW1vZ3JhcGhpY2EpLiBObyB0d28gY29sbGVjdGlvbnNcbi8vIG1heSBldmVyIGV4cG9ydCB0aGUgc2FtZSBuYW1lLlxubGV0IGRlZmF1bHRDb2xsZWN0aW9uTmFtZWQgPSBmYWxzZTtcbmxldCB1bm5hbWVkQ29sbGVjdGlvbnMgPSAwO1xuXG5jb25zdCBjcmVhdGVUeXBlc0NvbGxlY3Rpb24gPSAoY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9KSA9PiB7XG5cblx0Y29uc3QgdHlwZXNDb2xsZWN0aW9uID0gbmV3IFR5cGVzQ29sbGVjdGlvbihjb25maWcpO1xuXHRjb25zdCBjb2xsZWN0aW9uQ29uZmlnID0gKHR5cGVzQ29sbGVjdGlvbiBhcyB7IFsgU3ltYm9sQ29uZmlnIF0/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9KVtcblx0XHRTeW1ib2xDb25maWdcblx0XTtcblx0aWYgKCBjb2xsZWN0aW9uQ29uZmlnICYmICFjb2xsZWN0aW9uQ29uZmlnLm5hbWUgKSB7XG5cdFx0aWYgKCAhZGVmYXVsdENvbGxlY3Rpb25OYW1lZCApIHtcblx0XHRcdGNvbGxlY3Rpb25Db25maWcubmFtZSA9ICdkZWZhdWx0VHlwZXMnO1xuXHRcdFx0ZGVmYXVsdENvbGxlY3Rpb25OYW1lZCA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHVubmFtZWRDb2xsZWN0aW9ucyArPSAxO1xuXHRcdFx0Y29sbGVjdGlvbkNvbmZpZy5uYW1lID0gYGNvbGxlY3Rpb25fJHt1bm5hbWVkQ29sbGVjdGlvbnN9YDtcblx0XHR9XG5cdH1cblx0Y29uc3QgdHlwZXNDb2xsZWN0aW9uUHJveHkgPSBuZXcgUHJveHkoXG5cdFx0dHlwZXNDb2xsZWN0aW9uLFxuXHRcdHR5cGVzQ29sbGVjdGlvblByb3h5SGFuZGxlclxuXHQpO1xuXG5cdHR5cGVzQ29sbGVjdGlvbnMuc2V0KFxuXHRcdHR5cGVzQ29sbGVjdGlvbixcblx0XHR0eXBlc0NvbGxlY3Rpb25Qcm94eVxuXHQpO1xuXG5cdHJldHVybiB0eXBlc0NvbGxlY3Rpb25Qcm94eTtcblxufTtcblxuY29uc3QgREVGQVVMVF9UWVBFUyA9IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbigpO1xub2RwKFxuXHRERUZBVUxUX1RZUEVTLFxuXHRTeW1ib2xEZWZhdWx0VHlwZXNDb2xsZWN0aW9uLFxuXHR7XG5cdFx0Z2V0ICgpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuKTtcblxuZXhwb3J0IGNvbnN0IHR5cGVzID0ge1xuXHRnZXQgY3JlYXRlVHlwZXNDb2xsZWN0aW9uICgpOiBDcmVhdGVUeXBlc0NvbGxlY3Rpb25GdW5jdGlvbiB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gPFxuXHRcdFx0XHRUIGV4dGVuZHMgb2JqZWN0ID0ge30sXG5cdFx0XHRcdFBhcmVudCBleHRlbmRzIG9iamVjdCA9IG9iamVjdFxuXHRcdFx0XHQ+IChcblx0XHRcdFx0Y29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9XG5cdFx0XHQpOiBUeXBlc0NvbGxlY3Rpb248VCwgUGFyZW50PiA9PiB7XG5cdFx0XHRjb25zdCBjb2xsZWN0aW9uUmVzdWx0ID0gY3JlYXRlVHlwZXNDb2xsZWN0aW9uKGNvbmZpZykgYXMgVHlwZXNDb2xsZWN0aW9uPFQsIFBhcmVudD47XG5cdFx0XHRyZXR1cm4gY29sbGVjdGlvblJlc3VsdDtcblx0XHR9O1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGdldCBkZWZhdWx0VHlwZXMgKCk6IFR5cGVzQ29sbGVjdGlvbiB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gREVGQVVMVF9UWVBFUyBhcyBUeXBlc0NvbGxlY3Rpb247XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG59O1xuIl19