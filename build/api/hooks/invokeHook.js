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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52b2tlSG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvaG9va3MvaW52b2tlSG9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLGlEQUE4QztBQUU5Qyx5Q0FBc0M7QUFFL0IsTUFBTSxVQUFVLEdBQUcsVUFBc0IsUUFBZ0IsRUFBRSxJQUFnQztJQUVqRyxNQUFNLEVBQ0wsSUFBSSxFQUNKLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIsSUFBSSxFQUVKLE9BQU8sRUFDUCxHQUFHLElBQUksQ0FBQztJQUVULE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUdwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsSUFBSyxJQUFBLFNBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBRSxFQUFHLENBQUM7UUFLbkMsTUFBTSxFQUNMLFFBQVEsR0FFUixHQUFHLElBQUksQ0FBQztRQUVULE1BQU0sUUFBUSxHQUFHO1lBQ2hCLElBQUk7WUFDSixRQUFRO1lBQ1IsZ0JBQWdCO1lBQ2hCLElBQUk7U0FDSixDQUFDO1FBRUYsSUFBSyxPQUFPLGlCQUFpQixLQUFLLFFBQVEsRUFBRyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxNQUFNLENBQUUsUUFBUSxFQUFFO2dCQUN4QixpQkFBaUI7Z0JBQ2pCLHNCQUFzQixDQUFHLEtBQVk7b0JBQ3BDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBRSxLQUFLLENBQUUsQ0FBQztnQkFDekMsQ0FBQzthQUNELENBQUUsQ0FBQztRQUNMLENBQUM7UUFHRCxJQUFJLENBQUMsS0FBSyxDQUFFLFFBQVEsQ0FBRSxDQUFDLE9BQU8sQ0FBRSxDQUFFLElBQTRELEVBQUcsRUFBRTtZQUNsRyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFFLElBQUksRUFBRSxRQUFRLENBQUUsQ0FBQztZQUMzQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFFLENBQUM7UUFFSixNQUFNLFdBQVcsR0FBRywyQkFBWSxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztRQUM3QyxJQUFLLE9BQU8sV0FBVyxLQUFLLFVBQVUsRUFBRyxDQUFDO1lBQ3pDLFdBQVc7aUJBQ1QsSUFBSSxDQUFFLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFFLEVBQUUsRUFBRTtnQkFDL0IsaUJBQWlCO2dCQUNqQixRQUFRO2FBQ1IsRUFBRSxRQUFRLENBQUUsQ0FBRSxDQUFDO1FBQ2xCLENBQUM7SUFFRixDQUFDO0lBRUQsT0FBTyxpQkFBaUIsQ0FBQztBQUUxQixDQUFDLENBQUM7QUE3RFcsUUFBQSxVQUFVLGNBNkRyQiIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgZmxvd0NoZWNrZXJzIH0gZnJvbSAnLi9mbG93Q2hlY2tlcnMnO1xuXG5pbXBvcnQgeyBob3AgfSBmcm9tICcuLi8uLi91dGlscy9ob3AnO1xuXG5leHBvcnQgY29uc3QgaW52b2tlSG9vayA9IGZ1bmN0aW9uICggdGhpczogYW55LCBob29rVHlwZTogc3RyaW5nLCBvcHRzOiB7IFsgaW5kZXg6IHN0cmluZyBdOiBhbnkgfSApIHtcblxuXHRjb25zdCB7XG5cdFx0dHlwZSxcblx0XHRleGlzdGVudEluc3RhbmNlLFxuXHRcdGluaGVyaXRlZEluc3RhbmNlLFxuXHRcdGFyZ3MsXG5cdFx0Ly8gSW5zdGFuY2VNb2RpZmljYXRvcixcblx0XHRjcmVhdG9yXG5cdH0gPSBvcHRzO1xuXG5cdGNvbnN0IGludm9jYXRpb25SZXN1bHRzID0gbmV3IFNldCgpO1xuXG5cdCBcblx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0aWYgKCBob3AoIHNlbGYuaG9va3MsIGhvb2tUeXBlICkgKSB7XG5cblx0XHQvLyBcInRoaXNcIiByZWZlcmVzIHRvXG5cdFx0Ly8gdHlwZSwgaWYgY2FsbGVkIGZyb20gdHlwZXNcblxuXHRcdGNvbnN0IHtcblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0Ly8gcGFyZW50VHlwZSxcblx0XHR9ID0gdHlwZTtcblxuXHRcdGNvbnN0IGhvb2tBcmdzID0ge1xuXHRcdFx0dHlwZSxcblx0XHRcdFR5cGVOYW1lLFxuXHRcdFx0ZXhpc3RlbnRJbnN0YW5jZSxcblx0XHRcdGFyZ3MsXG5cdFx0fTtcblxuXHRcdGlmICggdHlwZW9mIGluaGVyaXRlZEluc3RhbmNlID09PSAnb2JqZWN0JyApIHtcblx0XHRcdE9iamVjdC5hc3NpZ24oIGhvb2tBcmdzLCB7XG5cdFx0XHRcdGluaGVyaXRlZEluc3RhbmNlLFxuXHRcdFx0XHR0aHJvd01vZGlmaWNhdGlvbkVycm9yICggZXJyb3I6IEVycm9yICkge1xuXHRcdFx0XHRcdGNyZWF0b3IudGhyb3dNb2RpZmljYXRpb25FcnJvciggZXJyb3IgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdH1cblxuXHRcdCBcblx0XHR0aGlzLmhvb2tzWyBob29rVHlwZSBdLmZvckVhY2goICggaG9vazogKCB0aGlzOiB1bmtub3duLCBob29rUGFyYW1zOiB0eXBlb2YgaG9va0FyZ3MgKSA9PiB2b2lkICkgPT4ge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gaG9vay5jYWxsKCBzZWxmLCBob29rQXJncyApO1xuXHRcdFx0aW52b2NhdGlvblJlc3VsdHMuYWRkKCByZXN1bHQgKTtcblx0XHR9ICk7XG5cblx0XHRjb25zdCBmbG93Q2hlY2tlciA9IGZsb3dDaGVja2Vycy5nZXQoIHRoaXMgKTtcblx0XHRpZiAoIHR5cGVvZiBmbG93Q2hlY2tlciA9PT0gJ2Z1bmN0aW9uJyApIHtcblx0XHRcdGZsb3dDaGVja2VyXG5cdFx0XHRcdC5jYWxsKCB0aGlzLCBPYmplY3QuYXNzaWduKCB7fSwge1xuXHRcdFx0XHRcdGludm9jYXRpb25SZXN1bHRzLFxuXHRcdFx0XHRcdGhvb2tUeXBlLFxuXHRcdFx0XHR9LCBob29rQXJncyApICk7XG5cdFx0fVxuXG5cdH1cblxuXHRyZXR1cm4gaW52b2NhdGlvblJlc3VsdHM7XG5cbn07XG4iXX0=