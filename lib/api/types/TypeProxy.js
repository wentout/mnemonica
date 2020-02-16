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
			
			// if we would make new keyword obligatory
			// then we should avoid it here, with throw Error
			
			const existentInstance = thisArg || inheritedInstance;
			return new Target(subtype, existentInstance, _args);
		},
		
	});
	
	return subtypeProxy;
};

const staticProps = [
	
	// builtins: functions + Promises
	'constructor',
	'prototype',
	'then',

	// builtins: errors
	'stack',
	'message',
	'domain',
	
	// builtins: EventEmitter
	'on',
	'once',
	'off',
	
	// mocha + chai => bug: ./utils.js .findParentSubType 'inspect'
	'inspect',
	
	
	// mnemonica instance: start
	'__proto_proto__',
	
	'__type__',
	'__self__',
	
	'__args__',
	
	'__parent__',
	'__subtypes__',
	
	'__stack__',
	
	'__collection__',
	'__namespace__',
	'__timestamp__',
	
	'fork',
	'clone',
	
	'parent',
	
	'extract',
	'parse',
	'merge',
	'pick',
	'toJSON',
	// mnemonica instance: finish
	
	
].reduce((obj, key) => {
	obj[key] = true;
	return obj;
}, Object.create(null));

const gaiaProxyHandler = {
	get (_target, prop, receiver) {
		
		const result = Reflect.get(_target, prop, receiver);
		
		if (typeof prop === 'symbol') {
			return result;
		}
		
		if (staticProps[prop] || Object[prop] || Function[prop]) {
			return result;
		}
		
		if (result !== undefined) {
			return result;
		}
		
		// prototype of proxy
		const instance = Object.getPrototypeOf(receiver);
		
		const {
			__type__ : {
				config : {
					strictChain
				},
				subtypes
			},
		} = instance;
		
		let subtype = subtypes.has(prop) ?
			subtypes.get(prop) :
				strictChain ?
					undefined :
					findParentSubType(instance, prop);
		
		return subtype ? makeSubTypeProxy(subtype, receiver) : result;
		
	}
};

TypeProxy.prototype.construct = function (target, args) {
	
	// new.target id equal with target here
	
	const {
		__type__: type
	} = this;
	
	const gaia = this[SymbolGaia];
	
	const gaiaProxy = new Proxy(gaia, gaiaProxyHandler);
	
	const instance = new InstanceCreator(type, gaiaProxy, args);
	return instance;
};

module.exports = TypeProxy;
