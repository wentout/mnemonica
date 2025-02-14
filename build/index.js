'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.defineStackCleaner = exports.utils = exports.errors = exports.defaultCollection = exports.createTypesCollection = exports.ErrorMessages = exports.TYPE_TITLE_PREFIX = exports.URANUS = exports.GAIA = exports.MNEMOSYNE = exports.MNEMONICA = exports.SymbolConfig = exports.SymbolDefaultTypesCollection = exports.SymbolReplaceUranus = exports.SymbolGaia = exports.SymbolConstructorName = exports.SymbolParentType = exports.mnemonica = exports.registerHook = exports.decorate = exports.bind = exports.call = exports.apply = exports.lookup = exports.define = exports.defaultTypes = void 0;
const constants_1 = require('./constants');
const { odp } = constants_1.constants;
const errorsApi = require('./api/errors');
const descriptors_1 = require('./descriptors');
exports.defaultTypes = descriptors_1.descriptors.defaultTypes;
function checkThis (pointer) {
	return pointer === exports.mnemonica || pointer === exports;
}
const define = function (TypeName, constructHandler, proto, config) {
	const types = checkThis(this) ? exports.defaultTypes : this || exports.defaultTypes;
	return types.define(TypeName, constructHandler, proto, config);
};
exports.define = define;
exports.lookup = function (TypeNestedPath) {
	const types = checkThis(this) ? exports.defaultTypes : this || exports.defaultTypes;
	return types.lookup(TypeNestedPath);
};
const apply = function (entity, Constructor, args = []) {
	const result = new entity[ Constructor.TypeName ](...args);
	return result;
};
exports.apply = apply;
const call = function (entity, Constructor, ...args) {
	const result = new entity[ Constructor.TypeName ](...args);
	return result;
};
exports.call = call;
const bind = function (entity, Constructor) {
	return (...args) => {
		const result = new entity[ Constructor.TypeName ](...args);
		return result;
	};
};
exports.bind = bind;
const decorate = function (parentClass = undefined, proto, config) {
	const decorator = function (cstr, s) {
		if (parentClass === undefined) {
			return (0, exports.define)(s.name, cstr, proto, config);
		}
		return parentClass.define(s.name, cstr, proto, config);
	};
	return decorator;
};
exports.decorate = decorate;
const registerHook = function (Constructor, hookType, cb) {
	Constructor.registerHook(hookType, cb);
};
exports.registerHook = registerHook;
exports.mnemonica = Object.entries(Object.assign(Object.assign(Object.assign({ define       : exports.define,
	lookup       : exports.lookup,
	apply        : exports.apply,
	call         : exports.call,
	bind         : exports.bind,
	decorate     : exports.decorate,
	registerHook : exports.registerHook }, descriptors_1.descriptors), errorsApi), constants_1.constants)).reduce((acc, entry) => {
	const [ name, code ] = entry;
	odp(acc, name, {
		get () {
			return code;
		},
		enumerable : true
	});
	return acc;
}, {});
exports.SymbolParentType = exports.mnemonica.SymbolParentType, exports.SymbolConstructorName = exports.mnemonica.SymbolConstructorName, exports.SymbolGaia = exports.mnemonica.SymbolGaia, exports.SymbolReplaceUranus = exports.mnemonica.SymbolReplaceUranus, exports.SymbolDefaultTypesCollection = exports.mnemonica.SymbolDefaultTypesCollection, exports.SymbolConfig = exports.mnemonica.SymbolConfig, exports.MNEMONICA = exports.mnemonica.MNEMONICA, exports.MNEMOSYNE = exports.mnemonica.MNEMOSYNE, exports.GAIA = exports.mnemonica.GAIA, exports.URANUS = exports.mnemonica.URANUS, exports.TYPE_TITLE_PREFIX = exports.mnemonica.TYPE_TITLE_PREFIX, exports.ErrorMessages = exports.mnemonica.ErrorMessages, exports.createTypesCollection = exports.mnemonica.createTypesCollection;
exports.defaultCollection = exports.defaultTypes.subtypes;
exports.errors = descriptors_1.descriptors.ErrorsTypes;
var utils_1 = require('./utils');
Object.defineProperty(exports, 'utils', { enumerable : true, get : function () { return utils_1.utils; } });
var utils_2 = require('./utils');
Object.defineProperty(exports, 'defineStackCleaner', { enumerable : true, get : function () { return utils_2.defineStackCleaner; } });
//# sourceMappingURL=index.js.map