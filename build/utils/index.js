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
        const result = method(instance !== undefined ? instance : this, ...args);
        return result;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYiwrREFBNEQ7QUFDNUQsdUNBQW9DO0FBQ3BDLHFDQUFrQztBQUNsQyxpQ0FBOEI7QUFDOUIscUNBQWtDO0FBQ2xDLG1DQUFnQztBQUNoQyxtQ0FBZ0M7QUFFaEMsTUFBTSxjQUFjLEdBQUc7SUFFdEIsT0FBTyxFQUFQLGlCQUFPO0lBQ1AsSUFBSSxFQUFKLFdBQUk7SUFFSixNQUFNLEVBQU4sZUFBTTtJQUVOLE1BQU0sRUFBTixlQUFNO0lBRU4sS0FBSyxFQUFMLGFBQUs7SUFDTCxLQUFLLEVBQUwsYUFBSztJQUVMLElBQUksbUJBQW1CO1FBQ3RCLE9BQU8seUNBQW1CLENBQUM7SUFDNUIsQ0FBQztDQUVELENBQUM7QUFFRixNQUFNLFFBQVEsR0FBRyxDQUFFLE1BQXdCLEVBQUcsRUFBRTtJQUMvQyxPQUFPLFVBQXlCLFFBQTRCLEVBQUUsR0FBRyxJQUFlO1FBQy9FLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FDcEIsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQ3hDLEdBQUcsSUFBSSxDQUNQLENBQUM7UUFDRixPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUMsQ0FBQztBQUNILENBQUMsQ0FBQztBQUVXLFFBQUEsS0FBSyxxQkFFZCxNQUFNLENBQUMsT0FBTyxDQUFFLGNBQWMsQ0FBRTtLQUNqQyxNQUFNLENBQ04sQ0FBRSxPQUFnRCxFQUFFLElBQUksRUFBRyxFQUFFO0lBQzVELE1BQU0sQ0FBRSxJQUFJLEVBQUUsRUFBRSxDQUFFLEdBQUcsSUFBSSxDQUFDO0lBQzFCLE9BQU8sQ0FBRSxJQUFJLENBQUUsR0FBRyxRQUFRLENBQUUsRUFBRSxDQUFFLENBQUM7SUFDakMsT0FBTyxPQUFPLENBQUM7QUFDaEIsQ0FBQyxFQUNELEVBQUUsQ0FDRixFQUVEO0FBRUYsMkRBQTBEO0FBQWpELHdIQUFBLGtCQUFrQixPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5cbmltcG9ydCB7IGNvbGxlY3RDb25zdHJ1Y3RvcnMgfSBmcm9tICcuL2NvbGxlY3RDb25zdHJ1Y3RvcnMnO1xuaW1wb3J0IHsgZXh0cmFjdCB9IGZyb20gJy4vZXh0cmFjdCc7XG5pbXBvcnQgeyBwYXJlbnQgfSBmcm9tICcuL3BhcmVudCc7XG5pbXBvcnQgeyBwaWNrIH0gZnJvbSAnLi9waWNrJztcbmltcG9ydCB7IHRvSlNPTiB9IGZyb20gJy4vdG9KU09OJztcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSAnLi9wYXJzZSc7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gJy4vbWVyZ2UnO1xuXG5jb25zdCB1dGlsc1VuV3JhcHBlZCA9IHtcblxuXHRleHRyYWN0LFxuXHRwaWNrLFxuXG5cdHBhcmVudCxcblxuXHR0b0pTT04sXG5cblx0cGFyc2UsXG5cdG1lcmdlLFxuXG5cdGdldCBjb2xsZWN0Q29uc3RydWN0b3JzICgpIHtcblx0XHRyZXR1cm4gY29sbGVjdENvbnN0cnVjdG9ycztcblx0fSxcblxufTtcblxuY29uc3Qgd3JhcFRoaXMgPSAoIG1ldGhvZDogQ2FsbGFibGVGdW5jdGlvbiApID0+IHtcblx0cmV0dXJuIGZ1bmN0aW9uICggdGhpczogb2JqZWN0LCBpbnN0YW5jZTogb2JqZWN0IHwgdW5kZWZpbmVkLCAuLi5hcmdzOiB1bmtub3duW10gKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gbWV0aG9kKFxuXHRcdFx0aW5zdGFuY2UgIT09IHVuZGVmaW5lZCA/IGluc3RhbmNlIDogdGhpcyxcblx0XHRcdC4uLmFyZ3MgXG5cdFx0KTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xufTtcblxuZXhwb3J0IGNvbnN0IHV0aWxzOiB7IFsgaW5kZXg6IHN0cmluZyBdOiBDYWxsYWJsZUZ1bmN0aW9uIH0gPSB7XG5cblx0Li4uT2JqZWN0LmVudHJpZXMoIHV0aWxzVW5XcmFwcGVkIClcblx0XHQucmVkdWNlKFxuXHRcdFx0KCBtZXRob2RzOiB7IFsgaW5kZXg6IHN0cmluZyBdOiBDYWxsYWJsZUZ1bmN0aW9uIH0sIHV0aWwgKSA9PiB7XG5cdFx0XHRcdGNvbnN0IFsgbmFtZSwgZm4gXSA9IHV0aWw7XG5cdFx0XHRcdG1ldGhvZHNbIG5hbWUgXSA9IHdyYXBUaGlzKCBmbiApO1xuXHRcdFx0XHRyZXR1cm4gbWV0aG9kcztcblx0XHRcdH0sXG5cdFx0XHR7fSBcblx0XHQpLFxuXG59O1xuXG5leHBvcnQgeyBkZWZpbmVTdGFja0NsZWFuZXIgfSBmcm9tICcuL2RlZmluZVN0YWNrQ2xlYW5lcic7XG4iXX0=