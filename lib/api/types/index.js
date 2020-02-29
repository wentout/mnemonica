'use strict';


const odp = Object.defineProperty;

const {

	SymbolSubtypeCollection,
	SymbolConstructorName,
	SymbolConfig,

	TYPE_TITLE_PREFIX,
	MNEMOSYNE,

} = require('../../constants');

const {
	ALREADY_DECLARED,
	WRONG_TYPE_DEFINITION,
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
} = require('../../descriptors/errors');

// invokeHook
// registerHook
// registerFlowChecker
const hooksApi = require('../hooks');
const TypeProxy = require('./TypeProxy');

const compileNewModificatorFunctionBody = require('./compileNewModificatorFunctionBody');


const {
	checkProto,
	getTypeChecker,
	CreationHandler,
	getTypeSplitPath,
	checkTypeName,
} = require('./utils');

const {
	getStack,
} = require('../errors');

const TypeDescriptor = function (
	defineOrigin,
	types,
	TypeName,
	constructHandler,
	proto,
	config,
) {

	// here "types" refers to types collection object {}

	const parentType = types[SymbolSubtypeCollection] || null;

	const isSubType = parentType ? true : false;

	const namespace = isSubType ? parentType.namespace : types.namespace;
	const collection = isSubType ? parentType.collection : types[MNEMOSYNE];

	if (types.has(TypeName)) {
		throw new ALREADY_DECLARED;
	}

	checkProto(proto);

	const subtypes = new Map();

	const title = `${TYPE_TITLE_PREFIX}${TypeName}`;
	
	config = Object.assign({}, collection[SymbolConfig], config);

	const type = Object.assign(this, {

		get constructHandler () {
			return constructHandler;
		},


		TypeName,
		proto,

		isSubType,
		subtypes,
		parentType,

		namespace,
		collection,

		title,

		config,

		hooks : Object.create(null)

	});
	
	getStack.call(this, `Definition of [ ${TypeName} ] made at:`, [], defineOrigin);

	odp(subtypes, SymbolSubtypeCollection, {
		get () {
			return type;
		}
	});
	
	types.set(TypeName, new TypeProxy(type));

	return types.get(TypeName);

};

Object.assign(TypeDescriptor.prototype, hooksApi);

TypeDescriptor.prototype.define = function (...args) {
	return define.call(define, this.subtypes, ...args);
};

TypeDescriptor.prototype.lookup = function (...args) {
	return lookup.call(this.subtypes, ...args);
};

odp(TypeDescriptor.prototype, Symbol.hasInstance, {
	get () {
		return getTypeChecker(this.TypeName);
	}
});

const defineFromType = function (subtypes, constructHandlerGetter, config) {
	// we need this to extract TypeName
	const type = constructHandlerGetter();

	if (typeof type !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}

	const TypeName = type.name;

	if (!TypeName) {
		throw new TYPENAME_MUST_BE_A_STRING;
	}

	const makeConstructHandler = function () {
		const ModificationConstructor = constructHandlerGetter();
		// constructHandler[SymbolConstructorName] = TypeName;
		odp(ModificationConstructor, SymbolConstructorName, {
			get () {
				return TypeName;
			}
		});
		const protoDesc = Object
			.getOwnPropertyDescriptor(ModificationConstructor, 'prototype');
		if (protoDesc.writable) {
			ModificationConstructor.prototype = {};
		}
		return ModificationConstructor;
	};

	if (typeof config === 'object') {
		config = Object.assign({}, config);
		config.useOldStyle = false;
	} else {
		config = {};
	}

	return new TypeDescriptor(
		this,
		subtypes,
		TypeName,
		makeConstructHandler,
		type.prototype,
		config
	);
};

const isClass = (constructHandler) => {
	return constructHandler.toString().indexOf('class') > -1;
};

const defineFromFunction = function (
	subtypes,
	TypeName,
	constructHandler = function () { },
	proto,
	config = {}
) {

	if (typeof constructHandler !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}
	
	const modificatorBody = compileNewModificatorFunctionBody(TypeName, isClass(constructHandler));

	const makeConstructHandler = modificatorBody(
		constructHandler,
		CreationHandler,
		SymbolConstructorName
	);

	if (!proto) {
		if (constructHandler.hasOwnProperty('prototype')) {
			proto = Object.assign({}, constructHandler.prototype);
		} else {
			proto = {};
		}
	}

	if (typeof config === 'object') {
		config = Object.assign({}, config);
	}

	if (typeof config === 'boolean') {
		config = {
			useOldStyle : config
		};
	}

	return new TypeDescriptor(
		this,
		subtypes,
		TypeName,
		makeConstructHandler,
		proto,
		config
	);

};


const define = function (subtypes, TypeOrTypeName, ...args) {

	if (typeof TypeOrTypeName === 'function') {
		if (TypeOrTypeName.name) {
			return define.call(this, subtypes, TypeOrTypeName.name, TypeOrTypeName, ...args);
		} else {
			return defineFromType.call(this, subtypes, TypeOrTypeName, ...args);
		}
	}

	if (typeof TypeOrTypeName === 'string') {

		checkTypeName(TypeOrTypeName);

		const split = getTypeSplitPath(TypeOrTypeName);

		const Type = lookup.call(subtypes, split[0]);

		if (!Type) {

			if (split.length === 1) {
				return defineFromFunction.call(this, subtypes, TypeOrTypeName, ...args);
			}

			throw new WRONG_TYPE_DEFINITION(`${split[0]} definition is not yet exists`);
		}

		const TypeName = split.slice(1).join('.');

		if (split.length > 1) {
			return define.call(this, Type.subtypes, TypeName, ...args);
		}

		// so, here we go with
		// defineFromType.call
		// from the next step
		return define.call(this, Type.subtypes, ...args);

	}

	throw new WRONG_TYPE_DEFINITION('definition is not provided');

};

const lookup = function (TypeNestedPath) {

	if (typeof TypeNestedPath !== 'string') {
		throw new WRONG_TYPE_DEFINITION('arg : type nested path must be a string');
	}

	if (!TypeNestedPath.length) {
		throw new WRONG_TYPE_DEFINITION('arg : type nested path has no path');
	}

	const split = getTypeSplitPath(TypeNestedPath);

	const [name] = split;
	const type = this.get(name);
	if (split.length == 1) {
		return type;
	}

	const NextNestedPath = split.slice(1).join('.');
	return lookup.call(type.subtypes, NextNestedPath);

};

module.exports = {
	define,
	lookup
};

