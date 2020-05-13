'use strict';

const wrapThis = ( method: Function ) => {
	return function ( this: any, instance: any, ...args: any[] ) {
		return method( instance !== undefined ? instance : this, ...args );
	};
};

import { constants } from './constants';
import descriptors from './descriptors';

const {
	defaultTypes
} = descriptors;

import * as errors from './api/errors';

import { utils } from './utils';

const utilsWrapped: { [ index: string ]: any } = {

	...Object.entries( {

		...utils

	} ).reduce( ( methods: { [ index: string ]: any }, util ) => {
		const [ name, fn ] = util;
		methods[ name ] = wrapThis( fn );
		return methods;
	}, {} ),

};

export const define = function ( this: object, ...args: any[] ) {
	const types = ( this === mnemonica ) ? defaultTypes : this || defaultTypes;
	return types.define( ...args );
};

export const lookup = function ( this: object, ...args: any[] ) {
	const types = ( this === mnemonica ) ? defaultTypes : this || defaultTypes;
	return types.lookup( ...args );
};

export const defaultCollection = defaultTypes.subtypes;
export const defineStackCleaner = errors.defineStackCleaner;

const mnemonica = {};

Object.entries( {
	define,
	lookup,
	
	defaultCollection,

	...constants,

	...descriptors,

	utils: utilsWrapped,
	
	defineStackCleaner,


} ).forEach( ( entry ) => {
	const [ name, code ] = entry;
	Object.defineProperty( mnemonica, name, {
		get () {
			return code;
		},
		enumerable: true
	} );
} );

// console.log(Object.keys(fascade));
export default mnemonica;
module.exports = mnemonica;
