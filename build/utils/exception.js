'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exception = void 0;
const exceptionConstructor_1 = __importDefault(require("../api/errors/exceptionConstructor"));
const exception = function (instance, error, ...args) {
    const target = new.target;
    const exceptionResult = exceptionConstructor_1.default.call(instance, target, error, ...args);
    return exceptionResult;
};
exports.exception = exception;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2V4Y2VwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7OztBQUViLDhGQUFzRTtBQUUvRCxNQUFNLFNBQVMsR0FBRyxVQUFVLFFBQWdCLEVBQUUsS0FBWSxFQUFFLEdBQUcsSUFBZTtJQUVwRixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQzFCLE1BQU0sZUFBZSxHQUFHLDhCQUFvQixDQUFDLElBQUksQ0FDaEQsUUFBUSxFQUNSLE1BQU0sRUFDTixLQUFLLEVBQ0wsR0FBRyxJQUFJLENBQ1AsQ0FBQztJQUNGLE9BQU8sZUFBZSxDQUFDO0FBRXhCLENBQUMsQ0FBQztBQVhXLFFBQUEsU0FBUyxhQVdwQiIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGV4Y2VwdGlvbkNvbnN0cnVjdG9yIGZyb20gJy4uL2FwaS9lcnJvcnMvZXhjZXB0aW9uQ29uc3RydWN0b3InO1xuXG5leHBvcnQgY29uc3QgZXhjZXB0aW9uID0gZnVuY3Rpb24gKGluc3RhbmNlOiBvYmplY3QsIGVycm9yOiBFcnJvciwgLi4uYXJnczogdW5rbm93bltdKSB7XG5cblx0Y29uc3QgdGFyZ2V0ID0gbmV3LnRhcmdldDtcblx0Y29uc3QgZXhjZXB0aW9uUmVzdWx0ID0gZXhjZXB0aW9uQ29uc3RydWN0b3IuY2FsbChcblx0XHRpbnN0YW5jZSxcblx0XHR0YXJnZXQsXG5cdFx0ZXJyb3IsXG5cdFx0Li4uYXJnc1xuXHQpO1xuXHRyZXR1cm4gZXhjZXB0aW9uUmVzdWx0O1xuXG59O1xuIl19