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
        const result = function (config = {}) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVzY3JpcHRvcnMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFVYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxxQkFBcUIsRUFDckIsNEJBQTRCLEVBQzVCLFlBQVksRUFDWixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLFNBQVMsRUFDVCxTQUFTLEdBQ1QsR0FBRyxxQkFBUyxDQUFDO0FBR2QsMkNBRXlCO0FBRXpCLDBEQUE0QztBQUU1QyxNQUFNLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFDVixtQkFBbUIsR0FDbkIsR0FBRyxRQUFRLENBQUM7QUFFYixNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFbkMsTUFBTSxlQUFlLEdBQUcsVUFBVyxPQUFnQztJQUVsRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUczQixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQ3ZDLENBQUUsQ0FBMEIsRUFBRSxHQUFXLEVBQUcsRUFBRTtRQUM3QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDN0IsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sS0FBSyxDQUFDO1FBQzVCLE1BQU0sTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDO1FBQzdCLElBQUssTUFBTSxLQUFLLE1BQU0sRUFBRyxDQUFDO1lBQ3pCLENBQUMsQ0FBRSxHQUFHLENBQUUsR0FBRyxLQUFLLENBQUM7UUFDbEIsQ0FBQzthQUFNLENBQUM7WUFDUCxDQUFDLENBQUUsR0FBRyxDQUFFLEdBQUcsTUFBTSxDQUFDO1FBQ25CLENBQUM7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUMsRUFDRCxFQUFFLENBQ0YsQ0FBQztJQUVGLEdBQUcsQ0FDRixJQUFJLEVBQ0osWUFBWSxFQUNaO1FBQ0MsR0FBRztZQUNGLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztLQUNELENBQ0QsQ0FBQztJQUVGLEdBQUcsQ0FDRixJQUFJLEVBQ0osTUFBTSxDQUFDLFdBQVcsRUFDbEI7UUFDQyxHQUFHO1lBQ0YsTUFBTSxNQUFNLEdBQUcsQ0FBRSxRQUE4QyxFQUFHLEVBQUU7Z0JBQ25FLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBRSxxQkFBcUIsQ0FBRSxLQUFLLFNBQVMsQ0FBQztnQkFDcEUsT0FBTyxXQUFXLENBQUM7WUFDcEIsQ0FBQyxDQUFDO1lBQ0YsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO0tBQ0QsQ0FDRCxDQUFDO0lBRUYsR0FBRyxDQUNGLElBQUksRUFDSixVQUFVLEVBQ1Y7UUFDQyxHQUFHO1lBQ0YsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztLQUNELENBQ0QsQ0FBQztJQUdGLEdBQUcsQ0FDRixRQUFRLEVBQ1IsU0FBUyxFQUNUO1FBQ0MsR0FBRztZQUVGLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztZQUM1QyxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7S0FDRCxDQUNELENBQUM7SUFHRixHQUFHLENBQ0YsSUFBSSxFQUNKLFNBQVMsRUFDVDtRQUNDLEdBQUc7WUFFRixNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFLENBQUM7WUFDNUMsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO0tBQ0QsQ0FDRCxDQUFDO0lBRUYsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUUsQ0FBQztJQUNwQyxHQUFHLENBQ0YsSUFBSSxFQUNKLE9BQU8sRUFDUDtRQUNDLEdBQUc7WUFDRixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FDRCxDQUNELENBQUM7QUFFSCxDQUEwQixDQUFDO0FBRTNCLEdBQUcsQ0FDRixlQUFlLENBQUMsU0FBUyxFQUN6QixTQUFTLEVBQ1Q7SUFDQyxHQUFHO1FBQ0YsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxDQUFDO1FBQzVDLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUNELENBQ0QsQ0FBQztBQUVGLEdBQUcsQ0FDRixlQUFlLENBQUMsU0FBUyxFQUN6QixRQUFRLEVBQ1I7SUFDQyxHQUFHO1FBQ0YsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUMxQixNQUFNLE1BQU0sR0FBRyxVQUVkLGNBQXlDLEVBQ3pDLHdCQUFvRCxFQUNwRCxNQUFlO1lBR2YsTUFBTSxZQUFZLEdBQUcsY0FBTSxDQUFDLElBQUksQ0FDL0IsSUFBZSxFQUNmLFFBQW9CLEVBQ3BCLGNBQWMsRUFDZCx3QkFBd0IsRUFDeEIsTUFBTSxDQUNOLENBQUM7WUFDRixPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDLENBQUM7UUFDRixPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFDRCxVQUFVLEVBQUcsSUFBSTtDQUNqQixDQUNELENBQUM7QUFFRixHQUFHLENBQ0YsZUFBZSxDQUFDLFNBQVMsRUFDekIsUUFBUSxFQUNSO0lBQ0MsR0FBRztRQUNGLE1BQU0sTUFBTSxHQUFHLFVBRWQsY0FBc0I7WUFFdEIsTUFBTSxZQUFZLEdBQUcsY0FBTSxDQUFDLElBQUksQ0FDbkMsSUFBSSxDQUFDLFFBQStCLEVBQ3BDLGNBQWMsQ0FDVixDQUFDO1lBQ0YsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUUsQ0FBQztRQUNmLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUNELFVBQVUsRUFBRyxJQUFJO0NBQ2pCLENBQ0QsQ0FBQztBQUVGLEdBQUcsQ0FDRixlQUFlLENBQUMsU0FBUyxFQUN6QixjQUFjLEVBQ2Q7SUFDQyxHQUFHO1FBRUYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLE1BQU0sTUFBTSxHQUFHLFVBQVcsUUFBZ0IsRUFBRSxZQUFrQjtZQUU3RCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUNuQyxJQUFJLEVBQ0osUUFBUSxFQUNSLFlBQVksQ0FDWixDQUFDO1lBQ0YsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUUsQ0FBQztRQUNmLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUNELFVBQVUsRUFBRyxJQUFJO0NBQ2pCLENBQ0QsQ0FBQztBQUVGLEdBQUcsQ0FDRixlQUFlLENBQUMsU0FBUyxFQUN6QixZQUFZLEVBQ1o7SUFDQyxHQUFHO1FBQ0YsTUFBTSxNQUFNLEdBQUcsQ0FBRSxRQUFnQixFQUFFLElBQWtDLEVBQUcsRUFBRTtZQUN6RSxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNqQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFLEVBQzVCLFFBQVEsRUFDYixJQUFpQixDQUNaLENBQUM7WUFDRixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDLENBQUM7UUFDRixPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7Q0FDRCxDQUNELENBQUM7QUFFRixHQUFHLENBQ0YsZUFBZSxDQUFDLFNBQVMsRUFDekIscUJBQXFCLEVBQ3JCO0lBQ0MsR0FBRztRQUNGLE1BQU0sTUFBTSxHQUFHLENBQUUsbUJBQWtDLEVBQUcsRUFBRTtZQUN2RCxNQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQzdDLGdCQUFnQixDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsRUFDNUIsbUJBQW1CLENBQ25CLENBQUM7WUFDRixPQUFPLGFBQWEsQ0FBQztRQUN0QixDQUFDLENBQUM7UUFDRixPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7Q0FDRCxDQUNELENBQUM7QUFRRixNQUFNLDJCQUEyQixHQUFHO0lBQ25DLEdBQUcsQ0FBRyxNQUE2QixFQUFFLElBQVk7UUFDaEQsSUFBSyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsRUFBRyxDQUFDO1lBR25DLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxDQUFDO1lBQ2xELE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFDRCxJQUFLLElBQUksS0FBSyxRQUFRLEVBQUcsQ0FBQztZQUV6QixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdEIsQ0FBQztRQUNELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQ2hDLE1BQU0sRUFDTixJQUFJLENBQ0osQ0FBQztRQUNGLE9BQU8sYUFBYSxDQUFDO0lBQ3RCLENBQUM7SUFDRCxHQUFHLENBQUcsTUFBNkIsRUFBRSxRQUFnQixFQUFFLFdBQWdDO1FBQ3RGLE1BQU0sQ0FBQyxNQUFNLENBQ1osUUFBUSxFQUNSLFdBQVcsQ0FDWCxDQUFDO1FBQ0YsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsd0JBQXdCLENBQUcsTUFBNkIsRUFBRSxJQUFZO1FBQ3JFLElBQUssTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFLEVBQUcsQ0FBQztZQUNuQyxNQUFNLGdCQUFnQixHQUFHO2dCQUN4QixZQUFZLEVBQUcsSUFBSTtnQkFDbkIsVUFBVSxFQUFLLElBQUk7Z0JBQ25CLFFBQVEsRUFBTyxLQUFLO2dCQUNwQixLQUFLLEVBQVUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFO2FBQzFDLENBQUM7WUFDRixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFDRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUUsTUFBTSxFQUFFLElBQUksQ0FBRSxDQUFDO1FBQ3ZFLE9BQU8sYUFBYSxDQUFDO0lBQ3RCLENBQUM7Q0FDRCxDQUFDO0FBRUYsTUFBTSxxQkFBcUIsR0FBRyxDQUFFLFNBQWtDLEVBQUUsRUFBRyxFQUFFO0lBRXhFLE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxDQUFFLE1BQU0sQ0FBRSxDQUFDO0lBQ3RELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxLQUFLLENBQ3JDLGVBQWUsRUFDZiwyQkFBMkIsQ0FDM0IsQ0FBQztJQUVGLGdCQUFnQixDQUFDLEdBQUcsQ0FDbkIsZUFBZSxFQUNmLG9CQUFvQixDQUNwQixDQUFDO0lBRUYsT0FBTyxvQkFBb0IsQ0FBQztBQUU3QixDQUFDLENBQUM7QUFFRixNQUFNLGFBQWEsR0FBRyxxQkFBcUIsRUFBRSxDQUFDO0FBQzlDLEdBQUcsQ0FDRixhQUFhLEVBQ2IsNEJBQTRCLEVBQzVCO0lBQ0MsR0FBRztRQUNGLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNELENBQ0QsQ0FBQztBQUVXLFFBQUEsS0FBSyxHQUFHO0lBQ3BCLElBQUkscUJBQXFCO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLFVBQVcsU0FBa0MsRUFBRTtZQUM3RCxNQUFNLGdCQUFnQixHQUFHLHFCQUFxQixDQUFFLE1BQU0sQ0FBcUIsQ0FBQztZQUM1RSxPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUMsQ0FBQztRQUNGLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUNELElBQUksWUFBWTtRQUNmLE1BQU0sTUFBTSxHQUFHLGFBQWdDLENBQUM7UUFDaEQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBRUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHR5cGUge1xuXHRfSW50ZXJuYWxfVENfLFxuXHRDcmVhdGVUeXBlc0NvbGxlY3Rpb25GdW5jdGlvbixcblx0VHlwZXNDb2xsZWN0aW9uLFxuXHRob29rc09wdHMsXG5cdGhvb2tcbn0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuY29uc3Qge1xuXHRvZHAsXG5cdFN5bWJvbENvbnN0cnVjdG9yTmFtZSxcblx0U3ltYm9sRGVmYXVsdFR5cGVzQ29sbGVjdGlvbixcblx0U3ltYm9sQ29uZmlnLFxuXHRkZWZhdWx0T3B0aW9ucyxcblx0ZGVmYXVsdE9wdGlvbnNLZXlzLFxuXHRNTkVNT05JQ0EsXG5cdE1ORU1PU1lORSxcbn0gPSBjb25zdGFudHM7XG5cbi8vIGhlcmUgaXMgVHlwZXNDb2xsZWN0aW9uLmRlZmluZSgpIG1ldGhvZFxuaW1wb3J0IHtcblx0ZGVmaW5lLCBsb29rdXAsIHR5cGUgVHlwZXNNYXAgXG59IGZyb20gJy4uLy4uL2FwaS90eXBlcyc7XG5cbmltcG9ydCAqIGFzIGhvb2tzQVBJIGZyb20gJy4uLy4uL2FwaS9ob29rcyc7XG5cbmNvbnN0IHtcblx0cmVnaXN0ZXJIb29rLFxuXHRpbnZva2VIb29rLFxuXHRyZWdpc3RlckZsb3dDaGVja2VyLFxufSA9IGhvb2tzQVBJO1xuXG5jb25zdCB0eXBlc0NvbGxlY3Rpb25zID0gbmV3IE1hcCgpO1xuXG5jb25zdCBUeXBlc0NvbGxlY3Rpb24gPSBmdW5jdGlvbiAoIF9jb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ICkge1xuXHQgXG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdGNvbnN0IHN1YnR5cGVzID0gbmV3IE1hcCgpO1xuXG5cdC8vIGRlZmF1bHQgY29uZmlnIGlzIGxlc3MgaW1wb3J0YW50IHRoYW4gdHlwZXMgY29sbGVjdGlvbiBjb25maWdcblx0Y29uc3QgY29uZmlnID0gZGVmYXVsdE9wdGlvbnNLZXlzLnJlZHVjZShcblx0XHQoIG86IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBrZXk6IHN0cmluZyApID0+IHtcblx0XHRcdGNvbnN0IHZhbHVlID0gX2NvbmZpZ1sga2V5IF07XG5cdFx0XHRjb25zdCBvcHRpb24gPSBkZWZhdWx0T3B0aW9uc1sga2V5IF07XG5cdFx0XHRjb25zdCB0X2NvbmYgPSB0eXBlb2YgdmFsdWU7XG5cdFx0XHRjb25zdCB0X29wdHMgPSB0eXBlb2Ygb3B0aW9uO1xuXHRcdFx0aWYgKCB0X2NvbmYgPT09IHRfb3B0cyApIHtcblx0XHRcdFx0b1sga2V5IF0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9bIGtleSBdID0gb3B0aW9uO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG87XG5cdFx0fSxcblx0XHR7fSBcblx0KTtcblxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHRTeW1ib2xDb25maWcsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGNvbmZpZztcblx0XHRcdH1cblx0XHR9IFxuXHQpO1xuXG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdFN5bWJvbC5oYXNJbnN0YW5jZSxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSAoIGluc3RhbmNlOiB7IFtTeW1ib2xDb25zdHJ1Y3Rvck5hbWVdPzogc3RyaW5nIH0gKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgY2hlY2tSZXN1bHQgPSBpbnN0YW5jZVsgU3ltYm9sQ29uc3RydWN0b3JOYW1lIF0gPT09IE1ORU1PTklDQTtcblx0XHRcdFx0XHRyZXR1cm4gY2hlY2tSZXN1bHQ7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fSBcblx0KTtcblxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHQnc3VidHlwZXMnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBzdWJ0eXBlcztcblx0XHRcdH1cblx0XHR9IFxuXHQpO1xuXG5cdC8vIEZvciBpbnN0YW5jZW9mIE1ORU1PU1lORVxuXHRvZHAoXG5cdFx0c3VidHlwZXMsXG5cdFx0TU5FTU9TWU5FLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHQvLyByZXR1cm5pbmcgcHJveHlcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gdHlwZXNDb2xsZWN0aW9ucy5nZXQoIHNlbGYgKTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHR9IFxuXHQpO1xuXG5cdC8vIEZvciBpbnN0YW5jZW9mIE1ORU1PU1lORVxuXHRvZHAoXG5cdFx0dGhpcyxcblx0XHRNTkVNT1NZTkUsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdC8vIHJldHVybmluZyBwcm94eVxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldCggc2VsZiApO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH0gXG5cdCk7XG5cblx0Y29uc3QgaG9va3MgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5cdG9kcChcblx0XHR0aGlzLFxuXHRcdCdob29rcycsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGhvb2tzO1xuXHRcdFx0fVxuXHRcdH0gXG5cdCk7XG5cbn0gYXMgX0ludGVybmFsX1RDXzxvYmplY3Q+O1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdE1ORU1PTklDQSxcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSB0eXBlc0NvbGxlY3Rpb25zLmdldCggdGhpcyApO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH0gXG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdkZWZpbmUnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHsgc3VidHlwZXMgfSA9IHRoaXM7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoXG5cdFx0XHRcdHRoaXM6IENhbGxhYmxlRnVuY3Rpb24sXG5cdFx0XHRcdFR5cGVPclR5cGVOYW1lOiBzdHJpbmcgfCBDYWxsYWJsZUZ1bmN0aW9uLFxuXHRcdFx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWc/OiBDYWxsYWJsZUZ1bmN0aW9uIHwgb2JqZWN0LFxuXHRcdFx0XHRjb25maWc/OiBvYmplY3Rcblx0XHRcdCkge1xuXHRcdFx0Ly8gdGhpcyAtIGRlZmluZSBmdW5jdGlvbiBvZiBtbmVtb25pY2EgaW50ZXJmYWNlXG5cdFx0XHRcdGNvbnN0IGRlZmluZVJlc3VsdCA9IGRlZmluZS5jYWxsKFxuXHRcdFx0XHRcdHRoaXMgYXMgdW5rbm93bixcblx0XHRcdFx0XHRzdWJ0eXBlcyBhcyBUeXBlc01hcCxcblx0XHRcdFx0XHRUeXBlT3JUeXBlTmFtZSxcblx0XHRcdFx0XHRjb25zdHJ1Y3RIYW5kbGVyT3JDb25maWcsXG5cdFx0XHRcdFx0Y29uZmlnXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBkZWZpbmVSZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH0gXG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdsb29rdXAnLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiB7IHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBvYmplY3Q+IH0pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uIChcblx0XHRcdFx0dGhpczogeyBzdWJ0eXBlczogTWFwPHN0cmluZywgb2JqZWN0PiB9LFxuXHRcdFx0XHRUeXBlTmVzdGVkUGF0aDogc3RyaW5nXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgbG9va3VwUmVzdWx0ID0gbG9va3VwLmNhbGwoXG4gdGhpcy5zdWJ0eXBlcyBhcyB1bmtub3duIGFzIFR5cGVzTWFwLFxuIFR5cGVOZXN0ZWRQYXRoIFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gbG9va3VwUmVzdWx0O1xuXHRcdFx0fS5iaW5kKCB0aGlzICk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fSBcbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J3JlZ2lzdGVySG9vaycsXG5cdHtcblx0XHRnZXQgKHRoaXM6IFR5cGVzQ29sbGVjdGlvbikge1xuXHRcdCBcblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKCBob29rTmFtZTogc3RyaW5nLCBob29rQ2FsbGJhY2s6IGhvb2sgKSB7XG5cdFx0XHQvLyByZXR1cm4gcHJvdG8ucmVnaXN0ZXJIb29rLmNhbGwoIHR5cGVzQ29sbGVjdGlvbnMuZ2V0KCBzZWxmICksIGhvb2tOYW1lLCBob29rQ2FsbGJhY2sgKTtcblx0XHRcdFx0Y29uc3QgaG9va1Jlc3VsdCA9IHJlZ2lzdGVySG9vay5jYWxsKFxuXHRcdFx0XHRcdHNlbGYsXG5cdFx0XHRcdFx0aG9va05hbWUsXG5cdFx0XHRcdFx0aG9va0NhbGxiYWNrIFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gaG9va1Jlc3VsdDtcblx0XHRcdH0uYmluZCggdGhpcyApO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH0gXG4pO1xuXG5vZHAoXG5cdFR5cGVzQ29sbGVjdGlvbi5wcm90b3R5cGUsXG5cdCdpbnZva2VIb29rJyxcblx0e1xuXHRcdGdldCAodGhpczogVHlwZXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSAoIGhvb2tOYW1lOiBzdHJpbmcsIG9wdHM6IHsgW2luZGV4OiBzdHJpbmddOiB1bmtub3duIH0gKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGhvb2tSZXN1bHQgPSBpbnZva2VIb29rLmNhbGwoXG5cdFx0XHRcdFx0dHlwZXNDb2xsZWN0aW9ucy5nZXQoIHRoaXMgKSxcblx0XHRcdFx0XHRob29rTmFtZSxcbm9wdHMgYXMgaG9va3NPcHRzIFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gaG9va1Jlc3VsdDtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fSBcbik7XG5cbm9kcChcblx0VHlwZXNDb2xsZWN0aW9uLnByb3RvdHlwZSxcblx0J3JlZ2lzdGVyRmxvd0NoZWNrZXInLFxuXHR7XG5cdFx0Z2V0ICh0aGlzOiBUeXBlc0NvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9ICggZmxvd0NoZWNrZXJDYWxsYmFjazogKCkgPT4gdW5rbm93biApID0+IHtcblx0XHRcdFx0Y29uc3QgY2hlY2tlclJlc3VsdCA9IHJlZ2lzdGVyRmxvd0NoZWNrZXIuY2FsbChcblx0XHRcdFx0XHR0eXBlc0NvbGxlY3Rpb25zLmdldCggdGhpcyApLFxuXHRcdFx0XHRcdGZsb3dDaGVja2VyQ2FsbGJhY2sgXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBjaGVja2VyUmVzdWx0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9IFxuKTtcblxuXG5pbnRlcmZhY2UgVHlwZXNDb2xsZWN0aW9uVGFyZ2V0IHtcblx0c3VidHlwZXM6IFR5cGVzTWFwO1xuXHRkZWZpbmU6IChuYW1lOiBzdHJpbmcsIGN0b3I6IEZ1bmN0aW9uQ29uc3RydWN0b3IpID0+IG9iamVjdDtcbn1cblxuY29uc3QgdHlwZXNDb2xsZWN0aW9uUHJveHlIYW5kbGVyID0ge1xuXHRnZXQgKCB0YXJnZXQ6IFR5cGVzQ29sbGVjdGlvblRhcmdldCwgcHJvcDogc3RyaW5nICkge1xuXHRcdGlmICggdGFyZ2V0LnN1YnR5cGVzLmhhcyggcHJvcCApICkge1xuXHRcdFx0Ly8gYWNjZXNzIHRvIHN1YnR5cGVcblx0XHRcdC8vIGZvciBuZXcgY2FsbCBvciBkZWZpbmluZyBuZXcgdHlwZVxuXHRcdFx0Y29uc3Qgc3VidHlwZVJlc3VsdCA9IHRhcmdldC5zdWJ0eXBlcy5nZXQoIHByb3AgKTtcblx0XHRcdHJldHVybiBzdWJ0eXBlUmVzdWx0O1xuXHRcdH1cblx0XHRpZiAoIHByb3AgPT09ICdkZWZpbmUnICkge1xuXHRcdFx0Ly8gd2lsbCBob3BlZnVsbHkgZGVmaW5lIG5ldyB0eXBlXG5cdFx0XHRyZXR1cm4gdGFyZ2V0LmRlZmluZTtcblx0XHR9XG5cdFx0Y29uc3QgcmVmbGVjdFJlc3VsdCA9IFJlZmxlY3QuZ2V0KFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0cHJvcCBcblx0XHQpO1xuXHRcdHJldHVybiByZWZsZWN0UmVzdWx0O1xuXHR9LFxuXHRzZXQgKCB0YXJnZXQ6IFR5cGVzQ29sbGVjdGlvblRhcmdldCwgVHlwZU5hbWU6IHN0cmluZywgQ29uc3RydWN0b3I6IEZ1bmN0aW9uQ29uc3RydWN0b3IgKSB7XG5cdFx0dGFyZ2V0LmRlZmluZShcblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0Q29uc3RydWN0b3IgXG5cdFx0KTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG5cdGdldE93blByb3BlcnR5RGVzY3JpcHRvciAoIHRhcmdldDogVHlwZXNDb2xsZWN0aW9uVGFyZ2V0LCBwcm9wOiBzdHJpbmcgKSB7XG5cdFx0aWYgKCB0YXJnZXQuc3VidHlwZXMuaGFzKCBwcm9wICkgKSB7XG5cdFx0XHRjb25zdCBkZXNjcmlwdG9yUmVzdWx0ID0ge1xuXHRcdFx0XHRjb25maWd1cmFibGUgOiB0cnVlLFxuXHRcdFx0XHRlbnVtZXJhYmxlICAgOiB0cnVlLFxuXHRcdFx0XHR3cml0YWJsZSAgICAgOiBmYWxzZSxcblx0XHRcdFx0dmFsdWUgICAgICAgIDogdGFyZ2V0LnN1YnR5cGVzLmdldCggcHJvcCApXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIGRlc2NyaXB0b3JSZXN1bHQ7XG5cdFx0fVxuXHRcdGNvbnN0IG93blByb3BSZXN1bHQgPSBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciggdGFyZ2V0LCBwcm9wICk7XG5cdFx0cmV0dXJuIG93blByb3BSZXN1bHQ7XG5cdH1cbn07XG5cbmNvbnN0IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiA9ICggY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9ICkgPT4ge1xuXG5cdGNvbnN0IHR5cGVzQ29sbGVjdGlvbiA9IG5ldyBUeXBlc0NvbGxlY3Rpb24oIGNvbmZpZyApO1xuXHRjb25zdCB0eXBlc0NvbGxlY3Rpb25Qcm94eSA9IG5ldyBQcm94eShcblx0XHR0eXBlc0NvbGxlY3Rpb24sXG5cdFx0dHlwZXNDb2xsZWN0aW9uUHJveHlIYW5kbGVyIFxuXHQpO1xuXG5cdHR5cGVzQ29sbGVjdGlvbnMuc2V0KFxuXHRcdHR5cGVzQ29sbGVjdGlvbixcblx0XHR0eXBlc0NvbGxlY3Rpb25Qcm94eSBcblx0KTtcblxuXHRyZXR1cm4gdHlwZXNDb2xsZWN0aW9uUHJveHk7XG5cbn07XG5cbmNvbnN0IERFRkFVTFRfVFlQRVMgPSBjcmVhdGVUeXBlc0NvbGxlY3Rpb24oKTtcbm9kcChcblx0REVGQVVMVF9UWVBFUyxcblx0U3ltYm9sRGVmYXVsdFR5cGVzQ29sbGVjdGlvbixcblx0e1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0gXG4pO1xuXG5leHBvcnQgY29uc3QgdHlwZXMgPSB7XG5cdGdldCBjcmVhdGVUeXBlc0NvbGxlY3Rpb24gKCk6IENyZWF0ZVR5cGVzQ29sbGVjdGlvbkZ1bmN0aW9uIHtcblx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoIGNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fSApOiBUeXBlc0NvbGxlY3Rpb24ge1xuXHRcdFx0Y29uc3QgY29sbGVjdGlvblJlc3VsdCA9IGNyZWF0ZVR5cGVzQ29sbGVjdGlvbiggY29uZmlnICkgYXMgVHlwZXNDb2xsZWN0aW9uO1xuXHRcdFx0cmV0dXJuIGNvbGxlY3Rpb25SZXN1bHQ7XG5cdFx0fTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRnZXQgZGVmYXVsdFR5cGVzICgpOiBUeXBlc0NvbGxlY3Rpb24ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IERFRkFVTFRfVFlQRVMgYXMgVHlwZXNDb2xsZWN0aW9uO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxufTtcbiJdfQ==