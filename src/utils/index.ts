'use strict';

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

const wrapThis = ( method: CallableFunction ) => {
	return function ( this: object, instance: object | undefined, ...args: unknown[] ) {
		return method( instance !== undefined ? instance : this, ...args );
	};
};

export const utils: { [ index: string ]: CallableFunction } = {

	...Object.entries( utilsUnWrapped )
		.reduce( ( methods: { [ index: string ]: CallableFunction }, util ) => {
			const [ name, fn ] = util;
			methods[ name ] = wrapThis( fn );
			return methods;
		}, {} ),

};

export { defineStackCleaner } from './defineStackCleaner';
