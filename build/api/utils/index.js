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
exports.CreationHandler = void 0;
const constants_1 = require("../../constants");
const errors_1 = require("../../descriptors/errors");
const collectConstructors_1 = require("../../utils/collectConstructors");
const { odp, SymbolConstructorName, MNEMONICA, MNEMOSYNE, } = constants_1.constants;
const { WRONG_TYPE_DEFINITION, } = errors_1.ErrorsTypes;
const Props_1 = require("../types/Props");
const compileNewModificatorFunctionBody_1 = __importStar(require("../types/compileNewModificatorFunctionBody"));
const CreationHandler = function (constructionAnswer) {
    return constructionAnswer;
};
exports.CreationHandler = CreationHandler;
const checkProto = (proto) => {
    if (!(proto instanceof Object)) {
        throw new WRONG_TYPE_DEFINITION('expect prototype to be an object');
    }
};
const getTypeChecker = (TypeName) => {
    const seeker = (instance) => {
        if (typeof instance !== 'object' || instance === null) {
            return false;
        }
        if (!instance.constructor) {
            return false;
        }
        const prototype = Reflect.getPrototypeOf(instance);
        if (prototype === null) {
            return false;
        }
        if (prototype.constructor && prototype.constructor.name === 'Promise') {
            const checkResult = instance[SymbolConstructorName] === TypeName;
            return checkResult;
        }
        const constructors = (0, collectConstructors_1.collectConstructors)(instance);
        const constructorResult = constructors[TypeName] || false;
        return constructorResult;
    };
    return seeker;
};
const typeCheckerCache = new Map();
const getCachedTypeChecker = (TypeName) => {
    let checker = typeCheckerCache.get(TypeName);
    if (!checker) {
        checker = getTypeChecker(TypeName);
        typeCheckerCache.set(TypeName, checker);
    }
    return checker;
};
const getTypeSplitPath = (path) => {
    const split = path
        .replace(/\n|\t| /g, '')
        .replace(/\[(\w+)\]/g, '.$1')
        .replace(/^\./, '')
        .split(/\.|\/|:/);
    return split;
};
const getExistentAsyncStack = (existentInstance) => {
    const stack = [];
    let proto = existentInstance;
    while (proto) {
        const props = (0, Props_1._getProps)(proto);
        if (!props.__stack__) {
            break;
        }
        const pstack = props
            .__stack__
            .split('\n')
            .reduce((arr, line) => {
            if (line.length) {
                arr.push(line);
            }
            return arr;
        }, []);
        proto = proto.parent();
        const protoProps = (0, Props_1._getProps)(proto);
        if (proto && protoProps && protoProps.__type__) {
            if (protoProps.__type__.isSubType) {
                stack.push(...pstack.slice(0, 1));
            }
            else {
                stack.push(...pstack);
            }
        }
        else {
            stack.push(...pstack);
            break;
        }
    }
    return stack;
};
const forbiddenNames = [MNEMONICA, MNEMOSYNE];
const checkTypeName = (name) => {
    if (!name.length) {
        throw new WRONG_TYPE_DEFINITION('TypeName must not be empty');
    }
    if (name[0] !== name[0].toUpperCase()) {
        throw new WRONG_TYPE_DEFINITION('TypeName should start with Uppercase Letter');
    }
    if (forbiddenNames.includes(name)) {
        throw new WRONG_TYPE_DEFINITION('TypeName of reserved keyword');
    }
};
const findSubTypeFromParent = (instance, subType) => {
    let subtype = null;
    if (!instance) {
        return null;
    }
    const props = (0, Props_1._getProps)(instance);
    if (props) {
        const _subtype = props.__type__.subtypes.get(subType);
        if (_subtype !== undefined) {
            subtype = _subtype;
        }
        else {
            subtype = findSubTypeFromParent(props.__parent__, subType);
        }
    }
    return subtype;
};
const makeErrorModificatorType = (TypeName, ErrorModificator = function () { }) => {
    const modificatorBody = (0, compileNewModificatorFunctionBody_1.default)(TypeName);
    const modificatorType = modificatorBody(ErrorModificator, exports.CreationHandler, SymbolConstructorName);
    const result = modificatorType();
    const constructorResult = result;
    return constructorResult;
};
const reflectPrimitive = (thisArg, primitive) => {
    odp(thisArg, Symbol.toPrimitive, {
        get() {
            const result = () => {
                return primitive;
            };
            return result;
        }
    });
    odp(thisArg, 'valueOf', {
        get() {
            const result = () => {
                return primitive;
            };
            return result;
        }
    });
    odp(thisArg, 'toString', {
        get() {
            const result = () => {
                const stringResult = String(primitive);
                return stringResult;
            };
            return result;
        }
    });
};
const reflectPrimitiveWrappers = (_thisArg) => {
    let thisArg = _thisArg;
    if (_thisArg === null) {
        thisArg = Object.create(null);
        reflectPrimitive(thisArg, null);
    }
    if (_thisArg instanceof Number ||
        _thisArg instanceof Boolean ||
        _thisArg instanceof String) {
        const primitive = _thisArg.valueOf();
        reflectPrimitive(thisArg, primitive);
    }
    return thisArg;
};
const TypesUtils = {
    isClass: compileNewModificatorFunctionBody_1.isClass,
    checkProto,
    getTypeChecker,
    getCachedTypeChecker,
    getTypeSplitPath,
    getExistentAsyncStack,
    checkTypeName,
    findSubTypeFromParent,
    makeErrorModificatorType,
    reflectPrimitiveWrappers,
};
exports.default = TypesUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3V0aWxzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWIsK0NBQTRDO0FBQzVDLHFEQUF1RDtBQUN2RCx5RUFBc0U7QUFFdEUsTUFBTSxFQUNMLEdBQUcsRUFDSCxxQkFBcUIsRUFDckIsU0FBUyxFQUNULFNBQVMsR0FDVCxHQUFHLHFCQUFTLENBQUM7QUFFZCxNQUFNLEVBQUUscUJBQXFCLEdBQUcsR0FBRyxvQkFBVyxDQUFDO0FBRS9DLDBDQUV3QjtBQU94QixnSEFBd0c7QUFJakcsTUFBTSxlQUFlLEdBQUcsVUFFOUIsa0JBQTJCO0lBRTNCLE9BQU8sa0JBQWtCLENBQUM7QUFDM0IsQ0FBQyxDQUFDO0FBTFcsUUFBQSxlQUFlLG1CQUsxQjtBQUVGLE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBYyxFQUFFLEVBQUU7SUFDckMsSUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDaEMsTUFBTSxJQUFJLHFCQUFxQixDQUFDLGtDQUFrQyxDQUFDLENBQUM7SUFDckUsQ0FBQztBQUNGLENBQUMsQ0FBQztBQUVGLE1BQU0sY0FBYyxHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO0lBQzNDLE1BQU0sTUFBTSxHQUFZLENBQUMsUUFBdUQsRUFBRSxFQUFFO1FBRW5GLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN2RCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFHRCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzNCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFD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RyxDQUNGLE9BQU8sRUFDUCxVQUFVLEVBQ1Y7UUFDQyxHQUFHO1lBQ0YsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFO2dCQUNuQixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUUsU0FBUyxDQUFFLENBQUM7Z0JBQ3pDLE9BQU8sWUFBWSxDQUFDO1lBQ3JCLENBQUMsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztLQUNELENBQ0QsQ0FBQztBQUNILENBQUMsQ0FBQztBQUVGLE1BQU0sd0JBQXdCLEdBQUcsQ0FBQyxRQUFpQixFQUFFLEVBQUU7SUFDdEQsSUFBSSxPQUFPLEdBQVcsUUFBa0IsQ0FBQztJQUV6QyxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUN2QixPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixnQkFBZ0IsQ0FDZixPQUFPLEVBQ1AsSUFBSSxDQUNKLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFDQyxRQUFRLFlBQVksTUFBTTtRQUMxQixRQUFRLFlBQVksT0FBTztRQUMzQixRQUFRLFlBQVksTUFBTSxFQUN6QixDQUFDO1FBR0YsTUFBTSxTQUFTLEdBQUksUUFBc0MsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNwRSxnQkFBZ0IsQ0FDZixPQUFPLEVBQ1AsU0FBUyxDQUNULENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxPQUFPLENBQUM7QUFDaEIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQUc7SUFDbEIsT0FBTyxFQUFQLDJDQUFPO0lBQ1AsVUFBVTtJQUNWLGNBQWM7SUFDZCxvQkFBb0I7SUFDcEIsZ0JBQWdCO0lBQ2hCLHFCQUFxQjtJQUNyQixhQUFhO0lBQ2IscUJBQXFCO0lBQ3JCLHdCQUF3QjtJQUN4Qix3QkFBd0I7Q0FDeEIsQ0FBQztBQUVGLGtCQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgY29uc3RhbnRzIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IEVycm9yc1R5cGVzIH0gZnJvbSAnLi4vLi4vZGVzY3JpcHRvcnMvZXJyb3JzJztcbmltcG9ydCB7IGNvbGxlY3RDb25zdHJ1Y3RvcnMgfSBmcm9tICcuLi8uLi91dGlscy9jb2xsZWN0Q29uc3RydWN0b3JzJztcblxuY29uc3Qge1xuXHRvZHAsXG5cdFN5bWJvbENvbnN0cnVjdG9yTmFtZSxcblx0TU5FTU9OSUNBLFxuXHRNTkVNT1NZTkUsXG59ID0gY29uc3RhbnRzO1xuXG5jb25zdCB7IFdST05HX1RZUEVfREVGSU5JVElPTiwgfSA9IEVycm9yc1R5cGVzO1xuXG5pbXBvcnQge1xuXHRfZ2V0UHJvcHMsIFByb3BzXG59IGZyb20gJy4uL3R5cGVzL1Byb3BzJztcbmltcG9ydCB0eXBlIHtcblx0SW5zdGFuY2VDb25zdHJ1Y3Rvcixcblx0TW5lbW9uaWNhQ29uc3RydWN0b3IsXG5cdFR5cGVDbGFzc1xufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCBjb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHksIHsgaXNDbGFzcyB9IGZyb20gJy4uL3R5cGVzL2NvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keSc7XG5cbi8vIENyZWF0aW9uSGFuZGxlciAtIGhhbmRsZXMgY29uc3RydWN0b3IgcmV0dXJuIHZhbHVlc1xuLy8gTW92ZWQgdG8gYXBpL3R5cGVzL2luZGV4LnRzIGFzIHBlciByZWZhY3RvcmluZyBwbGFuXG5leHBvcnQgY29uc3QgQ3JlYXRpb25IYW5kbGVyID0gZnVuY3Rpb24gKFxuXHR0aGlzOiBvYmplY3QgJiB7IGNvbnN0cnVjdG9yOiBJbnN0YW5jZUNvbnN0cnVjdG9yIH0sXG5cdGNvbnN0cnVjdGlvbkFuc3dlcjogdW5rbm93blxuKSB7XG5cdHJldHVybiBjb25zdHJ1Y3Rpb25BbnN3ZXI7XG59O1xuXG5jb25zdCBjaGVja1Byb3RvID0gKHByb3RvOiB1bmtub3duKSA9PiB7XG5cdGlmICghKHByb3RvIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuXHRcdHRocm93IG5ldyBXUk9OR19UWVBFX0RFRklOSVRJT04oJ2V4cGVjdCBwcm90b3R5cGUgdG8gYmUgYW4gb2JqZWN0Jyk7XG5cdH1cbn07XG5cbmNvbnN0IGdldFR5cGVDaGVja2VyID0gKFR5cGVOYW1lOiBzdHJpbmcpID0+IHtcblx0Y29uc3Qgc2Vla2VyOiB1bmtub3duID0gKGluc3RhbmNlOiBvYmplY3QgJiB7IFtTeW1ib2xDb25zdHJ1Y3Rvck5hbWVdPzogc3RyaW5nIH0pID0+IHtcblxuXHRcdGlmICh0eXBlb2YgaW5zdGFuY2UgIT09ICdvYmplY3QnIHx8IGluc3RhbmNlID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cblx0XHRpZiAoIWluc3RhbmNlLmNvbnN0cnVjdG9yKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvdG90eXBlID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZihpbnN0YW5jZSk7XG5cdFx0aWYgKHByb3RvdHlwZSA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmIChwcm90b3R5cGUuY29uc3RydWN0b3IgJiYgcHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdQcm9taXNlJykge1xuXHRcdFx0Ly8gaWYgKCBpbnN0YW5jZSBpbnN0YW5jZW9mIFByb21pc2UgKSB7XG5cblx0XHRcdGNvbnN0IGNoZWNrUmVzdWx0ID0gaW5zdGFuY2VbIFN5bWJvbENvbnN0cnVjdG9yTmFtZSBdID09PSBUeXBlTmFtZTtcblx0XHRcdHJldHVybiBjaGVja1Jlc3VsdDtcblx0XHR9XG5cblx0XHRjb25zdCBjb25zdHJ1Y3RvcnMgPSBjb2xsZWN0Q29uc3RydWN0b3JzKGluc3RhbmNlKSBhcyBSZWNvcmQ8c3RyaW5nLCBuZXcgKCkgPT4gdW5rbm93bj47XG5cblx0XHRjb25zdCBjb25zdHJ1Y3RvclJlc3VsdCA9IGNvbnN0cnVjdG9yc1sgVHlwZU5hbWUgXSB8fCBmYWxzZTtcblx0XHRyZXR1cm4gY29uc3RydWN0b3JSZXN1bHQ7XG5cblx0fTtcblx0cmV0dXJuIHNlZWtlcjtcbn07XG5cbmNvbnN0IHR5cGVDaGVja2VyQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgdW5rbm93bj4oKTtcblxuLy8gZ2V0VHlwZUNoZWNrZXIgYnVpbGRzIGEgZnJlc2ggY2xvc3VyZSBwZXIgY2FsbCwgYW5kIGluc3RhbmNlb2Zcbi8vIGNoZWNrcyBydW4gcGVyIGFjY2VzcyDigJQgc28gdGhlIGNsb3N1cmVzIGFyZSBjYWNoZWQgcGVyIFR5cGVOYW1lXG5jb25zdCBnZXRDYWNoZWRUeXBlQ2hlY2tlciA9IChUeXBlTmFtZTogc3RyaW5nKSA9PiB7XG5cdGxldCBjaGVja2VyID0gdHlwZUNoZWNrZXJDYWNoZS5nZXQoVHlwZU5hbWUpO1xuXHRpZiAoIWNoZWNrZXIpIHtcblx0XHRjaGVja2VyID0gZ2V0VHlwZUNoZWNrZXIoVHlwZU5hbWUpO1xuXHRcdHR5cGVDaGVja2VyQ2FjaGUuc2V0KFR5cGVOYW1lLCBjaGVja2VyKTtcblx0fVxuXHRyZXR1cm4gY2hlY2tlcjtcbn07XG5cbmNvbnN0IGdldFR5cGVTcGxpdFBhdGggPSAocGF0aDogc3RyaW5nKSA9PiB7XG5cdGNvbnN0IHNwbGl0ID0gcGF0aFxuXHRcdC8vIGJlYXV0aWZ1bGwgbmFtZXNcblx0XHQucmVwbGFjZShcblx0XHRcdC9cXG58XFx0fCAvZyxcblx0XHRcdCcnXG5cdFx0KVxuXHRcdC5yZXBsYWNlKFxuXHRcdFx0L1xcWyhcXHcrKVxcXS9nLFxuXHRcdFx0Jy4kMSdcblx0XHQpXG5cdFx0LnJlcGxhY2UoXG5cdFx0XHQvXlxcLi8sXG5cdFx0XHQnJ1xuXHRcdClcblx0XHQuc3BsaXQoL1xcLnxcXC98Oi8pO1xuXHRyZXR1cm4gc3BsaXQ7XG59O1xuXG5leHBvcnQgdHlwZSBhc3luY1N0YWNrID0ge1xuXHRfX3N0YWNrX18/OiBzdHJpbmdcblx0X190eXBlX186IHtcblx0XHRpc1N1YlR5cGU6IGJvb2xlYW5cblx0fVxuXHRwYXJlbnQ6ICgpID0+IGFzeW5jU3RhY2tcbn1cblxuY29uc3QgZ2V0RXhpc3RlbnRBc3luY1N0YWNrID0gKGV4aXN0ZW50SW5zdGFuY2U6IGFzeW5jU3RhY2spOiB1bmtub3duID0+IHtcblxuXHRjb25zdCBzdGFjayA9IFtdO1xuXHRsZXQgcHJvdG8gPSBleGlzdGVudEluc3RhbmNlO1xuXG5cdHdoaWxlIChwcm90bykge1xuXG5cdFx0Y29uc3QgcHJvcHMgPSBfZ2V0UHJvcHMocHJvdG8pIGFzIFByb3BzO1xuXG5cdFx0aWYgKCFwcm9wcy5fX3N0YWNrX18pIHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdGNvbnN0IHBzdGFjayA9IHByb3BzXG5cdFx0XHQuX19zdGFja19fXG5cdFx0XHQuc3BsaXQoJ1xcbicpXG5cdFx0XHQucmVkdWNlKFxuXHRcdFx0XHQoYXJyOiBzdHJpbmdbXSwgbGluZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0aWYgKGxpbmUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRhcnIucHVzaChsaW5lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGFycjtcblx0XHRcdFx0fSxcblx0XHRcdFx0W11cblx0XHRcdCk7XG5cblx0XHRwcm90byA9IHByb3RvLnBhcmVudCgpO1xuXG5cdFx0Y29uc3QgcHJvdG9Qcm9wcyA9IF9nZXRQcm9wcyhwcm90bykgYXMgUHJvcHM7XG5cblx0XHRpZiAocHJvdG8gJiYgcHJvdG9Qcm9wcyAmJiBwcm90b1Byb3BzLl9fdHlwZV9fKSB7XG5cblx0XHRcdGlmIChwcm90b1Byb3BzLl9fdHlwZV9fLmlzU3ViVHlwZSkge1xuXHRcdFx0XHRzdGFjay5wdXNoKC4uLnBzdGFjay5zbGljZShcblx0XHRcdFx0XHQwLFxuXHRcdFx0XHRcdDFcblx0XHRcdFx0KSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzdGFjay5wdXNoKC4uLnBzdGFjayk7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0c3RhY2sucHVzaCguLi5wc3RhY2spO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHN0YWNrO1xuXG59O1xuXG5jb25zdCBmb3JiaWRkZW5OYW1lcyA9IFsgTU5FTU9OSUNBLCBNTkVNT1NZTkUgXTtcblxuY29uc3QgY2hlY2tUeXBlTmFtZSA9IChuYW1lOiBzdHJpbmcpID0+IHtcblxuXHRpZiAoIW5hbWUubGVuZ3RoKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignVHlwZU5hbWUgbXVzdCBub3QgYmUgZW1wdHknKTtcblx0fVxuXG5cdGlmIChuYW1lWyAwIF0gIT09IG5hbWVbIDAgXS50b1VwcGVyQ2FzZSgpKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignVHlwZU5hbWUgc2hvdWxkIHN0YXJ0IHdpdGggVXBwZXJjYXNlIExldHRlcicpO1xuXHR9XG5cblx0aWYgKGZvcmJpZGRlbk5hbWVzLmluY2x1ZGVzKG5hbWUpKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignVHlwZU5hbWUgb2YgcmVzZXJ2ZWQga2V5d29yZCcpO1xuXHR9XG5cbn07XG5cbmV4cG9ydCB0eXBlIHBhcmVudFN1YiA9IHtcblx0VHlwZU5hbWU6IHN0cmluZztcblx0X190eXBlX186IHtcblx0XHRzdWJ0eXBlczogTWFwPHN0cmluZywgcGFyZW50U3ViPlxuXHR9XG5cdF9fcGFyZW50X186IHBhcmVudFN1YlxufVxuXG5jb25zdCBmaW5kU3ViVHlwZUZyb21QYXJlbnQgPSAoaW5zdGFuY2U6IHBhcmVudFN1YiB8IG9iamVjdCB8IHVuZGVmaW5lZCwgc3ViVHlwZTogc3RyaW5nKTogVHlwZUNsYXNzIHwgbnVsbCA9PiB7XG5cdGxldCBzdWJ0eXBlOiBUeXBlQ2xhc3MgfCBudWxsID0gbnVsbDtcblxuXHRpZiAoIWluc3RhbmNlKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRjb25zdCBwcm9wcyA9IF9nZXRQcm9wcyhpbnN0YW5jZSkgYXMgUHJvcHM7XG5cblx0aWYgKHByb3BzKSB7XG5cdFx0Y29uc3QgX3N1YnR5cGUgPSBwcm9wcy5fX3R5cGVfXy5zdWJ0eXBlcy5nZXQoc3ViVHlwZSk7XG5cdFx0aWYgKF9zdWJ0eXBlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHN1YnR5cGUgPSBfc3VidHlwZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3VidHlwZSA9IGZpbmRTdWJUeXBlRnJvbVBhcmVudChcblx0XHRcdFx0cHJvcHMuX19wYXJlbnRfXyxcblx0XHRcdFx0c3ViVHlwZVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc3VidHlwZTtcbn07XG5cbi8vIGlzQ2xhc3MgbGl2ZXMgYmVzaWRlIHRoZSBjb25zdHJ1Y3QtaGFuZGxlciBzaGFwZXMgaXQgbmFycm93cywgaW5cbi8vIGNvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keS50cyAodGhlIGNvbXBpbGVyIHBpY2tzIHRoZSBjbGFzc1xuLy8gYnJhbmNoIHdpdGggaXQpOyByZS1leHBvcnRlZCBoZXJlIGFzIHBhcnQgb2YgVHlwZXNVdGlsc1xuXG5jb25zdCBtYWtlRXJyb3JNb2RpZmljYXRvclR5cGUgPSAoXG5cdFR5cGVOYW1lOiBzdHJpbmcsXG5cdEVycm9yTW9kaWZpY2F0b3IgPSBmdW5jdGlvbiAoKSB7IH1cbik6IE1uZW1vbmljYUNvbnN0cnVjdG9yID0+IHtcblxuXHRjb25zdCBtb2RpZmljYXRvckJvZHkgPSBjb21waWxlTmV3TW9kaWZpY2F0b3JGdW5jdGlvbkJvZHkoVHlwZU5hbWUpO1xuXG5cdC8vIENyZWF0aW9uSGFuZGxlciBpcyBub3cgZGVmaW5lZCBsb2NhbGx5IGluIGFwaS90eXBlcy9pbmRleC50c1xuXHRjb25zdCBtb2RpZmljYXRvclR5cGUgPSBtb2RpZmljYXRvckJvZHkoXG5cdFx0RXJyb3JNb2RpZmljYXRvcixcblx0XHRDcmVhdGlvbkhhbmRsZXIsXG5cdFx0U3ltYm9sQ29uc3RydWN0b3JOYW1lXG5cdCk7XG5cblx0Y29uc3QgcmVzdWx0ID0gbW9kaWZpY2F0b3JUeXBlKCk7XG5cdGNvbnN0IGNvbnN0cnVjdG9yUmVzdWx0ID0gcmVzdWx0IGFzIE1uZW1vbmljYUNvbnN0cnVjdG9yO1xuXHRyZXR1cm4gY29uc3RydWN0b3JSZXN1bHQ7XG5cbn07XG5cblxuLy8gYSBudWxsIG9yIHByaW1pdGl2ZS13cmFwcGVyIHBhcmVudCByZWZsZWN0cyBpdHMgcHJpbWl0aXZlIHRvIHRoZSBpbnN0YW5jZVxuLy8gYnVpbHQgb3ZlciBpdDogY29lcmNpb24gKCtpbnN0LCBgJHtpbnN0fWApIHRocm91Z2ggU3ltYm9sLnRvUHJpbWl0aXZlLCBhbmRcbi8vIGV4cGxpY2l0IGluc3QudmFsdWVPZigpIC8gaW5zdC50b1N0cmluZygpIOKAlCB0aGUgd3JhcHBlcidzIG93biBwcm90b3R5cGVcbi8vIG1ldGhvZHMgdGhyb3cgd2hlbiBgdGhpc2AgaXMgdGhlIGluc3RhbmNlIHJhdGhlciB0aGFuIHRoZSB3cmFwcGVyLCBhbmQgYW5cbi8vIE9iamVjdC5jcmVhdGUobnVsbCkgcGFyZW50IGhhcyBub25lIGF0IGFsbFxuY29uc3QgcmVmbGVjdFByaW1pdGl2ZSA9ICh0aGlzQXJnOiBvYmplY3QsIHByaW1pdGl2ZTogbnVsbCB8IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4pID0+IHtcblx0b2RwKFxuXHRcdHRoaXNBcmcsXG5cdFx0U3ltYm9sLnRvUHJpbWl0aXZlLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9ICgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gcHJpbWl0aXZlO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblx0b2RwKFxuXHRcdHRoaXNBcmcsXG5cdFx0J3ZhbHVlT2YnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9ICgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gcHJpbWl0aXZlO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcblx0b2RwKFxuXHRcdHRoaXNBcmcsXG5cdFx0J3RvU3RyaW5nJyxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgc3RyaW5nUmVzdWx0ID0gU3RyaW5nKCBwcmltaXRpdmUgKTtcblx0XHRcdFx0XHRyZXR1cm4gc3RyaW5nUmVzdWx0O1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcbn07XG5cbmNvbnN0IHJlZmxlY3RQcmltaXRpdmVXcmFwcGVycyA9IChfdGhpc0FyZzogdW5rbm93bikgPT4ge1xuXHRsZXQgdGhpc0FyZzogb2JqZWN0ID0gX3RoaXNBcmcgYXMgb2JqZWN0O1xuXG5cdGlmIChfdGhpc0FyZyA9PT0gbnVsbCkge1xuXHRcdHRoaXNBcmcgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRcdHJlZmxlY3RQcmltaXRpdmUoXG5cdFx0XHR0aGlzQXJnLFxuXHRcdFx0bnVsbFxuXHRcdCk7XG5cdH1cblxuXHRpZiAoXG5cdFx0X3RoaXNBcmcgaW5zdGFuY2VvZiBOdW1iZXIgfHxcblx0XHRfdGhpc0FyZyBpbnN0YW5jZW9mIEJvb2xlYW4gfHxcblx0XHRfdGhpc0FyZyBpbnN0YW5jZW9mIFN0cmluZ1xuXHQpIHtcblx0XHQvLyByZWFkIG9uY2UsIGJlZm9yZSB0aGUgd3JhcHBlciBnZXRzIGl0cyBvd24gdmFsdWVPZiBiZWxvdztcblx0XHQvLyBhIHdyYXBwZXIncyBwcmltaXRpdmUgbmV2ZXIgY2hhbmdlc1xuXHRcdGNvbnN0IHByaW1pdGl2ZSA9IChfdGhpc0FyZyBhcyBTdHJpbmcgfCBOdW1iZXIgfCBCb29sZWFuKS52YWx1ZU9mKCk7XG5cdFx0cmVmbGVjdFByaW1pdGl2ZShcblx0XHRcdHRoaXNBcmcsXG5cdFx0XHRwcmltaXRpdmVcblx0XHQpO1xuXHR9XG5cblx0cmV0dXJuIHRoaXNBcmc7XG59O1xuXG5jb25zdCBUeXBlc1V0aWxzID0ge1xuXHRpc0NsYXNzLFxuXHRjaGVja1Byb3RvLFxuXHRnZXRUeXBlQ2hlY2tlcixcblx0Z2V0Q2FjaGVkVHlwZUNoZWNrZXIsXG5cdGdldFR5cGVTcGxpdFBhdGgsXG5cdGdldEV4aXN0ZW50QXN5bmNTdGFjayxcblx0Y2hlY2tUeXBlTmFtZSxcblx0ZmluZFN1YlR5cGVGcm9tUGFyZW50LFxuXHRtYWtlRXJyb3JNb2RpZmljYXRvclR5cGUsXG5cdHJlZmxlY3RQcmltaXRpdmVXcmFwcGVycyxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFR5cGVzVXRpbHM7XG4iXX0=