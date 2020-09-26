'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
const constants_1 = require('../../constants');
const errors_1 = require('../../descriptors/errors');
const utils_1 = require('../../utils');
const { odp, SymbolConstructorName, MNEMONICA, MNEMOSYNE, GAIA, URANUS } = constants_1.constants;
const { WRONG_TYPE_DEFINITION, } = errors_1.ErrorsTypes;
const { collectConstructors } = utils_1.utils;
const CreationHandler = function (constructionAnswer) {
	if (constructionAnswer instanceof Object) {
		return constructionAnswer;
	}
	return this;
};
const compileNewModificatorFunctionBody_1 = require('../types/compileNewModificatorFunctionBody');
const createInstanceModificator200XthWay_1 = require('../types/createInstanceModificator200XthWay');
const createInstanceModificator_1 = require('../types/createInstanceModificator');
const getModificationConstructor = (useOldStyle) => {
	return (useOldStyle ? createInstanceModificator200XthWay_1.default : createInstanceModificator_1.default)();
};
const checkProto = (proto) => {
	if (!(proto instanceof Object)) {
		throw new WRONG_TYPE_DEFINITION('expect prototype to be an object');
	}
};
const getTypeChecker = (TypeName) => {
	const seeker = (instance) => {
		if (typeof instance !== 'object') {
			return false;
		}
		if (!instance.constructor) {
			return false;
		}
		if (Reflect.getPrototypeOf(instance).constructor.name === 'Promise') {
			return instance[SymbolConstructorName] === TypeName;
		}
		const constructors = collectConstructors(instance);
		return constructors[TypeName] || false;
	};
	return seeker;
};
const getTypeSplitPath = (path) => {
	const split = path
		.replace(/\n|\t| /g, '')
		.replace(/\[(\w+)\]/g, '.$1')
		.replace(/^\./, '')
		.split(/\.|\/|:/);
	return split;
};
const getExistentAsyncStack = (existentInstance) => {
	const stack = [];
	let proto = existentInstance;
	while (proto) {
		if (!proto.__stack__) {
			break;
		}
		const pstack = proto
			.__stack__
			.split('\n')
			.reduce((arr, line) => {
				if (line.length) {
					arr.push(line);
				}
				return arr;
			}, []);
		proto = proto.parent();
		if (proto && proto.__type__) {
			if (proto.__type__.isSubType) {
				stack.push(...pstack.slice(0, 1));
			}
			else {
				stack.push(...pstack);
			}
		}
		else {
			stack.push(...pstack);
			break;
		}
	}
	return stack;
};
const forbiddenNames = [MNEMONICA, MNEMOSYNE, GAIA, URANUS];
const checkTypeName = (name) => {
	if (!name.length) {
		throw new WRONG_TYPE_DEFINITION('TypeName must not be empty');
	}
	if (name[0] !== name[0].toUpperCase()) {
		throw new WRONG_TYPE_DEFINITION('TypeName should start with Uppercase Letter');
	}
	if (forbiddenNames.includes(name)) {
		throw new WRONG_TYPE_DEFINITION('TypeName of reserved keyword');
	}
};
const findParentSubType = (instance, prop) => {
	let subtype = null;
	if (instance.__type__.subtypes.has(prop)) {
		subtype = instance.__type__.subtypes.get(prop);
		return subtype;
	}
	return findParentSubType(instance.__parent__, prop);
};
const isClass = (fn) => {
	if (typeof fn.prototype !== 'object') {
		return false;
	}
	if (fn.prototype.constructor !== fn) {
		return false;
	}
	return Reflect.getOwnPropertyDescriptor(fn, 'prototype').writable === false;
};
const makeFakeModificatorType = (TypeName, fakeModificator = function () { }) => {
	const modificatorBody = compileNewModificatorFunctionBody_1.default(TypeName);
	const modificatorType = modificatorBody(fakeModificator, CreationHandler, SymbolConstructorName);
	return modificatorType();
};
const reflectPrimitiveWrappers = (_thisArg) => {
	let thisArg = _thisArg;
	if (_thisArg === null) {
		thisArg = Object.create(null);
		odp(thisArg, Symbol.toPrimitive, {
			get () {
				return () => {
					return _thisArg;
				};
			}
		});
	}
	if (_thisArg instanceof Number ||
        _thisArg instanceof Boolean ||
        _thisArg instanceof String) {
		odp(thisArg, Symbol.toPrimitive, {
			get () {
				return () => {
					return _thisArg.valueOf();
				};
			}
		});
	}
	return thisArg;
};
const TypesUtils = {
	isClass,
	CreationHandler,
	getModificationConstructor,
	checkProto,
	getTypeChecker,
	getTypeSplitPath,
	getExistentAsyncStack,
	checkTypeName,
	findParentSubType,
	makeFakeModificatorType,
	reflectPrimitiveWrappers
};
exports.default = TypesUtils;
