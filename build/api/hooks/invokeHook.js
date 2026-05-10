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
            flowChecker(Object.assign(Object.assign({}, hookArgs), { invocationResults,
                hookType }));
        }
    }
    return invocationResults;
};
exports.invokeHook = invokeHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52b2tlSG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvaG9va3MvaW52b2tlSG9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQU1iLGlEQUE4QztBQUM5QyxxREFBa0Q7QUFFbEQseUNBQXNDO0FBRS9CLE1BQU0sVUFBVSxHQUFHLFVBQTJCLFFBQWdCLEVBQUUsSUFBZTtJQUVyRixNQUFNLEVBQ0wsSUFBSSxFQUNKLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIsSUFBSSxFQUNKLE9BQU8sRUFDUCxHQUFHLElBQUksQ0FBQztJQUVULE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQVcsQ0FBQztJQUU3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsSUFBSyxJQUFBLFNBQUcsRUFDUCxJQUFJLENBQUMsS0FBSyxFQUNWLFFBQVEsQ0FDUixFQUFHLENBQUM7UUFFSixNQUFNLE9BQU8sR0FBRyxJQUFJLCtCQUFjLENBQ2pDLElBQUksRUFDSixnQkFBZ0IsRUFDaEIsSUFBSSxDQUNKLENBQUM7UUFFRixJQUFLLE9BQU8saUJBQWlCLEtBQUssUUFBUSxFQUFHLENBQUM7WUFDN0MsT0FBTyxDQUFDLHFCQUFxQixDQUFFLGlCQUFpQixDQUFFLENBQUM7UUFDcEQsQ0FBQztRQUNELElBQUssT0FBTyxFQUFHLENBQUM7WUFDZixPQUFPLENBQUMsV0FBVyxDQUFFLE9BQU8sQ0FBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFakMsSUFBSSxDQUFDLEtBQUssQ0FBRSxRQUFRLENBQUUsQ0FBQyxPQUFPLENBQUUsQ0FBRSxJQUFrQixFQUFHLEVBQUU7WUFDeEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FDdkIsSUFBSSxFQUNKLFFBQVEsQ0FDUixDQUFDO1lBQ0YsaUJBQWlCLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBRSxDQUFDO1FBQ2pDLENBQUMsQ0FBRSxDQUFDO1FBRUosTUFBTSxXQUFXLEdBQUcsMkJBQVksQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFLENBQUM7UUFDN0MsSUFBSyxPQUFPLFdBQVcsS0FBSyxVQUFVLEVBQUcsQ0FBQztZQUN4QyxXQUFvRCxpQ0FDakQsUUFBUSxLQUNYLGlCQUFpQjtnQkFDakIsUUFBUSxJQUNQLENBQUM7UUFDSixDQUFDO0lBRUYsQ0FBQztJQUVELE9BQU8saUJBQWlCLENBQUM7QUFFMUIsQ0FBQyxDQUFDO0FBdkRXLFFBQUEsVUFBVSxjQXVEckIiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0eXBlIHtcblx0aG9va3NPcHRzLCBIb29rYWJsZSwgSG9va0Z1bmN0aW9uIFxufSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmltcG9ydCB7IGZsb3dDaGVja2VycyB9IGZyb20gJy4vZmxvd0NoZWNrZXJzJztcbmltcG9ydCB7IEhvb2tJbnZvY2F0aW9uIH0gZnJvbSAnLi9Ib29rSW52b2NhdGlvbic7XG5cbmltcG9ydCB7IGhvcCB9IGZyb20gJy4uLy4uL3V0aWxzL2hvcCc7XG5cbmV4cG9ydCBjb25zdCBpbnZva2VIb29rID0gZnVuY3Rpb24gKCB0aGlzOiBIb29rYWJsZSwgaG9va1R5cGU6IHN0cmluZywgb3B0czogaG9va3NPcHRzICkge1xuXG5cdGNvbnN0IHtcblx0XHR0eXBlLFxuXHRcdGV4aXN0ZW50SW5zdGFuY2UsXG5cdFx0aW5oZXJpdGVkSW5zdGFuY2UsXG5cdFx0YXJncyxcblx0XHRjcmVhdG9yXG5cdH0gPSBvcHRzO1xuXG5cdGNvbnN0IGludm9jYXRpb25SZXN1bHRzID0gbmV3IFNldDx1bmtub3duPigpO1xuXG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdGlmICggaG9wKFxuXHRcdHNlbGYuaG9va3MsXG5cdFx0aG9va1R5cGUgXG5cdCkgKSB7XG5cblx0XHRjb25zdCBidWlsZGVyID0gbmV3IEhvb2tJbnZvY2F0aW9uKFxuXHRcdFx0dHlwZSxcblx0XHRcdGV4aXN0ZW50SW5zdGFuY2UsXG5cdFx0XHRhcmdzXG5cdFx0KTtcblxuXHRcdGlmICggdHlwZW9mIGluaGVyaXRlZEluc3RhbmNlID09PSAnb2JqZWN0JyApIHtcblx0XHRcdGJ1aWxkZXIud2l0aEluaGVyaXRlZEluc3RhbmNlKCBpbmhlcml0ZWRJbnN0YW5jZSApO1xuXHRcdH1cblx0XHRpZiAoIGNyZWF0b3IgKSB7XG5cdFx0XHRidWlsZGVyLndpdGhDcmVhdG9yKCBjcmVhdG9yICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaG9va0FyZ3MgPSBidWlsZGVyLmJ1aWxkKCk7XG5cblx0XHRzZWxmLmhvb2tzWyBob29rVHlwZSBdLmZvckVhY2goICggaG9vazogSG9va0Z1bmN0aW9uICkgPT4ge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gaG9vay5jYWxsKFxuXHRcdFx0XHRzZWxmLFxuXHRcdFx0XHRob29rQXJnc1xuXHRcdFx0KTtcblx0XHRcdGludm9jYXRpb25SZXN1bHRzLmFkZCggcmVzdWx0ICk7XG5cdFx0fSApO1xuXG5cdFx0Y29uc3QgZmxvd0NoZWNrZXIgPSBmbG93Q2hlY2tlcnMuZ2V0KCB0aGlzICk7XG5cdFx0aWYgKCB0eXBlb2YgZmxvd0NoZWNrZXIgPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHQoZmxvd0NoZWNrZXIgYXMgdW5rbm93biBhcyAob3B0czogb2JqZWN0KSA9PiB1bmtub3duKSh7XG5cdFx0XHRcdC4uLmhvb2tBcmdzLFxuXHRcdFx0XHRpbnZvY2F0aW9uUmVzdWx0cyxcblx0XHRcdFx0aG9va1R5cGUsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fVxuXG5cdHJldHVybiBpbnZvY2F0aW9uUmVzdWx0cztcblxufTtcbiJdfQ==