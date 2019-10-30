'use strict';

const {
	SymbolConstructorName,
	MNEMOSYNE,
	MNEMONICA,
	GAIA,
} = require('../constants');

const {
	WRONG_MODIFICATION_PATTERN
} = require('../errors');

const collectConstructors = (self, asSequence = false) => {
	const descriptors = require('../descriptors');
	
	if (!self || !self.constructor) {
		throw new WRONG_MODIFICATION_PATTERN;
	}
	const constructors = asSequence ? [] : {};
	const addToSequence = asSequence ?
		(name) => {
			constructors.push(name);
		} :
		(name) => {
			constructors[name] = true;
		};
	
	let proto = Object.getPrototypeOf(self);
	var mnemonicaReached = false;
	while (proto) {
		const constructorName = proto.constructor.name;
		if (constructorName === GAIA) {
			self = proto;
			proto = Object.getPrototypeOf(self);
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
		proto = Object.getPrototypeOf(self);
	}
	return constructors;
};

module.exports = collectConstructors;
