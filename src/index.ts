'use strict';

const wrapThis = ( method: any ) => {
	return function ( this: any, instance: any, ...args: any[] ) {
		return method( instance !== undefined ? instance : this, ...args );
	};
};

import { constants } from './constants';
import descriptors from './descriptors';

const {
	defaultTypes
} = descriptors;

import errors from './api/errors';
const {
	defineStackCleaner
} = errors;

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

const define = function ( this: any, ...args: any[] ) {
	const types = ( this === fascade ) ? defaultTypes : this || defaultTypes;
	return types.define( ...args );
};

const lookup = function ( this: any, ...args: any ) {
	const types = ( this === fascade ) ? defaultTypes : this || defaultTypes;
	return types.lookup( ...args );
};

const fascade = {};

Object.entries( {

	...constants,

	...descriptors,

	defaultCollection: defaultTypes.subtypes,

	defineStackCleaner,

	utils: utilsWrapped,

	define,
	lookup

} ).forEach( ( entry ) => {
	const [ name, code ] = entry;
	Object.defineProperty( fascade, name, {
		get () {
			return code;
		},
		enumerable: true
	} );
} );

// console.log(Object.keys(fascade));
module.exports = fascade;
