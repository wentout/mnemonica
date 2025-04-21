'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwModificationError = void 0;
const constants_1 = require("../../constants");
const { odp, SymbolReplaceUranus, } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const { BASE_MNEMONICA_ERROR } = errors_1.ErrorsTypes;
const _1 = require("./");
const utils_1 = require("../utils");
const { makeFakeModificatorType } = utils_1.default;
const utils_2 = require("../../utils");
const { parse } = utils_2.utils;
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
    self.ModificatorType = makeFakeModificatorType(TypeName);
    self.InstanceModificator = (0, InstanceModificator_1.makeInstanceModificator)(self);
    const erroredInstance = new self.InstanceModificator();
    erroredInstance[SymbolReplaceUranus](error);
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
    const results = self.invokePostHooks();
    const { type, collection, } = results;
    if (type.has(true) || collection.has(true)) {
        return;
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
                return erroredInstance.__self__.extract();
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
    throw erroredInstance;
};
exports.throwModificationError = throwModificationError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyb3dNb2RpZmljYXRpb25FcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvZXJyb3JzL3Rocm93TW9kaWZpY2F0aW9uRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLEdBQUcsRUFDSCxtQkFBbUIsR0FFbkIsR0FBRyxxQkFBUyxDQUFDO0FBRWQscURBQXVEO0FBQ3ZELE1BQU0sRUFDTCxvQkFBb0IsRUFDcEIsR0FBRyxvQkFBVyxDQUFDO0FBRWhCLHlCQUE0QztBQUU1QyxvQ0FBa0M7QUFDbEMsTUFBTSxFQUNMLHVCQUF1QixFQUN2QixHQUFHLGVBQVUsQ0FBQztBQUVmLHVDQUFvQztBQUNwQyxNQUFNLEVBQ0wsS0FBSyxFQUNMLEdBQUcsYUFBSyxDQUFDO0FBRVYsc0VBQXVFO0FBRWhFLE1BQU0sc0JBQXNCLEdBQUcsVUFBc0IsS0FBVTtJQUlyRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsTUFBTSxFQUNMLFFBQVEsRUFDUixJQUFJLEVBQUUsRUFDTCxLQUFLLEVBQUUsU0FBUyxFQUNoQixFQUNELElBQUksRUFDSixHQUFHLElBQUksQ0FBQztJQU1ULE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxlQUFlLElBQUksS0FBSyxDQUFDO0lBRXZELElBQUssS0FBSyxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQUcsQ0FBQztRQUUzQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUMsZUFBZSxDQUFFLENBQUM7UUFDNUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLENBQUM7UUFFNUIsTUFBTSxLQUFLLENBQUM7SUFFYixDQUFDO0lBRUQsR0FBRyxDQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRTtRQUM5QixHQUFHO1lBQ0YsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FB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T0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0tBQ0QsQ0FBRSxDQUFDO0lBRUosR0FBRyxDQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUU7UUFDakMsR0FBRztZQUNGLE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7S0FDRCxDQUFFLENBQUM7SUFFSixHQUFHLENBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRTtRQUNoQyxHQUFHO1lBQ0YsT0FBTyxHQUFHLEVBQUU7Z0JBQ1gsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzNDLENBQUMsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFFLENBQUM7SUFFSixHQUFHLENBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRTtRQUM5QixHQUFHO1lBQ0YsT0FBTyxHQUFHLEVBQUU7Z0JBQ1gsT0FBTyxLQUFLLENBQUUsZUFBZSxDQUFFLENBQUM7WUFDakMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQztLQUNELENBQUUsQ0FBQztJQUVKLE1BQU0sZUFBZSxDQUFDO0FBRXZCLENBQUMsQ0FBQztBQXpKVyxRQUFBLHNCQUFzQiwwQkF5SmpDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuY29uc3Qge1xuXHRvZHAsXG5cdFN5bWJvbFJlcGxhY2VVcmFudXMsXG5cdC8vIFN5bWJvbENvbnN0cnVjdG9yTmFtZVxufSA9IGNvbnN0YW50cztcblxuaW1wb3J0IHsgRXJyb3JzVHlwZXMgfSBmcm9tICcuLi8uLi9kZXNjcmlwdG9ycy9lcnJvcnMnO1xuY29uc3Qge1xuXHRCQVNFX01ORU1PTklDQV9FUlJPUlxufSA9IEVycm9yc1R5cGVzO1xuXG5pbXBvcnQgeyBjbGVhbnVwU3RhY2ssIGdldFN0YWNrIH0gZnJvbSAnLi8nO1xuXG5pbXBvcnQgVHlwZXNVdGlscyBmcm9tICcuLi91dGlscyc7XG5jb25zdCB7XG5cdG1ha2VGYWtlTW9kaWZpY2F0b3JUeXBlXG59ID0gVHlwZXNVdGlscztcblxuaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi8uLi91dGlscyc7XG5jb25zdCB7XG5cdHBhcnNlXG59ID0gdXRpbHM7XG5cbmltcG9ydCB7IG1ha2VJbnN0YW5jZU1vZGlmaWNhdG9yIH0gZnJvbSAnLi4vdHlwZXMvSW5zdGFuY2VNb2RpZmljYXRvcic7XG5cbmV4cG9ydCBjb25zdCB0aHJvd01vZGlmaWNhdGlvbkVycm9yID0gZnVuY3Rpb24gKCB0aGlzOiBhbnksIGVycm9yOiBhbnkgKSB7XG5cblx0Ly8gSW5zdGFuY2VDcmVhdG9yXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuXHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRjb25zdCB7XG5cdFx0VHlwZU5hbWUsXG5cdFx0dHlwZToge1xuXHRcdFx0c3RhY2s6IHR5cGVTdGFja1xuXHRcdH0sXG5cdFx0YXJnc1xuXHR9ID0gc2VsZjtcblxuXHQvLyBpZiAoIGVycm9yWyBTeW1ib2xDb25zdHJ1Y3Rvck5hbWUgXSApIHtcblx0Ly8gXHRkZWJ1Z2dlcjtcblx0Ly8gfVxuXG5cdGNvbnN0IGV4Y2VwdGlvblJlYXNvbiA9IGVycm9yLmV4Y2VwdGlvblJlYXNvbiB8fCBlcnJvcjtcblxuXHRpZiAoIGVycm9yLmV4Y2VwdGlvblJlYXNvbiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0ZXJyb3IucmVhc29ucy5wdXNoKCBlcnJvci5leGNlcHRpb25SZWFzb24gKTtcblx0XHRlcnJvci5zdXJwbHVzLnB1c2goIGVycm9yICk7XG5cblx0XHR0aHJvdyBlcnJvcjtcblxuXHR9XG5cblx0b2RwKCBlcnJvciwgJ2V4Y2VwdGlvblJlYXNvbicsIHtcblx0XHRnZXQgKCkge1xuXHRcdFx0cmV0dXJuIGV4Y2VwdGlvblJlYXNvbjtcblx0XHR9LFxuXHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdH0gKTtcblxuXHRjb25zdCByZWFzb25zOiBhbnlbIHR5cGVvZiBleGNlcHRpb25SZWFzb24gXSA9IFsgZXhjZXB0aW9uUmVhc29uIF07XG5cblx0b2RwKCBlcnJvciwgJ3JlYXNvbnMnLCB7XG5cdFx0Z2V0ICgpIHtcblx0XHRcdHJldHVybiByZWFzb25zO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0fSApO1xuXHRjb25zdCBzdXJwbHVzOiBhbnlbIHR5cGVvZiBleGNlcHRpb25SZWFzb24gXSA9IFtdO1xuXHRvZHAoIGVycm9yLCAnc3VycGx1cycsIHtcblx0XHRnZXQgKCkge1xuXHRcdFx0cmV0dXJuIHN1cnBsdXM7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHR9ICk7XG5cblx0c2VsZi5Nb2RpZmljYXRvclR5cGUgPSBtYWtlRmFrZU1vZGlmaWNhdG9yVHlwZSggVHlwZU5hbWUgKTtcblxuXHRzZWxmLkluc3RhbmNlTW9kaWZpY2F0b3IgPSBtYWtlSW5zdGFuY2VNb2RpZmljYXRvciggc2VsZiApO1xuXG5cdC8vIENvbnN0cnVjdG9yIEludm9jYXRpb24gSXRzZWxmXG5cdGNvbnN0IGVycm9yZWRJbnN0YW5jZSA9IG5ldyBzZWxmLkluc3RhbmNlTW9kaWZpY2F0b3IoKTtcblxuXHRlcnJvcmVkSW5zdGFuY2VbIFN5bWJvbFJlcGxhY2VVcmFudXMgXSggZXJyb3IgKTtcblxuXHRjb25zdCBzdGFjazogc3RyaW5nW10gPSBbXTtcblxuXHRpZiAoIGVycm9yIGluc3RhbmNlb2YgQkFTRV9NTkVNT05JQ0FfRVJST1IgKSB7XG5cblx0XHRzdGFjay5wdXNoKCBlcnJvci5zdGFjayApO1xuXG5cdH0gZWxzZSB7XG5cblx0XHRjb25zdCB0aXRsZSA9IGBcXG48LS0gY3JlYXRpb24gb2YgWyAke1R5cGVOYW1lfSBdIHRyYWNlZCAtLT5gO1xuXG5cdFx0Z2V0U3RhY2suY2FsbCggZXJyb3JlZEluc3RhbmNlLCB0aXRsZSwgW10sIHRocm93TW9kaWZpY2F0aW9uRXJyb3IgKTtcblxuXHRcdHN0YWNrLnB1c2goIC4uLmVycm9yZWRJbnN0YW5jZS5zdGFjayApO1xuXG5cdFx0Y29uc3QgZXJyb3JTdGFjayA9IGVycm9yLnN0YWNrLnNwbGl0KCAnXFxuJyApO1xuXG5cdFx0c3RhY2sucHVzaCggJzwtLSB3aXRoIHRoZSBmb2xsb3dpbmcgZXJyb3IgLS0+JyApO1xuXG5cdFx0ZXJyb3JTdGFjay5mb3JFYWNoKCAoIGxpbmU6IHN0cmluZyApID0+IHtcblx0XHRcdGlmICggIXN0YWNrLmluY2x1ZGVzKCBsaW5lICkgKSB7XG5cdFx0XHRcdHN0YWNrLnB1c2goIGxpbmUgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRzdGFjay5wdXNoKCAnXFxuPC0tIG9mIGNvbnN0cnVjdG9yIGRlZmluaXRpb25zIHN0YWNrIC0tPicgKTtcblx0XHRzdGFjay5wdXNoKCAuLi50eXBlU3RhY2sgKTtcblxuXHR9XG5cblx0Y29uc3QgZXJyb3JlZEluc3RhbmNlU3RhY2sgPSBjbGVhbnVwU3RhY2soIHN0YWNrICkuam9pbiggJ1xcbicgKTtcblxuXHQvLyBzdGFydGluZyBmcm9tIE5vZGUuanMgdjIyIHdlIHNob3VsZCBkZWZpbmUgdGhpcyBwcm9wZXJ0eSB0aHJvdWdoIG9kcFxuXHQvLyB0aGF0IHdhcyB1bm5lY2Vzc2FyeSBmb3IgdjIwLCB0aG91Z2ggc2VlbXMgbmV3IHY4IG9wdGltaXplZCBjb21waWxlclxuXHQvLyBpcyBnYXRoZXJpbmcgdmFsdWUgZnJvbSBkZWVwIGNoYWluIGFuZCB3aGlsZSBjb21wYXJpbmcgaXQgd2l0aCBcblx0Ly8gYXNzaWdubWVudCBvcGVyYXRvciwgdGhlbiBpdCB3aWxsIG5vdCBjcmVhdGUgdGhpcyBwcm9wZXJ0eSBcblx0Ly8gc28gd2UgbmVlZCBkaXJlY3QgcHJvcGVydHkgZGVjbGFyYXRpb24gaGVyZSAuLi5cblx0b2RwKCBlcnJvcmVkSW5zdGFuY2UsICdzdGFjaycsIHtcblx0XHRnZXQgKCkge1xuXHRcdFx0cmV0dXJuIGVycm9yZWRJbnN0YW5jZVN0YWNrO1xuXHRcdH1cblx0fSApO1xuXG5cdHNlbGYuaW5oZXJpdGVkSW5zdGFuY2UgPSBlcnJvcmVkSW5zdGFuY2U7XG5cblx0Ly8gaWYgaG9va3MgaGFkIHNvbWUgaW50ZXJjZXB0aW9uOiBzdGFydFxuXHRjb25zdCByZXN1bHRzID0gc2VsZi5pbnZva2VQb3N0SG9va3MoKTtcblx0Y29uc3Qge1xuXHRcdHR5cGUsXG5cdFx0Y29sbGVjdGlvbixcblx0fSA9IHJlc3VsdHM7XG5cblx0aWYgKCB0eXBlLmhhcyggdHJ1ZSApIHx8IGNvbGxlY3Rpb24uaGFzKCB0cnVlICkgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdC8vIGlmIGhvb2tzIGhhZCBzb21lIGludGVyY2VwdGlvbjogc3RvcFxuXG5cdG9kcCggZXJyb3JlZEluc3RhbmNlLCAnYXJncycsIHtcblx0XHRnZXQgKCkge1xuXHRcdFx0cmV0dXJuIGFyZ3M7XG5cdFx0fVxuXHR9ICk7XG5cblx0b2RwKCBlcnJvcmVkSW5zdGFuY2UsICdvcmlnaW5hbEVycm9yJywge1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0fVxuXHR9ICk7XG5cblx0b2RwKCBlcnJvcmVkSW5zdGFuY2UsICdpbnN0YW5jZScsIHtcblx0XHRnZXQgKCkge1xuXHRcdFx0cmV0dXJuIGVycm9yZWRJbnN0YW5jZTtcblx0XHR9XG5cdH0gKTtcblxuXHRvZHAoIGVycm9yZWRJbnN0YW5jZSwgJ2V4dHJhY3QnLCB7XG5cdFx0Z2V0ICgpIHtcblx0XHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBlcnJvcmVkSW5zdGFuY2UuX19zZWxmX18uZXh0cmFjdCgpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0gKTtcblxuXHRvZHAoIGVycm9yZWRJbnN0YW5jZSwgJ3BhcnNlJywge1xuXHRcdGdldCAoKSB7XG5cdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcGFyc2UoIGVycm9yZWRJbnN0YW5jZSApO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0gKTtcblxuXHR0aHJvdyBlcnJvcmVkSW5zdGFuY2U7XG5cbn07XG4iXX0=