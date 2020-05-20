'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.descriptors = void 0;
const errors_1 = require('./errors');
const namespaces_1 = require('./namespaces');
const types_1 = require('./types');
exports.descriptors = Object.assign(Object.assign(Object.assign({}, namespaces_1.namespaces), types_1.types), { ErrorsTypes : errors_1.ErrorsTypes });
