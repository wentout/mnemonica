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

interface Constructible<T> {
	new( ...args: any[] ): T;
	prototype: ThisType<T>;
}

export interface IDEF<T extends Constructible<T>> {
	new( ...args: any[] ): InstanceType<Constructible<T>>;
	( this: T, ...args: any[] ): T;
}

interface SubType<T> {
	new( ...args: any[] ): InstanceType<Constructible<T>>;
	( this: T, ...args: any[] ): T;
	define: typeof define,
	lookup: typeof lookup,
	registerHook: ( type: string, hook: CallableFunction ) => any;
}

export const define = function <T, S extends Constructible<T>> (
	this: any,
	TypeName: string,
	constructHandler: S,
	proto?: object,
	config?: object
): SubType<S> {
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
