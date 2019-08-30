'use strict';

const {
	SymbolConstructorName,
	WRONG_MODIFICATION_PATTERN,
} = require('../../const');

const collectConstructors = (self, asSequence = false) => {
	if (!self.constructor) {
		throw new Error(WRONG_MODIFICATION_PATTERN);
	}
	const constructors = asSequence ? [] : {};
	const addToSequence = asSequence ?
		(name) => {
			constructors.push(name);
		} :
		(name) => {
			constructors[name] = true;
		};
	addToSequence(self.constructor[SymbolConstructorName]);
	let proto = Object.getPrototypeOf(self);
	while (proto) {
		if (proto && proto.constructor) {
			const mnemoName = proto.constructor[SymbolConstructorName];
			if (mnemoName) {
				addToSequence(mnemoName);
			} else {
				const baseName = proto[SymbolConstructorName];
				if (baseName) {
					addToSequence(baseName);
				}
				const standardName = proto.constructor.name;
				if (standardName === 'Object') {
					addToSequence(standardName);
					break;
				}
			}
			self = proto;
			proto = Object.getPrototypeOf(self);
		} else {
			break;
		}
	}
	return constructors;
};

module.exports = collectConstructors;