'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineStackCleaner = exports.utils = void 0;
const collectConstructors_1 = require("./collectConstructors");
const extract_1 = require("./extract");
const parent_1 = require("./parent");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFPYiwrREFBNEQ7QUFDNUQsdUNBQW9DO0FBQ3BDLHFDQUFrQztBQUNsQyxpQ0FBOEI7QUFDOUIsdUNBQW9DO0FBQ3BDLDJDQUF3QztBQUN4QyxpQ0FBOEI7QUFDOUIsbUNBQWdDO0FBQ2hDLHFDQUFrQztBQUNsQyxtQ0FBZ0M7QUFDaEMsbUNBQWdDO0FBRWhDLE1BQU0sY0FBYyxHQUFHO0lBRXRCLE9BQU8sRUFBUCxpQkFBTztJQUNQLElBQUksRUFBSixXQUFJO0lBRUosTUFBTSxFQUFOLGVBQU07SUFDTixPQUFPLEVBQVAsaUJBQU87SUFDUCxTQUFTLEVBQVQscUJBQVM7SUFDVCxJQUFJLEVBQUosV0FBSTtJQUNKLEtBQUssRUFBTCxhQUFLO0lBRUwsTUFBTSxFQUFOLGVBQU07SUFFTixLQUFLLEVBQUwsYUFBSztJQUNMLEtBQUssRUFBTCxhQUFLO0lBRUwsbUJBQW1CLEVBQW5CLHlDQUFtQjtDQUVuQixDQUFDO0FBRUYsTUFBTSxRQUFRLEdBQUcsQ0FBRSxNQUF1QixFQUFHLEVBQUU7SUFDOUMsTUFBTSxNQUFNLEdBQUcsVUFBeUIsUUFBNEIsRUFBRSxHQUFHLElBQWU7UUFDdkYsTUFBTSxlQUFlLEdBQUcsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDakUsSUFBSSxVQUFtQixDQUFDO1FBQ3hCLElBQUssR0FBRyxDQUFDLE1BQU0sRUFBRyxDQUFDO1lBQ2xCLFVBQVUsR0FBRyxJQUFLLE1BQXNELENBQ3ZFLGVBQWUsRUFDZixHQUFHLElBQUksQ0FDUCxDQUFDO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDUCxVQUFVLEdBQUcsTUFBTSxDQUNsQixlQUFlLEVBQ2YsR0FBRyxJQUFJLENBQ1AsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLFVBQVUsQ0FBQztJQUNuQixDQUFDLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVXLFFBQUEsS0FBSyxHQUFHLGtCQUVqQixNQUFNLENBQUMsT0FBTyxDQUFFLGNBQWMsQ0FBRTtLQUNqQyxNQUFNLENBQ04sQ0FBRSxPQUFnRCxFQUFFLElBQUksRUFBRyxFQUFFO0lBQzVELE1BQU0sQ0FBRSxJQUFJLEVBQUUsRUFBRSxDQUFFLEdBQUcsSUFBSSxDQUFDO0lBQzFCLE9BQU8sQ0FBRSxJQUFJLENBQUUsR0FBRyxRQUFRLENBQUUsRUFBRSxDQUFFLENBQUM7SUFDakMsT0FBTyxPQUFPLENBQUM7QUFDaEIsQ0FBQyxFQUNELEVBQUUsQ0FDRixDQUVpQixDQUFDO0FBRXJCLDJEQUEwRDtBQUFqRCx3SEFBQSxrQkFBa0IsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHR5cGUge1xuXHRXcmFwcGFibGVNZXRob2QsXG5cdFV0aWxzQ29sbGVjdGlvblxufSBmcm9tICcuLi90eXBlcyc7XG5cbmltcG9ydCB7IGNvbGxlY3RDb25zdHJ1Y3RvcnMgfSBmcm9tICcuL2NvbGxlY3RDb25zdHJ1Y3RvcnMnO1xuaW1wb3J0IHsgZXh0cmFjdCB9IGZyb20gJy4vZXh0cmFjdCc7XG5pbXBvcnQgeyBwYXJlbnQgfSBmcm9tICcuL3BhcmVudCc7XG5pbXBvcnQgeyBwaWNrIH0gZnJvbSAnLi9waWNrJztcbmltcG9ydCB7IHNpYmxpbmcgfSBmcm9tICcuL3NpYmxpbmcnO1xuaW1wb3J0IHsgZXhjZXB0aW9uIH0gZnJvbSAnLi9leGNlcHRpb24nO1xuaW1wb3J0IHsgZm9yayB9IGZyb20gJy4vZm9yayc7XG5pbXBvcnQgeyBjbG9uZSB9IGZyb20gJy4vY2xvbmUnO1xuaW1wb3J0IHsgdG9KU09OIH0gZnJvbSAnLi90b0pTT04nO1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICcuL3BhcnNlJztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSAnLi9tZXJnZSc7XG5cbmNvbnN0IHV0aWxzVW5XcmFwcGVkID0ge1xuXG5cdGV4dHJhY3QsXG5cdHBpY2ssXG5cblx0cGFyZW50LFxuXHRzaWJsaW5nLFxuXHRleGNlcHRpb24sXG5cdGZvcmssXG5cdGNsb25lLFxuXG5cdHRvSlNPTixcblxuXHRwYXJzZSxcblx0bWVyZ2UsXG5cblx0Y29sbGVjdENvbnN0cnVjdG9ycyxcblxufTtcblxuY29uc3Qgd3JhcFRoaXMgPSAoIG1ldGhvZDogV3JhcHBhYmxlTWV0aG9kICkgPT4ge1xuXHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoIHRoaXM6IG9iamVjdCwgaW5zdGFuY2U6IG9iamVjdCB8IHVuZGVmaW5lZCwgLi4uYXJnczogdW5rbm93bltdICkge1xuXHRcdGNvbnN0IGluc3RhbmNlQ29udGV4dCA9IGluc3RhbmNlICE9PSB1bmRlZmluZWQgPyBpbnN0YW5jZSA6IHRoaXM7XG5cdFx0bGV0IHdyYXBSZXN1bHQ6IHVua25vd247XG5cdFx0aWYgKCBuZXcudGFyZ2V0ICkge1xuXHRcdFx0d3JhcFJlc3VsdCA9IG5ldyAobWV0aG9kIGFzIHVua25vd24gYXMgbmV3ICguLi5hOiB1bmtub3duW10pID0+IHVua25vd24pKFxuXHRcdFx0XHRpbnN0YW5jZUNvbnRleHQsXG5cdFx0XHRcdC4uLmFyZ3Ncblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHdyYXBSZXN1bHQgPSBtZXRob2QoXG5cdFx0XHRcdGluc3RhbmNlQ29udGV4dCxcblx0XHRcdFx0Li4uYXJncyBcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiB3cmFwUmVzdWx0O1xuXHR9O1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGNvbnN0IHV0aWxzID0ge1xuXG5cdC4uLk9iamVjdC5lbnRyaWVzKCB1dGlsc1VuV3JhcHBlZCApXG5cdFx0LnJlZHVjZShcblx0XHRcdCggbWV0aG9kczogeyBbIGluZGV4OiBzdHJpbmcgXTogQ2FsbGFibGVGdW5jdGlvbiB9LCB1dGlsICkgPT4ge1xuXHRcdFx0XHRjb25zdCBbIG5hbWUsIGZuIF0gPSB1dGlsO1xuXHRcdFx0XHRtZXRob2RzWyBuYW1lIF0gPSB3cmFwVGhpcyggZm4gKTtcblx0XHRcdFx0cmV0dXJuIG1ldGhvZHM7XG5cdFx0XHR9LFxuXHRcdFx0e31cblx0XHQpLFxuXG59IGFzIFV0aWxzQ29sbGVjdGlvbjtcblxuZXhwb3J0IHsgZGVmaW5lU3RhY2tDbGVhbmVyIH0gZnJvbSAnLi9kZWZpbmVTdGFja0NsZWFuZXInO1xuIl19