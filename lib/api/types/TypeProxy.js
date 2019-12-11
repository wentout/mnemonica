'use strict';

const odp = Object.defineProperty;

const {
	SymbolGaia,
} = require('../../constants');

const {
	WRONG_TYPE_DEFINITION,
} = require('../../errors');

const {
	checkProto
} = require('./utils');

const {
	Gaia,
	Mnemosyne
} = require('./Mnemosyne');

const {
	InstanceCreator
} = require('./InstanceCreator');

const TypeProxy = function (type, Uranus) {

	const {
		namespace,
		isSubType,
		constructHandler
	} = type;

	this.__type__ = type;

	if (!isSubType) {

		odp(this, SymbolGaia, {
			get () {
				return new Mnemosyne(namespace, new Gaia(Uranus));
			}
		});

	}

	const typeProxy = new Proxy(constructHandler, this);

	return typeProxy;

};

const reProxifyInstance = (type, Uranus, ...args) => {
	const instance = new (new TypeProxy(type, Uranus))(...args);
	return instance;

};

TypeProxy.prototype.get = function (target, prop) {

	const {
		__type__: type
	} = this;

	if (prop === 'prototype') {
		return type.proto;
	}

	const propDeclaration = type[prop];
	if (propDeclaration) {
		return propDeclaration;
	}

	// used for existent props with value
	// undefined || null || false 
	if (type.hasOwnProperty(prop)) {
		return propDeclaration;
	}

	// SomeType.SomeSubType
	if (type.subtypes.hasOwnProperty(prop)) {
		return type.subtypes[prop];
	}

	return target[prop];

};

TypeProxy.prototype.set = function (target, name, value) {

	const {
		__type__: type
	} = this;

	// is about setting a prototype to Type
	if (name === 'prototype') {
		checkProto(value);
		type.proto = value;
		return true;
	}

	if (typeof name !== 'string' || !name.length) {
		throw new WRONG_TYPE_DEFINITION('should use non empty string as TypeName');
	}

	if (typeof value !== 'function') {
		throw new WRONG_TYPE_DEFINITION('should use function for type definition');
	}

	const TypeName = name;
	const Constructor = value;

	type.define(TypeName, Constructor);
	return true;

};

TypeProxy.prototype.apply = function (target, Uranus, args) {
	const {
		__type__: type
	} = this;
	return reProxifyInstance(type, Uranus, ...args);
	// return new (new TypeProxy(type, Uranus))(...args);
};

TypeProxy.prototype.construct = function (target, args) {
	const {
		__type__: type
	} = this;
	const gaia = this[SymbolGaia];
	const instance = new InstanceCreator(type, gaia, args);
	return instance;
};

module.exports = TypeProxy;
