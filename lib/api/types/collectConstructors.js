'use strict';

const {
	SymbolConstructorName,
	MNEMOSYNE,
} = require('../../constants');

const {
	WRONG_MODIFICATION_PATTERN,
} = require('../../errors');

const collectConstructors = (self, asSequence = false) => {
	if (!self.constructor) {
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
		if (proto && proto.constructor) {
			const standardName = proto.constructor.name;
			if (standardName) {
				if (standardName === 'Object') {
					const baseName = proto[SymbolConstructorName];
					if (baseName === MNEMOSYNE) {
						addToSequence(baseName);
					}
					addToSequence(standardName);
					break;
				}
				addToSequence(standardName);
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