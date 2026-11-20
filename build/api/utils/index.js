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
    return result;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3V0aWxzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWIsK0NBQTRDO0FBQzVDLHFEQUF1RDtBQUN2RCx5RUFBc0U7QUFFdEUsTUFBTSxFQUNMLEdBQUcsRUFDSCxxQkFBcUIsRUFDckIsU0FBUyxFQUNULFNBQVMsR0FDVCxHQUFHLHFCQUFTLENBQUM7QUFFZCxNQUFNLEVBQUUscUJBQXFCLEdBQUcsR0FBRyxvQkFBVyxDQUFDO0FBRS9DLDBDQUV3QjtBQU94QixnSEFBd0c7QUFJakcsTUFBTSxlQUFlLEdBQUcsVUFFOUIsa0JBQTJCO0lBRTNCLE9BQU8sa0JBQWtCLENBQUM7QUFDM0IsQ0FBQyxDQUFDO0FBTFcsUUFBQSxlQUFlLG1CQUsxQjtBQUVGLE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBYyxFQUFFLEVBQUU7SUFDckMsSUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDaEMsTUFBTSxJQUFJLHFCQUFxQixDQUFDLGtDQUFrQyxDQUFDLENBQUM7SUFDckUsQ0FBQztBQUNGLENBQUMsQ0FBQztBQUVGLE1BQU0sY0FBYyxHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO0lBQzNDLE1BQU0sTUFBTSxHQUFZLENBQUMsUUFBdUQsRUFBRSxFQUFFO1FBRW5GLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN2RCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFHRCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzNCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFD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WUFDRixNQUFNLE1BQU0sR0FBRyxHQUFHLEVBQUU7Z0JBQ25CLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBRSxTQUFTLENBQUUsQ0FBQztnQkFDekMsT0FBTyxZQUFZLENBQUM7WUFDckIsQ0FBQyxDQUFDO1lBQ0YsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO0tBQ0QsQ0FDRCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLFFBQWlCLEVBQUUsRUFBRTtJQUN0RCxJQUFJLE9BQU8sR0FBVyxRQUFrQixDQUFDO0lBRXpDLElBQUksUUFBUSxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLGdCQUFnQixDQUNmLE9BQU8sRUFDUCxJQUFJLENBQ0osQ0FBQztJQUNILENBQUM7SUFFRCxJQUNDLFFBQVEsWUFBWSxNQUFNO1FBQzFCLFFBQVEsWUFBWSxPQUFPO1FBQzNCLFFBQVEsWUFBWSxNQUFNLEVBQ3pCLENBQUM7UUFHRixNQUFNLFNBQVMsR0FBSSxRQUFzQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BFLGdCQUFnQixDQUNmLE9BQU8sRUFDUCxTQUFTLENBQ1QsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDLENBQUM7QUFFRixNQUFNLFVBQVUsR0FBRztJQUNsQixPQUFPLEVBQVAsMkNBQU87SUFDUCxVQUFVO0lBQ1YsY0FBYztJQUNkLG9CQUFvQjtJQUNwQixnQkFBZ0I7SUFDaEIscUJBQXFCO0lBQ3JCLGFBQWE7SUFDYixxQkFBcUI7SUFDckIsd0JBQXdCO0lBQ3hCLHdCQUF3QjtDQUN4QixDQUFDO0FBRUYsa0JBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgRXJyb3JzVHlwZXMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycy9lcnJvcnMnO1xuaW1wb3J0IHsgY29sbGVjdENvbnN0cnVjdG9ycyB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbGxlY3RDb25zdHJ1Y3RvcnMnO1xuXG5jb25zdCB7XG5cdG9kcCxcblx0U3ltYm9sQ29uc3RydWN0b3JOYW1lLFxuXHRNTkVNT05JQ0EsXG5cdE1ORU1PU1lORSxcbn0gPSBjb25zdGFudHM7XG5cbmNvbnN0IHsgV1JPTkdfVFlQRV9ERUZJTklUSU9OLCB9ID0gRXJyb3JzVHlwZXM7XG5cbmltcG9ydCB7XG5cdF9nZXRQcm9wcywgUHJvcHNcbn0gZnJvbSAnLi4vdHlwZXMvUHJvcHMnO1xuaW1wb3J0IHR5cGUge1xuXHRJbnN0YW5jZUNvbnN0cnVjdG9yLFxuXHRNbmVtb25pY2FDb25zdHJ1Y3Rvcixcblx0VHlwZUNsYXNzXG59IGZyb20gJy4uLy4uL3R5cGVzJztcblxuaW1wb3J0IGNvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keSwgeyBpc0NsYXNzIH0gZnJvbSAnLi4vdHlwZXMvY29tcGlsZU5ld01vZGlmaWNhdG9yRnVuY3Rpb25Cb2R5JztcblxuLy8gQ3JlYXRpb25IYW5kbGVyIC0gaGFuZGxlcyBjb25zdHJ1Y3RvciByZXR1cm4gdmFsdWVzXG4vLyBNb3ZlZCB0byBhcGkvdHlwZXMvaW5kZXgudHMgYXMgcGVyIHJlZmFjdG9yaW5nIHBsYW5cbmV4cG9ydCBjb25zdCBDcmVhdGlvbkhhbmRsZXIgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IG9iamVjdCAmIHsgY29uc3RydWN0b3I6IEluc3RhbmNlQ29uc3RydWN0b3IgfSxcblx0Y29uc3RydWN0aW9uQW5zd2VyOiB1bmtub3duXG4pIHtcblx0cmV0dXJuIGNvbnN0cnVjdGlvbkFuc3dlcjtcbn07XG5cbmNvbnN0IGNoZWNrUHJvdG8gPSAocHJvdG86IHVua25vd24pID0+IHtcblx0aWYgKCEocHJvdG8gaW5zdGFuY2VvZiBPYmplY3QpKSB7XG5cdFx0dGhyb3cgbmV3IFdST05HX1RZUEVfREVGSU5JVElPTignZXhwZWN0IHByb3RvdHlwZSB0byBiZSBhbiBvYmplY3QnKTtcblx0fVxufTtcblxuY29uc3QgZ2V0VHlwZUNoZWNrZXIgPSAoVHlwZU5hbWU6IHN0cmluZykgPT4ge1xuXHRjb25zdCBzZWVrZXI6IHVua25vd24gPSAoaW5zdGFuY2U6IG9iamVjdCAmIHsgW1N5bWJvbENvbnN0cnVjdG9yTmFtZV0/OiBzdHJpbmcgfSkgPT4ge1xuXG5cdFx0aWYgKHR5cGVvZiBpbnN0YW5jZSAhPT0gJ29iamVjdCcgfHwgaW5zdGFuY2UgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblxuXHRcdGlmICghaW5zdGFuY2UuY29uc3RydWN0b3IpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBwcm90b3R5cGUgPSBSZWZsZWN0LmdldFByb3RvdHlwZU9mKGluc3RhbmNlKTtcblx0XHRpZiAocHJvdG90eXBlID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKHByb3RvdHlwZS5jb25zdHJ1Y3RvciAmJiBwcm90b3R5cGUuY29uc3RydWN0b3IubmFtZSA9PT0gJ1Byb21pc2UnKSB7XG5cdFx0XHQvLyBpZiAoIGluc3RhbmNlIGluc3RhbmNlb2YgUHJvbWlzZSApIHtcblxuXHRcdFx0Y29uc3QgY2hlY2tSZXN1bHQgPSBpbnN0YW5jZVsgU3ltYm9sQ29uc3RydWN0b3JOYW1lIF0gPT09IFR5cGVOYW1lO1xuXHRcdFx0cmV0dXJuIGNoZWNrUmVzdWx0O1xuXHRcdH1cblxuXHRcdGNvbnN0IGNvbnN0cnVjdG9ycyA9IGNvbGxlY3RDb25zdHJ1Y3RvcnMoaW5zdGFuY2UpIGFzIFJlY29yZDxzdHJpbmcsIG5ldyAoKSA9PiB1bmtub3duPjtcblxuXHRcdGNvbnN0IGNvbnN0cnVjdG9yUmVzdWx0ID0gY29uc3RydWN0b3JzWyBUeXBlTmFtZSBdIHx8IGZhbHNlO1xuXHRcdHJldHVybiBjb25zdHJ1Y3RvclJlc3VsdDtcblxuXHR9O1xuXHRyZXR1cm4gc2Vla2VyO1xufTtcblxuY29uc3QgdHlwZUNoZWNrZXJDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpO1xuXG4vLyBnZXRUeXBlQ2hlY2tlciBidWlsZHMgYSBmcmVzaCBjbG9zdXJlIHBlciBjYWxsLCBhbmQgaW5zdGFuY2VvZlxuLy8gY2hlY2tzIHJ1biBwZXIgYWNjZXNzIOKAlCBzbyB0aGUgY2xvc3VyZXMgYXJlIGNhY2hlZCBwZXIgVHlwZU5hbWVcbmNvbnN0IGdldENhY2hlZFR5cGVDaGVja2VyID0gKFR5cGVOYW1lOiBzdHJpbmcpID0+IHtcblx0bGV0IGNoZWNrZXIgPSB0eXBlQ2hlY2tlckNhY2hlLmdldChUeXBlTmFtZSk7XG5cdGlmICghY2hlY2tlcikge1xuXHRcdGNoZWNrZXIgPSBnZXRUeXBlQ2hlY2tlcihUeXBlTmFtZSk7XG5cdFx0dHlwZUNoZWNrZXJDYWNoZS5zZXQoVHlwZU5hbWUsIGNoZWNrZXIpO1xuXHR9XG5cdHJldHVybiBjaGVja2VyO1xufTtcblxuY29uc3QgZ2V0VHlwZVNwbGl0UGF0aCA9IChwYXRoOiBzdHJpbmcpID0+IHtcblx0Y29uc3Qgc3BsaXQgPSBwYXRoXG5cdFx0Ly8gYmVhdXRpZnVsbCBuYW1lc1xuXHRcdC5yZXBsYWNlKFxuXHRcdFx0L1xcbnxcXHR8IC9nLFxuXHRcdFx0Jydcblx0XHQpXG5cdFx0LnJlcGxhY2UoXG5cdFx0XHQvXFxbKFxcdyspXFxdL2csXG5cdFx0XHQnLiQxJ1xuXHRcdClcblx0XHQucmVwbGFjZShcblx0XHRcdC9eXFwuLyxcblx0XHRcdCcnXG5cdFx0KVxuXHRcdC5zcGxpdCgvXFwufFxcL3w6Lyk7XG5cdHJldHVybiBzcGxpdDtcbn07XG5cbmV4cG9ydCB0eXBlIGFzeW5jU3RhY2sgPSB7XG5cdF9fc3RhY2tfXz86IHN0cmluZ1xuXHRfX3R5cGVfXzoge1xuXHRcdGlzU3ViVHlwZTogYm9vbGVhblxuXHR9XG5cdHBhcmVudDogKCkgPT4gYXN5bmNTdGFja1xufVxuXG5jb25zdCBnZXRFeGlzdGVudEFzeW5jU3RhY2sgPSAoZXhpc3RlbnRJbnN0YW5jZTogYXN5bmNTdGFjayk6IHVua25vd24gPT4ge1xuXG5cdGNvbnN0IHN0YWNrID0gW107XG5cdGxldCBwcm90byA9IGV4aXN0ZW50SW5zdGFuY2U7XG5cblx0d2hpbGUgKHByb3RvKSB7XG5cblx0XHRjb25zdCBwcm9wcyA9IF9nZXRQcm9wcyhwcm90bykgYXMgUHJvcHM7XG5cblx0XHRpZiAoIXByb3BzLl9fc3RhY2tfXykge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHN0YWNrID0gcHJvcHNcblx0XHRcdC5fX3N0YWNrX19cblx0XHRcdC5zcGxpdCgnXFxuJylcblx0XHRcdC5yZWR1Y2UoXG5cdFx0XHRcdChhcnI6IHN0cmluZ1tdLCBsaW5lOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRpZiAobGluZS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdGFyci5wdXNoKGxpbmUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gYXJyO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRbXVxuXHRcdFx0KTtcblxuXHRcdHByb3RvID0gcHJvdG8ucGFyZW50KCk7XG5cblx0XHRjb25zdCBwcm90b1Byb3BzID0gX2dldFByb3BzKHByb3RvKSBhcyBQcm9wcztcblxuXHRcdGlmIChwcm90byAmJiBwcm90b1Byb3BzICYmIHByb3RvUHJvcHMuX190eXBlX18pIHtcblxuXHRcdFx0aWYgKHByb3RvUHJvcHMuX190eXBlX18uaXNTdWJUeXBlKSB7XG5cdFx0XHRcdHN0YWNrLnB1c2goLi4ucHN0YWNrLnNsaWNlKFxuXHRcdFx0XHRcdDAsXG5cdFx0XHRcdFx0MVxuXHRcdFx0XHQpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN0YWNrLnB1c2goLi4ucHN0YWNrKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdGFjay5wdXNoKC4uLnBzdGFjayk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc3RhY2s7XG5cbn07XG5cbmNvbnN0IGZvcmJpZGRlbk5hbWVzID0gWyBNTkVNT05JQ0EsIE1ORU1PU1lORSBdO1xuXG5jb25zdCBjaGVja1R5cGVOYW1lID0gKG5hbWU6IHN0cmluZykgPT4ge1xuXG5cdGlmICghbmFtZS5sZW5ndGgpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdUeXBlTmFtZSBtdXN0IG5vdCBiZSBlbXB0eScpO1xuXHR9XG5cblx0aWYgKG5hbWVbIDAgXSAhPT0gbmFtZVsgMCBdLnRvVXBwZXJDYXNlKCkpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdUeXBlTmFtZSBzaG91bGQgc3RhcnQgd2l0aCBVcHBlcmNhc2UgTGV0dGVyJyk7XG5cdH1cblxuXHRpZiAoZm9yYmlkZGVuTmFtZXMuaW5jbHVkZXMobmFtZSkpIHtcblx0XHR0aHJvdyBuZXcgV1JPTkdfVFlQRV9ERUZJTklUSU9OKCdUeXBlTmFtZSBvZiByZXNlcnZlZCBrZXl3b3JkJyk7XG5cdH1cblxufTtcblxuZXhwb3J0IHR5cGUgcGFyZW50U3ViID0ge1xuXHRUeXBlTmFtZTogc3RyaW5nO1xuXHRfX3R5cGVfXzoge1xuXHRcdHN1YnR5cGVzOiBNYXA8c3RyaW5nLCBwYXJlbnRTdWI+XG5cdH1cblx0X19wYXJlbnRfXzogcGFyZW50U3ViXG59XG5cbmNvbnN0IGZpbmRTdWJUeXBlRnJvbVBhcmVudCA9IChpbnN0YW5jZTogcGFyZW50U3ViIHwgb2JqZWN0IHwgdW5kZWZpbmVkLCBzdWJUeXBlOiBzdHJpbmcpOiBUeXBlQ2xhc3MgfCBudWxsID0+IHtcblx0bGV0IHN1YnR5cGU6IFR5cGVDbGFzcyB8IG51bGwgPSBudWxsO1xuXG5cdGlmICghaW5zdGFuY2UpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IHByb3BzID0gX2dldFByb3BzKGluc3RhbmNlKSBhcyBQcm9wcztcblxuXHRpZiAocHJvcHMpIHtcblx0XHRjb25zdCBfc3VidHlwZSA9IHByb3BzLl9fdHlwZV9fLnN1YnR5cGVzLmdldChzdWJUeXBlKTtcblx0XHRpZiAoX3N1YnR5cGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0c3VidHlwZSA9IF9zdWJ0eXBlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdWJ0eXBlID0gZmluZFN1YlR5cGVGcm9tUGFyZW50KFxuXHRcdFx0XHRwcm9wcy5fX3BhcmVudF9fLFxuXHRcdFx0XHRzdWJUeXBlXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzdWJ0eXBlO1xufTtcblxuLy8gaXNDbGFzcyBsaXZlcyBiZXNpZGUgdGhlIGNvbnN0cnVjdC1oYW5kbGVyIHNoYXBlcyBpdCBuYXJyb3dzLCBpblxuLy8gY29tcGlsZU5ld01vZGlmaWNhdG9yRnVuY3Rpb25Cb2R5LnRzICh0aGUgY29tcGlsZXIgcGlja3MgdGhlIGNsYXNzXG4vLyBicmFuY2ggd2l0aCBpdCk7IHJlLWV4cG9ydGVkIGhlcmUgYXMgcGFydCBvZiBUeXBlc1V0aWxzXG5cbmNvbnN0IG1ha2VFcnJvck1vZGlmaWNhdG9yVHlwZSA9IChcblx0VHlwZU5hbWU6IHN0cmluZyxcblx0RXJyb3JNb2RpZmljYXRvciA9IGZ1bmN0aW9uICgpIHsgfVxuKTogTW5lbW9uaWNhQ29uc3RydWN0b3IgPT4ge1xuXG5cdGNvbnN0IG1vZGlmaWNhdG9yQm9keSA9IGNvbXBpbGVOZXdNb2RpZmljYXRvckZ1bmN0aW9uQm9keShUeXBlTmFtZSk7XG5cblx0Ly8gQ3JlYXRpb25IYW5kbGVyIGlzIG5vdyBkZWZpbmVkIGxvY2FsbHkgaW4gYXBpL3R5cGVzL2luZGV4LnRzXG5cdGNvbnN0IG1vZGlmaWNhdG9yVHlwZSA9IG1vZGlmaWNhdG9yQm9keShcblx0XHRFcnJvck1vZGlmaWNhdG9yLFxuXHRcdENyZWF0aW9uSGFuZGxlcixcblx0XHRTeW1ib2xDb25zdHJ1Y3Rvck5hbWVcblx0KTtcblxuXHRjb25zdCByZXN1bHQgPSBtb2RpZmljYXRvclR5cGUoKTtcblx0cmV0dXJuIHJlc3VsdDtcblxufTtcblxuXG4vLyBhIG51bGwgb3IgcHJpbWl0aXZlLXdyYXBwZXIgcGFyZW50IHJlZmxlY3RzIGl0cyBwcmltaXRpdmUgdG8gdGhlIGluc3RhbmNlXG4vLyBidWlsdCBvdmVyIGl0OiBjb2VyY2lvbiAoK2luc3QsIGAke2luc3R9YCkgdGhyb3VnaCBTeW1ib2wudG9QcmltaXRpdmUsIGFuZFxuLy8gZXhwbGljaXQgaW5zdC52YWx1ZU9mKCkgLyBpbnN0LnRvU3RyaW5nKCkg4oCUIHRoZSB3cmFwcGVyJ3Mgb3duIHByb3RvdHlwZVxuLy8gbWV0aG9kcyB0aHJvdyB3aGVuIGB0aGlzYCBpcyB0aGUgaW5zdGFuY2UgcmF0aGVyIHRoYW4gdGhlIHdyYXBwZXIsIGFuZCBhblxuLy8gT2JqZWN0LmNyZWF0ZShudWxsKSBwYXJlbnQgaGFzIG5vbmUgYXQgYWxsXG5jb25zdCByZWZsZWN0UHJpbWl0aXZlID0gKHRoaXNBcmc6IG9iamVjdCwgcHJpbWl0aXZlOiBudWxsIHwgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbikgPT4ge1xuXHRvZHAoXG5cdFx0dGhpc0FyZyxcblx0XHRTeW1ib2wudG9QcmltaXRpdmUsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gKCkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBwcmltaXRpdmU7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXHRvZHAoXG5cdFx0dGhpc0FyZyxcblx0XHQndmFsdWVPZicsXG5cdFx0e1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gKCkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBwcmltaXRpdmU7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXHRvZHAoXG5cdFx0dGhpc0FyZyxcblx0XHQndG9TdHJpbmcnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9ICgpID0+IHtcblx0XHRcdFx0XHRjb25zdCBzdHJpbmdSZXN1bHQgPSBTdHJpbmcoIHByaW1pdGl2ZSApO1xuXHRcdFx0XHRcdHJldHVybiBzdHJpbmdSZXN1bHQ7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xufTtcblxuY29uc3QgcmVmbGVjdFByaW1pdGl2ZVdyYXBwZXJzID0gKF90aGlzQXJnOiB1bmtub3duKSA9PiB7XG5cdGxldCB0aGlzQXJnOiBvYmplY3QgPSBfdGhpc0FyZyBhcyBvYmplY3Q7XG5cblx0aWYgKF90aGlzQXJnID09PSBudWxsKSB7XG5cdFx0dGhpc0FyZyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0cmVmbGVjdFByaW1pdGl2ZShcblx0XHRcdHRoaXNBcmcsXG5cdFx0XHRudWxsXG5cdFx0KTtcblx0fVxuXG5cdGlmIChcblx0XHRfdGhpc0FyZyBpbnN0YW5jZW9mIE51bWJlciB8fFxuXHRcdF90aGlzQXJnIGluc3RhbmNlb2YgQm9vbGVhbiB8fFxuXHRcdF90aGlzQXJnIGluc3RhbmNlb2YgU3RyaW5nXG5cdCkge1xuXHRcdC8vIHJlYWQgb25jZSwgYmVmb3JlIHRoZSB3cmFwcGVyIGdldHMgaXRzIG93biB2YWx1ZU9mIGJlbG93O1xuXHRcdC8vIGEgd3JhcHBlcidzIHByaW1pdGl2ZSBuZXZlciBjaGFuZ2VzXG5cdFx0Y29uc3QgcHJpbWl0aXZlID0gKF90aGlzQXJnIGFzIFN0cmluZyB8IE51bWJlciB8IEJvb2xlYW4pLnZhbHVlT2YoKTtcblx0XHRyZWZsZWN0UHJpbWl0aXZlKFxuXHRcdFx0dGhpc0FyZyxcblx0XHRcdHByaW1pdGl2ZVxuXHRcdCk7XG5cdH1cblxuXHRyZXR1cm4gdGhpc0FyZztcbn07XG5cbmNvbnN0IFR5cGVzVXRpbHMgPSB7XG5cdGlzQ2xhc3MsXG5cdGNoZWNrUHJvdG8sXG5cdGdldFR5cGVDaGVja2VyLFxuXHRnZXRDYWNoZWRUeXBlQ2hlY2tlcixcblx0Z2V0VHlwZVNwbGl0UGF0aCxcblx0Z2V0RXhpc3RlbnRBc3luY1N0YWNrLFxuXHRjaGVja1R5cGVOYW1lLFxuXHRmaW5kU3ViVHlwZUZyb21QYXJlbnQsXG5cdG1ha2VFcnJvck1vZGlmaWNhdG9yVHlwZSxcblx0cmVmbGVjdFByaW1pdGl2ZVdyYXBwZXJzLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgVHlwZXNVdGlscztcbiJdfQ==