'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineStackCleaner = exports.utils = void 0;
const collectConstructors_1 = require("./collectConstructors");
const extract_1 = require("./extract");
const parent_1 = require("./parent");
const pick_1 = require("./pick");
const toJSON_1 = require("./toJSON");
const parse_1 = require("./parse");
const merge_1 = require("./merge");
const utilsUnWrapped = {
    extract: extract_1.extract,
    pick: pick_1.pick,
    parent: parent_1.parent,
    toJSON: toJSON_1.toJSON,
    parse: parse_1.parse,
    merge: merge_1.merge,
    get collectConstructors() {
        return collectConstructors_1.collectConstructors;
    },
};
const wrapThis = (method) => {
    return function (instance, ...args) {
        return method(instance !== undefined ? instance : this, ...args);
    };
};
exports.utils = {
    ...Object.entries(utilsUnWrapped)
        .reduce((methods, util) => {
        const [name, fn] = util;
        methods[name] = wrapThis(fn);
        return methods;
    }, {}),
};
var defineStackCleaner_1 = require("./defineStackCleaner");
Object.defineProperty(exports, "defineStackCleaner", { enumerable: true, get: function () { return defineStackCleaner_1.defineStackCleaner; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYiwrREFBNEQ7QUFDNUQsdUNBQW9DO0FBQ3BDLHFDQUFrQztBQUNsQyxpQ0FBOEI7QUFDOUIscUNBQWtDO0FBQ2xDLG1DQUFnQztBQUNoQyxtQ0FBZ0M7QUFFaEMsTUFBTSxjQUFjLEdBQUc7SUFFdEIsT0FBTyxFQUFQLGlCQUFPO0lBQ1AsSUFBSSxFQUFKLFdBQUk7SUFFSixNQUFNLEVBQU4sZUFBTTtJQUVOLE1BQU0sRUFBTixlQUFNO0lBRU4sS0FBSyxFQUFMLGFBQUs7SUFDTCxLQUFLLEVBQUwsYUFBSztJQUVMLElBQUksbUJBQW1CO1FBQ3RCLE9BQU8seUNBQW1CLENBQUM7SUFDNUIsQ0FBQztDQUVELENBQUM7QUFFRixNQUFNLFFBQVEsR0FBRyxDQUFFLE1BQXdCLEVBQUcsRUFBRTtJQUMvQyxPQUFPLFVBQXlCLFFBQTRCLEVBQUUsR0FBRyxJQUFlO1FBQy9FLE9BQU8sTUFBTSxDQUFFLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFFLENBQUM7SUFDcEUsQ0FBQyxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRVcsUUFBQSxLQUFLLEdBQTRDO0lBRTdELEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBRSxjQUFjLENBQUU7U0FDakMsTUFBTSxDQUFFLENBQUUsT0FBZ0QsRUFBRSxJQUFJLEVBQUcsRUFBRTtRQUNyRSxNQUFNLENBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBQztRQUMxQixPQUFPLENBQUUsSUFBSSxDQUFFLEdBQUcsUUFBUSxDQUFFLEVBQUUsQ0FBRSxDQUFDO1FBQ2pDLE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUMsRUFBRSxFQUFFLENBQUU7Q0FFUixDQUFDO0FBRUYsMkRBQTBEO0FBQWpELHdIQUFBLGtCQUFrQixPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBjb2xsZWN0Q29uc3RydWN0b3JzIH0gZnJvbSAnLi9jb2xsZWN0Q29uc3RydWN0b3JzJztcbmltcG9ydCB7IGV4dHJhY3QgfSBmcm9tICcuL2V4dHJhY3QnO1xuaW1wb3J0IHsgcGFyZW50IH0gZnJvbSAnLi9wYXJlbnQnO1xuaW1wb3J0IHsgcGljayB9IGZyb20gJy4vcGljayc7XG5pbXBvcnQgeyB0b0pTT04gfSBmcm9tICcuL3RvSlNPTic7XG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gJy4vcGFyc2UnO1xuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tICcuL21lcmdlJztcblxuY29uc3QgdXRpbHNVbldyYXBwZWQgPSB7XG5cblx0ZXh0cmFjdCxcblx0cGljayxcblxuXHRwYXJlbnQsXG5cblx0dG9KU09OLFxuXG5cdHBhcnNlLFxuXHRtZXJnZSxcblxuXHRnZXQgY29sbGVjdENvbnN0cnVjdG9ycyAoKSB7XG5cdFx0cmV0dXJuIGNvbGxlY3RDb25zdHJ1Y3RvcnM7XG5cdH0sXG5cbn07XG5cbmNvbnN0IHdyYXBUaGlzID0gKCBtZXRob2Q6IENhbGxhYmxlRnVuY3Rpb24gKSA9PiB7XG5cdHJldHVybiBmdW5jdGlvbiAoIHRoaXM6IG9iamVjdCwgaW5zdGFuY2U6IG9iamVjdCB8IHVuZGVmaW5lZCwgLi4uYXJnczogdW5rbm93bltdICkge1xuXHRcdHJldHVybiBtZXRob2QoIGluc3RhbmNlICE9PSB1bmRlZmluZWQgPyBpbnN0YW5jZSA6IHRoaXMsIC4uLmFyZ3MgKTtcblx0fTtcbn07XG5cbmV4cG9ydCBjb25zdCB1dGlsczogeyBbIGluZGV4OiBzdHJpbmcgXTogQ2FsbGFibGVGdW5jdGlvbiB9ID0ge1xuXG5cdC4uLk9iamVjdC5lbnRyaWVzKCB1dGlsc1VuV3JhcHBlZCApXG5cdFx0LnJlZHVjZSggKCBtZXRob2RzOiB7IFsgaW5kZXg6IHN0cmluZyBdOiBDYWxsYWJsZUZ1bmN0aW9uIH0sIHV0aWwgKSA9PiB7XG5cdFx0XHRjb25zdCBbIG5hbWUsIGZuIF0gPSB1dGlsO1xuXHRcdFx0bWV0aG9kc1sgbmFtZSBdID0gd3JhcFRoaXMoIGZuICk7XG5cdFx0XHRyZXR1cm4gbWV0aG9kcztcblx0XHR9LCB7fSApLFxuXG59O1xuXG5leHBvcnQgeyBkZWZpbmVTdGFja0NsZWFuZXIgfSBmcm9tICcuL2RlZmluZVN0YWNrQ2xlYW5lcic7XG4iXX0=