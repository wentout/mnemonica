'use strict';

import { constants } from '../constants';

const {
	MNEMOSYNE,
	MNEMONICA,
	// SymbolConstructorName
} = constants;

const getAdditor = (constructors: string[] | { [index: string]: boolean }) => {
	return Array.isArray(constructors) ?
		(name: string) => {
			constructors.push(name);
		} : (name: string) => {
			constructors[ name ] = true;
		};

};

const getAccumulator = (asSequence: boolean) => {
	return asSequence ? [] : {};
};

export const collectConstructors = (self: object, asSequence = false) => {

	const constructors = getAccumulator(asSequence);
	const addToSequence = getAdditor(constructors);

	if (typeof self === 'object') {
		if (self === null) {
			return constructors;
		}
	} else {
		return constructors;
	}

	let proto: unknown = Reflect.getPrototypeOf(self);

	let mnemonicaReached = false;
	while (proto) {
		if (proto.constructor) {
			const constructorName = proto.constructor.name;
			if (constructorName === MNEMONICA && !mnemonicaReached) {
				if (Object.hasOwnProperty.call(proto, 'constructor')) {
					addToSequence(constructorName);
					addToSequence(MNEMOSYNE);
					mnemonicaReached = true;
				}
			} else if (constructorName === 'Object') {
				addToSequence(constructorName);
				break;
			} else {
				addToSequence(constructorName);
			}
		}

		if (mnemonicaReached) {
			break;
		}
		
		self = proto;
		proto = Reflect.getPrototypeOf(self);
		if (proto === null) {
			addToSequence('Object: null prototype');
			break;
		}
		/*
		TODO: show full chain and test it !!!
		else {
			// proto may be either empty object or null
			// so typeof will always be 'object'
			// eslint-disable-next-line no-lonely-if
			addToSequence('... plain object ...');
		}
		*/
		// so here we go deeper to the chain
	}
	return constructors;
};
