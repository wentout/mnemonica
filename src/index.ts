'use strict';
export { ConstructorFunction } from './types';
import { ConstructorFunction } from './types';
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

// interface ConstructorFactory<T extends object> {
// 	// tslint:disable-next-line: callable-types
// 	( ...args: any[] ): ConstructorFunction<T>
// }
// function definer<T extends object> (
// 	this: any,
// 	TypeOrTypeName: ConstructorFactory<T>,
// 	constructHandlerOrConfig?: object,
// 	proto?: object,
// 	config?: object
// ): ConstructorFunction<T> {

interface SubType<T extends object> {
	new( ...args: any[] ): T;
	( this: T, ...args: any[] ): T;
	prototype: ThisType<T>;
	define: typeof define,
	lookup: typeof lookup,
}

export const define = function <
	T,
	Z extends Extract<T, M>,
	S extends ConstructorFunction<Z>,
	M extends SubType<InstanceType<S>>,
> (
	this: any,
	TypeName: string,
	constructHandler: S,
	proto?: object,
	config?: object
): M {
	const types = checkThis( this ) ? defaultTypes : this || defaultTypes;
	return types.define( TypeName, constructHandler, proto, config );
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
