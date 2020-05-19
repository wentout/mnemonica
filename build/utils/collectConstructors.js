'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.collectConstructors = void 0;
const constants_1 = require('../constants');
const { MNEMOSYNE, MNEMONICA, GAIA, } = constants_1.constants;
const getAdditor = (constructors) => {
	return Array.isArray(constructors) ?
		(name) => {
			constructors.push(name);
		} : (name) => {
			constructors[name] = true;
		};
};
const getAccumulator = (asSequence) => {
	return asSequence ? [] : {};
};
exports.collectConstructors = (self, asSequence = false) => {
	const constructors = getAccumulator(asSequence);
	const addToSequence = getAdditor(constructors);
	if (typeof self === 'object') {
		if (self === null) {
			return constructors;
		}
	}
	else {
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
				addToSequence(MNEMOSYNE);
				mnemonicaReached = true;
			}
		}
		else if (constructorName === 'Object') {
			addToSequence(constructorName);
			break;
		}
		else {
			addToSequence(constructorName);
		}
		self = proto;
		proto = Reflect.getPrototypeOf(self);
	}
	return constructors;
};
