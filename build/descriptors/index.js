'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
const errors_1 = require('./errors');
const namespaces_1 = require('./namespaces');
const types_1 = require('./types');
const fascade = Object.assign(Object.assign(Object.assign({}, namespaces_1.namespaces), types_1.types), { errors : Object.assign({}, errors_1.ErrorsTypes) });
exports.default = Object.assign({}, fascade);
