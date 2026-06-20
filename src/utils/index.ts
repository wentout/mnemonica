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
	merge,

	collectConstructors,

};

const wrapThis = ( method: WrappableMethod ) => {
	const result = function ( this: object, instance: object | undefined, ...args: unknown[] ) {
		const instanceContext = instance !== undefined ? instance : this;
		let wrapResult: unknown;
		if ( new.target ) {
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

export const utils = {

	...Object.entries( utilsUnWrapped )
		.reduce(
			( methods: { [ index: string ]: CallableFunction }, util ) => {
				const [ name, fn ] = util;
				methods[ name ] = wrapThis( fn );
				return methods;
			},
			{}
		),

} as UtilsCollection;

export { defineStackCleaner } from './defineStackCleaner';
