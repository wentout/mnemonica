'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.ErrorsTypes = void 0;
const constants_1 = require('../../constants');
const { ErrorMessages, } = constants_1.constants;
const errors_1 = require('../../api/errors');
const { BASE_MNEMONICA_ERROR, constructError, } = errors_1.default;
exports.ErrorsTypes = {};
exports.ErrorsTypes['BASE_MNEMONICA_ERROR'] = BASE_MNEMONICA_ERROR;
Object.entries(ErrorMessages).forEach(entry => {
    const [ErrorConstructorName, message] = entry;
    const ErrorConstructor = constructError(ErrorConstructorName, message);
    exports.ErrorsTypes[ErrorConstructorName] = ErrorConstructor;
});
