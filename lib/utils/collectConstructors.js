'use strict';

const {
	SymbolConstructorName,
	MNEMOSYNE,
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
	while (proto) {
		const standardName = proto.constructor.name;
		if (standardName === 'Object') {
			const baseName = proto[SymbolConstructorName];
			if (descriptors.namespaces.get(baseName)) {
				addToSequence(MNEMOSYNE);
			}
			addToSequence(standardName);
			break;
		}
		addToSequence(standardName);
		self = proto;
		proto = Object.getPrototypeOf(self);
	}
	return constructors;
};

module.exports = collectConstructors;
