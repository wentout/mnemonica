'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.ErrorsTypes = void 0;
const constants_1 = require('../../constants');
const { ErrorMessages, } = constants_1.constants;
const errors_1 = require('../../api/errors');
exports.ErrorsTypes = {};
exports.ErrorsTypes['BASE_MNEMONICA_ERROR'] = errors_1.BASE_MNEMONICA_ERROR;
Object.entries(ErrorMessages).forEach(entry => {
    const [ErrorConstructorName, message] = entry;
    const ErrorConstructor = errors_1.constructError(ErrorConstructorName, message);
    exports.ErrorsTypes[ErrorConstructorName] = ErrorConstructor;
});
