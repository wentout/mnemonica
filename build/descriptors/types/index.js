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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVzY3JpcHRvcnMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFVYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxxQkFBcUIsRUFDckIsNEJBQTRCLEVBQzVCLFlBQVksRUFDWixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLFNBQVMsRUFDVCxTQUFTLEdBQ1QsR0FBRyxxQkFBUyxDQUFDO0FBR2QsMkNBRXlCO0FBRXpCLDBEQUE0QztBQUU1QyxNQUFNLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFDVixtQkFBbUIsR0FDbkIsR0FBRyxRQUFRLENBQUM7QUFFYixNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFbkMsTUFBTSxlQUFlLEdBQUcsVUFBVSxPQUFnQztJQUVqRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUczQixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQ3ZDLENBQUMsQ0FBMEIsRUFBRSxHQUFXLEVBQUUsRUFBRTtRQUMzQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDN0IsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sS0FBSyxDQUFDO1FBQzVCLE1BQU0sTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDO1FBQzdCLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLENBQUMsQ0FBRSxHQUFHLENBQUUsR0FBRyxLQUFLLENBQUM7UUFDbEIsQ0FBQzthQUFNLENBQUM7WUFDUCxDQUFDLENBQUUsR0FBRyxD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QUcsQ0FBQyxTQUFrQyxFQUFFLEVBQUUsRUFBRTtJQUV0RSxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwRCxNQUFNLG9CQUFvQixHQUFHLElBQUksS0FBSyxDQUNyQyxlQUFlLEVBQ2YsMkJBQTJCLENBQzNCLENBQUM7SUFFRixnQkFBZ0IsQ0FBQyxHQUFHLENBQ25CLGVBQWUsRUFDZixvQkFBb0IsQ0FDcEIsQ0FBQztJQUVGLE9BQU8sb0JBQW9CLENBQUM7QUFFN0IsQ0FBQyxDQUFDO0FBRUYsTUFBTSxhQUFhLEdBQUcscUJBQXFCLEVBQUUsQ0FBQztBQUM5QyxHQUFHLENBQ0YsYUFBYSxFQUNiLDRCQUE0QixFQUM1QjtJQUNDLEdBQUc7UUFDRixPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRCxDQUNELENBQUM7QUFFVyxRQUFBLEtBQUssR0FBRztJQUNwQixJQUFJLHFCQUFxQjtRQUN4QixNQUFNLE1BQU0sR0FBRyxDQUliLFNBQWtDLEVBQUUsRUFDUCxFQUFFO1lBQ2hDLE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUErQixDQUFDO1lBQ3JGLE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBQ0QsSUFBSSxZQUFZO1FBQ2YsTUFBTSxNQUFNLEdBQUcsYUFBZ0MsQ0FBQztRQUNoRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7Q0FFRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdHlwZSB7XG5cdF9JbnRlcm5hbF9UQ18sXG5cdENyZWF0ZVR5cGVzQ29sbGVjdGlvbkZ1bmN0aW9uLFxuXHRUeXBlc0NvbGxlY3Rpb24sXG5cdGhvb2tzT3B0cyxcblx0aG9va1xufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5jb25zdCB7XG5cdG9kcCxcblx0U3ltYm9sQ29uc3RydWN0b3JOYW1lLFxuXHRTeW1ib2xEZWZhdWx0VHlwZXNDb2xsZWN0aW9uLFxuXHRTeW1ib2xDb25maWcsXG5cdGRlZmF1bHRPcHRpb25zLFxuXHRkZWZhdWx0T3B0aW9uc0tleXMsXG5cdE1ORU1PTklDQSxcblx0TU5FTU9TWU5FLFxufSA9IGNvbnN0YW50cztcblxuLy8gaGVyZSBpcyBUeXBlc0NvbGxlY3Rpb24uZGVmaW5lKCkgbWV0aG9kXG5pbXBvcnQge1xuXHRkZWZpbmUsIGxvb2t1cCwgdHlwZSBUeXBlc01hcFxufSBmcm9tICcuLi8uLi9hcGkvdHlwZXMnO1xuXG5pbXBvcnQgKiBhcyBob29rc0FQSSBmcm9tICcuLi8uLi9hcGkvaG9va3MnO1xuXG5jb25zdCB7XG5cdHJlZ2lzdGVySG9vayxcblx0aW52b2tlSG9vayxcblx0cmVnaXN0ZXJGbG93Q2hlY2tlcixcbn0gPSBob29rc0FQSTtcblxuY29uc3QgdHlwZXNDb2xsZWN0aW9ucyA9IG5ldyBNYXAoKTtcblxuY29uc3QgVHlwZXNDb2xsZWN0aW9uID0gZnVuY3Rpb24gKF9jb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSB7XG5cblx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0Y29uc3Qgc3VidHlwZXMgPSBuZXcgTWFwKCk7XG5cblx0Ly8gZGVmYXVsdCBjb25maWcgaXMgbGVzcyBpbXBvcnRhbnQgdGhhbiB0eXBlcyBjb2xsZWN0aW9uIGNvbmZpZ1xuXHRjb25zdCBjb25maWcgPSBkZWZhdWx0T3B0aW9uc0tleXMucmVkdWNlKFxuXHRcdChvOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwga2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdGNvbnN0IHZhbHVlID0gX2NvbmZpZ1sga2V5IF07XG5cdFx0XHRjb25zdCBvcHRpb24gPSBkZWZhdWx0T3B0aW9uc1sga2V5IF07XG5cdFx0XHRjb25zdCB0X2NvbmYgPSB0eXBlb2YgdmFsdWU7XG5cdFx0XHRjb25zdCB0X29wdHMgPSB0eXBlb2Ygb3B0aW9uO1xuXHRcdFx0aWYgKHRfY29uZiA9PT0gdF9vcHRzKSB7XG5cdFx0XHRcdG9bIGtleSBdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvWyBrZXkgXSA9IG9wdGlvbjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvO1xuXHRcdH0sXG5cdFx0e31cblx0KTtcblxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHRTeW1ib2xDb25maWcsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGNvbmZpZztcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0U3ltYm9sLmhhc0luc3RhbmNlLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IChpbnN0YW5jZTogeyBbU3ltYm9sQ29uc3RydWN0b3JOYW1lXT86IHN0cmluZyB9KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgY2hlY2tSZXN1bHQgPSBpbnN0YW5jZVsgU3ltYm9sQ29uc3RydWN0b3JOYW1lIF0gPT09IE1ORU1PTklDQTtcblx0XHRcdFx0XHRyZXR1cm4gY2hlY2tSZXN1bHQ7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdCdzdWJ0eXBlcycsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIHN1YnR5cGVzO1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHQvLyBGb3IgaW5zdGFuY2VvZiBNTkVNT1NZTkVcblx0b2RwKFxuXHRcdHN1YnR5cGVzLFxuXHRcdE1ORU1PU1lORSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHQvLyByZXR1cm5pbmcgcHJveHlcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gdHlwZXNDb2xsZWN0aW9ucy5nZXQoc2VsZik7XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdC8vIEZvciBpbnN0YW5jZW9mIE1ORU1PU1lORVxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHRNTkVNT1NZTkUsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Ly8gcmV0dXJuaW5nIHByb3h5XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHNlbGYpO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxuXHRjb25zdCBob29rcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdCdob29rcycsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGhvb2tzO1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblxufSBhcyBfSW50ZXJuYWxfVENfPG9iamVjdD47XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0TU5FTU9OSUNBLFxuXHR7XG5cdFx0Z2V0ICgpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IHR5cGVzQ29sbGVjdGlvbnMuZ2V0KHRoaXMpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2RlZmluZScsXG5cdHtcblx0XHRnZXQgKHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSkge1xuXHRcdFx0Y29uc3QgeyBzdWJ0eXBlcyB9ID0gdGhpcztcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChcblx0XHRcdFx0dGhpczogQ2FsbGFibGVGdW5jdGlvbixcblx0XHRcdFx0VHlwZU9yVHlwZU5hbWU6IHN0cmluZyB8IENhbGxhYmxlRnVuY3Rpb24sXG5cdFx0XHRcdGNvbnN0cnVjdEhhbmRsZXJPckNvbmZpZz86IENhbGxhYmxlRnVuY3Rpb24gfCBvYmplY3QsXG5cdFx0XHRcdGNvbmZpZz86IG9iamVjdFxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIHRoaXMgLSBkZWZpbmUgZnVuY3Rpb24gb2YgbW5lbW9uaWNhIGludGVyZmFjZVxuXHRcdFx0XHRjb25zdCBkZWZpbmVSZXN1bHQgPSBkZWZpbmUuY2FsbChcblx0XHRcdFx0XHR0aGlzIGFzIHVua25vd24sXG5cdFx0XHRcdFx0c3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRcdFx0VHlwZU9yVHlwZU5hbWUsXG5cdFx0XHRcdFx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnLFxuXHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gZGVmaW5lUmVzdWx0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9XG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdsb29rdXAnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChcblx0XHRcdFx0dGhpczogeyBzdWJ0eXBlczogTWFwPHN0cmluZywgb2JqZWN0PiB9LFxuXHRcdFx0XHRUeXBlTmVzdGVkUGF0aDogc3RyaW5nXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgbG9va3VwUmVzdWx0ID0gbG9va3VwLmNhbGwoXG5cdFx0XHRcdFx0dGhpcy5zdWJ0eXBlcyBhcyB1bmtub3duIGFzIFR5cGVzTWFwLFxuXHRcdFx0XHRcdFR5cGVOZXN0ZWRQYXRoXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBsb29rdXBSZXN1bHQ7XG5cdFx0XHR9LmJpbmQodGhpcyk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fVxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQncmVnaXN0ZXJIb29rJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKGhvb2tOYW1lOiBzdHJpbmcsIGhvb2tDYWxsYmFjazogaG9vaykge1xuXHRcdFx0XHQvLyByZXR1cm4gcHJvdG8ucmVnaXN0ZXJIb29rLmNhbGwoIHR5cGVzQ29sbGVjdGlvbnMuZ2V0KCBzZWxmICksIGhvb2tOYW1lLCBob29rQ2FsbGJhY2sgKTtcblx0XHRcdFx0Y29uc3QgaG9va1Jlc3VsdCA9IHJlZ2lzdGVySG9vay5jYWxsKFxuXHRcdFx0XHRcdHNlbGYsXG5cdFx0XHRcdFx0aG9va05hbWUsXG5cdFx0XHRcdFx0aG9va0NhbGxiYWNrXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBob29rUmVzdWx0O1xuXHRcdFx0fS5iaW5kKHRoaXMpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J2ludm9rZUhvb2snLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IChob29rTmFtZTogc3RyaW5nLCBvcHRzOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGhvb2tSZXN1bHQgPSBpbnZva2VIb29rLmNhbGwoXG5cdFx0XHRcdFx0dHlwZXNDb2xsZWN0aW9ucy5nZXQodGhpcyksXG5cdFx0XHRcdFx0aG9va05hbWUsXG5cdFx0XHRcdFx0b3B0cyBhcyBob29rc09wdHNcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIGhvb2tSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J3JlZ2lzdGVyRmxvd0NoZWNrZXInLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IChmbG93Q2hlY2tlckNhbGxiYWNrOiAoKSA9PiB1bmtub3duKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNoZWNrZXJSZXN1bHQgPSByZWdpc3RlckZsb3dDaGVja2VyLmNhbGwoXG5cdFx0XHRcdFx0dHlwZXNDb2xsZWN0aW9ucy5nZXQodGhpcyksXG5cdFx0XHRcdFx0Zmxvd0NoZWNrZXJDYWxsYmFja1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gY2hlY2tlclJlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuKTtcblxuXG5pbnRlcmZhY2UgVHlwZXNDb2xsZWN0aW9uVGFyZ2V0IHtcblx0c3VidHlwZXM6IFR5cGVzTWFwO1xuXHRkZWZpbmU6IChuYW1lOiBzdHJpbmcsIGN0b3I6IEZ1bmN0aW9uQ29uc3RydWN0b3IpID0+IG9iamVjdDtcbn1cblxuY29uc3QgdHlwZXNDb2xsZWN0aW9uUHJveHlIYW5kbGVyID0ge1xuXHRnZXQgKHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBwcm9wOiBzdHJpbmcpIHtcblx0XHRpZiAodGFyZ2V0LnN1YnR5cGVzLmhhcyhwcm9wKSkge1xuXHRcdFx0Ly8gYWNjZXNzIHRvIHN1YnR5cGVcblx0XHRcdC8vIGZvciBuZXcgY2FsbCBvciBkZWZpbmluZyBuZXcgdHlwZVxuXHRcdFx0Y29uc3Qgc3VidHlwZVJlc3VsdCA9IHRhcmdldC5zdWJ0eXBlcy5nZXQocHJvcCk7XG5cdFx0XHRyZXR1cm4gc3VidHlwZVJlc3VsdDtcblx0XHR9XG5cdFx0aWYgKHByb3AgPT09ICdkZWZpbmUnKSB7XG5cdFx0XHQvLyB3aWxsIGhvcGVmdWxseSBkZWZpbmUgbmV3IHR5cGVcblx0XHRcdHJldHVybiB0YXJnZXQuZGVmaW5lO1xuXHRcdH1cblx0XHRjb25zdCByZWZsZWN0UmVzdWx0ID0gUmVmbGVjdC5nZXQoXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRwcm9wXG5cdFx0KTtcblx0XHRyZXR1cm4gcmVmbGVjdFJlc3VsdDtcblx0fSxcblx0c2V0ICh0YXJnZXQ6IFR5cGVzQ29sbGVjdGlvblRhcmdldCwgVHlwZU5hbWU6IHN0cmluZywgQ29uc3RydWN0b3I6IEZ1bmN0aW9uQ29uc3RydWN0b3IpIHtcblx0XHR0YXJnZXQuZGVmaW5lKFxuXHRcdFx0VHlwZU5hbWUsXG5cdFx0XHRDb25zdHJ1Y3RvclxuXHRcdCk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuXHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgKHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBwcm9wOiBzdHJpbmcpIHtcblx0XHRpZiAodGFyZ2V0LnN1YnR5cGVzLmhhcyhwcm9wKSkge1xuXHRcdFx0Y29uc3QgZGVzY3JpcHRvclJlc3VsdCA9IHtcblx0XHRcdFx0Y29uZmlndXJhYmxlIDogdHJ1ZSxcblx0XHRcdFx0ZW51bWVyYWJsZSAgIDogdHJ1ZSxcblx0XHRcdFx0d3JpdGFibGUgICAgIDogZmFsc2UsXG5cdFx0XHRcdHZhbHVlICAgICAgICA6IHRhcmdldC5zdWJ0eXBlcy5nZXQocHJvcClcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gZGVzY3JpcHRvclJlc3VsdDtcblx0XHR9XG5cdFx0Y29uc3Qgb3duUHJvcFJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcCk7XG5cdFx0cmV0dXJuIG93blByb3BSZXN1bHQ7XG5cdH1cbn07XG5cbmNvbnN0IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiA9IChjb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge30pID0+IHtcblxuXHRjb25zdCB0eXBlc0NvbGxlY3Rpb24gPSBuZXcgVHlwZXNDb2xsZWN0aW9uKGNvbmZpZyk7XG5cdGNvbnN0IHR5cGVzQ29sbGVjdGlvblByb3h5ID0gbmV3IFByb3h5KFxuXHRcdHR5cGVzQ29sbGVjdGlvbixcblx0XHR0eXBlc0NvbGxlY3Rpb25Qcm94eUhhbmRsZXJcblx0KTtcblxuXHR0eXBlc0NvbGxlY3Rpb25zLnNldChcblx0XHR0eXBlc0NvbGxlY3Rpb24sXG5cdFx0dHlwZXNDb2xsZWN0aW9uUHJveHlcblx0KTtcblxuXHRyZXR1cm4gdHlwZXNDb2xsZWN0aW9uUHJveHk7XG5cbn07XG5cbmNvbnN0IERFRkFVTFRfVFlQRVMgPSBjcmVhdGVUeXBlc0NvbGxlY3Rpb24oKTtcbm9kcChcblx0REVGQVVMVF9UWVBFUyxcblx0U3ltYm9sRGVmYXVsdFR5cGVzQ29sbGVjdGlvbixcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cbik7XG5cbmV4cG9ydCBjb25zdCB0eXBlcyA9IHtcblx0Z2V0IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiAoKTogQ3JlYXRlVHlwZXNDb2xsZWN0aW9uRnVuY3Rpb24ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IDxcblx0XHRcdFx0VCBleHRlbmRzIG9iamVjdCA9IHt9LFxuXHRcdFx0XHRQYXJlbnQgZXh0ZW5kcyBvYmplY3QgPSBvYmplY3Rcblx0XHRcdFx0PiAoXG5cdFx0XHRcdGNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fVxuXHRcdFx0KTogVHlwZXNDb2xsZWN0aW9uPFQsIFBhcmVudD4gPT4ge1xuXHRcdFx0Y29uc3QgY29sbGVjdGlvblJlc3VsdCA9IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbihjb25maWcpIGFzIFR5cGVzQ29sbGVjdGlvbjxULCBQYXJlbnQ+O1xuXHRcdFx0cmV0dXJuIGNvbGxlY3Rpb25SZXN1bHQ7XG5cdFx0fTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRnZXQgZGVmYXVsdFR5cGVzICgpOiBUeXBlc0NvbGxlY3Rpb24ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IERFRkFVTFRfVFlQRVMgYXMgVHlwZXNDb2xsZWN0aW9uO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxufTtcbiJdfQ==