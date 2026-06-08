'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwModificationError = void 0;
const constants_1 = require("../../constants");
const { odp, MNEMONICA, } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const { BASE_MNEMONICA_ERROR } = errors_1.ErrorsTypes;
const _1 = require("./");
const utils_1 = __importDefault(require("../utils"));
const { makeErrorModificatorType } = utils_1.default;
const utils_2 = require("../../utils");
const { parse, parent, extract } = utils_2.utils;
const InstanceModificator_1 = require("../types/InstanceModificator");
const throwModificationError = function (error) {
    const self = this;
    const { TypeName, type: { stack: typeStack }, args } = self;
    const exceptionReason = error.exceptionReason || error;
    if (error.exceptionReason !== undefined) {
        error.reasons.push(error.exceptionReason);
        error.surplus.push(error);
        throw error;
    }
    odp(error, 'exceptionReason', {
        get() {
            return exceptionReason;
        },
        enumerable: true
    });
    const reasons = [exceptionReason];
    odp(error, 'reasons', {
        get() {
            return reasons;
        },
        enumerable: true
    });
    const surplus = [];
    odp(error, 'surplus', {
        get() {
            return surplus;
        },
        enumerable: true
    });
    self.ModificatorType = makeErrorModificatorType(TypeName);
    self.InstanceModificator = (0, InstanceModificator_1.makeInstanceModificator)(self);
    const erroredInstance = new self.InstanceModificator();
    let errorProto = Reflect.getPrototypeOf(erroredInstance);
    let isMnemonicaInstance = false;
    while (errorProto) {
        const testToProto = Reflect.getPrototypeOf(errorProto);
        if (testToProto === null) {
            break;
        }
        if (testToProto !== null &&
            Object.hasOwnProperty.call(testToProto, 'constructor') &&
            testToProto.constructor.name === MNEMONICA) {
            isMnemonicaInstance = true;
            break;
        }
        errorProto = testToProto;
    }
    const result = Reflect.setPrototypeOf(errorProto, error);
    const stack = [];
    if (error instanceof BASE_MNEMONICA_ERROR) {
        stack.push(error.stack);
    }
    else {
        const title = `\n<-- creation of [ ${TypeName} ] traced -->`;
        _1.getStack.call(erroredInstance, title, [], exports.throwModificationError);
        stack.push(...erroredInstance.stack);
        const errorStack = error.stack.split('\n');
        stack.push('<-- with the following error -->');
        errorStack.forEach((line) => {
            if (!stack.includes(line)) {
                stack.push(line);
            }
        });
        stack.push('\n<-- of constructor definitions stack -->');
        stack.push(...typeStack);
    }
    const erroredInstanceStack = (0, _1.cleanupStack)(stack).join('\n');
    odp(erroredInstance, 'stack', {
        get() {
            return erroredInstanceStack;
        }
    });
    self.inheritedInstance = erroredInstance;
    if (result) {
        if (isMnemonicaInstance) {
            const results = self.invokePostHooks();
            const { type, collection, } = results;
            if (type.has(true) || collection.has(true)) {
                return;
            }
        }
        odp(erroredInstance, 'args', {
            get() {
                return args;
            }
        });
        odp(erroredInstance, 'originalError', {
            get() {
                return error;
            }
        });
        odp(erroredInstance, 'instance', {
            get() {
                return erroredInstance;
            }
        });
        odp(erroredInstance, 'extract', {
            get() {
                return () => {
                    const _parent = parent(erroredInstance);
                    const extractResult = extract(_parent);
                    return extractResult;
                };
            }
        });
        odp(erroredInstance, 'parse', {
            get() {
                return () => {
                    const parseResult = parse(erroredInstance);
                    return parseResult;
                };
            }
        });
    }
    throw erroredInstance;
};
exports.throwModificationError = throwModificationError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyb3dNb2RpZmljYXRpb25FcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvZXJyb3JzL3Rocm93TW9kaWZpY2F0aW9uRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7QUFNYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxTQUFTLEdBQ1QsR0FBRyxxQkFBUyxDQUFDO0FBR2QscURBQXVEO0FBQ3ZELE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxHQUFHLG9CQUFXLENBQUM7QUFFN0MseUJBRVk7QUFFWixxREFBa0M7QUFDbEMsTUFBTSxFQUFFLHdCQUF3QixFQUFFLEdBQUcsZUFBVSxDQUFDO0FBRWhELHVDQUFvQztBQUNwQyxNQUFNLEVBQ0wsS0FBSyxFQUNMLE1BQU0sRUFDTixPQUFPLEVBQ1AsR0FBRyxhQUFLLENBQUM7QUFFVixzRUFBdUU7QUFFaEUsTUFBTSxzQkFBc0IsR0FBRyxVQUF5QyxLQUFxQjtJQUluRyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsTUFBTSxFQUNMLFFBQVEsRUFDUixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQzFCLElBQUksRUFDSixHQUFHLElBRUgsQ0FBQztJQU1GLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxlQUFlLElBQUksS0FBSyxDQUFDO0lBRXZELElBQUssS0FBSyxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQUcsQ0FBQztRQUUxQyxLQUFLLENBQUMsT0FBbUIsQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFDLGVBQWUsQ0FBRSxDQUFDO1FBQ3hELEtBQUssQ0FBQyxPQUFtQixDQUFDLElBQUksQ0FBRSxLQUFLLENBQUUsQ0FBQztRQUV6QyxNQUFNLEtBQUssQ0FBQztJQUViLENBQUM7SUFFRCxHQUFHLENBQ0YsS0FBSyxFQUNMLGlCQUFpQixFQUNqQjtRQUNDLEdBQUc7WUFDRixPQUFP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O1FBRUYsR0FBRyxDQUNGLGVBQWUsRUFDZixPQUFPLEVBQ1A7WUFDQyxHQUFHO2dCQUNGLE9BQU8sR0FBRyxFQUFFO29CQUNYLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBRSxlQUFlLENBQUUsQ0FBQztvQkFDN0MsT0FBTyxXQUFXLENBQUM7Z0JBQ3BCLENBQUMsQ0FBQztZQUNILENBQUM7U0FDRCxDQUNELENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxlQUFlLENBQUM7QUFFdkIsQ0FBQyxDQUFDO0FBL09XLFFBQUEsc0JBQXNCLDBCQStPakMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0eXBlIHtcblx0TW5lbW9uaWNhRXJyb3IsIEluc3RhbmNlQ3JlYXRvckNvbnRleHQgXG59IGZyb20gJy4uLy4uL3R5cGVzJztcblxuaW1wb3J0IHsgY29uc3RhbnRzIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcbmNvbnN0IHtcblx0b2RwLFxuXHRNTkVNT05JQ0EsXG59ID0gY29uc3RhbnRzO1xuXG5cbmltcG9ydCB7IEVycm9yc1R5cGVzIH0gZnJvbSAnLi4vLi4vZGVzY3JpcHRvcnMvZXJyb3JzJztcbmNvbnN0IHsgQkFTRV9NTkVNT05JQ0FfRVJST1IgfSA9IEVycm9yc1R5cGVzO1xuXG5pbXBvcnQge1xuXHRjbGVhbnVwU3RhY2ssIGdldFN0YWNrIFxufSBmcm9tICcuLyc7XG5cbmltcG9ydCBUeXBlc1V0aWxzIGZyb20gJy4uL3V0aWxzJztcbmNvbnN0IHsgbWFrZUVycm9yTW9kaWZpY2F0b3JUeXBlIH0gPSBUeXBlc1V0aWxzO1xuXG5pbXBvcnQgeyB1dGlscyB9IGZyb20gJy4uLy4uL3V0aWxzJztcbmNvbnN0IHtcblx0cGFyc2UsXG5cdHBhcmVudCxcblx0ZXh0cmFjdFxufSA9IHV0aWxzO1xuXG5pbXBvcnQgeyBtYWtlSW5zdGFuY2VNb2RpZmljYXRvciB9IGZyb20gJy4uL3R5cGVzL0luc3RhbmNlTW9kaWZpY2F0b3InO1xuXG5leHBvcnQgY29uc3QgdGhyb3dNb2RpZmljYXRpb25FcnJvciA9IGZ1bmN0aW9uICggdGhpczogSW5zdGFuY2VDcmVhdG9yQ29udGV4dCwgZXJyb3I6IE1uZW1vbmljYUVycm9yICkge1xuXG5cdC8vIEluc3RhbmNlQ3JlYXRvclxuXHQgXG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdGNvbnN0IHtcblx0XHRUeXBlTmFtZSxcblx0XHR0eXBlOiB7IHN0YWNrOiB0eXBlU3RhY2sgfSxcblx0XHRhcmdzXG5cdH0gPSBzZWxmIGFzIEluc3RhbmNlQ3JlYXRvckNvbnRleHQgJiB7XG5cdFx0dHlwZTogeyBzdGFjazogc3RyaW5nW10gfVxuXHR9O1xuXG5cdC8vIGlmICggZXJyb3JbIFN5bWJvbENvbnN0cnVjdG9yTmFtZSBdICkge1xuXHQvLyBcdGRlYnVnZ2VyO1xuXHQvLyB9XG5cblx0Y29uc3QgZXhjZXB0aW9uUmVhc29uID0gZXJyb3IuZXhjZXB0aW9uUmVhc29uIHx8IGVycm9yO1xuXG5cdGlmICggZXJyb3IuZXhjZXB0aW9uUmVhc29uICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHQoZXJyb3IucmVhc29ucyBhcyBFcnJvcltdKS5wdXNoKCBlcnJvci5leGNlcHRpb25SZWFzb24gKTtcblx0XHQoZXJyb3Iuc3VycGx1cyBhcyBFcnJvcltdKS5wdXNoKCBlcnJvciApO1xuXG5cdFx0dGhyb3cgZXJyb3I7XG5cblx0fVxuXG5cdG9kcChcblx0XHRlcnJvcixcblx0XHQnZXhjZXB0aW9uUmVhc29uJyxcblx0XHR7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gZXhjZXB0aW9uUmVhc29uO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdFx0fSBcblx0KTtcblxuXHRjb25zdCByZWFzb25zOiBFcnJvcltdID0gWyBleGNlcHRpb25SZWFzb24gXTtcblxuXHRvZHAoXG5cdFx0ZXJyb3IsXG5cdFx0J3JlYXNvbnMnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiByZWFzb25zO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdFx0fSBcblx0KTtcblx0Y29uc3Qgc3VycGx1czogRXJyb3JbXSA9IFtdO1xuXHRvZHAoXG5cdFx0ZXJyb3IsXG5cdFx0J3N1cnBsdXMnLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBzdXJwbHVzO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdFx0fSBcblx0KTtcblxuXHRzZWxmLk1vZGlmaWNhdG9yVHlwZSA9IG1ha2VFcnJvck1vZGlmaWNhdG9yVHlwZSggVHlwZU5hbWUgKTtcblxuXHRzZWxmLkluc3RhbmNlTW9kaWZpY2F0b3IgPSBtYWtlSW5zdGFuY2VNb2RpZmljYXRvciggc2VsZiApO1xuXG5cdC8vIGxldCBlcnJvcmVkSW5zdGFuY2UgPSBuZXcgc2VsZi5JbnN0YW5jZU1vZGlmaWNhdG9yKCk7XG5cdGNvbnN0IGVycm9yZWRJbnN0YW5jZSA9IG5ldyBzZWxmLkluc3RhbmNlTW9kaWZpY2F0b3IoKTtcblxuXHRsZXQgZXJyb3JQcm90bzogb2JqZWN0IHwgbnVsbCA9IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YoIGVycm9yZWRJbnN0YW5jZSApO1xuXHRsZXQgaXNNbmVtb25pY2FJbnN0YW5jZSA9IGZhbHNlO1xuXHR3aGlsZSAoIGVycm9yUHJvdG8gKSB7XG5cdFx0Y29uc3QgdGVzdFRvUHJvdG8gPSBSZWZsZWN0LmdldFByb3RvdHlwZU9mKCBlcnJvclByb3RvICk7XG5cdFx0aWYgKHRlc3RUb1Byb3RvID09PSBudWxsKSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0Ly8gaWYgKHRlc3RUb1Byb3RvID09PSBPYmplY3QucHJvdG90eXBlKSB7XG5cdFx0Ly8gXHRicmVhaztcblx0XHQvLyB9XG5cdFx0aWYgKFxuXHRcdFx0dGVzdFRvUHJvdG8gIT09IG51bGwgJiZcblx0XHRcdE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuXHRcdFx0XHR0ZXN0VG9Qcm90byxcblx0XHRcdFx0J2NvbnN0cnVjdG9yJ1xuXHRcdFx0KSAmJlxuXHRcdFx0dGVzdFRvUHJvdG8uY29uc3RydWN0b3IubmFtZSA9PT0gTU5FTU9OSUNBXG5cdFx0KSB7XG5cdFx0XHRpc01uZW1vbmljYUluc3RhbmNlID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRlcnJvclByb3RvID0gdGVzdFRvUHJvdG87XG5cdH1cblxuXHQvLyBSZWZsZWN0LnNldFByb3RvdHlwZU9mKCBlcnJvclByb3RvLCBlcnJvcik7XG5cdGNvbnN0IHJlc3VsdCA9IFJlZmxlY3Quc2V0UHJvdG90eXBlT2YoXG4gZXJyb3JQcm90byBhcyBvYmplY3QsXG4gZXJyb3Jcblx0KTtcblx0Ly8gbGV0IHJlc3VsdCA9IFJlZmxlY3Quc2V0UHJvdG90eXBlT2YoIGVycm9yUHJvdG8sIGVycm9yKTtcblx0Ly8gaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcblx0Ly8gXHRPYmplY3Quc2V0UHJvdG90eXBlT2YoZXJyb3JQcm90bywgZXJyb3IpO1xuXHQvLyBcdC8vIHVucmVhY2hhYmxlXG5cdC8vIFx0cmVzdWx0ID0gdHJ1ZTtcblx0Ly8gfVxuXHQvLyBjb25zb2xlLmxvZyhyZXN1bHQpO1xuXG5cdGNvbnN0IHN0YWNrOiBzdHJpbmdbXSA9IFtdO1xuXG5cdGlmICggZXJyb3IgaW5zdGFuY2VvZiBCQVNFX01ORU1PTklDQV9FUlJPUiApIHtcblxuXHRcdHN0YWNrLnB1c2goIGVycm9yLnN0YWNrIGFzIHN0cmluZyApO1xuXG5cdH0gZWxzZSB7XG5cblx0XHRjb25zdCB0aXRsZSA9IGBcXG48LS0gY3JlYXRpb24gb2YgWyAke1R5cGVOYW1lfSBdIHRyYWNlZCAtLT5gO1xuXG5cdFx0Z2V0U3RhY2suY2FsbChcblx0XHRcdGVycm9yZWRJbnN0YW5jZSxcblx0XHRcdHRpdGxlLFxuXHRcdFx0W10sXG5cdFx0XHR0aHJvd01vZGlmaWNhdGlvbkVycm9yIFxuXHRcdCk7XG5cblx0XHRzdGFjay5wdXNoKCAuLi4oZXJyb3JlZEluc3RhbmNlIGFzIHsgc3RhY2s6IHN0cmluZ1tdIH0pLnN0YWNrICk7XG5cblx0XHRjb25zdCBlcnJvclN0YWNrID0gKGVycm9yLnN0YWNrIGFzIHN0cmluZyApLnNwbGl0KCAnXFxuJyApO1xuXG5cdFx0c3RhY2sucHVzaCggJzwtLSB3aXRoIHRoZSBmb2xsb3dpbmcgZXJyb3IgLS0+JyApO1xuXG5cdFx0ZXJyb3JTdGFjay5mb3JFYWNoKCAoIGxpbmU6IHN0cmluZyApID0+IHtcblx0XHRcdGlmICggIXN0YWNrLmluY2x1ZGVzKCBsaW5lICkgKSB7XG5cdFx0XHRcdHN0YWNrLnB1c2goIGxpbmUgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRzdGFjay5wdXNoKCAnXFxuPC0tIG9mIGNvbnN0cnVjdG9yIGRlZmluaXRpb25zIHN0YWNrIC0tPicgKTtcblx0XHRzdGFjay5wdXNoKCAuLi50eXBlU3RhY2sgKTtcblxuXHR9XG5cblx0Y29uc3QgZXJyb3JlZEluc3RhbmNlU3RhY2sgPSBjbGVhbnVwU3RhY2soIHN0YWNrICkuam9pbiggJ1xcbicgKTtcblxuXHQvLyBzdGFydGluZyBmcm9tIE5vZGUuanMgdjIyIHdlIHNob3VsZCBkZWZpbmUgdGhpcyBwcm9wZXJ0eSB0aHJvdWdoIG9kcFxuXHQvLyB0aGF0IHdhcyB1bm5lY2Vzc2FyeSBmb3IgdjIwLCB0aG91Z2ggc2VlbXMgbmV3IHY4IG9wdGltaXplZCBjb21waWxlclxuXHQvLyBpcyBnYXRoZXJpbmcgdmFsdWUgZnJvbSBkZWVwIGNoYWluIGFuZCB3aGlsZSBjb21wYXJpbmcgaXQgd2l0aCBcblx0Ly8gYXNzaWdubWVudCBvcGVyYXRvciwgdGhlbiBpdCB3aWxsIG5vdCBjcmVhdGUgdGhpcyBwcm9wZXJ0eSBcblx0Ly8gc28gd2UgbmVlZCBkaXJlY3QgcHJvcGVydHkgZGVjbGFyYXRpb24gaGVyZSAuLi5cblx0b2RwKFxuXHRcdGVycm9yZWRJbnN0YW5jZSxcblx0XHQnc3RhY2snLFxuXHRcdHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcmVkSW5zdGFuY2VTdGFjaztcblx0XHRcdH1cblx0XHR9IFxuXHQpO1xuXG5cdHNlbGYuaW5oZXJpdGVkSW5zdGFuY2UgPSBlcnJvcmVkSW5zdGFuY2U7XG5cblx0aWYgKHJlc3VsdCkge1xuXHRcdGlmIChpc01uZW1vbmljYUluc3RhbmNlKSB7XG5cblx0XHRcdC8vIGlmIGhvb2tzIGhhZCBzb21lIGludGVyY2VwdGlvbjogc3RhcnRcblx0XHRcdGNvbnN0IHJlc3VsdHMgPSBzZWxmLmludm9rZVBvc3RIb29rcygpO1xuXHRcdFx0Y29uc3Qge1xuXHRcdFx0XHR0eXBlLFxuXHRcdFx0XHRjb2xsZWN0aW9uLFxuXHRcdFx0fSA9IHJlc3VsdHM7XG5cdFx0XHRpZiAoIHR5cGUuaGFzKCB0cnVlICkgfHwgY29sbGVjdGlvbi5oYXMoIHRydWUgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIH1cblxuXHRcdC8vIGlmIGhvb2tzIGhhZCBzb21lIGludGVyY2VwdGlvbjogc3RvcFxuXG5cdFx0b2RwKFxuXHRcdFx0ZXJyb3JlZEluc3RhbmNlLFxuXHRcdFx0J2FyZ3MnLFxuXHRcdFx0e1xuXHRcdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRcdHJldHVybiBhcmdzO1xuXHRcdFx0XHR9XG5cdFx0XHR9IFxuXHRcdCk7XG5cblx0XHRvZHAoXG5cdFx0XHRlcnJvcmVkSW5zdGFuY2UsXG5cdFx0XHQnb3JpZ2luYWxFcnJvcicsXG5cdFx0XHR7XG5cdFx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9IFxuXHRcdCk7XG5cblx0XHRvZHAoXG5cdFx0XHRlcnJvcmVkSW5zdGFuY2UsXG5cdFx0XHQnaW5zdGFuY2UnLFxuXHRcdFx0e1xuXHRcdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcmVkSW5zdGFuY2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gXG5cdFx0KTtcblxuXHRcdG9kcChcblx0XHRcdGVycm9yZWRJbnN0YW5jZSxcblx0XHRcdCdleHRyYWN0Jyxcblx0XHRcdHtcblx0XHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgX3BhcmVudCA9IHBhcmVudChlcnJvcmVkSW5zdGFuY2UpO1xuXHRcdFx0XHRcdFx0Y29uc3QgZXh0cmFjdFJlc3VsdCA9IGV4dHJhY3QoX3BhcmVudCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXh0cmFjdFJlc3VsdDtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9IFxuXHRcdCk7XG5cblx0XHRvZHAoXG5cdFx0XHRlcnJvcmVkSW5zdGFuY2UsXG5cdFx0XHQncGFyc2UnLFxuXHRcdFx0e1xuXHRcdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBwYXJzZVJlc3VsdCA9IHBhcnNlKCBlcnJvcmVkSW5zdGFuY2UgKTtcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVJlc3VsdDtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9IFxuXHRcdCk7XG5cdH1cblxuXHR0aHJvdyBlcnJvcmVkSW5zdGFuY2U7XG5cbn07XG4iXX0=