'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exception = void 0;
const exceptionConstructor_1 = __importDefault(require("../api/errors/exceptionConstructor"));
const exception = (instance) => {
    const result = function (error, ...args) {
        const target = new.target;
        const exceptionResult = exceptionConstructor_1.default.call(instance, target, error, ...args);
        return exceptionResult;
    };
    return result;
};
exports.exception = exception;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2V4Y2VwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7OztBQUViLDhGQUFzRTtBQUUvRCxNQUFNLFNBQVMsR0FBRyxDQUFDLFFBQWdCLEVBQUUsRUFBRTtJQUU3QyxNQUFNLE1BQU0sR0FBRyxVQUFVLEtBQVksRUFBRSxHQUFHLElBQWU7UUFDeEQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMxQixNQUFNLGVBQWUsR0FBRyw4QkFBb0IsQ0FBQyxJQUFJLENBQ2hELFFBQVEsRUFDUixNQUFNLEVBQ04sS0FBSyxFQUNMLEdBQUcsSUFBSSxDQUNQLENBQUM7UUFDRixPQUFPLGVBQWUsQ0FBQztJQUN4QixDQUFDLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUVmLENBQUMsQ0FBQztBQWRXLFFBQUEsU0FBUyxhQWNwQiIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGV4Y2VwdGlvbkNvbnN0cnVjdG9yIGZyb20gJy4uL2FwaS9lcnJvcnMvZXhjZXB0aW9uQ29uc3RydWN0b3InO1xuXG5leHBvcnQgY29uc3QgZXhjZXB0aW9uID0gKGluc3RhbmNlOiBvYmplY3QpID0+IHtcblxuXHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoZXJyb3I6IEVycm9yLCAuLi5hcmdzOiB1bmtub3duW10pIHtcblx0XHRjb25zdCB0YXJnZXQgPSBuZXcudGFyZ2V0O1xuXHRcdGNvbnN0IGV4Y2VwdGlvblJlc3VsdCA9IGV4Y2VwdGlvbkNvbnN0cnVjdG9yLmNhbGwoXG5cdFx0XHRpbnN0YW5jZSxcblx0XHRcdHRhcmdldCxcblx0XHRcdGVycm9yLFxuXHRcdFx0Li4uYXJnc1xuXHRcdCk7XG5cdFx0cmV0dXJuIGV4Y2VwdGlvblJlc3VsdDtcblx0fTtcblx0cmV0dXJuIHJlc3VsdDtcblxufTtcbiJdfQ==