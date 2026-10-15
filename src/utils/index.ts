'use strict';

import type {
	WrappableMethod,
	UtilsCollection
} from '../types';

import { collectConstructors } from './collectConstructors';
import { extract } from './extract';
import { parent } from './parent';
import { pick } from './pick';
import { sibling } from './sibling';
import { exception } from './exception';
import { fork } from './fork';
import { clone } from './clone';
import { toJSON } from './toJSON';
import { parse } from './parse';
import { deepParse } from './deepParse';
import { lineage } from './lineage';
import { merge } from './merge';

const utilsUnWrapped = {

	extract,
	pick,

	parent,
	sibling,
	exception,
	fork,
	clone,

	toJSON,

	parse,
	deepParse,
	lineage,
	merge,

	collectConstructors,

};

const wrapThis = ( collection: object, method: WrappableMethod ) => {
	const result = function ( this: object, instance: object | undefined, ...args: unknown[] ) {
		// utils.X(undefined) must not silently operate on the utils
		// collection itself: `this` substitutes only for a genuine method
		// call on some OTHER object (the prototype opt-in form)
		const instanceContext = instance !== undefined ? instance
			: ( this !== collection ? this : undefined );
		let wrapResult: unknown;
		if ( new.target ) {
			// wrapThis forwards `new` to the util; WrappableMethod (a plain
			// function type) declares no construct signature, so the cast
			// bridges that construct call
			wrapResult = new (method as unknown as new (...a: unknown[]) => unknown)(
				instanceContext,
				...args
			);
		} else {
			wrapResult = method(
				instanceContext,
				...args 
			);
		}
		return wrapResult;
	};
	return result;
};

// one object serves both roles: the exported collection AND the identity
// wrapThis compares `this` against (a spread copy would defeat the check)
const wrappedUtils: { [ index: string ]: WrappableMethod } = {};
Object.entries( utilsUnWrapped )
	.forEach(( util ) => {
		const [ name, fn ] = util;
		wrappedUtils[ name ] = wrapThis( wrappedUtils, fn );
	});

export const utils = wrappedUtils as UtilsCollection;

export { defineStackCleaner } from './defineStackCleaner';
