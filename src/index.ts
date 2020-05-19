'use strict';
import { constants } from './constants';
const { odp } = constants;

import * as errorsApi from './api/errors';
import { descriptors } from './descriptors';

export const {
	defaultTypes,
} = descriptors;

function checkThis ( pointer: any ): boolean {
	if (
		pointer === mnemonica ||
		pointer === exports
	) {
		return true;
	}
	return false;
};

export interface IDEF<T> {
	new( ...args: any[] ): T;
	( this: T, ...args: any[] ): T;
	prototype?: ThisType<T>;
}

type TypeAbsorber<T> = (
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: object
) => TypeClass<T>;

interface TypeClass<T> {
	// construct
	new( ...args: any[] ): T;
	// define, lookup, registerHook
	( this: T, ...args: any[] ): T;
	// props
	define: TypeAbsorber<T>,
	// define: typeof define,
	lookup: typeof lookup,
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hook: CallableFunction ) => any;
}

export const define = function <T> (
	this: any,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: object
): TypeClass<T> {
	const types = checkThis( this ) ? defaultTypes : this || defaultTypes;
	const type = types.define( TypeName, constructHandler, proto, config );
	return type;
};


export const lookup = function ( this: typeof defaultTypes, TypeNestedPath: string ) {
	const types = checkThis( this ) ? defaultTypes : this || defaultTypes;
	return types.lookup( TypeNestedPath );
};


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
