'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.utils = void 0;
const collectConstructors_1 = require('./collectConstructors');
const extract_1 = require('./extract');
const parent_1 = require('./parent');
const pick_1 = require('./pick');
const toJSON_1 = require('./toJSON');
const parse_1 = require('./parse');
const merge_1 = require('./merge');
const utilsUnWrapped = {
	extract : extract_1.extract,
	pick    : pick_1.pick,
	parent  : parent_1.parent,
	toJSON  : toJSON_1.toJSON,
	parse   : parse_1.parse,
	merge   : merge_1.merge,
	get collectConstructors () {
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
var defineStackCleaner_1 = require('./defineStackCleaner');
Object.defineProperty(exports, 'defineStackCleaner', { enumerable : true, get : function () { return defineStackCleaner_1.defineStackCleaner; } });
