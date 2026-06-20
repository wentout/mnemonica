'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineStackCleaner = exports.utils = void 0;
const collectConstructors_1 = require("./collectConstructors");
const extract_1 = require("./extract");
const parent_1 = require("./parent");
const parentTyped_1 = require("./parentTyped");
const pick_1 = require("./pick");
const sibling_1 = require("./sibling");
const exception_1 = require("./exception");
const fork_1 = require("./fork");
const clone_1 = require("./clone");
const toJSON_1 = require("./toJSON");
const parse_1 = require("./parse");
const merge_1 = require("./merge");
const utilsUnWrapped = {
    extract: extract_1.extract,
    pick: pick_1.pick,
    parent: parent_1.parent,
    parentTyped: parentTyped_1.parentTyped,
    sibling: sibling_1.sibling,
    exception: exception_1.exception,
    fork: fork_1.fork,
    clone: clone_1.clone,
    toJSON: toJSON_1.toJSON,
    parse: parse_1.parse,
    merge: merge_1.merge,
    collectConstructors: collectConstructors_1.collectConstructors,
};
const wrapThis = (method) => {
    const result = function (instance, ...args) {
        const instanceContext = instance !== undefined ? instance : this;
        let wrapResult;
        if (new.target) {
            wrapResult = new method(instanceContext, ...args);
        }
        else {
            wrapResult = method(instanceContext, ...args);
        }
        return wrapResult;
    };
    return result;
};
exports.utils = Object.assign({}, Object.entries(utilsUnWrapped)
    .reduce((methods, util) => {
    const [name, fn] = util;
    methods[name] = wrapThis(fn);
    return methods;
}, {}));
var defineStackCleaner_1 = require("./defineStackCleaner");
Object.defineProperty(exports, "defineStackCleaner", { enumerable: true, get: function () { return defineStackCleaner_1.defineStackCleaner; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFPYiwrREFBNEQ7QUFDNUQsdUNBQW9DO0FBQ3BDLHFDQUFrQztBQUNsQywrQ0FBNEM7QUFDNUMsaUNBQThCO0FBQzlCLHVDQUFvQztBQUNwQywyQ0FBd0M7QUFDeEMsaUNBQThCO0FBQzlCLG1DQUFnQztBQUNoQyxxQ0FBa0M7QUFDbEMsbUNBQWdDO0FBQ2hDLG1DQUFnQztBQUVoQyxNQUFNLGNBQWMsR0FBRztJQUV0QixPQUFPLEVBQVAsaUJBQU87SUFDUCxJQUFJLEVBQUosV0FBSTtJQUVKLE1BQU0sRUFBTixlQUFNO0lBQ04sV0FBVyxFQUFYLHlCQUFXO0lBQ1gsT0FBTyxFQUFQLGlCQUFPO0lBQ1AsU0FBUyxFQUFULHFCQUFTO0lBQ1QsSUFBSSxFQUFKLFdBQUk7SUFDSixLQUFLLEVBQUwsYUFBSztJQUVMLE1BQU0sRUFBTixlQUFNO0lBRU4sS0FBSyxFQUFMLGFBQUs7SUFDTCxLQUFLLEVBQUwsYUFBSztJQUVMLG1CQUFtQixFQUFuQix5Q0FBbUI7Q0FFbkIsQ0FBQztBQUVGLE1BQU0sUUFBUSxHQUFHLENBQUUsTUFBdUIsRUFBRyxFQUFFO0lBQzlDLE1BQU0sTUFBTSxHQUFHLFVBQXlCLFFBQTRCLEVBQUUsR0FBRyxJQUFlO1FBQ3ZGLE1BQU0sZUFBZSxHQUFHLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2pFLElBQUksVUFBbUIsQ0FBQztRQUN4QixJQUFLLEdBQUcsQ0FBQyxNQUFNLEVBQUcsQ0FBQztZQUNsQixVQUFVLEdBQUcsSUFBSyxNQUFzRCxDQUN2RSxlQUFlLEVBQ2YsR0FBRyxJQUFJLENBQ1AsQ0FBQztRQUNILENBQUM7YUFBTSxDQUFDO1lBQ1AsVUFBVSxHQUFHLE1BQU0sQ0FDbEIsZUFBZSxFQUNmLEdBQUcsSUFBSSxDQUNQLENBQUM7UUFDSCxDQUFDO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDbkIsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDLENBQUM7QUFFVyxRQUFBLEtBQUssR0FBRyxrQkFFakIsTUFBTSxDQUFDLE9BQU8sQ0FBRSxjQUFjLENBQUU7S0FDakMsTUFBTSxDQUNOLENBQUUsT0FBZ0QsRUFBRSxJQUFJLEVBQUcsRUFBRTtJQUM1RCxNQUFNLENBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBQztJQUMxQixPQUFPLENBQUUsSUFBSSxDQUFFLEdBQUcsUUFBUSxDQUFFLEVBQUUsQ0FBRSxDQUFDO0lBQ2pDLE9BQU8sT0FBTyxDQUFDO0FBQ2hCLENBQUMsRUFDRCxFQUFFLENBQ0YsQ0FFaUIsQ0FBQztBQUVyQiwyREFBMEQ7QUFBakQsd0hBQUEsa0JBQWtCLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0eXBlIHtcblx0V3JhcHBhYmxlTWV0aG9kLFxuXHRVdGlsc0NvbGxlY3Rpb25cbn0gZnJvbSAnLi4vdHlwZXMnO1xuXG5pbXBvcnQgeyBjb2xsZWN0Q29uc3RydWN0b3JzIH0gZnJvbSAnLi9jb2xsZWN0Q29uc3RydWN0b3JzJztcbmltcG9ydCB7IGV4dHJhY3QgfSBmcm9tICcuL2V4dHJhY3QnO1xuaW1wb3J0IHsgcGFyZW50IH0gZnJvbSAnLi9wYXJlbnQnO1xuaW1wb3J0IHsgcGFyZW50VHlwZWQgfSBmcm9tICcuL3BhcmVudFR5cGVkJztcbmltcG9ydCB7IHBpY2sgfSBmcm9tICcuL3BpY2snO1xuaW1wb3J0IHsgc2libGluZyB9IGZyb20gJy4vc2libGluZyc7XG5pbXBvcnQgeyBleGNlcHRpb24gfSBmcm9tICcuL2V4Y2VwdGlvbic7XG5pbXBvcnQgeyBmb3JrIH0gZnJvbSAnLi9mb3JrJztcbmltcG9ydCB7IGNsb25lIH0gZnJvbSAnLi9jbG9uZSc7XG5pbXBvcnQgeyB0b0pTT04gfSBmcm9tICcuL3RvSlNPTic7XG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gJy4vcGFyc2UnO1xuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tICcuL21lcmdlJztcblxuY29uc3QgdXRpbHNVbldyYXBwZWQgPSB7XG5cblx0ZXh0cmFjdCxcblx0cGljayxcblxuXHRwYXJlbnQsXG5cdHBhcmVudFR5cGVkLFxuXHRzaWJsaW5nLFxuXHRleGNlcHRpb24sXG5cdGZvcmssXG5cdGNsb25lLFxuXG5cdHRvSlNPTixcblxuXHRwYXJzZSxcblx0bWVyZ2UsXG5cblx0Y29sbGVjdENvbnN0cnVjdG9ycyxcblxufTtcblxuY29uc3Qgd3JhcFRoaXMgPSAoIG1ldGhvZDogV3JhcHBhYmxlTWV0aG9kICkgPT4ge1xuXHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoIHRoaXM6IG9iamVjdCwgaW5zdGFuY2U6IG9iamVjdCB8IHVuZGVmaW5lZCwgLi4uYXJnczogdW5rbm93bltdICkge1xuXHRcdGNvbnN0IGluc3RhbmNlQ29udGV4dCA9IGluc3RhbmNlICE9PSB1bmRlZmluZWQgPyBpbnN0YW5jZSA6IHRoaXM7XG5cdFx0bGV0IHdyYXBSZXN1bHQ6IHVua25vd247XG5cdFx0aWYgKCBuZXcudGFyZ2V0ICkge1xuXHRcdFx0d3JhcFJlc3VsdCA9IG5ldyAobWV0aG9kIGFzIHVua25vd24gYXMgbmV3ICguLi5hOiB1bmtub3duW10pID0+IHVua25vd24pKFxuXHRcdFx0XHRpbnN0YW5jZUNvbnRleHQsXG5cdFx0XHRcdC4uLmFyZ3Ncblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHdyYXBSZXN1bHQgPSBtZXRob2QoXG5cdFx0XHRcdGluc3RhbmNlQ29udGV4dCxcblx0XHRcdFx0Li4uYXJncyBcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiB3cmFwUmVzdWx0O1xuXHR9O1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGNvbnN0IHV0aWxzID0ge1xuXG5cdC4uLk9iamVjdC5lbnRyaWVzKCB1dGlsc1VuV3JhcHBlZCApXG5cdFx0LnJlZHVjZShcblx0XHRcdCggbWV0aG9kczogeyBbIGluZGV4OiBzdHJpbmcgXTogQ2FsbGFibGVGdW5jdGlvbiB9LCB1dGlsICkgPT4ge1xuXHRcdFx0XHRjb25zdCBbIG5hbWUsIGZuIF0gPSB1dGlsO1xuXHRcdFx0XHRtZXRob2RzWyBuYW1lIF0gPSB3cmFwVGhpcyggZm4gKTtcblx0XHRcdFx0cmV0dXJuIG1ldGhvZHM7XG5cdFx0XHR9LFxuXHRcdFx0e31cblx0XHQpLFxuXG59IGFzIFV0aWxzQ29sbGVjdGlvbjtcblxuZXhwb3J0IHsgZGVmaW5lU3RhY2tDbGVhbmVyIH0gZnJvbSAnLi9kZWZpbmVTdGFja0NsZWFuZXInO1xuIl19