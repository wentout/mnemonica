'use strict';

const odp = Object.defineProperty;

const {
	SymbolGaia,
} = require('../../constants');

const {
	WRONG_TYPE_DEFINITION,
	// EXISTENT_PROPERTY_REDEFINITION,
} = require('../../descriptors/errors');

const {
	checkProto,
	getTypeChecker,
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
	// return new (new TypeProxy(type, Uranus))(...args);
};

TypeProxy.prototype.construct = function (target, args) {
	const {
		__type__: type
	} = this;
	const gaia = this[SymbolGaia];
	
	const gaiaProxy = new Proxy(gaia, {
		get (_target, prop, receiver) {
			const result = Reflect.get(_target, prop, receiver);
			if (result === undefined) {
				// prototype of proxy: wow
				const pReceiver = Object.getPrototypeOf(receiver);
				if (pReceiver.__subtypes__) {
					
					// if (pReceiver.hasOwnProperty(prop)) {
					// 	throw new EXISTENT_PROPERTY_REDEFINITION(prop, 'stack');
					// }
					
					let subtype = null;
					
					if (pReceiver.__subtypes__.has(prop)) {
						
						subtype = pReceiver.__subtypes__.get(prop);
						
					} else if (
						pReceiver.__type__ &&
						pReceiver.__type__.config &&
						!pReceiver.__type__.config.strictChain
					) {
						
						let current = pReceiver.__parent__;
						const findParentSubType = () => {
							if (!current.__subtypes__) {
								return;
							}
							if (current.__subtypes__.has(prop)) {
								subtype = current.__subtypes__.get(prop);
								return;
							}
							current = current.__parent__;
							findParentSubType();
						};
						
						findParentSubType();
						
					}
					
					if (subtype) {
						
						const inheritedInstance = receiver;
						
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
					}
					
				}
			}
			
			return result;
		}
	});
	// const instance = new InstanceCreator(type, gaia, args);
	const instance = new InstanceCreator(type, gaiaProxy, args);
	return instance;
};

module.exports = TypeProxy;
