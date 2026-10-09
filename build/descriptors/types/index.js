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
        const result = function (TypeNameOrGetter, getterOrConfig, namedFormConfig) {
            let name;
            let getter;
            let config;
            if (typeof TypeNameOrGetter === 'string') {
                name = TypeNameOrGetter;
                getter = getterOrConfig;
                config = namedFormConfig;
            }
            else {
                getter = TypeNameOrGetter;
                config = getterOrConfig;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVzY3JpcHRvcnMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQmIsK0NBQTRDO0FBQzVDLE1BQU0sRUFDTCxHQUFHLEVBQ0gscUJBQXFCLEVBQ3JCLDRCQUE0QixFQUM1QixZQUFZLEVBQ1osY0FBYyxFQUNkLGtCQUFrQixFQUNsQixTQUFTLEVBQ1QsU0FBUyxHQUNULEdBQUcscUJBQVMsQ0FBQztBQUdkLDJDQUV5QjtBQUV6QiwwREFBNEM7QUFFNUMsTUFBTSxFQUNMLFlBQVksRUFDWixVQUFVLEVBQ1YsbUJBQW1CLEdBQ25CLEdBQUcsUUFBUSxDQUFDO0FBRWIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRW5DLE1BQU0sZUFBZSxHQUFHLFVBQVUsT0FBZ0M7SUFFakUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBRWxCLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFHM0IsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUN2QyxDQUFDLENBQTBCLEVBQUUsR0FBVyxFQUFFLEVBQUU7UUFDM0MsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQzdCLE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBRSxHQUFHLENBQUUsQ0FBQztRQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLEtBQUssQ0FBQztRQUM1QixNQUFNLE1BQU0sR0FBRyxPQUFPLE1BQU0sQ0FBQztRQUM3QixJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUN2QixDQUFDLENBQUUsR0FBRyxDQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLENBQUM7YUFBTSxDQUFDO1lBQ1AsQ0FBQyxDQUFFLEdBQUcs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RUYsT0FBTyxvQkFBb0IsQ0FBQztBQUU3QixDQUFDLENBQUM7QUFFRixNQUFNLGFBQWEsR0FBRyxxQkFBcUIsRUFBRSxDQUFDO0FBQzlDLEdBQUcsQ0FDRixhQUFhLEVBQ2IsNEJBQTRCLEVBQzVCO0lBQ0MsR0FBRztRQUNGLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNELENBQ0QsQ0FBQztBQUVXLFFBQUEsS0FBSyxHQUFHO0lBQ3BCLElBQUkscUJBQXFCO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLENBSWIsU0FBa0MsRUFBRSxFQUNQLEVBQUU7WUFDaEMsTUFBTSxnQkFBZ0IsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQStCLENBQUM7WUFDckYsT0FBTyxnQkFBZ0IsQ0FBQztRQUN6QixDQUFDLENBQUM7UUFDRixPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFDRCxJQUFJLFlBQVk7UUFDZixNQUFNLE1BQU0sR0FBRyxhQUFnQyxDQUFDO1FBQ2hELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUVELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0eXBlIHtcblx0X0ludGVybmFsX1RDXyxcblx0Q3JlYXRlVHlwZXNDb2xsZWN0aW9uRnVuY3Rpb24sXG5cdFR5cGVzQ29sbGVjdGlvbixcblx0VHlwZUNsYXNzLFxuXHRJREVGLFxuXHRob29rc09wdHMsXG5cdGhvb2ssXG5cdFN0YWNrQm91bmRhcnksXG5cdERlZmluZU5ld2FibGUsXG5cdERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHRGbG93Q2hlY2tlclxufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5jb25zdCB7XG5cdG9kcCxcblx0U3ltYm9sQ29uc3RydWN0b3JOYW1lLFxuXHRTeW1ib2xEZWZhdWx0VHlwZXNDb2xsZWN0aW9uLFxuXHRTeW1ib2xDb25maWcsXG5cdGRlZmF1bHRPcHRpb25zLFxuXHRkZWZhdWx0T3B0aW9uc0tleXMsXG5cdE1ORU1PTklDQSxcblx0TU5FTU9TWU5FLFxufSA9IGNvbnN0YW50cztcblxuLy8gaGVyZSBpcyBUeXBlc0NvbGxlY3Rpb24uZGVmaW5lKCkgbWV0aG9kXG5pbXBvcnQge1xuXHRkZWZpbmUsIGxhenksIGxvb2t1cCwgdHlwZSBUeXBlc01hcCwgdHlwZSBMYXp5VHlwZUdldHRlclxufSBmcm9tICcuLi8uLi9hcGkvdHlwZXMnO1xuXG5pbXBvcnQgKiBhcyBob29rc0FQSSBmcm9tICcuLi8uLi9hcGkvaG9va3MnO1xuXG5jb25zdCB7XG5cdHJlZ2lzdGVySG9vayxcblx0aW52b2tlSG9vayxcblx0cmVnaXN0ZXJGbG93Q2hlY2tlcixcbn0gPSBob29rc0FQSTtcblxuY29uc3QgdHlwZXNDb2xsZWN0aW9ucyA9IG5ldyBNYXAoKTtcblxuY29uc3QgVHlwZXNDb2xsZWN0aW9uID0gZnVuY3Rpb24gKF9jb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSB7XG5cblx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0Y29uc3Qgc3VidHlwZXMgPSBuZXcgTWFwKCk7XG5cblx0Ly8gZGVmYXVsdCBjb25maWcgaXMgbGVzcyBpbXBvcnRhbnQgdGhhbiB0eXBlcyBjb2xsZWN0aW9uIGNvbmZpZ1xuXHRjb25zdCBjb25maWcgPSBkZWZhdWx0T3B0aW9uc0tleXMucmVkdWNlKFxuXHRcdChvOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwga2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdGNvbnN0IHZhbHVlID0gX2NvbmZpZ1sga2V5IF07XG5cdFx0XHRjb25zdCBvcHRpb24gPSBkZWZhdWx0T3B0aW9uc1sga2V5IF07XG5cdFx0XHRjb25zdCB0X2NvbmYgPSB0eXBlb2YgdmFsdWU7XG5cdFx0XHRjb25zdCB0X29wdHMgPSB0eXBlb2Ygb3B0aW9uO1xuXHRcdFx0aWYgKHRfY29uZiA9PT0gdF9vcHRzKSB7XG5cdFx0XHRcdG9bIGtleSBdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvWyBrZXkgXSA9IG9wdGlvbjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvO1xuXHRcdH0sXG5cdFx0e31cblx0KTtcblxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHRTeW1ib2xDb25maWcsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGNvbmZpZztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0U3ltYm9sLmhhc0luc3RhbmNlLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IChpbnN0YW5jZTogeyBbU3ltYm9sQ29uc3RydWN0b3JOYW1lXT86IHN0cmluZyB9KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgY2hlY2tSZXN1bHQgPSBpbnN0YW5jZVsgU3ltYm9sQ29uc3RydWN0b3JOYW1lIF0gPT09IE1ORU1PTklDQTtcblx0XHRcdFx0XHRyZXR1cm4gY2hlY2tSZXN1bHQ7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdCdzdWJ0eXBlcycsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIHN1YnR5cGVzO1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHQvLyBGb3IgaW5zdGFuY2VvZiBNTkVNT1NZTkVcblx0b2RwKFxuXHRcdHN1YnR5cGVzLFxuXHRcdE1ORU1PU1lORSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHQvLyByZXR1cm5pbmcgcHJveHlcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gdHlwZXNDb2xsZWN0aW9ucy5nZXQoc2VsZik7XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdC8vIEZvciBpbnN0YW5jZW9mIE1ORU1PU1lORVxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHRNTkVNT1NZTkUsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Ly8gcmV0dXJuaW5nIHByb3h5XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHNlbGYpO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHRjb25zdCBob29rcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdCdob29rcycsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGhvb2tzO1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxufSBhcyBfSW50ZXJuYWxfVENfPG9iamVjdD47XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0TU5FTU9OSUNBLFxuXHR7XG5cdFx0Z2V0ICgpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHRoaXMpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2RlZmluZScsXG5cdHtcblx0XHRnZXQgKHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSkge1xuXHRcdFx0Y29uc3QgeyBzdWJ0eXBlcyB9ID0gdGhpcztcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChcblx0XHRcdFx0dGhpczogU3RhY2tCb3VuZGFyeSxcblx0XHRcdFx0VHlwZU9yVHlwZU5hbWU6IHN0cmluZyB8IERlZmluZU5ld2FibGVPckNhbGxhYmxlLFxuXHRcdFx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWc/OiBEZWZpbmVOZXdhYmxlT3JDYWxsYWJsZSB8IG9iamVjdCxcblx0XHRcdFx0Y29uZmlnPzogb2JqZWN0XG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gcGFzcyBgcmVzdWx0YCBpdHNlbGYgYXMgdGhlIHN0YWNrLWNhcHR1cmUgYm91bmRhcnkgKFN0YWNrQm91bmRhcnkpOlxuXHRcdFx0XHQvLyBpdCBpcyBhIHJlYWwgY2FsbGFibGUgb24gdGhlIHN0YWNrLCBzbyBjYXB0dXJlU3RhY2tUcmFjZVxuXHRcdFx0XHQvLyB0cnVuY2F0ZXMgYXQgdGhlIHVzZXIncyBjYWxsIHNpdGUgaW5zdGVhZCBvZiBrZWVwaW5nIGludGVybmFsIGZyYW1lc1xuXHRcdFx0XHRjb25zdCBkZWZpbmVSZXN1bHQgPSBkZWZpbmUuY2FsbChcblx0XHRcdFx0XHRyZXN1bHQsXG5cdFx0XHRcdFx0c3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRcdFx0VHlwZU9yVHlwZU5hbWUsXG5cdFx0XHRcdFx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnLFxuXHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gZGVmaW5lUmVzdWx0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdsYXp5Jyxcblx0e1xuXHRcdGdldCAodGhpczogeyBzdWJ0eXBlczogTWFwPHN0cmluZywgb2JqZWN0PiB9KSB7XG5cdFx0XHRjb25zdCB7IHN1YnR5cGVzIH0gPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKFxuXHRcdFx0XHR0aGlzOiBTdGFja0JvdW5kYXJ5LFxuXHRcdFx0XHRUeXBlTmFtZU9yR2V0dGVyOiBzdHJpbmcgfCBMYXp5VHlwZUdldHRlcixcblx0XHRcdFx0Z2V0dGVyT3JDb25maWc/OiBMYXp5VHlwZUdldHRlciB8IG9iamVjdCxcblx0XHRcdFx0bmFtZWRGb3JtQ29uZmlnPzogb2JqZWN0XG5cdFx0XHQpIHtcblx0XHRcdFx0bGV0IG5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0bGV0IGdldHRlcjogTGF6eVR5cGVHZXR0ZXI7XG5cdFx0XHRcdGxldCBjb25maWc6IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdFx0aWYgKHR5cGVvZiBUeXBlTmFtZU9yR2V0dGVyID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdG5hbWUgPSBUeXBlTmFtZU9yR2V0dGVyO1xuXHRcdFx0XHRcdGdldHRlciA9IGdldHRlck9yQ29uZmlnIGFzIExhenlUeXBlR2V0dGVyO1xuXHRcdFx0XHRcdGNvbmZpZyA9IG5hbWVkRm9ybUNvbmZpZztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRnZXR0ZXIgPSBUeXBlTmFtZU9yR2V0dGVyIGFzIExhenlUeXBlR2V0dGVyO1xuXHRcdFx0XHRcdGNvbmZpZyA9IGdldHRlck9yQ29uZmlnIGFzIG9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgbGF6eVJlc3VsdDogVHlwZUNsYXNzO1xuXHRcdFx0XHQvLyBzYW1lIGFzIGluIGBkZWZpbmVgIGFib3ZlOiBwYXNzIGByZXN1bHRgIGl0c2VsZiBhcyB0aGVcblx0XHRcdFx0Ly8gc3RhY2stY2FwdHVyZSBib3VuZGFyeSwgbm90IHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuXHRcdFx0XHRpZiAobmFtZSkge1xuXHRcdFx0XHRcdGxhenlSZXN1bHQgPSBsYXp5LmNhbGwoXG5cdFx0XHRcdFx0XHRyZXN1bHQsXG5cdFx0XHRcdFx0XHRzdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0XHRnZXR0ZXIgYXMgTGF6eVR5cGVHZXR0ZXIsXG5cdFx0XHRcdFx0XHRjb25maWdcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxhenlSZXN1bHQgPSBsYXp5LmNhbGwoXG5cdFx0XHRcdFx0XHRyZXN1bHQsXG5cdFx0XHRcdFx0XHRzdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdFx0XHRcdGdldHRlciBhcyBMYXp5VHlwZUdldHRlcixcblx0XHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGxhenlSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2RlY29yYXRlJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChjb25maWc/OiBvYmplY3QpIHtcblx0XHRcdFx0Y29uc3QgZGVjb3JhdG9yID0gZnVuY3Rpb24gKGNzdHI6IERlZmluZU5ld2FibGUpIHtcblx0XHRcdFx0XHRjb25zdCB7IG5hbWUgfSA9IGNzdHI7XG5cdFx0XHRcdFx0Y29uc3QgZGVmaW5lUmVzdWx0ID0gc2VsZi5kZWZpbmUoXG5cdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0Y3N0ciBhcyBJREVGPG9iamVjdD4sXG5cdFx0XHRcdFx0XHRjb25maWdcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBkZWNvcmF0b3I7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2xvb2t1cCcsXG5cdHtcblx0XHRnZXQgKHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSkge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKFxuXHRcdFx0XHR0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0sXG5cdFx0XHRcdFR5cGVOZXN0ZWRQYXRoOiBzdHJpbmdcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBsb29rdXBSZXN1bHQgPSBsb29rdXAuY2FsbChcblx0XHRcdFx0XHQvLyBhIGNvbGxlY3Rpb24ncyBzdWJ0eXBlcyBtYXAgSVMgdGhlIHJ1bnRpbWUgVHlwZXNNYXAgKHRoZVxuXHRcdFx0XHRcdC8vIE1ORU1PU1lORS9TeW1ib2xQYXJlbnRUeXBlIHByb3BzIGFyZSBpbnN0YWxsZWQgYXRcblx0XHRcdFx0XHQvLyBjb25zdHJ1Y3Rpb24pLCBzbyB0aGUgc2luZ2xlIGNhc3Qgb25seSBuYW1lcyB0aGF0IHZpZXdcblx0XHRcdFx0XHR0aGlzLnN1YnR5cGVzIGFzIFR5cGVzTWFwLFxuXHRcdFx0XHRcdFR5cGVOZXN0ZWRQYXRoXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBsb29rdXBSZXN1bHQ7XG5cdFx0XHR9LmJpbmQodGhpcyk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQncmVnaXN0ZXJIb29rJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKGhvb2tOYW1lOiBzdHJpbmcsIGhvb2tDYWxsYmFjazogaG9vaykge1xuXHRcdFx0XHQvLyByZXR1cm4gcHJvdG8ucmVnaXN0ZXJIb29rLmNhbGwoIHR5cGVzQ29sbGVjdGlvbnMuZ2V0KCBzZWxmICksIGhvb2tOYW1lLCBob29rQ2FsbGJhY2sgKTtcblx0XHRcdFx0Y29uc3QgaG9va1Jlc3VsdCA9IHJlZ2lzdGVySG9vay5jYWxsKFxuXHRcdFx0XHRcdHNlbGYsXG5cdFx0XHRcdFx0aG9va05hbWUsXG5cdFx0XHRcdFx0aG9va0NhbGxiYWNrXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBob29rUmVzdWx0O1xuXHRcdFx0fS5iaW5kKHRoaXMpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2ludm9rZUhvb2snLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IChob29rTmFtZTogc3RyaW5nLCBvcHRzOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGhvb2tSZXN1bHQgPSBpbnZva2VIb29rLmNhbGwoXG5cdFx0XHRcdFx0dHlwZXNDb2xsZWN0aW9ucy5nZXQodGhpcyksXG5cdFx0XHRcdFx0aG9va05hbWUsXG5cdFx0XHRcdFx0b3B0cyBhcyBob29rc09wdHNcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGhvb2tSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J3JlZ2lzdGVyRmxvd0NoZWNrZXInLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IChmbG93Q2hlY2tlckNhbGxiYWNrOiBGbG93Q2hlY2tlcikgPT4ge1xuXHRcdFx0XHRjb25zdCBjaGVja2VyUmVzdWx0ID0gcmVnaXN0ZXJGbG93Q2hlY2tlci5jYWxsKFxuXHRcdFx0XHRcdHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHRoaXMpLFxuXHRcdFx0XHRcdGZsb3dDaGVja2VyQ2FsbGJhY2tcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGNoZWNrZXJSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cblxuaW50ZXJmYWNlIFR5cGVzQ29sbGVjdGlvblRhcmdldCB7XG5cdHN1YnR5cGVzOiBUeXBlc01hcDtcblx0ZGVmaW5lOiAobmFtZTogc3RyaW5nLCBjdG9yOiBGdW5jdGlvbkNvbnN0cnVjdG9yKSA9PiBvYmplY3Q7XG59XG5cbmNvbnN0IHR5cGVzQ29sbGVjdGlvblByb3h5SGFuZGxlciA9IHtcblx0Z2V0ICh0YXJnZXQ6IFR5cGVzQ29sbGVjdGlvblRhcmdldCwgcHJvcDogc3RyaW5nKSB7XG5cdFx0aWYgKHRhcmdldC5zdWJ0eXBlcy5oYXMocHJvcCkpIHtcblx0XHRcdC8vIGFjY2VzcyB0byBzdWJ0eXBlXG5cdFx0XHQvLyBmb3IgbmV3IGNhbGwgb3IgZGVmaW5pbmcgbmV3IHR5cGVcblx0XHRcdGNvbnN0IHN1YnR5cGVSZXN1bHQgPSB0YXJnZXQuc3VidHlwZXMuZ2V0KHByb3ApO1xuXHRcdFx0cmV0dXJuIHN1YnR5cGVSZXN1bHQ7XG5cdFx0fVxuXHRcdGlmIChwcm9wID09PSAnZGVmaW5lJykge1xuXHRcdFx0Ly8gd2lsbCBob3BlZnVsbHkgZGVmaW5lIG5ldyB0eXBlXG5cdFx0XHRyZXR1cm4gdGFyZ2V0LmRlZmluZTtcblx0XHR9XG5cdFx0Y29uc3QgcmVmbGVjdFJlc3VsdCA9IFJlZmxlY3QuZ2V0KFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0cHJvcFxuXHRcdCk7XG5cdFx0cmV0dXJuIHJlZmxlY3RSZXN1bHQ7XG5cdH0sXG5cdHNldCAodGFyZ2V0OiBUeXBlc0NvbGxlY3Rpb25UYXJnZXQsIFR5cGVOYW1lOiBzdHJpbmcsIENvbnN0cnVjdG9yOiBGdW5jdGlvbkNvbnN0cnVjdG9yKSB7XG5cdFx0dGFyZ2V0LmRlZmluZShcblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0Q29uc3RydWN0b3Jcblx0XHQpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcblx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICh0YXJnZXQ6IFR5cGVzQ29sbGVjdGlvblRhcmdldCwgcHJvcDogc3RyaW5nKSB7XG5cdFx0aWYgKHRhcmdldC5zdWJ0eXBlcy5oYXMocHJvcCkpIHtcblx0XHRcdGNvbnN0IGRlc2NyaXB0b3JSZXN1bHQgPSB7XG5cdFx0XHRcdGNvbmZpZ3VyYWJsZSA6IHRydWUsXG5cdFx0XHRcdGVudW1lcmFibGUgICA6IHRydWUsXG5cdFx0XHRcdHdyaXRhYmxlICAgICA6IGZhbHNlLFxuXHRcdFx0XHR2YWx1ZSAgICAgICAgOiB0YXJnZXQuc3VidHlwZXMuZ2V0KHByb3ApXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIGRlc2NyaXB0b3JSZXN1bHQ7XG5cdFx0fVxuXHRcdGNvbnN0IG93blByb3BSZXN1bHQgPSBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3ApO1xuXHRcdHJldHVybiBvd25Qcm9wUmVzdWx0O1xuXHR9XG59O1xuXG4vLyBldmVyeSBjb2xsZWN0aW9uIGV4cG9ydHMgdW5kZXIgZXhhY3RseSBvbmUgbmFtZSAobGV0aGUgdHlwZS5jb2xsZWN0aW9uKTpcbi8vIHRoZSBmaXJzdCBjb2xsZWN0aW9uIOKAlCB0aGUgZGVmYXVsdCBvbmUg4oCUIGlzICdkZWZhdWx0VHlwZXMnOyBsYXRlclxuLy8gdW5uYW1lZCBjb2xsZWN0aW9ucyBnZXQgJ2NvbGxlY3Rpb25fMScsICdjb2xsZWN0aW9uXzInLCDigKYgaW4gY3JlYXRpb25cbi8vIG9yZGVyICh0aGUgc2NoZW1lIHRhY3RpY2Egd3JpdGVzIGZvciBtbmVtb2dyYXBoaWNhKS4gTm8gdHdvIGNvbGxlY3Rpb25zXG4vLyBtYXkgZXZlciBleHBvcnQgdGhlIHNhbWUgbmFtZS5cbmxldCBkZWZhdWx0Q29sbGVjdGlvbk5hbWVkID0gZmFsc2U7XG5sZXQgdW5uYW1lZENvbGxlY3Rpb25zID0gMDtcblxuY29uc3QgY3JlYXRlVHlwZXNDb2xsZWN0aW9uID0gKGNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fSkgPT4ge1xuXG5cdGNvbnN0IHR5cGVzQ29sbGVjdGlvbiA9IG5ldyBUeXBlc0NvbGxlY3Rpb24oY29uZmlnKTtcblx0Y29uc3QgY29sbGVjdGlvbkNvbmZpZyA9ICh0eXBlc0NvbGxlY3Rpb24gYXMgeyBbIFN5bWJvbENvbmZpZyBdPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSlbXG5cdFx0U3ltYm9sQ29uZmlnXG5cdF07XG5cdGlmICggY29sbGVjdGlvbkNvbmZpZyAmJiAhY29sbGVjdGlvbkNvbmZpZy5uYW1lICkge1xuXHRcdGlmICggIWRlZmF1bHRDb2xsZWN0aW9uTmFtZWQgKSB7XG5cdFx0XHRjb2xsZWN0aW9uQ29uZmlnLm5hbWUgPSAnZGVmYXVsdFR5cGVzJztcblx0XHRcdGRlZmF1bHRDb2xsZWN0aW9uTmFtZWQgPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR1bm5hbWVkQ29sbGVjdGlvbnMgKz0gMTtcblx0XHRcdGNvbGxlY3Rpb25Db25maWcubmFtZSA9IGBjb2xsZWN0aW9uXyR7dW5uYW1lZENvbGxlY3Rpb25zfWA7XG5cdFx0fVxuXHR9XG5cdGNvbnN0IHR5cGVzQ29sbGVjdGlvblByb3h5ID0gbmV3IFByb3h5KFxuXHRcdHR5cGVzQ29sbGVjdGlvbixcblx0XHR0eXBlc0NvbGxlY3Rpb25Qcm94eUhhbmRsZXJcblx0KTtcblxuXHR0eXBlc0NvbGxlY3Rpb25zLnNldChcblx0XHR0eXBlc0NvbGxlY3Rpb24sXG5cdFx0dHlwZXNDb2xsZWN0aW9uUHJveHlcblx0KTtcblxuXHRyZXR1cm4gdHlwZXNDb2xsZWN0aW9uUHJveHk7XG5cbn07XG5cbmNvbnN0IERFRkFVTFRfVFlQRVMgPSBjcmVhdGVUeXBlc0NvbGxlY3Rpb24oKTtcbm9kcChcblx0REVGQVVMVF9UWVBFUyxcblx0U3ltYm9sRGVmYXVsdFR5cGVzQ29sbGVjdGlvbixcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cbik7XG5cbmV4cG9ydCBjb25zdCB0eXBlcyA9IHtcblx0Z2V0IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiAoKTogQ3JlYXRlVHlwZXNDb2xsZWN0aW9uRnVuY3Rpb24ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IDxcblx0XHRcdFx0VCBleHRlbmRzIG9iamVjdCA9IHt9LFxuXHRcdFx0XHRQYXJlbnQgZXh0ZW5kcyBvYmplY3QgPSBvYmplY3Rcblx0XHRcdFx0PiAoXG5cdFx0XHRcdGNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fVxuXHRcdFx0KTogVHlwZXNDb2xsZWN0aW9uPFQsIFBhcmVudD4gPT4ge1xuXHRcdFx0Y29uc3QgY29sbGVjdGlvblJlc3VsdCA9IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbihjb25maWcpIGFzIFR5cGVzQ29sbGVjdGlvbjxULCBQYXJlbnQ+O1xuXHRcdFx0cmV0dXJuIGNvbGxlY3Rpb25SZXN1bHQ7XG5cdFx0fTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRnZXQgZGVmYXVsdFR5cGVzICgpOiBUeXBlc0NvbGxlY3Rpb24ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IERFRkFVTFRfVFlQRVMgYXMgVHlwZXNDb2xsZWN0aW9uO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxufTtcbiJdfQ==