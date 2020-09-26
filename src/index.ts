'use strict';

import { TypeAbsorber, ITypeClass, TypeLookup, IDEF } from './types';

import { constants } from './constants';
const { odp } = constants;

import * as errorsApi from './api/errors';
import { descriptors } from './descriptors';

export type { IDEF } from './types';

export const {
	defaultTypes,
} = descriptors;

function checkThis ( pointer: any ): boolean {
	return pointer === mnemonica ||
		pointer === exports;
};

export const define = function (
	this: any,
	TypeName: string,
	constructHandler: CallableFunction,
	proto?: object,
	config?: object,
) {
	const types = checkThis( this ) ? defaultTypes : this || defaultTypes;
	return types.define( TypeName, constructHandler, proto, config );
} as TypeAbsorber;

export const tsdefine = function <T> (
	this: any,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: object,
): ITypeClass<T> {
	return defaultTypes.define( TypeName, constructHandler, proto, config );
};

export const lookup = function ( TypeNestedPath ) {
	const types = checkThis( this ) ? defaultTypes : this || defaultTypes;
	return types.lookup( TypeNestedPath );
} as TypeLookup;


export const mnemonica = Object.entries( {

	define,
	lookup,

	...descriptors,

	...errorsApi,
	...constants,

} ).reduce( ( acc: { [ index: string ]: any }, entry: any ) => {
	const [ name, code ] = entry;
	odp( acc, name, {
		get () {
			return code;
		},
		enumerable: true
	} );
	return acc;
}, {} );

export const {

	SymbolSubtypeCollection,
	SymbolConstructorName,
	SymbolGaia,
	SymbolReplaceGaia,
	SymbolDefaultNamespace,
	SymbolDefaultTypesCollection,
	SymbolConfig,
	MNEMONICA,
	MNEMOSYNE,
	GAIA,
	URANUS,
	TYPE_TITLE_PREFIX,
	ErrorMessages,
	createNamespace,
	namespaces,
	defaultNamespace,
	createTypesCollection,

} = mnemonica;


export const defaultCollection = defaultTypes.subtypes;
export const errors = descriptors.ErrorsTypes;

export { utils } from './utils';
export { defineStackCleaner } from './utils';
