'use strict';

const odp = Object.defineProperty;

const {
	SymbolGaia,
} = require('../../constants');

const {
	WRONG_TYPE_DEFINITION,
} = require('../../descriptors/errors');

const {
	checkProto,
	getTypeChecker,
	findParentSubType,
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
	if (type.subtypes.has(prop)) {
		return type.subtypes.get(prop);
	}
	
	return Reflect.get(target, prop);

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
};

const makeSubTypeProxy = function (subtype, inheritedInstance) {
					
	const subtypeProxy = new Proxy(InstanceCreator, {
		
		get (Target, _prop) {
			
			if (_prop === Symbol.hasInstance) {
				return getTypeChecker(subtype.TypeName);
			}
			
			return Reflect.get(Target, _prop);
			
		},
		
		construct (Target, _args) {
			return new Target(subtype, inheritedInstance, _args);
		},
		
		apply (Target, thisArg, _args) {
			const existentInstance = thisArg || inheritedInstance;
			return new Target(subtype, existentInstance, _args);
		},
		
	});
	
	return subtypeProxy;
};

const gaiaProxyHandler = {
	get (_target, prop, receiver) {
		const result = Reflect.get(_target, prop, receiver);
		
		if (typeof prop === 'symbol') {
			return result;
		}
		
		if (prop === '__stack__') {
			return result;
		}
		
		// then it is string
		// so we should try to skip non constructors
		// and as all of their names starts from UpperCase...
		if (prop[0] !== prop[0].toUpperCase()) {
			return result;
		}
		
		if (result !== undefined) {
			return result;
		}
		
		// prototype of proxy
		const instance = Object.getPrototypeOf(receiver);
		
		if (instance.__subtypes__) {
			
			const {
				__subtypes__ : subtypes,
				__type__ : {
					config : {
						strictChain
					}
				},
			} = instance;
			
			let subtype = subtypes.has(prop) ?
				subtypes.get(prop) :
					strictChain ?
						undefined :
						findParentSubType(instance, prop);
			
			return subtype ? makeSubTypeProxy(subtype, receiver) : result;
			
		}
	}
};

TypeProxy.prototype.construct = function (target, args) {
	
	const {
		__type__: type
	} = this;
	
	const gaia = this[SymbolGaia];
	
	const gaiaProxy = new Proxy(gaia, gaiaProxyHandler);
	
	const instance = new InstanceCreator(type, gaiaProxy, args);
	return instance;
};

module.exports = TypeProxy;
