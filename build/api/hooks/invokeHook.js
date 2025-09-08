'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeHook = void 0;
const constants_1 = require("../../constants");
const { MNEMONICA, } = constants_1.constants;
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
            existentInstance: existentInstance.constructor.name === MNEMONICA ?
                null : existentInstance,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52b2tlSG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvaG9va3MvaW52b2tlSG9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLCtDQUE0QztBQUM1QyxNQUFNLEVBQ0wsU0FBUyxHQUNULEdBQUcscUJBQVMsQ0FBQztBQUVkLGlEQUE4QztBQUU5Qyx5Q0FBc0M7QUFFL0IsTUFBTSxVQUFVLEdBQUcsVUFBc0IsUUFBZ0IsRUFBRSxJQUFnQztJQUVqRyxNQUFNLEVBQ0wsSUFBSSxFQUNKLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIsSUFBSSxFQUVKLE9BQU8sRUFDUCxHQUFHLElBQUksQ0FBQztJQUVULE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUdwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7SUFFbEIsSUFBSyxJQUFBLFNBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBRSxFQUFHLENBQUM7UUFLbkMsTUFBTSxFQUNMLFFBQVEsR0FFUixHQUFHLElBQUksQ0FBQztRQUVULE1BQU0sUUFBUSxHQUFHO1lBQ2hCLElBQUk7WUFDSixRQUFRO1lBQ1IsZ0JBQWdCLEVBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7WUFDeEIsSUFBSTtTQUNKLENBQUM7UUFFRixJQUFLLE9BQU8saUJBQWlCLEtBQUssUUFBUSxFQUFHLENBQUM7WUFDN0MsTUFBTSxDQUFDLE1BQU0sQ0FBRSxRQUFRLEVBQUU7Z0JBQ3hCLGlCQUFpQjtnQkFDakIsc0JBQXNCLENBQUcsS0FBWTtvQkFDcEMsT0FBTyxDQUFDLHNCQUFzQixDQUFFLEtBQUssQ0FBRSxDQUFDO2dCQUN6QyxDQUFDO2FBQ0QsQ0FBRSxDQUFDO1FBQ0wsQ0FBQztRQUdELElBQUksQ0FBQyxLQUFLLENBQUUsUUFBUSxDQUFFLENBQUMsT0FBTyxDQUFFLENBQUUsSUFBNEQsRUFBRyxFQUFFO1lBQ2xHLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBRSxDQUFDO1lBQzNDLGlCQUFpQixDQUFDLEdBQUcsQ0FBRSxNQUFNLENBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUUsQ0FBQztRQUVKLE1BQU0sV0FBVyxHQUFHLDJCQUFZLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxDQUFDO1FBQzdDLElBQUssT0FBTyxXQUFXLEtBQUssVUFBVSxFQUFHLENBQUM7WUFDekMsV0FBVztpQkFDVCxJQUFJLENBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUUsRUFBRSxFQUFFO2dCQUMvQixpQkFBaUI7Z0JBQ2pCLFFBQVE7YUFDUixFQUFFLFFBQVEsQ0FBRSxDQUFFLENBQUM7UUFDbEIsQ0FBQztJQUVGLENBQUM7SUFFRCxPQUFPLGlCQUFpQixDQUFDO0FBRTFCLENBQUMsQ0FBQztBQTlEVyxRQUFBLFVBQVUsY0E4RHJCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuY29uc3Qge1xuXHRNTkVNT05JQ0EsXG59ID0gY29uc3RhbnRzO1xuXG5pbXBvcnQgeyBmbG93Q2hlY2tlcnMgfSBmcm9tICcuL2Zsb3dDaGVja2Vycyc7XG5cbmltcG9ydCB7IGhvcCB9IGZyb20gJy4uLy4uL3V0aWxzL2hvcCc7XG5cbmV4cG9ydCBjb25zdCBpbnZva2VIb29rID0gZnVuY3Rpb24gKCB0aGlzOiBhbnksIGhvb2tUeXBlOiBzdHJpbmcsIG9wdHM6IHsgWyBpbmRleDogc3RyaW5nIF06IGFueSB9ICkge1xuXG5cdGNvbnN0IHtcblx0XHR0eXBlLFxuXHRcdGV4aXN0ZW50SW5zdGFuY2UsXG5cdFx0aW5oZXJpdGVkSW5zdGFuY2UsXG5cdFx0YXJncyxcblx0XHQvLyBJbnN0YW5jZU1vZGlmaWNhdG9yLFxuXHRcdGNyZWF0b3Jcblx0fSA9IG9wdHM7XG5cblx0Y29uc3QgaW52b2NhdGlvblJlc3VsdHMgPSBuZXcgU2V0KCk7XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdGlmICggaG9wKCBzZWxmLmhvb2tzLCBob29rVHlwZSApICkge1xuXG5cdFx0Ly8gXCJ0aGlzXCIgcmVmZXJlcyB0b1xuXHRcdC8vIHR5cGUsIGlmIGNhbGxlZCBmcm9tIHR5cGVzXG5cblx0XHRjb25zdCB7XG5cdFx0XHRUeXBlTmFtZSxcblx0XHRcdC8vIHBhcmVudFR5cGUsXG5cdFx0fSA9IHR5cGU7XG5cblx0XHRjb25zdCBob29rQXJncyA9IHtcblx0XHRcdHR5cGUsXG5cdFx0XHRUeXBlTmFtZSxcblx0XHRcdGV4aXN0ZW50SW5zdGFuY2UgOiBleGlzdGVudEluc3RhbmNlLmNvbnN0cnVjdG9yLm5hbWUgPT09IE1ORU1PTklDQSA/XG5cdFx0XHRcdG51bGwgOiBleGlzdGVudEluc3RhbmNlLFxuXHRcdFx0YXJncyxcblx0XHR9O1xuXG5cdFx0aWYgKCB0eXBlb2YgaW5oZXJpdGVkSW5zdGFuY2UgPT09ICdvYmplY3QnICkge1xuXHRcdFx0T2JqZWN0LmFzc2lnbiggaG9va0FyZ3MsIHtcblx0XHRcdFx0aW5oZXJpdGVkSW5zdGFuY2UsXG5cdFx0XHRcdHRocm93TW9kaWZpY2F0aW9uRXJyb3IgKCBlcnJvcjogRXJyb3IgKSB7XG5cdFx0XHRcdFx0Y3JlYXRvci50aHJvd01vZGlmaWNhdGlvbkVycm9yKCBlcnJvciApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNoYWRvd1xuXHRcdHRoaXMuaG9va3NbIGhvb2tUeXBlIF0uZm9yRWFjaCggKCBob29rOiAoIHRoaXM6IHVua25vd24sIGhvb2tQYXJhbXM6IHR5cGVvZiBob29rQXJncyApID0+IHZvaWQgKSA9PiB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBob29rLmNhbGwoIHNlbGYsIGhvb2tBcmdzICk7XG5cdFx0XHRpbnZvY2F0aW9uUmVzdWx0cy5hZGQoIHJlc3VsdCApO1xuXHRcdH0gKTtcblxuXHRcdGNvbnN0IGZsb3dDaGVja2VyID0gZmxvd0NoZWNrZXJzLmdldCggdGhpcyApO1xuXHRcdGlmICggdHlwZW9mIGZsb3dDaGVja2VyID09PSAnZnVuY3Rpb24nICkge1xuXHRcdFx0Zmxvd0NoZWNrZXJcblx0XHRcdFx0LmNhbGwoIHRoaXMsIE9iamVjdC5hc3NpZ24oIHt9LCB7XG5cdFx0XHRcdFx0aW52b2NhdGlvblJlc3VsdHMsXG5cdFx0XHRcdFx0aG9va1R5cGUsXG5cdFx0XHRcdH0sIGhvb2tBcmdzICkgKTtcblx0XHR9XG5cblx0fVxuXG5cdHJldHVybiBpbnZvY2F0aW9uUmVzdWx0cztcblxufTtcbiJdfQ==