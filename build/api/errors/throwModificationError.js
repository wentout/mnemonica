'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwModificationError = void 0;
const constants_1 = require("../../constants");
const { odp, MNEMONICA, } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const { BASE_MNEMONICA_ERROR } = errors_1.ErrorsTypes;
const _1 = require("./");
const utils_1 = require("../utils");
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
                    return extract(_parent);
                };
            }
        });
        odp(erroredInstance, 'parse', {
            get() {
                return () => {
                    return parse(erroredInstance);
                };
            }
        });
    }
    throw erroredInstance;
};
exports.throwModificationError = throwModificationError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyb3dNb2RpZmljYXRpb25FcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvZXJyb3JzL3Rocm93TW9kaWZpY2F0aW9uRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFJYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxTQUFTLEdBQ1QsR0FBRyxxQkFBUyxDQUFDO0FBR2QscURBQXVEO0FBQ3ZELE1BQU0sRUFDTCxvQkFBb0IsRUFDcEIsR0FBRyxvQkFBVyxDQUFDO0FBRWhCLHlCQUE0QztBQUU1QyxvQ0FBa0M7QUFDbEMsTUFBTSxFQUNMLHdCQUF3QixFQUN4QixHQUFHLGVBQVUsQ0FBQztBQUVmLHVDQUFvQztBQUNwQyxNQUFNLEVBQ0wsS0FBSyxFQUNMLE1BQU0sRUFDTixPQUFPLEVBQ1AsR0FBRyxhQUFLLENBQUM7QUFFVixzRUFBdUU7QUFFaEUsTUFBTSxzQkFBc0IsR0FBRyxVQUF5QyxLQUFxQjtJQUluRyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsTUFBTSxFQUNMLFFBQVEsRUFDUixJQUFJLEVBQUUsRUFDTCxLQUFLLEVBQUUsU0FBUyxFQUNoQixFQUNELElBQUksRUFDSixHQUFHLElBRUgsQ0FBQztJQU1GLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxlQUFlLElBQUksS0FBSyxDQUFDO0lBRXZELElBQUssS0FBSyxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQUcsQ0FBQztRQUUxQyxLQUFLLENBQUMsT0FBbUIsQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFDLGVBQWUsQ0FBRSxDQUFDO1FBQ3hELEtBQUssQ0FBQyxPQUFtQixDQUFDLElBQUksQ0FBRSxLQUFLLENBQUUsQ0FBQztRQUV6QyxNQUFNLEtBQUssQ0FBQztJQUViLENBQUM7SUFFRCxHQUFHLENBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFO1FBQzlCLEdBQUc7WUFDRixPQUFPLGVBQWUsQ0FBQztRQUN4QixDQUFDO1FBQ0QsVUFBVSxFQUFHLElBQUk7S0FDakIsQ0FBRSxDQUFDO0lBRUosTUFBTSxPQUFPLEdBQVksQ0FBRSxlQUFlLENBQUUsQ0FBQztJQUU3QyxHQUFHLENBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtRQUN0QixHQUFHO1lBQ0YsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUNELFVBQVUsRUFBRyxJQUFJO0tBQ2pCLENBQUUsQ0FBQztJQUNKLE1BQU0sT0FBTyxHQUFZLEVBQUUsQ0FBQztJQUM1QixHQUFHLENBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtRQUN0QixHQUFHO1lBQ0YsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUNELFVBQVUsRUFBRyxJQUFJO0tBQ2pCLENBQUUsQ0FBQztJQUVKLElBQUksQ0FBQyxlQUFlLEdBQUcsd0JBQXdCLENBQUUsUUFBUSxDQUFFLENBQUM7SUFFNUQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUEsNkNBQXVCLEVBQUUsSUFBSSxDQUFFLENBQUM7SUFHM0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUV2RCxJQUFJLFVBQVUsR0FBa0IsT0FBTyxDQUFDLGNBQWMsQ0FBRSxlQUFlLENBQUUsQ0FBQztJQUMxRSxJQUFJLG1CQUFtQixHQUFHLEtBQUssQ0FBQztJQUNoQyxPQUFRLFVBQVUsRUFBRyxDQUFDO1FBQ3JCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUUsVUFBVSxDQUFFLENBQUM7UUFDekQsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDMUIsTUFBTTtRQUNQLENBQUM7UUFJRCxJQUNDLFdBQVcsS0FBSyxJQUFJO1lBQ3BCLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUM7WUFDdEQsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUN6QyxDQUFDO1lBQ0YsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQzNCLE1BQU07UUFDUCxDQUFDO1FBQ0QsVUFBVSxHQUFHLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBR0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBRSxVQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBU3BFLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztJQUUzQixJQUFLLEtBQUssWUFBWSxvQkFBb0IsRUFBRyxDQUFDO1FBRTdDLEtBQUssQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFDLEtBQWUsQ0FBRSxDQUFDO0lBRXJDLENBQUM7U0FBTSxDQUFDO1FBRVAsTUFBTSxLQUFLLEdBQUcsdUJBQXVCLFFBQVEsZUFBZSxDQUFDO1FBRTdELFdBQVEsQ0FBQyxJQUFJLENBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsOEJBQXNCLENBQUUsQ0FBQztRQUVwRSxLQUFLLENBQUMsSUFBSSxDQUFFLEdBQUksZUFBdUMsQ0FBQyxLQUFLLENBQUUsQ0FBQztRQUVoRSxNQUFNLFVBQVUsR0FBSSxLQUFLLENBQUMsS0FBaUIsQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFFLENBQUM7UUFFMUQsS0FBSyxDQUFDLElBQUksQ0FBRSxrQ0FBa0MsQ0FBRSxDQUFDO1FBRWpELFVBQVUsQ0FBQyxPQUFPLENBQUUsQ0FBRSxJQUFZLEVBQUcsRUFBRTtZQUN0QyxJQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBRSxJQUFJLENBQUUsRUFBRyxDQUFDO2dCQUMvQixLQUFLLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBRSxDQUFDO1lBQ3BCLENBQUM7UUFDRixDQUFDLENBQUUsQ0FBQztRQUVKLEtBQUssQ0FBQyxJQUFJLENBQUUsNENBQTRDLENBQUUsQ0FBQztRQUMzRCxLQUFLLENBQUMsSUFBSSxDQUFFLEdBQUcsU0FBUyxDQUFFLENBQUM7SUFFNUIsQ0FBQztJQUVELE1BQU0sb0JBQW9CLEdBQUcsSUFBQSxlQUFZLEVBQUUsS0FBSyxDQUFFLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBRSxDQUFDO0lBT2hFLEdBQUcsQ0FBRSxlQUFlLEVBQUUsT0FBTyxFQUFFO1FBQzlCLEdBQUc7WUFDRixPQUFPLG9CQUFvQixDQUFDO1FBQzdCLENBQUM7S0FDRCxDQUFFLENBQUM7SUFFSixJQUFJLENBQUMsaUJBQWlCLEdBQUcsZUFBZSxDQUFDO0lBRXpDLElBQUksTUFBTSxFQUFFLENBQUM7UUFDWixJQUFJLG1CQUFtQixFQUFFLENBQUM7WUFHekIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sRUFDTCxJQUFJLEVBQ0osVUFBVSxHQUNWLEdBQUcsT0FBTyxDQUFDO1lBQ1osSUFBSyxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFLEVBQUcsQ0FBQztnQkFDbEQsT0FBTztZQUNSLENBQUM7UUFDRixDQUFDO1FBTUQsR0FBRyxDQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUU7WUFDN0IsR0FBRztnQkFDRixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7U0FDRCxDQUFFLENBQUM7UUFFSixHQUFHLENBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRTtZQUN0QyxHQUFHO2dCQUNGLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztTQUNELENBQUUsQ0FBQztRQUVKLEdBQUcsQ0FBRSxlQUFlLEVBQUUsVUFBVSxFQUFFO1lBQ2pDLEdBQUc7Z0JBQ0YsT0FBTyxlQUFlLENBQUM7WUFDeEIsQ0FBQztTQUNELENBQUUsQ0FBQztRQUVKLEdBQUcsQ0FBRSxlQUFlLEVBQUUsU0FBUyxFQUFFO1lBQ2hDLEdBQUc7Z0JBQ0YsT0FBTyxHQUFHLEVBQUU7b0JBQ1gsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUN4QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekIsQ0FBQyxDQUFDO1lBQ0gsQ0FBQztTQUNELENBQUUsQ0FBQztRQUVKLEdBQUcsQ0FBRSxlQUFlLEVBQUUsT0FBTyxFQUFFO1lBQzlCLEdBQUc7Z0JBQ0YsT0FBTyxHQUFHLEVBQUU7b0JBQ1gsT0FBTyxLQUFLLENBQUUsZUFBZSxDQUFFLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQztZQUNILENBQUM7U0FDRCxDQUFFLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxlQUFlLENBQUM7QUFFdkIsQ0FBQyxDQUFDO0FBaE1XLFFBQUEsc0JBQXNCLDBCQWdNakMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0eXBlIHsgTW5lbW9uaWNhRXJyb3IsIEluc3RhbmNlQ3JlYXRvckNvbnRleHQgfSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5jb25zdCB7XG5cdG9kcCxcblx0TU5FTU9OSUNBLFxufSA9IGNvbnN0YW50cztcblxuXG5pbXBvcnQgeyBFcnJvcnNUeXBlcyB9IGZyb20gJy4uLy4uL2Rlc2NyaXB0b3JzL2Vycm9ycyc7XG5jb25zdCB7XG5cdEJBU0VfTU5FTU9OSUNBX0VSUk9SXG59ID0gRXJyb3JzVHlwZXM7XG5cbmltcG9ydCB7IGNsZWFudXBTdGFjaywgZ2V0U3RhY2sgfSBmcm9tICcuLyc7XG5cbmltcG9ydCBUeXBlc1V0aWxzIGZyb20gJy4uL3V0aWxzJztcbmNvbnN0IHtcblx0bWFrZUVycm9yTW9kaWZpY2F0b3JUeXBlXG59ID0gVHlwZXNVdGlscztcblxuaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi8uLi91dGlscyc7XG5jb25zdCB7XG5cdHBhcnNlLFxuXHRwYXJlbnQsXG5cdGV4dHJhY3Rcbn0gPSB1dGlscztcblxuaW1wb3J0IHsgbWFrZUluc3RhbmNlTW9kaWZpY2F0b3IgfSBmcm9tICcuLi90eXBlcy9JbnN0YW5jZU1vZGlmaWNhdG9yJztcblxuZXhwb3J0IGNvbnN0IHRocm93TW9kaWZpY2F0aW9uRXJyb3IgPSBmdW5jdGlvbiAoIHRoaXM6IEluc3RhbmNlQ3JlYXRvckNvbnRleHQsIGVycm9yOiBNbmVtb25pY2FFcnJvciApIHtcblxuXHQvLyBJbnN0YW5jZUNyZWF0b3Jcblx0IFxuXHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRjb25zdCB7XG5cdFx0VHlwZU5hbWUsXG5cdFx0dHlwZToge1xuXHRcdFx0c3RhY2s6IHR5cGVTdGFja1xuXHRcdH0sXG5cdFx0YXJnc1xuXHR9ID0gc2VsZiBhcyBJbnN0YW5jZUNyZWF0b3JDb250ZXh0ICYge1xuXHRcdHR5cGU6IHsgc3RhY2s6IHN0cmluZ1tdIH1cblx0fTtcblxuXHQvLyBpZiAoIGVycm9yWyBTeW1ib2xDb25zdHJ1Y3Rvck5hbWUgXSApIHtcblx0Ly8gXHRkZWJ1Z2dlcjtcblx0Ly8gfVxuXG5cdGNvbnN0IGV4Y2VwdGlvblJlYXNvbiA9IGVycm9yLmV4Y2VwdGlvblJlYXNvbiB8fCBlcnJvcjtcblxuXHRpZiAoIGVycm9yLmV4Y2VwdGlvblJlYXNvbiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0KGVycm9yLnJlYXNvbnMgYXMgRXJyb3JbXSkucHVzaCggZXJyb3IuZXhjZXB0aW9uUmVhc29uICk7XG5cdFx0KGVycm9yLnN1cnBsdXMgYXMgRXJyb3JbXSkucHVzaCggZXJyb3IgKTtcblxuXHRcdHRocm93IGVycm9yO1xuXG5cdH1cblxuXHRvZHAoIGVycm9yLCAnZXhjZXB0aW9uUmVhc29uJywge1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gZXhjZXB0aW9uUmVhc29uO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fSApO1xuXG5cdGNvbnN0IHJlYXNvbnM6IEVycm9yW10gPSBbIGV4Y2VwdGlvblJlYXNvbiBdO1xuXG5cdG9kcCggZXJyb3IsICdyZWFzb25zJywge1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gcmVhc29ucztcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH0gKTtcblx0Y29uc3Qgc3VycGx1czogRXJyb3JbXSA9IFtdO1xuXHRvZHAoIGVycm9yLCAnc3VycGx1cycsIHtcblx0XHRnZXQgKCkge1xuXHRcdFx0cmV0dXJuIHN1cnBsdXM7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9ICk7XG5cblx0c2VsZi5Nb2RpZmljYXRvclR5cGUgPSBtYWtlRXJyb3JNb2RpZmljYXRvclR5cGUoIFR5cGVOYW1lICk7XG5cblx0c2VsZi5JbnN0YW5jZU1vZGlmaWNhdG9yID0gbWFrZUluc3RhbmNlTW9kaWZpY2F0b3IoIHNlbGYgKTtcblxuXHQvLyBsZXQgZXJyb3JlZEluc3RhbmNlID0gbmV3IHNlbGYuSW5zdGFuY2VNb2RpZmljYXRvcigpO1xuXHRjb25zdCBlcnJvcmVkSW5zdGFuY2UgPSBuZXcgc2VsZi5JbnN0YW5jZU1vZGlmaWNhdG9yKCk7XG5cblx0bGV0IGVycm9yUHJvdG86IG9iamVjdCB8IG51bGwgPSBSZWZsZWN0LmdldFByb3RvdHlwZU9mKCBlcnJvcmVkSW5zdGFuY2UgKTtcblx0bGV0IGlzTW5lbW9uaWNhSW5zdGFuY2UgPSBmYWxzZTtcblx0d2hpbGUgKCBlcnJvclByb3RvICkge1xuXHRcdGNvbnN0IHRlc3RUb1Byb3RvID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZiggZXJyb3JQcm90byApO1xuXHRcdGlmICh0ZXN0VG9Qcm90byA9PT0gbnVsbCkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdC8vIGlmICh0ZXN0VG9Qcm90byA9PT0gT2JqZWN0LnByb3RvdHlwZSkge1xuXHRcdC8vIFx0YnJlYWs7XG5cdFx0Ly8gfVxuXHRcdGlmIChcblx0XHRcdHRlc3RUb1Byb3RvICE9PSBudWxsICYmXG5cdFx0XHRPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbCh0ZXN0VG9Qcm90bywgJ2NvbnN0cnVjdG9yJykgJiZcblx0XHRcdHRlc3RUb1Byb3RvLmNvbnN0cnVjdG9yLm5hbWUgPT09IE1ORU1PTklDQVxuXHRcdCkge1xuXHRcdFx0aXNNbmVtb25pY2FJbnN0YW5jZSA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0ZXJyb3JQcm90byA9IHRlc3RUb1Byb3RvO1xuXHR9XG5cblx0Ly8gUmVmbGVjdC5zZXRQcm90b3R5cGVPZiggZXJyb3JQcm90bywgZXJyb3IpO1xuXHRjb25zdCByZXN1bHQgPSBSZWZsZWN0LnNldFByb3RvdHlwZU9mKCBlcnJvclByb3RvIGFzIG9iamVjdCwgZXJyb3IpO1xuXHQvLyBsZXQgcmVzdWx0ID0gUmVmbGVjdC5zZXRQcm90b3R5cGVPZiggZXJyb3JQcm90bywgZXJyb3IpO1xuXHQvLyBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuXHQvLyBcdE9iamVjdC5zZXRQcm90b3R5cGVPZihlcnJvclByb3RvLCBlcnJvcik7XG5cdC8vIFx0Ly8gdW5yZWFjaGFibGVcblx0Ly8gXHRyZXN1bHQgPSB0cnVlO1xuXHQvLyB9XG5cdC8vIGNvbnNvbGUubG9nKHJlc3VsdCk7XG5cblx0Y29uc3Qgc3RhY2s6IHN0cmluZ1tdID0gW107XG5cblx0aWYgKCBlcnJvciBpbnN0YW5jZW9mIEJBU0VfTU5FTU9OSUNBX0VSUk9SICkge1xuXG5cdFx0c3RhY2sucHVzaCggZXJyb3Iuc3RhY2sgYXMgc3RyaW5nICk7XG5cblx0fSBlbHNlIHtcblxuXHRcdGNvbnN0IHRpdGxlID0gYFxcbjwtLSBjcmVhdGlvbiBvZiBbICR7VHlwZU5hbWV9IF0gdHJhY2VkIC0tPmA7XG5cblx0XHRnZXRTdGFjay5jYWxsKCBlcnJvcmVkSW5zdGFuY2UsIHRpdGxlLCBbXSwgdGhyb3dNb2RpZmljYXRpb25FcnJvciApO1xuXG5cdFx0c3RhY2sucHVzaCggLi4uKGVycm9yZWRJbnN0YW5jZSBhcyB7IHN0YWNrOiBzdHJpbmdbXSB9KS5zdGFjayApO1xuXG5cdFx0Y29uc3QgZXJyb3JTdGFjayA9IChlcnJvci5zdGFjayBhcyBzdHJpbmcgKS5zcGxpdCggJ1xcbicgKTtcblxuXHRcdHN0YWNrLnB1c2goICc8LS0gd2l0aCB0aGUgZm9sbG93aW5nIGVycm9yIC0tPicgKTtcblxuXHRcdGVycm9yU3RhY2suZm9yRWFjaCggKCBsaW5lOiBzdHJpbmcgKSA9PiB7XG5cdFx0XHRpZiAoICFzdGFjay5pbmNsdWRlcyggbGluZSApICkge1xuXHRcdFx0XHRzdGFjay5wdXNoKCBsaW5lICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0c3RhY2sucHVzaCggJ1xcbjwtLSBvZiBjb25zdHJ1Y3RvciBkZWZpbml0aW9ucyBzdGFjayAtLT4nICk7XG5cdFx0c3RhY2sucHVzaCggLi4udHlwZVN0YWNrICk7XG5cblx0fVxuXG5cdGNvbnN0IGVycm9yZWRJbnN0YW5jZVN0YWNrID0gY2xlYW51cFN0YWNrKCBzdGFjayApLmpvaW4oICdcXG4nICk7XG5cblx0Ly8gc3RhcnRpbmcgZnJvbSBOb2RlLmpzIHYyMiB3ZSBzaG91bGQgZGVmaW5lIHRoaXMgcHJvcGVydHkgdGhyb3VnaCBvZHBcblx0Ly8gdGhhdCB3YXMgdW5uZWNlc3NhcnkgZm9yIHYyMCwgdGhvdWdoIHNlZW1zIG5ldyB2OCBvcHRpbWl6ZWQgY29tcGlsZXJcblx0Ly8gaXMgZ2F0aGVyaW5nIHZhbHVlIGZyb20gZGVlcCBjaGFpbiBhbmQgd2hpbGUgY29tcGFyaW5nIGl0IHdpdGggXG5cdC8vIGFzc2lnbm1lbnQgb3BlcmF0b3IsIHRoZW4gaXQgd2lsbCBub3QgY3JlYXRlIHRoaXMgcHJvcGVydHkgXG5cdC8vIHNvIHdlIG5lZWQgZGlyZWN0IHByb3BlcnR5IGRlY2xhcmF0aW9uIGhlcmUgLi4uXG5cdG9kcCggZXJyb3JlZEluc3RhbmNlLCAnc3RhY2snLCB7XG5cdFx0Z2V0ICgpIHtcblx0XHRcdHJldHVybiBlcnJvcmVkSW5zdGFuY2VTdGFjaztcblx0XHR9XG5cdH0gKTtcblxuXHRzZWxmLmluaGVyaXRlZEluc3RhbmNlID0gZXJyb3JlZEluc3RhbmNlO1xuXG5cdGlmIChyZXN1bHQpIHtcblx0XHRpZiAoaXNNbmVtb25pY2FJbnN0YW5jZSkge1xuXG5cdFx0XHQvLyBpZiBob29rcyBoYWQgc29tZSBpbnRlcmNlcHRpb246IHN0YXJ0XG5cdFx0XHRjb25zdCByZXN1bHRzID0gc2VsZi5pbnZva2VQb3N0SG9va3MoKTtcblx0XHRcdGNvbnN0IHtcblx0XHRcdFx0dHlwZSxcblx0XHRcdFx0Y29sbGVjdGlvbixcblx0XHRcdH0gPSByZXN1bHRzO1xuXHRcdFx0aWYgKCB0eXBlLmhhcyggdHJ1ZSApIHx8IGNvbGxlY3Rpb24uaGFzKCB0cnVlICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyB9XG5cblx0XHQvLyBpZiBob29rcyBoYWQgc29tZSBpbnRlcmNlcHRpb246IHN0b3BcblxuXHRcdG9kcCggZXJyb3JlZEluc3RhbmNlLCAnYXJncycsIHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBhcmdzO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdG9kcCggZXJyb3JlZEluc3RhbmNlLCAnb3JpZ2luYWxFcnJvcicsIHtcblx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRvZHAoIGVycm9yZWRJbnN0YW5jZSwgJ2luc3RhbmNlJywge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yZWRJbnN0YW5jZTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRvZHAoIGVycm9yZWRJbnN0YW5jZSwgJ2V4dHJhY3QnLCB7XG5cdFx0XHRnZXQgKCkge1xuXHRcdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IF9wYXJlbnQgPSBwYXJlbnQoZXJyb3JlZEluc3RhbmNlKTtcblx0XHRcdFx0XHRyZXR1cm4gZXh0cmFjdChfcGFyZW50KTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRvZHAoIGVycm9yZWRJbnN0YW5jZSwgJ3BhcnNlJywge1xuXHRcdFx0Z2V0ICgpIHtcblx0XHRcdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2UoIGVycm9yZWRJbnN0YW5jZSApO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXG5cdHRocm93IGVycm9yZWRJbnN0YW5jZTtcblxufTtcbiJdfQ==