'use strict';

const {
	SymbolConstructorName,
	MNEMOSYNE,
	MNEMONICA,
	GAIA,
} = require('../constants');

const collectConstructors = (self, asSequence = false) => {
	const descriptors = require('../descriptors');


	const constructors = asSequence ? [] : {};
	const addToSequence = asSequence ?
		(name) => {
			constructors.push(name);
		} :
		(name) => {
			constructors[name] = true;
		};

	if (typeof self === 'object') {
		if (self === null) {
			return constructors;
		}
	} else {
		return constructors;
	}

	let proto = Reflect.getPrototypeOf(self);
	let mnemonicaReached = false;
	while (proto) {
		const constructorName = proto.constructor.name;
		if (constructorName === GAIA) {
			self = proto;
			proto = Reflect.getPrototypeOf(self);
			continue;
		}
		if (constructorName === MNEMONICA) {
			if (!mnemonicaReached) {
				addToSequence(constructorName);
				const baseName = proto[SymbolConstructorName];
				descriptors.namespaces.get(baseName) && addToSequence(MNEMOSYNE);
				mnemonicaReached = true;
			}
		} else if (constructorName === 'Object') {
			addToSequence(constructorName);
			break;
		} else {
			addToSequence(constructorName);
		}
		self = proto;
		proto = Reflect.getPrototypeOf(self);
	}
	return constructors;
};

module.exports = collectConstructors;
