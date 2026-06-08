'use strict';

import type { WrappableMethod } from '../types';

import { collectConstructors } from './collectConstructors';
import { extract } from './extract';
import { parent } from './parent';
import { pick } from './pick';
import { toJSON } from './toJSON';
import { parse } from './parse';
import { merge } from './merge';

const utilsUnWrapped = {

	extract,
	pick,

	parent,

	toJSON,

	parse,
	merge,

	get collectConstructors () {
		return collectConstructors;
	},

};

const wrapThis = ( method: WrappableMethod ) => {
	const result = function ( this: object, instance: object | undefined, ...args: unknown[] ) {
		const wrapResult = method(
			instance !== undefined ? instance : this,
			...args 
		);
		return wrapResult;
	};
	return result;
};

export const utils: { [ index: string ]: CallableFunction } = {

	...Object.entries( utilsUnWrapped )
		.reduce(
			( methods: { [ index: string ]: CallableFunction }, util ) => {
				const [ name, fn ] = util;
				methods[ name ] = wrapThis( fn );
				return methods;
			},
			{} 
		),

};

export { defineStackCleaner } from './defineStackCleaner';
