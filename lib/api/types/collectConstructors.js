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
		
	
	let proto = Object.getPrototypeOf(self);
	while (proto) {
		if (proto && proto.constructor) {
			const standardName = proto.constructor.name;
			if (standardName) {
				if (standardName === 'Object') {
					const baseName = proto[SymbolConstructorName];
					if (baseName) {
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