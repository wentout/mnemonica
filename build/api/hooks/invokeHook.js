'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeHook = void 0;
const flowCheckers_1 = require("./flowCheckers");
const hop_1 = require("../../utils/hop");
const invokeHook = function (hookType, opts) {
    const { type, existentInstance, inheritedInstance, args, creator } = opts;
    const invocationResults = new Set();
    const self = this;
    if ((0, hop_1.hop)(self.hooks, hookType)) {
        const { TypeName, } = type;
        const hookArgs = {
            type,
            TypeName,
            existentInstance,
            args,
        };
        if (typeof inheritedInstance === 'object') {
            Object.assign(hookArgs, {
                inheritedInstance,
                throwModificationError(error) {
                    creator.throwModificationError(error);
                }
            });
        }
        this.hooks[hookType].forEach((hook) => {
            const result = hook.call(self, hookArgs);
            invocationResults.add(result);
        });
        const flowChecker = flowCheckers_1.flowCheckers.get(this);
        if (typeof flowChecker === 'function') {
            flowChecker
                .call(this, Object.assign({}, {
                invocationResults,
                hookType,
            }, hookArgs));
        }
    }
    return invocationResults;
};
exports.invokeHook = invokeHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52b2tlSG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvaG9va3MvaW52b2tlSG9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUliLGlEQUE4QztBQUU5Qyx5Q0FBc0M7QUFFL0IsTUFBTSxVQUFVLEdBQUcsVUFBMkIsUUFBZ0IsRUFBRSxJQUFlO0lBRXJGLE1BQU0sRUFDTCxJQUFJLEVBQ0osZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixJQUFJLEVBRUosT0FBTyxFQUNQLEdBQUcsSUFBSSxDQUFDO0lBRVQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBR3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztJQUVsQixJQUFLLElBQUEsU0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFFLEVBQUcsQ0FBQztRQUtuQyxNQUFNLEVBQ0wsUUFBUSxHQUVSLEdBQUcsSUFBSSxDQUFDO1FBRVQsTUFBTSxRQUFRLEdBQUc7WUFDaEIsSUFBSTtZQUNKLFFBQVE7WUFDUixnQkFBZ0I7WUFDaEIsSUFBSTtTQUNKLENBQUM7UUFFRixJQUFLLE9BQU8saUJBQWlCLEtBQUssUUFBUSxFQUFHLENBQUM7WUFDN0MsTUFBTSxDQUFDLE1BQU0sQ0FBRSxRQUFRLEVBQUU7Z0JBQ3hCLGlCQUFpQjtnQkFDakIsc0JBQXNCLENBQUcsS0FBWTtvQkFDcEMsT0FBUSxDQUFDLHNCQUFzQixDQUFFLEtBQUssQ0FBRSxDQUFDO2dCQUMxQyxDQUFDO2FBQ0QsQ0FBRSxDQUFDO1FBQ0wsQ0FBQztRQUdELElBQUksQ0FBQyxLQUFLLENBQUUsUUFBUSxDQUFFLENBQUMsT0FBTyxDQUFFLENBQUUsSUFBc0IsRUFBRyxFQUFFO1lBQzVELE1BQU0sTUFBTSxHQUFJLElBQWlCLENBQUMsSUFBSSxDQUFFLElBQUksRUFBRSxRQUFRLENBQUUsQ0FBQztZQUN6RCxpQkFBaUIsQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFFLENBQUM7UUFFSixNQUFNLFdBQVcsR0FBRywyQkFBWSxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztRQUM3QyxJQUFLLE9BQU8sV0FBVyxLQUFLLFVBQVUsRUFBRyxDQUFDO1lBQ3hDLFdBQXdCO2lCQUN2QixJQUFJLENBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUUsRUFBRSxFQUFFO2dCQUMvQixpQkFBaUI7Z0JBQ2pCLFFBQVE7YUFDUixFQUFFLFFBQVEsQ0FBRSxDQUFFLENBQUM7UUFDbEIsQ0FBQztJQUVGLENBQUM7SUFFRCxPQUFPLGlCQUFpQixDQUFDO0FBRTFCLENBQUMsQ0FBQztBQTdEVyxRQUFBLFVBQVUsY0E2RHJCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdHlwZSB7IGhvb2tzT3B0cywgSG9va2FibGUgfSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGZsb3dDaGVja2VycyB9IGZyb20gJy4vZmxvd0NoZWNrZXJzJztcblxuaW1wb3J0IHsgaG9wIH0gZnJvbSAnLi4vLi4vdXRpbHMvaG9wJztcblxuZXhwb3J0IGNvbnN0IGludm9rZUhvb2sgPSBmdW5jdGlvbiAoIHRoaXM6IEhvb2thYmxlLCBob29rVHlwZTogc3RyaW5nLCBvcHRzOiBob29rc09wdHMgKSB7XG5cblx0Y29uc3Qge1xuXHRcdHR5cGUsXG5cdFx0ZXhpc3RlbnRJbnN0YW5jZSxcblx0XHRpbmhlcml0ZWRJbnN0YW5jZSxcblx0XHRhcmdzLFxuXHRcdC8vIEluc3RhbmNlTW9kaWZpY2F0b3IsXG5cdFx0Y3JlYXRvclxuXHR9ID0gb3B0cztcblxuXHRjb25zdCBpbnZvY2F0aW9uUmVzdWx0cyA9IG5ldyBTZXQoKTtcblxuXHQgXG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdGlmICggaG9wKCBzZWxmLmhvb2tzLCBob29rVHlwZSApICkge1xuXG5cdFx0Ly8gXCJ0aGlzXCIgcmVmZXJlcyB0b1xuXHRcdC8vIHR5cGUsIGlmIGNhbGxlZCBmcm9tIHR5cGVzXG5cblx0XHRjb25zdCB7XG5cdFx0XHRUeXBlTmFtZSxcblx0XHRcdC8vIHBhcmVudFR5cGUsXG5cdFx0fSA9IHR5cGU7XG5cblx0XHRjb25zdCBob29rQXJncyA9IHtcblx0XHRcdHR5cGUsXG5cdFx0XHRUeXBlTmFtZSxcblx0XHRcdGV4aXN0ZW50SW5zdGFuY2UsXG5cdFx0XHRhcmdzLFxuXHRcdH07XG5cblx0XHRpZiAoIHR5cGVvZiBpbmhlcml0ZWRJbnN0YW5jZSA9PT0gJ29iamVjdCcgKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKCBob29rQXJncywge1xuXHRcdFx0XHRpbmhlcml0ZWRJbnN0YW5jZSxcblx0XHRcdFx0dGhyb3dNb2RpZmljYXRpb25FcnJvciAoIGVycm9yOiBFcnJvciApIHtcblx0XHRcdFx0XHRjcmVhdG9yIS50aHJvd01vZGlmaWNhdGlvbkVycm9yKCBlcnJvciApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0IFxuXHRcdHRoaXMuaG9va3NbIGhvb2tUeXBlIF0uZm9yRWFjaCggKCBob29rOiBDYWxsYWJsZUZ1bmN0aW9uICkgPT4ge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gKGhvb2sgYXMgRnVuY3Rpb24pLmNhbGwoIHNlbGYsIGhvb2tBcmdzICk7XG5cdFx0XHRpbnZvY2F0aW9uUmVzdWx0cy5hZGQoIHJlc3VsdCApO1xuXHRcdH0gKTtcblxuXHRcdGNvbnN0IGZsb3dDaGVja2VyID0gZmxvd0NoZWNrZXJzLmdldCggdGhpcyApO1xuXHRcdGlmICggdHlwZW9mIGZsb3dDaGVja2VyID09PSAnZnVuY3Rpb24nICkge1xuXHRcdFx0KGZsb3dDaGVja2VyIGFzIEZ1bmN0aW9uKVxuXHRcdFx0XHQuY2FsbCggdGhpcywgT2JqZWN0LmFzc2lnbigge30sIHtcblx0XHRcdFx0XHRpbnZvY2F0aW9uUmVzdWx0cyxcblx0XHRcdFx0XHRob29rVHlwZSxcblx0XHRcdFx0fSwgaG9va0FyZ3MgKSApO1xuXHRcdH1cblxuXHR9XG5cblx0cmV0dXJuIGludm9jYXRpb25SZXN1bHRzO1xuXG59O1xuIl19