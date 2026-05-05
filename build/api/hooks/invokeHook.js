'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeHook = void 0;
const flowCheckers_1 = require("./flowCheckers");
const HookInvocation_1 = require("./HookInvocation");
const hop_1 = require("../../utils/hop");
const invokeHook = function (hookType, opts) {
    const { type, existentInstance, inheritedInstance, args, creator } = opts;
    const invocationResults = new Set();
    const self = this;
    if ((0, hop_1.hop)(self.hooks, hookType)) {
        const builder = new HookInvocation_1.HookInvocation(type, existentInstance, args);
        if (typeof inheritedInstance === 'object') {
            builder.withInheritedInstance(inheritedInstance);
        }
        if (creator) {
            builder.withCreator(creator);
        }
        const hookArgs = builder.build();
        self.hooks[hookType].forEach((hook) => {
            const result = hook.call(self, hookArgs);
            invocationResults.add(result);
        });
        const flowChecker = flowCheckers_1.flowCheckers.get(this);
        if (typeof flowChecker === 'function') {
            flowChecker.call(this, Object.assign(Object.assign({}, hookArgs), { invocationResults,
                hookType }));
        }
    }
    return invocationResults;
};
exports.invokeHook = invokeHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52b2tlSG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvaG9va3MvaW52b2tlSG9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQU1iLGlEQUE4QztBQUM5QyxxREFBa0Q7QUFFbEQseUNBQXNDO0FBRS9CLE1BQU0sVUFBVSxHQUFHLFVBQTJCLFFBQWdCLEVBQUUsSUFBZTtJQUVyRixNQUFNLEVBQ0wsSUFBSSxFQUNKLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIsSUFBSSxFQUNKLE9BQU8sRUFDUCxHQUFHLElBQUksQ0FBQztJQUVULE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQVcsQ0FBQztJQUU3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsSUFBSyxJQUFBLFNBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUNuQixRQUFRLENBQUUsRUFBRyxDQUFDO1FBRWQsTUFBTSxPQUFPLEdBQUcsSUFBSSwrQkFBYyxDQUFDLElBQUksRUFDdEMsZ0JBQWdCLEVBQ2hCLElBQUksQ0FBQyxDQUFDO1FBRVAsSUFBSyxPQUFPLGlCQUFpQixLQUFLLFFBQVEsRUFBRyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBRSxpQkFBaUIsQ0FBRSxDQUFDO1FBQ3BELENBQUM7UUFDRCxJQUFLLE9BQU8sRUFBRyxDQUFDO1lBQ2YsT0FBTyxDQUFDLFdBQVcsQ0FBRSxPQUFPLENBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxLQUFLLENBQUUsUUFBUSxDQUFFLENBQUMsT0FBTyxDQUFFLENBQUUsSUFBa0IsRUFBRyxFQUFFO1lBQ3hELE1BQU0sTUFBTSxHQUFJLElBQWlCLENBQUMsSUFBSSxDQUFFLElBQUksRUFDM0MsUUFBUSxDQUFFLENBQUM7WUFDWixpQkFBaUIsQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFFLENBQUM7UUFFSixNQUFNLFdBQVcsR0FBRywyQkFBWSxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztRQUM3QyxJQUFLLE9BQU8sV0FBVyxLQUFLLFVBQVUsRUFBRyxDQUFDO1lBQ3hDLFdBQXdCLENBQUMsSUFBSSxDQUFFLElBQUksa0NBRS9CLFFBQVEsS0FDWCxpQkFBaUI7Z0JBQ2pCLFFBQVEsSUFDTixDQUFDO1FBQ04sQ0FBQztJQUVGLENBQUM7SUFFRCxPQUFPLGlCQUFpQixDQUFDO0FBRTFCLENBQUMsQ0FBQztBQWxEVyxRQUFBLFVBQVUsY0FrRHJCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdHlwZSB7XG5cdGhvb2tzT3B0cywgSG9va2FibGUsIEhvb2tGdW5jdGlvbiBcbn0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuXG5pbXBvcnQgeyBmbG93Q2hlY2tlcnMgfSBmcm9tICcuL2Zsb3dDaGVja2Vycyc7XG5pbXBvcnQgeyBIb29rSW52b2NhdGlvbiB9IGZyb20gJy4vSG9va0ludm9jYXRpb24nO1xuXG5pbXBvcnQgeyBob3AgfSBmcm9tICcuLi8uLi91dGlscy9ob3AnO1xuXG5leHBvcnQgY29uc3QgaW52b2tlSG9vayA9IGZ1bmN0aW9uICggdGhpczogSG9va2FibGUsIGhvb2tUeXBlOiBzdHJpbmcsIG9wdHM6IGhvb2tzT3B0cyApIHtcblxuXHRjb25zdCB7XG5cdFx0dHlwZSxcblx0XHRleGlzdGVudEluc3RhbmNlLFxuXHRcdGluaGVyaXRlZEluc3RhbmNlLFxuXHRcdGFyZ3MsXG5cdFx0Y3JlYXRvclxuXHR9ID0gb3B0cztcblxuXHRjb25zdCBpbnZvY2F0aW9uUmVzdWx0cyA9IG5ldyBTZXQ8dW5rbm93bj4oKTtcblxuXHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRpZiAoIGhvcCggc2VsZi5ob29rcyxcblx0XHRob29rVHlwZSApICkge1xuXG5cdFx0Y29uc3QgYnVpbGRlciA9IG5ldyBIb29rSW52b2NhdGlvbih0eXBlLFxuXHRcdFx0ZXhpc3RlbnRJbnN0YW5jZSxcblx0XHRcdGFyZ3MpO1xuXG5cdFx0aWYgKCB0eXBlb2YgaW5oZXJpdGVkSW5zdGFuY2UgPT09ICdvYmplY3QnICkge1xuXHRcdFx0YnVpbGRlci53aXRoSW5oZXJpdGVkSW5zdGFuY2UoIGluaGVyaXRlZEluc3RhbmNlICk7XG5cdFx0fVxuXHRcdGlmICggY3JlYXRvciApIHtcblx0XHRcdGJ1aWxkZXIud2l0aENyZWF0b3IoIGNyZWF0b3IgKTtcblx0XHR9XG5cblx0XHRjb25zdCBob29rQXJncyA9IGJ1aWxkZXIuYnVpbGQoKTtcblxuXHRcdHNlbGYuaG9va3NbIGhvb2tUeXBlIF0uZm9yRWFjaCggKCBob29rOiBIb29rRnVuY3Rpb24gKSA9PiB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSAoaG9vayBhcyBGdW5jdGlvbikuY2FsbCggc2VsZixcblx0XHRcdFx0aG9va0FyZ3MgKTtcblx0XHRcdGludm9jYXRpb25SZXN1bHRzLmFkZCggcmVzdWx0ICk7XG5cdFx0fSApO1xuXG5cdFx0Y29uc3QgZmxvd0NoZWNrZXIgPSBmbG93Q2hlY2tlcnMuZ2V0KCB0aGlzICk7XG5cdFx0aWYgKCB0eXBlb2YgZmxvd0NoZWNrZXIgPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHQoZmxvd0NoZWNrZXIgYXMgRnVuY3Rpb24pLmNhbGwoIHRoaXMsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQuLi5ob29rQXJncyxcblx0XHRcdFx0XHRpbnZvY2F0aW9uUmVzdWx0cyxcblx0XHRcdFx0XHRob29rVHlwZSxcblx0XHRcdFx0fSApO1xuXHRcdH1cblxuXHR9XG5cblx0cmV0dXJuIGludm9jYXRpb25SZXN1bHRzO1xuXG59O1xuIl19