'use strict';

const {
	types
} = require('../descriptors/types');

const {
	odp,
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
	WRONG_TYPE_DEFINITION,
} = require('../const');

const checkProto = (proto) => {
	if (!(proto instanceof Object)) {
		throw new Error(WRONG_TYPE_DEFINITION);
	}
};

const getConstructorFunctionBody = function (FunctionName) {
	return new Function('ConstructHandler', 'proto',
	`
		const ${FunctionName} = function ${FunctionName} (...args) {
			ConstructHandler.call(this, ...args);
			return this;
		};
		${FunctionName}.prototype = proto;
		return ${FunctionName};
	`);
};

const defineFromFunction = function (TypeName, ConstructHandler = function () {}, proto = {}) {
	const types = this;
	
	if (typeof TypeName !== 'string') {
		throw new Error(TYPENAME_MUST_BE_A_STRING);
	}
	
	if (typeof ConstructHandler !== 'function') {
		throw new Error(HANDLER_MUST_BE_A_FUNCTION);
	}
	
	checkProto(proto);
	
	odp(types, TypeName, {
		get () {
			const ConstructorBody  = getConstructorFunctionBody(TypeName);
			const TypeCreationController = ConstructorBody(ConstructHandler, proto);
			odp(TypeCreationController.prototype, 'constructor', {
				get () {
					return TypeCreationController;
				}
			});
			return TypeCreationController;
		}
	});
	
	return types[TypeName];
	
};

const defineFromType = function (GetConstructHandler) {
	const types = this;
	const TypeCreationController = GetConstructHandler();
	const proto = TypeCreationController.prototype;
	const TypeName = TypeCreationController.name || 'TypeCreationController';
	odp(types, TypeName, {
		get () {
			const TypeCreationController = GetConstructHandler();
			const proto = TypeCreationController.prototype;
			checkProto(proto);
			odp(TypeCreationController.prototype, 'constructor', {
				get () {
					return TypeCreationController;
				}
			});
			return new Proxy(TypeCreationController, {
				construct (target, args) {
					const creature = new target(...args);
					return creature;
				}
			});
		}
	});

	return types[TypeName];
};


const define = function (TypeOrTypeName, ...args) {
	const types = this;
	let definitor = null;
	if (typeof TypeOrTypeName === 'string') {
		return defineFromFunction.call(this, TypeOrTypeName, ...args);
	}
	if (typeof TypeOrTypeName === 'function') {
		return defineFromType.call(this, TypeOrTypeName, ...args);
	}
	if (definitor === null) {
		throw new Error(WRONG_TYPE_DEFINITION);
	}
	return definitor.call(this, TypeOrTypeName, ...args);
};


const subtype = function (TypeName) {
	
};

module.exports = {
	define : define.bind(types)
};