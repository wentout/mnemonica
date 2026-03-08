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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYiwrREFBNEQ7QUFDNUQsdUNBQW9DO0FBQ3BDLHFDQUFrQztBQUNsQyxpQ0FBOEI7QUFDOUIscUNBQWtDO0FBQ2xDLG1DQUFnQztBQUNoQyxtQ0FBZ0M7QUFFaEMsTUFBTSxjQUFjLEdBQUc7SUFFdEIsT0FBTyxFQUFQLGlCQUFPO0lBQ1AsSUFBSSxFQUFKLFdBQUk7SUFFSixNQUFNLEVBQU4sZUFBTTtJQUVOLE1BQU0sRUFBTixlQUFNO0lBRU4sS0FBSyxFQUFMLGFBQUs7SUFDTCxLQUFLLEVBQUwsYUFBSztJQUVMLElBQUksbUJBQW1CO1FBQ3RCLE9BQU8seUNBQW1CLENBQUM7SUFDNUIsQ0FBQztDQUVELENBQUM7QUFFRixNQUFNLFFBQVEsR0FBRyxDQUFFLE1BQXdCLEVBQUcsRUFBRTtJQUMvQyxPQUFPLFVBQXlCLFFBQTRCLEVBQUUsR0FBRyxJQUFlO1FBQy9FLE9BQU8sTUFBTSxDQUFFLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFFLENBQUM7SUFDcEUsQ0FBQyxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRVcsUUFBQSxLQUFLLHFCQUVkLE1BQU0sQ0FBQyxPQUFPLENBQUUsY0FBYyxDQUFFO0tBQ2pDLE1BQU0sQ0FBRSxDQUFFLE9BQWdELEVBQUUsSUFBSSxFQUFHLEVBQUU7SUFDckUsTUFBTSxDQUFFLElBQUksRUFBRSxFQUFFLENBQUUsR0FBRyxJQUFJLENBQUM7SUFDMUIsT0FBTyxDQUFFLElBQUksQ0FBRSxHQUFHLFFBQVEsQ0FBRSxFQUFFLENBQUUsQ0FBQztJQUNqQyxPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDLEVBQUUsRUFBRSxDQUFFLEVBRVA7QUFFRiwyREFBMEQ7QUFBakQsd0hBQUEsa0JBQWtCLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IGNvbGxlY3RDb25zdHJ1Y3RvcnMgfSBmcm9tICcuL2NvbGxlY3RDb25zdHJ1Y3RvcnMnO1xuaW1wb3J0IHsgZXh0cmFjdCB9IGZyb20gJy4vZXh0cmFjdCc7XG5pbXBvcnQgeyBwYXJlbnQgfSBmcm9tICcuL3BhcmVudCc7XG5pbXBvcnQgeyBwaWNrIH0gZnJvbSAnLi9waWNrJztcbmltcG9ydCB7IHRvSlNPTiB9IGZyb20gJy4vdG9KU09OJztcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSAnLi9wYXJzZSc7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gJy4vbWVyZ2UnO1xuXG5jb25zdCB1dGlsc1VuV3JhcHBlZCA9IHtcblxuXHRleHRyYWN0LFxuXHRwaWNrLFxuXG5cdHBhcmVudCxcblxuXHR0b0pTT04sXG5cblx0cGFyc2UsXG5cdG1lcmdlLFxuXG5cdGdldCBjb2xsZWN0Q29uc3RydWN0b3JzICgpIHtcblx0XHRyZXR1cm4gY29sbGVjdENvbnN0cnVjdG9ycztcblx0fSxcblxufTtcblxuY29uc3Qgd3JhcFRoaXMgPSAoIG1ldGhvZDogQ2FsbGFibGVGdW5jdGlvbiApID0+IHtcblx0cmV0dXJuIGZ1bmN0aW9uICggdGhpczogb2JqZWN0LCBpbnN0YW5jZTogb2JqZWN0IHwgdW5kZWZpbmVkLCAuLi5hcmdzOiB1bmtub3duW10gKSB7XG5cdFx0cmV0dXJuIG1ldGhvZCggaW5zdGFuY2UgIT09IHVuZGVmaW5lZCA/IGluc3RhbmNlIDogdGhpcywgLi4uYXJncyApO1xuXHR9O1xufTtcblxuZXhwb3J0IGNvbnN0IHV0aWxzOiB7IFsgaW5kZXg6IHN0cmluZyBdOiBDYWxsYWJsZUZ1bmN0aW9uIH0gPSB7XG5cblx0Li4uT2JqZWN0LmVudHJpZXMoIHV0aWxzVW5XcmFwcGVkIClcblx0XHQucmVkdWNlKCAoIG1ldGhvZHM6IHsgWyBpbmRleDogc3RyaW5nIF06IENhbGxhYmxlRnVuY3Rpb24gfSwgdXRpbCApID0+IHtcblx0XHRcdGNvbnN0IFsgbmFtZSwgZm4gXSA9IHV0aWw7XG5cdFx0XHRtZXRob2RzWyBuYW1lIF0gPSB3cmFwVGhpcyggZm4gKTtcblx0XHRcdHJldHVybiBtZXRob2RzO1xuXHRcdH0sIHt9ICksXG5cbn07XG5cbmV4cG9ydCB7IGRlZmluZVN0YWNrQ2xlYW5lciB9IGZyb20gJy4vZGVmaW5lU3RhY2tDbGVhbmVyJztcbiJdfQ==