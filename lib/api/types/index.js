'use strict';


const odp = Object.defineProperty;

const {

	SymbolSubtypeCollection,
	SymbolConstructorName,

	TYPE_TITLE_PREFIX,
	MNEMOSYNE,

} = require('../../constants');

const {
	ALREADY_DECLARED,
	WRONG_TYPE_DEFINITION,
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
} = require('../../errors');

const hooksApi = require('../hooks');
const TypeProxy = require('./TypeProxy');


const compileNewModificatorFunctionBody
	= require('./compileNewModificatorFunctionBody');

	
const {
	checkProto,
	getTypeChecker,
	CreationHandler,
	getTypeSplitPath,
	getStack
} =	require('./utils');

const TypeDescriptor = function (
	types,
	TypeName,
	constructHandler,
	proto,
	useOldStyle
) {

	// here "types" refers to types collection object {}

	const parentType = types[SymbolSubtypeCollection] || null;

	const isSubType = parentType ? true : false;

	const namespace = isSubType ? parentType.namespace : types.namespace;
	const collection = isSubType ? parentType.collection : types[MNEMOSYNE];

	if (types[TypeName]) {
		throw new ALREADY_DECLARED;
	}

	checkProto(proto);

	const subtypes = {};

	const title = `${TYPE_TITLE_PREFIX}${TypeName}`;

	const type = Object.assign(this, {

		get constructHandler () {
			return constructHandler;
		},
		
		stack : getStack(`Definition ${TypeName} made:`),

		TypeName,
		proto,

		isSubType,
		subtypes,
		parentType,

		namespace,
		collection,

		title,

		// about using
		// createInstanceModificator200XthWay
		// or more general
		// createInstanceModificator
		useOldStyle,

		hooks : Object.create(null)

	});

	odp(subtypes, SymbolSubtypeCollection, {
		get () {
			return type;
		}
	});

	odp(types, TypeName, {
		enumerable : true,
		get () {
			return new TypeProxy(type);
		},
	});

	return types[TypeName];

};

Object.assign(TypeDescriptor.prototype, hooksApi);

TypeDescriptor.prototype.define = function (...args) {
	return define.call(this.subtypes, ...args);
};

TypeDescriptor.prototype.lookup = function (...args) {
	return lookup.call(this.subtypes, ...args);
};

odp(TypeDescriptor.prototype, Symbol.hasInstance, {
	get () {
		return getTypeChecker(this.TypeName);
	}
});

const defineFromType = function (constructHandlerGetter) {
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
	return new TypeDescriptor(
		this,
		TypeName,
		makeConstructHandler,
		type.prototype,
		false
	);
};

const defineFromFunction = function (
	TypeName,
	constructHandler = function () { },
	proto,
	useOldStyle = false
) {

	if (typeof constructHandler !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}

	const makeConstructHandler = function () {
		const modificatorBody = compileNewModificatorFunctionBody(TypeName);
		const ModificationConstructor = modificatorBody(
			constructHandler,
			CreationHandler,
			SymbolConstructorName
		);
		ModificationConstructor.prototype = {};
		return ModificationConstructor;
	};
	
	if (!proto) {
		if(constructHandler.hasOwnProperty('prototype')) {
			proto = constructHandler.prototype;
		} else {
			proto = {};
		}
	}

	return new TypeDescriptor(
		this,
		TypeName,
		makeConstructHandler,
		proto,
		useOldStyle
	);

};


const define = function (TypeOrTypeName, ...args) {

	if (typeof TypeOrTypeName === 'string') {

		if (!TypeOrTypeName.length) {
			throw new WRONG_TYPE_DEFINITION('TypeName must not be empty');
		}

		const split = getTypeSplitPath(TypeOrTypeName);

		const Type = lookup.call(this, split[0]);

		if (!Type) {
			if (split.length === 1) {
				return defineFromFunction.call(this, TypeOrTypeName, ...args);
			} else {
				throw new WRONG_TYPE_DEFINITION(`${split[0]} definition is not yet exists`);
			}
		}

		const TypeName = split.slice(1).join('.');

		if (split.length > 1) {
			return define.call(Type.subtypes, TypeName, ...args);
		}

		// so, here we go with
		// defineFromType.call
		// from the next step
		return define.call(Type.subtypes, ...args);

	}

	if (typeof TypeOrTypeName === 'function') {
		return defineFromType.call(this, TypeOrTypeName);
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

	var [name] = split;
	var type = this[name];
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

