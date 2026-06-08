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
            return (instance) => {
                return instance[SymbolConstructorName] === MNEMONICA;
            };
        }
    });
    odp(this, 'subtypes', {
        get() {
            return subtypes;
        }
    });
    odp(subtypes, MNEMOSYNE, {
        get() {
            return typesCollections.get(self);
        }
    });
    odp(this, MNEMOSYNE, {
        get() {
            return typesCollections.get(self);
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
        return typesCollections.get(this);
    }
});
odp(TypesCollection.prototype, 'define', {
    get() {
        const { subtypes } = this;
        return function (TypeOrTypeName, constructHandlerOrConfig, config) {
            const result = types_1.define.call(this, subtypes, TypeOrTypeName, constructHandlerOrConfig, config);
            return result;
        };
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'lookup', {
    get() {
        return function (TypeNestedPath) {
            return types_1.lookup.call(this.subtypes, TypeNestedPath);
        }.bind(this);
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'registerHook', {
    get() {
        const self = this;
        return function (hookName, hookCallback) {
            return registerHook.call(self, hookName, hookCallback);
        }.bind(this);
    },
    enumerable: true
});
odp(TypesCollection.prototype, 'invokeHook', {
    get() {
        return (hookName, opts) => {
            return invokeHook.call(typesCollections.get(this), hookName, opts);
        };
    }
});
odp(TypesCollection.prototype, 'registerFlowChecker', {
    get() {
        return (flowCheckerCallback) => {
            return registerFlowChecker.call(typesCollections.get(this), flowCheckerCallback);
        };
    }
});
const typesCollectionProxyHandler = {
    get(target, prop) {
        if (target.subtypes.has(prop)) {
            return target.subtypes.get(prop);
        }
        if (prop === 'define') {
            return target.define;
        }
        return Reflect.get(target, prop);
    },
    set(target, TypeName, Constructor) {
        target.define(TypeName, Constructor);
        return true;
    },
    getOwnPropertyDescriptor(target, prop) {
        if (target.subtypes.has(prop)) {
            return {
                configurable: true,
                enumerable: true,
                writable: false,
                value: target.subtypes.get(prop)
            };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
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
        return function (config = {}) {
            const result = createTypesCollection(config);
            return result;
        };
    },
    get defaultTypes() {
        return DEFAULT_TYPES;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVzY3JpcHRvcnMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFVYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxxQkFBcUIsRUFDckIsNEJBQTRCLEVBQzVCLFlBQVksRUFDWixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLFNBQVMsRUFDVCxTQUFTLEdBQ1QsR0FBRyxxQkFBUyxDQUFDO0FBR2QsMkNBRXlCO0FBRXpCLDBEQUE0QztBQUU1QyxNQUFNLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFDVixtQkFBbUIsR0FDbkIsR0FBRyxRQUFRLENBQUM7QUFFYixNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFbkMsTUFBTSxlQUFlLEdBQUcsVUFBVyxPQUFnQztJQUVsRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUczQixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQ3ZDLENBQUUsQ0FBMEIsRUFBRSxHQUFXLEVBQUcsRUFBRTtRQUM3QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDN0IsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sS0FBSyxDQUFDO1FBQzVCLE1BQU0sTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDO1FBQzdCLElBQUssTUFBTSxLQUFLLE1BQU0sRUFBRyxDQUFDO1lBQ3pCLENBQUMsQ0FBRSxHQUFHLENBQUUsR0FBRyxLQUFLLENBQUM7UUFDbEIsQ0FBQzthQUFNLENBQUM7WUFDUCxDQUFDLENBQUUsR0FBRyxD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TyxhQUFnQyxDQUFDO0lBQ3pDLENBQUM7Q0FFRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdHlwZSB7XG5cdF9JbnRlcm5hbF9UQ18sXG5cdENyZWF0ZVR5cGVzQ29sbGVjdGlvbkZ1bmN0aW9uLFxuXHRUeXBlc0NvbGxlY3Rpb24sXG5cdGhvb2tzT3B0cyxcblx0aG9va1xufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5jb25zdCB7XG5cdG9kcCxcblx0U3ltYm9sQ29uc3RydWN0b3JOYW1lLFxuXHRTeW1ib2xEZWZhdWx0VHlwZXNDb2xsZWN0aW9uLFxuXHRTeW1ib2xDb25maWcsXG5cdGRlZmF1bHRPcHRpb25zLFxuXHRkZWZhdWx0T3B0aW9uc0tleXMsXG5cdE1ORU1PTklDQSxcblx0TU5FTU9TWU5FLFxufSA9IGNvbnN0YW50cztcblxuLy8gaGVyZSBpcyBUeXBlc0NvbGxlY3Rpb24uZGVmaW5lKCkgbWV0aG9kXG5pbXBvcnQge1xuXHRkZWZpbmUsIGxvb2t1cCwgdHlwZSBUeXBlc01hcCBcbn0gZnJvbSAnLi4vLi4vYXBpL3R5cGVzJztcblxuaW1wb3J0ICogYXMgaG9va3NBUEkgZnJvbSAnLi4vLi4vYXBpL2hvb2tzJztcblxuY29uc3Qge1xuXHRyZWdpc3Rlckhvb2ssXG5cdGludm9rZUhvb2ssXG5cdHJlZ2lzdGVyRmxvd0NoZWNrZXIsXG59ID0gaG9va3NBUEk7XG5cbmNvbnN0IHR5cGVzQ29sbGVjdGlvbnMgPSBuZXcgTWFwKCk7XG5cbmNvbnN0IFR5cGVzQ29sbGVjdGlvbiA9IGZ1bmN0aW9uICggX2NvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gKSB7XG5cdCBcblx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0Y29uc3Qgc3VidHlwZXMgPSBuZXcgTWFwKCk7XG5cblx0Ly8gZGVmYXVsdCBjb25maWcgaXMgbGVzcyBpbXBvcnRhbnQgdGhhbiB0eXBlcyBjb2xsZWN0aW9uIGNvbmZpZ1xuXHRjb25zdCBjb25maWcgPSBkZWZhdWx0T3B0aW9uc0tleXMucmVkdWNlKFxuXHRcdCggbzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGtleTogc3RyaW5nICkgPT4ge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBfY29uZmlnWyBrZXkgXTtcblx0XHRcdGNvbnN0IG9wdGlvbiA9IGRlZmF1bHRPcHRpb25zWyBrZXkgXTtcblx0XHRcdGNvbnN0IHRfY29uZiA9IHR5cGVvZiB2YWx1ZTtcblx0XHRcdGNvbnN0IHRfb3B0cyA9IHR5cGVvZiBvcHRpb247XG5cdFx0XHRpZiAoIHRfY29uZiA9PT0gdF9vcHRzICkge1xuXHRcdFx0XHRvWyBrZXkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1sga2V5IF0gPSBvcHRpb247XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbztcblx0XHR9LFxuXHRcdHt9IFxuXHQpO1xuXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdFN5bWJvbENvbmZpZyxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gY29uZmlnO1xuXHRcdFx0fVxuXHRcdH0gXG5cdCk7XG5cblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0U3ltYm9sLmhhc0luc3RhbmNlLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiAoIGluc3RhbmNlOiB7IFtTeW1ib2xDb25zdHJ1Y3Rvck5hbWVdPzogc3RyaW5nIH0gKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGluc3RhbmNlWyBTeW1ib2xDb25zdHJ1Y3Rvck5hbWUgXSA9PT0gTU5FTU9OSUNBO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0gXG5cdCk7XG5cblx0b2RwKFxuXHRcdHRoaXMsXG5cdFx0J3N1YnR5cGVzJyxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gc3VidHlwZXM7XG5cdFx0XHR9XG5cdFx0fSBcblx0KTtcblxuXHQvLyBGb3IgaW5zdGFuY2VvZiBNTkVNT1NZTkVcblx0b2RwKFxuXHRcdHN1YnR5cGVzLFxuXHRcdE1ORU1PU1lORSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0Ly8gcmV0dXJuaW5nIHByb3h5XG5cdFx0XHRcdHJldHVybiB0eXBlc0NvbGxlY3Rpb25zLmdldCggc2VsZiApO1xuXHRcdFx0fVxuXHRcdH0gXG5cdCk7XG5cblx0Ly8gRm9yIGluc3RhbmNlb2YgTU5FTU9TWU5FXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdE1ORU1PU1lORSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0Ly8gcmV0dXJuaW5nIHByb3h5XG5cdFx0XHRcdHJldHVybiB0eXBlc0NvbGxlY3Rpb25zLmdldCggc2VsZiApO1xuXHRcdFx0fVxuXHRcdH0gXG5cdCk7XG5cblx0Y29uc3QgaG9va3MgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdCdob29rcycsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGhvb2tzO1xuXHRcdFx0fVxuXHRcdH0gXG5cdCk7XG5cbn0gYXMgX0ludGVybmFsX1RDXzxvYmplY3Q+O1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdE1ORU1PTklDQSxcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gdHlwZXNDb2xsZWN0aW9ucy5nZXQoIHRoaXMgKTtcblx0XHR9XG5cdH0gXG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdkZWZpbmUnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHsgc3VidHlwZXMgfSA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKFxuXHRcdFx0XHR0aGlzOiBDYWxsYWJsZUZ1bmN0aW9uLFxuXHRcdFx0XHRUeXBlT3JUeXBlTmFtZTogc3RyaW5nIHwgQ2FsbGFibGVGdW5jdGlvbixcblx0XHRcdFx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnPzogQ2FsbGFibGVGdW5jdGlvbiB8IG9iamVjdCxcblx0XHRcdFx0Y29uZmlnPzogb2JqZWN0XG5cdFx0XHQpIHtcblx0XHRcdC8vIHRoaXMgLSBkZWZpbmUgZnVuY3Rpb24gb2YgbW5lbW9uaWNhIGludGVyZmFjZVxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSBkZWZpbmUuY2FsbChcblx0XHRcdFx0XHR0aGlzIGFzIHVua25vd24sXG5cdFx0XHRcdFx0c3VidHlwZXMgYXMgVHlwZXNNYXAsXG5cdFx0XHRcdFx0VHlwZU9yVHlwZU5hbWUsXG5cdFx0XHRcdFx0Y29uc3RydWN0SGFuZGxlck9yQ29uZmlnLFxuXHRcdFx0XHRcdGNvbmZpZ1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH0gXG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdsb29rdXAnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IHsgc3VidHlwZXM6IE1hcDxzdHJpbmcsIG9iamVjdD4gfSxcblx0XHRcdFx0VHlwZU5lc3RlZFBhdGg6IHN0cmluZ1xuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiBsb29rdXAuY2FsbChcbiB0aGlzLnN1YnR5cGVzIGFzIHVua25vd24gYXMgVHlwZXNNYXAsXG4gVHlwZU5lc3RlZFBhdGggXG5cdFx0XHRcdCk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKTtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH0gXG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdyZWdpc3Rlckhvb2snLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHQgXG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoIGhvb2tOYW1lOiBzdHJpbmcsIGhvb2tDYWxsYmFjazogaG9vayApIHtcblx0XHRcdC8vIHJldHVybiBwcm90by5yZWdpc3Rlckhvb2suY2FsbCggdHlwZXNDb2xsZWN0aW9ucy5nZXQoIHNlbGYgKSwgaG9va05hbWUsIGhvb2tDYWxsYmFjayApO1xuXHRcdFx0XHRyZXR1cm4gcmVnaXN0ZXJIb29rLmNhbGwoXG5cdFx0XHRcdFx0c2VsZixcblx0XHRcdFx0XHRob29rTmFtZSxcblx0XHRcdFx0XHRob29rQ2FsbGJhY2sgXG5cdFx0XHRcdCk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKTtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH0gXG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdpbnZva2VIb29rJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRyZXR1cm4gKCBob29rTmFtZTogc3RyaW5nLCBvcHRzOiB7IFtpbmRleDogc3RyaW5nXTogdW5rbm93biB9ICkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gaW52b2tlSG9vay5jYWxsKFxuXHRcdFx0XHRcdHR5cGVzQ29sbGVjdGlvbnMuZ2V0KCB0aGlzICksXG5cdFx0XHRcdFx0aG9va05hbWUsXG5vcHRzIGFzIGhvb2tzT3B0cyBcblx0XHRcdFx0KTtcblx0XHRcdH07XG5cdFx0fVxuXHR9IFxuKTtcblxub2RwKFxuXHRUeXBlc0NvbGxlY3Rpb24ucHJvdG90eXBlLFxuXHQncmVnaXN0ZXJGbG93Q2hlY2tlcicsXG5cdHtcblx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXHRcdFx0cmV0dXJuICggZmxvd0NoZWNrZXJDYWxsYmFjazogKCkgPT4gdW5rbm93biApID0+IHtcblx0XHRcdFx0cmV0dXJuIHJlZ2lzdGVyRmxvd0NoZWNrZXIuY2FsbChcblx0XHRcdFx0XHR0eXBlc0NvbGxlY3Rpb25zLmdldCggdGhpcyApLFxuXHRcdFx0XHRcdGZsb3dDaGVja2VyQ2FsbGJhY2sgXG5cdFx0XHRcdCk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSBcbik7XG5cblxuaW50ZXJmYWNlIFR5cGVzQ29sbGVjdGlvblRhcmdldCB7XG5cdHN1YnR5cGVzOiBUeXBlc01hcDtcblx0ZGVmaW5lOiAobmFtZTogc3RyaW5nLCBjdG9yOiBGdW5jdGlvbkNvbnN0cnVjdG9yKSA9PiBvYmplY3Q7XG59XG5cbmNvbnN0IHR5cGVzQ29sbGVjdGlvblByb3h5SGFuZGxlciA9IHtcblx0Z2V0ICggdGFyZ2V0OiBUeXBlc0NvbGxlY3Rpb25UYXJnZXQsIHByb3A6IHN0cmluZyApIHtcblx0XHRpZiAoIHRhcmdldC5zdWJ0eXBlcy5oYXMoIHByb3AgKSApIHtcblx0XHRcdC8vIGFjY2VzcyB0byBzdXB0eXBlXG5cdFx0XHQvLyBmb3IgbmV3IGNhbGwgb3IgZGVmaW5pbmcgbmV3IHR5cGVcblx0XHRcdHJldHVybiB0YXJnZXQuc3VidHlwZXMuZ2V0KCBwcm9wICk7XG5cdFx0fVxuXHRcdGlmICggcHJvcCA9PT0gJ2RlZmluZScgKSB7XG5cdFx0XHQvLyB3aWxsIGhvcGVmdWxseSBkZWZpbmUgbmV3IHR5cGVcblx0XHRcdHJldHVybiB0YXJnZXQuZGVmaW5lO1xuXHRcdH1cblx0XHRyZXR1cm4gUmVmbGVjdC5nZXQoXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRwcm9wIFxuXHRcdCk7XG5cdH0sXG5cdHNldCAoIHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBUeXBlTmFtZTogc3RyaW5nLCBDb25zdHJ1Y3RvcjogRnVuY3Rpb25Db25zdHJ1Y3RvciApIHtcblx0XHR0YXJnZXQuZGVmaW5lKFxuXHRcdFx0VHlwZU5hbWUsXG5cdFx0XHRDb25zdHJ1Y3RvciBcblx0XHQpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcblx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICggdGFyZ2V0OiBUeXBlc0NvbGxlY3Rpb25UYXJnZXQsIHByb3A6IHN0cmluZyApIHtcblx0XHRpZiAoIHRhcmdldC5zdWJ0eXBlcy5oYXMoIHByb3AgKSApIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGNvbmZpZ3VyYWJsZSA6IHRydWUsXG5cdFx0XHRcdGVudW1lcmFibGUgICA6IHRydWUsXG5cdFx0XHRcdHdyaXRhYmxlICAgICA6IGZhbHNlLFxuXHRcdFx0XHR2YWx1ZSAgICAgICAgOiB0YXJnZXQuc3VidHlwZXMuZ2V0KCBwcm9wIClcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciggdGFyZ2V0LCBwcm9wICk7XG5cdH1cbn07XG5cbmNvbnN0IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiA9ICggY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9ICkgPT4ge1xuXG5cdGNvbnN0IHR5cGVzQ29sbGVjdGlvbiA9IG5ldyBUeXBlc0NvbGxlY3Rpb24oIGNvbmZpZyApO1xuXHRjb25zdCB0eXBlc0NvbGxlY3Rpb25Qcm94eSA9IG5ldyBQcm94eShcblx0XHR0eXBlc0NvbGxlY3Rpb24sXG5cdFx0dHlwZXNDb2xsZWN0aW9uUHJveHlIYW5kbGVyIFxuXHQpO1xuXG5cdHR5cGVzQ29sbGVjdGlvbnMuc2V0KFxuXHRcdHR5cGVzQ29sbGVjdGlvbixcblx0XHR0eXBlc0NvbGxlY3Rpb25Qcm94eSBcblx0KTtcblxuXHRyZXR1cm4gdHlwZXNDb2xsZWN0aW9uUHJveHk7XG5cbn07XG5cbmNvbnN0IERFRkFVTFRfVFlQRVMgPSBjcmVhdGVUeXBlc0NvbGxlY3Rpb24oKTtcbm9kcChcblx0REVGQVVMVF9UWVBFUyxcblx0U3ltYm9sRGVmYXVsdFR5cGVzQ29sbGVjdGlvbixcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0gXG4pO1xuXG5leHBvcnQgY29uc3QgdHlwZXMgPSB7XG5cdGdldCBjcmVhdGVUeXBlc0NvbGxlY3Rpb24gKCk6IENyZWF0ZVR5cGVzQ29sbGVjdGlvbkZ1bmN0aW9uIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCBjb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge30gKTogVHlwZXNDb2xsZWN0aW9uIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiggY29uZmlnICkgYXMgVHlwZXNDb2xsZWN0aW9uO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9O1xuXHR9LFxuXHRnZXQgZGVmYXVsdFR5cGVzICgpOiBUeXBlc0NvbGxlY3Rpb24ge1xuXHRcdHJldHVybiBERUZBVUxUX1RZUEVTIGFzIFR5cGVzQ29sbGVjdGlvbjtcblx0fVxuXG59O1xuIl19