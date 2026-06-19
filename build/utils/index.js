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
        const wrapResult = method(instance !== undefined ? instance : this, ...args);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFJYiwrREFBNEQ7QUFDNUQsdUNBQW9DO0FBQ3BDLHFDQUFrQztBQUNsQyxpQ0FBOEI7QUFDOUIsdUNBQW9DO0FBQ3BDLDJDQUF3QztBQUN4QyxpQ0FBOEI7QUFDOUIsbUNBQWdDO0FBQ2hDLHFDQUFrQztBQUNsQyxtQ0FBZ0M7QUFDaEMsbUNBQWdDO0FBRWhDLE1BQU0sY0FBYyxHQUFHO0lBRXRCLE9BQU8sRUFBUCxpQkFBTztJQUNQLElBQUksRUFBSixXQUFJO0lBRUosTUFBTSxFQUFOLGVBQU07SUFDTixPQUFPLEVBQVAsaUJBQU87SUFDUCxTQUFTLEVBQVQscUJBQVM7SUFDVCxJQUFJLEVBQUosV0FBSTtJQUNKLEtBQUssRUFBTCxhQUFLO0lBRUwsTUFBTSxFQUFOLGVBQU07SUFFTixLQUFLLEVBQUwsYUFBSztJQUNMLEtBQUssRUFBTCxhQUFLO0lBRUwsbUJBQW1CLEVBQW5CLHlDQUFtQjtDQUVuQixDQUFDO0FBRUYsTUFBTSxRQUFRLEdBQUcsQ0FBRSxNQUF1QixFQUFHLEVBQUU7SUFDOUMsTUFBTSxNQUFNLEdBQUcsVUFBeUIsUUFBNEIsRUFBRSxHQUFHLElBQWU7UUFDdkYsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN4QixRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksRUFDeEMsR0FBRyxJQUFJLENBQ1AsQ0FBQztRQUNGLE9BQU8sVUFBVSxDQUFDO0lBQ25CLENBQUMsQ0FBQztJQUNGLE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRVcsUUFBQSxLQUFLLHFCQUVkLE1BQU0sQ0FBQyxPQUFPLENBQUUsY0FBYyxDQUFFO0tBQ2pDLE1BQU0sQ0FDTixDQUFFLE9BQWdELEVBQUUsSUFBSSxFQUFHLEVBQUU7SUFDNUQsTUFBTSxDQUFFLElBQUksRUFBRSxFQUFFLENBQUUsR0FBRyxJQUFJLENBQUM7SUFDMUIsT0FBTyxDQUFFLElBQUksQ0FBRSxHQUFHLFFBQVEsQ0FBRSxFQUFFLENBQUUsQ0FBQztJQUNqQyxPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDLEVBQ0QsRUFBRSxDQUNGLEVBRUQ7QUFFRiwyREFBMEQ7QUFBakQsd0hBQUEsa0JBQWtCLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0eXBlIHsgV3JhcHBhYmxlTWV0aG9kIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5pbXBvcnQgeyBjb2xsZWN0Q29uc3RydWN0b3JzIH0gZnJvbSAnLi9jb2xsZWN0Q29uc3RydWN0b3JzJztcbmltcG9ydCB7IGV4dHJhY3QgfSBmcm9tICcuL2V4dHJhY3QnO1xuaW1wb3J0IHsgcGFyZW50IH0gZnJvbSAnLi9wYXJlbnQnO1xuaW1wb3J0IHsgcGljayB9IGZyb20gJy4vcGljayc7XG5pbXBvcnQgeyBzaWJsaW5nIH0gZnJvbSAnLi9zaWJsaW5nJztcbmltcG9ydCB7IGV4Y2VwdGlvbiB9IGZyb20gJy4vZXhjZXB0aW9uJztcbmltcG9ydCB7IGZvcmsgfSBmcm9tICcuL2ZvcmsnO1xuaW1wb3J0IHsgY2xvbmUgfSBmcm9tICcuL2Nsb25lJztcbmltcG9ydCB7IHRvSlNPTiB9IGZyb20gJy4vdG9KU09OJztcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSAnLi9wYXJzZSc7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gJy4vbWVyZ2UnO1xuXG5jb25zdCB1dGlsc1VuV3JhcHBlZCA9IHtcblxuXHRleHRyYWN0LFxuXHRwaWNrLFxuXG5cdHBhcmVudCxcblx0c2libGluZyxcblx0ZXhjZXB0aW9uLFxuXHRmb3JrLFxuXHRjbG9uZSxcblxuXHR0b0pTT04sXG5cblx0cGFyc2UsXG5cdG1lcmdlLFxuXG5cdGNvbGxlY3RDb25zdHJ1Y3RvcnMsXG5cbn07XG5cbmNvbnN0IHdyYXBUaGlzID0gKCBtZXRob2Q6IFdyYXBwYWJsZU1ldGhvZCApID0+IHtcblx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKCB0aGlzOiBvYmplY3QsIGluc3RhbmNlOiBvYmplY3QgfCB1bmRlZmluZWQsIC4uLmFyZ3M6IHVua25vd25bXSApIHtcblx0XHRjb25zdCB3cmFwUmVzdWx0ID0gbWV0aG9kKFxuXHRcdFx0aW5zdGFuY2UgIT09IHVuZGVmaW5lZCA/IGluc3RhbmNlIDogdGhpcyxcblx0XHRcdC4uLmFyZ3MgXG5cdFx0KTtcblx0XHRyZXR1cm4gd3JhcFJlc3VsdDtcblx0fTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBjb25zdCB1dGlsczogeyBbIGluZGV4OiBzdHJpbmcgXTogQ2FsbGFibGVGdW5jdGlvbiB9ID0ge1xuXG5cdC4uLk9iamVjdC5lbnRyaWVzKCB1dGlsc1VuV3JhcHBlZCApXG5cdFx0LnJlZHVjZShcblx0XHRcdCggbWV0aG9kczogeyBbIGluZGV4OiBzdHJpbmcgXTogQ2FsbGFibGVGdW5jdGlvbiB9LCB1dGlsICkgPT4ge1xuXHRcdFx0XHRjb25zdCBbIG5hbWUsIGZuIF0gPSB1dGlsO1xuXHRcdFx0XHRtZXRob2RzWyBuYW1lIF0gPSB3cmFwVGhpcyggZm4gKTtcblx0XHRcdFx0cmV0dXJuIG1ldGhvZHM7XG5cdFx0XHR9LFxuXHRcdFx0e31cblx0XHQpLFxuXG59O1xuXG5leHBvcnQgeyBkZWZpbmVTdGFja0NsZWFuZXIgfSBmcm9tICcuL2RlZmluZVN0YWNrQ2xlYW5lcic7XG4iXX0=