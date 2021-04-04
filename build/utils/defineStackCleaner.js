'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.defineStackCleaner = void 0;
const errors_1 = require('../descriptors/errors');
const errors_2 = require('../api/errors');
const { WRONG_STACK_CLEANER } = errors_1.ErrorsTypes;
const defineStackCleaner = (regexp) => {
	if (!(regexp instanceof RegExp)) {
		throw new WRONG_STACK_CLEANER;
	}
	errors_2.stackCleaners.push(regexp);
};
exports.defineStackCleaner = defineStackCleaner;
