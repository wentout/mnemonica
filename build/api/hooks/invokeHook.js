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
        self.hooks[hookType].forEach((cb) => {
            const result = cb.call(self, hookArgs);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52b2tlSG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvaG9va3MvaW52b2tlSG9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQU1iLGlEQUE4QztBQUM5QyxxREFBa0Q7QUFFbEQseUNBQXNDO0FBRS9CLE1BQU0sVUFBVSxHQUFHLFVBQTJCLFFBQWdCLEVBQUUsSUFBZTtJQUVyRixNQUFNLEVBQ0wsSUFBSSxFQUNKLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIsSUFBSSxFQUNKLE9BQU8sRUFDUCxHQUFHLElBQUksQ0FBQztJQUVULE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQVcsQ0FBQztJQUU3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsSUFBSyxJQUFBLFNBQUcsRUFDUCxJQUFJLENBQUMsS0FBSyxFQUNWLFFBQVEsQ0FDUixFQUFHLENBQUM7UUFFSixNQUFNLE9BQU8sR0FBRyxJQUFJLCtCQUFjLENBQ2pDLElBQUksRUFDSixnQkFBZ0IsRUFDaEIsSUFBSSxDQUNKLENBQUM7UUFFRixJQUFLLE9BQU8saUJBQWlCLEtBQUssUUFBUSxFQUFHLENBQUM7WUFDN0MsT0FBTyxDQUFDLHFCQUFxQixDQUFFLGlCQUFpQixDQUFFLENBQUM7UUFDcEQsQ0FBQztRQUNELElBQUssT0FBTyxFQUFHLENBQUM7WUFDZixPQUFPLENBQUMsV0FBVyxDQUFFLE9BQU8sQ0FBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFakMsSUFBSSxDQUFDLEtBQUssQ0FBRSxRQUFRLENBQUUsQ0FBQyxPQUFPLENBQUUsQ0FBRSxFQUFRLEVBQUcsRUFBRTtZQUM5QyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUNyQixJQUFJLEVBQ0osUUFBUSxDQUNSLENBQUM7WUFDRixpQkFBaUIsQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFFLENBQUM7UUFFSixNQUFNLFdBQVcsR0FBRywyQkFBWSxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztRQUM3QyxJQUFLLE9BQU8sV0FBVyxLQUFLLFVBQVUsRUFBRyxDQUFDO1lBQ3hDLFdBQW9ELGlDQUNqRCxRQUFRLEtBQ1gsaUJBQWlCO2dCQUNqQixRQUFRLElBQ1AsQ0FBQztRQUNKLENBQUM7SUFFRixDQUFDO0lBRUQsT0FBTyxpQkFBaUIsQ0FBQztBQUUxQixDQUFDLENBQUM7QUF2RFcsUUFBQSxVQUFVLGNBdURyQiIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHR5cGUge1xuXHRob29rc09wdHMsIEhvb2thYmxlLCBob29rXG59IGZyb20gJy4uLy4uL3R5cGVzJztcblxuaW1wb3J0IHsgZmxvd0NoZWNrZXJzIH0gZnJvbSAnLi9mbG93Q2hlY2tlcnMnO1xuaW1wb3J0IHsgSG9va0ludm9jYXRpb24gfSBmcm9tICcuL0hvb2tJbnZvY2F0aW9uJztcblxuaW1wb3J0IHsgaG9wIH0gZnJvbSAnLi4vLi4vdXRpbHMvaG9wJztcblxuZXhwb3J0IGNvbnN0IGludm9rZUhvb2sgPSBmdW5jdGlvbiAoIHRoaXM6IEhvb2thYmxlLCBob29rVHlwZTogc3RyaW5nLCBvcHRzOiBob29rc09wdHMgKSB7XG5cblx0Y29uc3Qge1xuXHRcdHR5cGUsXG5cdFx0ZXhpc3RlbnRJbnN0YW5jZSxcblx0XHRpbmhlcml0ZWRJbnN0YW5jZSxcblx0XHRhcmdzLFxuXHRcdGNyZWF0b3Jcblx0fSA9IG9wdHM7XG5cblx0Y29uc3QgaW52b2NhdGlvblJlc3VsdHMgPSBuZXcgU2V0PHVua25vd24+KCk7XG5cblx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0aWYgKCBob3AoXG5cdFx0c2VsZi5ob29rcyxcblx0XHRob29rVHlwZSBcblx0KSApIHtcblxuXHRcdGNvbnN0IGJ1aWxkZXIgPSBuZXcgSG9va0ludm9jYXRpb24oXG5cdFx0XHR0eXBlLFxuXHRcdFx0ZXhpc3RlbnRJbnN0YW5jZSxcblx0XHRcdGFyZ3Ncblx0XHQpO1xuXG5cdFx0aWYgKCB0eXBlb2YgaW5oZXJpdGVkSW5zdGFuY2UgPT09ICdvYmplY3QnICkge1xuXHRcdFx0YnVpbGRlci53aXRoSW5oZXJpdGVkSW5zdGFuY2UoIGluaGVyaXRlZEluc3RhbmNlICk7XG5cdFx0fVxuXHRcdGlmICggY3JlYXRvciApIHtcblx0XHRcdGJ1aWxkZXIud2l0aENyZWF0b3IoIGNyZWF0b3IgKTtcblx0XHR9XG5cblx0XHRjb25zdCBob29rQXJncyA9IGJ1aWxkZXIuYnVpbGQoKTtcblxuXHRcdHNlbGYuaG9va3NbIGhvb2tUeXBlIF0uZm9yRWFjaCggKCBjYjogaG9vayApID0+IHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGNiLmNhbGwoXG5cdFx0XHRcdHNlbGYsXG5cdFx0XHRcdGhvb2tBcmdzXG5cdFx0XHQpO1xuXHRcdFx0aW52b2NhdGlvblJlc3VsdHMuYWRkKCByZXN1bHQgKTtcblx0XHR9ICk7XG5cblx0XHRjb25zdCBmbG93Q2hlY2tlciA9IGZsb3dDaGVja2Vycy5nZXQoIHRoaXMgKTtcblx0XHRpZiAoIHR5cGVvZiBmbG93Q2hlY2tlciA9PT0gJ2Z1bmN0aW9uJyApIHtcblx0XHRcdChmbG93Q2hlY2tlciBhcyB1bmtub3duIGFzIChvcHRzOiBvYmplY3QpID0+IHVua25vd24pKHtcblx0XHRcdFx0Li4uaG9va0FyZ3MsXG5cdFx0XHRcdGludm9jYXRpb25SZXN1bHRzLFxuXHRcdFx0XHRob29rVHlwZSxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHR9XG5cblx0cmV0dXJuIGludm9jYXRpb25SZXN1bHRzO1xuXG59O1xuIl19