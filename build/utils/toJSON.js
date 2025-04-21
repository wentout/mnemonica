'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJSON = void 0;
const extract_1 = require("./extract");
const toJSON = (instance) => {
    const extracted = (0, extract_1.extract)(instance);
    return Object.entries(extracted).reduce((o, entry) => {
        const [name, _value] = entry;
        if ([null, undefined].includes(_value)) {
            return o;
        }
        let value;
        try {
            value = JSON.stringify(_value);
        }
        catch (error) {
            const description = 'This value type is not supported by JSON.stringify';
            const { stack, message } = error;
            value = JSON.stringify({
                description,
                stack,
                message
            });
        }
        o += `"${name}":${value},`;
        return o;
    }, '{')
        .replace(/,$/, '}');
};
exports.toJSON = toJSON;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9KU09OLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3RvSlNPTi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFvQztBQUM3QixNQUFNLE1BQU0sR0FBRyxDQUFFLFFBQWdCLEVBQUcsRUFBRTtJQUU1QyxNQUFNLFNBQVMsR0FBRyxJQUFBLGlCQUFPLEVBQUUsUUFBUSxDQUFFLENBQUM7SUFDdEMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFFLFNBQVMsQ0FBRSxDQUFDLE1BQU0sQ0FBRSxDQUFFLENBQVMsRUFBRSxLQUFzQixFQUFHLEVBQUU7UUFFbEYsTUFBTSxDQUFFLElBQUksRUFBRSxNQUFNLENBQUUsR0FBRyxLQUFLLENBQUM7UUFDL0IsSUFBSyxDQUFFLElBQUksRUFBRSxTQUFTLENBQUUsQ0FBQyxRQUFRLENBQUUsTUFBTSxDQUFFLEVBQUcsQ0FBQztZQUM5QyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFRCxJQUFJLEtBQUssQ0FBQztRQUVWLElBQUksQ0FBQztZQUNKLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLE1BQU0sQ0FBRSxDQUFDO1FBQ2xDLENBQUM7UUFBQyxPQUFRLEtBQWtCLEVBQUUsQ0FBQztZQUM5QixNQUFNLFdBQVcsR0FBRyxvREFBb0QsQ0FBQztZQUN6RSxNQUFNLEVBQ0wsS0FBSyxFQUNMLE9BQU8sRUFDUCxHQUFHLEtBQUssQ0FBQztZQUVWLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFO2dCQUN2QixXQUFXO2dCQUNYLEtBQUs7Z0JBQ0wsT0FBTzthQUNQLENBQUUsQ0FBQztRQUNMLENBQUM7UUFFRCxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxHQUFHLENBQUM7UUFDM0IsT0FBTyxDQUFDLENBQUM7SUFFVixDQUFDLEVBQUUsR0FBRyxDQUFFO1NBQ04sT0FBTyxDQUFFLElBQUksRUFBRSxHQUFHLENBQUUsQ0FBQztBQUV4QixDQUFDLENBQUM7QUFsQ1csUUFBQSxNQUFNLFVBa0NqQiIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgZXh0cmFjdCB9IGZyb20gJy4vZXh0cmFjdCc7XG5leHBvcnQgY29uc3QgdG9KU09OID0gKCBpbnN0YW5jZTogb2JqZWN0ICkgPT4ge1xuXG5cdGNvbnN0IGV4dHJhY3RlZCA9IGV4dHJhY3QoIGluc3RhbmNlICk7XG5cdHJldHVybiBPYmplY3QuZW50cmllcyggZXh0cmFjdGVkICkucmVkdWNlKCAoIG86IHN0cmluZywgZW50cnk6IFsgc3RyaW5nLCBhbnkgXSApID0+IHtcblxuXHRcdGNvbnN0IFsgbmFtZSwgX3ZhbHVlIF0gPSBlbnRyeTtcblx0XHRpZiAoIFsgbnVsbCwgdW5kZWZpbmVkIF0uaW5jbHVkZXMoIF92YWx1ZSApICkge1xuXHRcdFx0cmV0dXJuIG87XG5cdFx0fVxuXG5cdFx0bGV0IHZhbHVlO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHZhbHVlID0gSlNPTi5zdHJpbmdpZnkoIF92YWx1ZSApO1xuXHRcdH0gY2F0Y2ggKCBlcnJvcjogYW55IHwgRXJyb3IpIHtcblx0XHRcdGNvbnN0IGRlc2NyaXB0aW9uID0gJ1RoaXMgdmFsdWUgdHlwZSBpcyBub3Qgc3VwcG9ydGVkIGJ5IEpTT04uc3RyaW5naWZ5Jztcblx0XHRcdGNvbnN0IHtcblx0XHRcdFx0c3RhY2ssXG5cdFx0XHRcdG1lc3NhZ2Vcblx0XHRcdH0gPSBlcnJvcjtcblxuXHRcdFx0dmFsdWUgPSBKU09OLnN0cmluZ2lmeSgge1xuXHRcdFx0XHRkZXNjcmlwdGlvbixcblx0XHRcdFx0c3RhY2ssXG5cdFx0XHRcdG1lc3NhZ2Vcblx0XHRcdH0gKTtcblx0XHR9XG5cblx0XHRvICs9IGBcIiR7bmFtZX1cIjoke3ZhbHVlfSxgO1xuXHRcdHJldHVybiBvO1xuXG5cdH0sICd7JyApXG5cdFx0LnJlcGxhY2UoIC8sJC8sICd9JyApO1xuXG59O1xuIl19