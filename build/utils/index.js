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
exports.utils = Object.assign({}, Object.entries(utilsUnWrapped)
    .reduce((methods, util) => {
    const [name, fn] = util;
    methods[name] = wrapThis(fn);
    return methods;
}, {}));
var defineStackCleaner_1 = require("./defineStackCleaner");
Object.defineProperty(exports, "defineStackCleaner", { enumerable: true, get: function () { return defineStackCleaner_1.defineStackCleaner; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYiwrREFBNEQ7QUFDNUQsdUNBQW9DO0FBQ3BDLHFDQUFrQztBQUNsQyxpQ0FBOEI7QUFDOUIscUNBQWtDO0FBQ2xDLG1DQUFnQztBQUNoQyxtQ0FBZ0M7QUFFaEMsTUFBTSxjQUFjLEdBQUc7SUFFdEIsT0FBTyxFQUFQLGlCQUFPO0lBQ1AsSUFBSSxFQUFKLFdBQUk7SUFFSixNQUFNLEVBQU4sZUFBTTtJQUVOLE1BQU0sRUFBTixlQUFNO0lBRU4sS0FBSyxFQUFMLGFBQUs7SUFDTCxLQUFLLEVBQUwsYUFBSztJQUVMLElBQUksbUJBQW1CO1FBQ3RCLE9BQU8seUNBQW1CLENBQUM7SUFDNUIsQ0FBQztDQUVELENBQUM7QUFFRixNQUFNLFFBQVEsR0FBRyxDQUFFLE1BQXdCLEVBQUcsRUFBRTtJQUMvQyxPQUFPLFVBQXlCLFFBQTRCLEVBQUUsR0FBRyxJQUFlO1FBQy9FLE9BQU8sTUFBTSxDQUFFLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFFLENBQUM7SUFDcEUsQ0FBQyxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRVcsUUFBQSxLQUFLLHFCQUVkLE1BQU0sQ0FBQyxPQUFPLENBQUUsY0FBYyxDQUFFO0tBQ2pDLE1BQU0sQ0FBRSxDQUFFLE9BQWdELEVBQUUsSUFBSSxFQUFHLEVBQUU7SUFDckUsTUFBTSxDQUFFLElBQUksRUFBRSxFQUFFLENBQUUsR0FBRyxJQUFJLENBQUM7SUFDMUIsT0FBTyxDQUFFLElBQUksQ0FBRSxHQUFHLFFBQVEsQ0FBRSxFQUFFLENBQUUsQ0FBQztJQUNqQyxPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDLEVBQUUsRUFBRSxDQUFFLEVBRVA7QUFFRiwyREFBMEQ7QUFBakQsd0hBQUEsa0JBQWtCLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cblxuaW1wb3J0IHsgY29sbGVjdENvbnN0cnVjdG9ycyB9IGZyb20gJy4vY29sbGVjdENvbnN0cnVjdG9ycyc7XG5pbXBvcnQgeyBleHRyYWN0IH0gZnJvbSAnLi9leHRyYWN0JztcbmltcG9ydCB7IHBhcmVudCB9IGZyb20gJy4vcGFyZW50JztcbmltcG9ydCB7IHBpY2sgfSBmcm9tICcuL3BpY2snO1xuaW1wb3J0IHsgdG9KU09OIH0gZnJvbSAnLi90b0pTT04nO1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICcuL3BhcnNlJztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSAnLi9tZXJnZSc7XG5cbmNvbnN0IHV0aWxzVW5XcmFwcGVkID0ge1xuXG5cdGV4dHJhY3QsXG5cdHBpY2ssXG5cblx0cGFyZW50LFxuXG5cdHRvSlNPTixcblxuXHRwYXJzZSxcblx0bWVyZ2UsXG5cblx0Z2V0IGNvbGxlY3RDb25zdHJ1Y3RvcnMgKCkge1xuXHRcdHJldHVybiBjb2xsZWN0Q29uc3RydWN0b3JzO1xuXHR9LFxuXG59O1xuXG5jb25zdCB3cmFwVGhpcyA9ICggbWV0aG9kOiBDYWxsYWJsZUZ1bmN0aW9uICkgPT4ge1xuXHRyZXR1cm4gZnVuY3Rpb24gKCB0aGlzOiBvYmplY3QsIGluc3RhbmNlOiBvYmplY3QgfCB1bmRlZmluZWQsIC4uLmFyZ3M6IHVua25vd25bXSApIHtcblx0XHRyZXR1cm4gbWV0aG9kKCBpbnN0YW5jZSAhPT0gdW5kZWZpbmVkID8gaW5zdGFuY2UgOiB0aGlzLCAuLi5hcmdzICk7XG5cdH07XG59O1xuXG5leHBvcnQgY29uc3QgdXRpbHM6IHsgWyBpbmRleDogc3RyaW5nIF06IENhbGxhYmxlRnVuY3Rpb24gfSA9IHtcblxuXHQuLi5PYmplY3QuZW50cmllcyggdXRpbHNVbldyYXBwZWQgKVxuXHRcdC5yZWR1Y2UoICggbWV0aG9kczogeyBbIGluZGV4OiBzdHJpbmcgXTogQ2FsbGFibGVGdW5jdGlvbiB9LCB1dGlsICkgPT4ge1xuXHRcdFx0Y29uc3QgWyBuYW1lLCBmbiBdID0gdXRpbDtcblx0XHRcdG1ldGhvZHNbIG5hbWUgXSA9IHdyYXBUaGlzKCBmbiApO1xuXHRcdFx0cmV0dXJuIG1ldGhvZHM7XG5cdFx0fSwge30gKSxcblxufTtcblxuZXhwb3J0IHsgZGVmaW5lU3RhY2tDbGVhbmVyIH0gZnJvbSAnLi9kZWZpbmVTdGFja0NsZWFuZXInO1xuIl19