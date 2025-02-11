/* eslint-disable @typescript-eslint/ban-ts-comment, indent, new-cap, space-before-function-paren */
'use strict';

import {
	TypeLookup,
	IDEF,
	hook,
	hooksTypes,
	constructorOptions,
	Proto,
	SN,
	IDefinitorInstance
} from './types';
export type { IDEF, ConstructorFunction } from './types';

import { constants } from './constants';
const { odp } = constants;

import * as errorsApi from './api/errors';
import { descriptors } from './descriptors';

export const {
	defaultTypes,
} = descriptors;

function checkThis ( pointer: typeof mnemonica | typeof exports | unknown ): boolean {
	return pointer === mnemonica || pointer === exports;
}

export const define = function <
	T,
	// K extends IDEF<T>,
	// H extends ThisType<IDEF<T>>,
	P extends object,
	N extends Proto<P, T>,
	// so S it just basically allows nested constructors
	// and gives extracted props from constructHandler & proto
	// then it goes to new() keyword of define output
	S extends SN & N,
	R extends IDefinitorInstance<N, S>
> (
	this: unknown,
	TypeName?: string,
	constructHandler?: IDEF<T>,
	proto?: P,
	config?: constructorOptions,
): R {
	const types = checkThis( this ) ? defaultTypes : this || defaultTypes;
	return types.define( TypeName, constructHandler, proto, config );
};

export const lookup = function ( TypeNestedPath ) {
	const types = checkThis( this ) ? defaultTypes : this || defaultTypes;
	return types.lookup( TypeNestedPath );
} as TypeLookup;

export const apply = function <E extends object, T extends object, S extends Proto<E, T>> ( entity: E, Constructor: IDEF<T>, args: unknown[] = [] ): {
	[ key in keyof S ]: S[ key ]
} {
	// @ts-ignore
	const result = new entity[ Constructor.TypeName ]( ...args );
	return result;
};

export const call = function <E extends object, T extends object, S extends Proto<E, T>> ( entity: E, Constructor: IDEF<T>, ...args: unknown[] ): {
	[ key in keyof S ]: S[ key ]
} {
	// @ts-ignore
	const result = new entity[ Constructor.TypeName ]( ...args );
	return result;
};

export const bind = function <E extends object, T extends object, S extends Proto<E, T>> ( entity: E, Constructor: IDEF<T> ): ( ...args: unknown[] ) => {
	[ key in keyof S ]: S[ key ]
} {
	return ( ...args ) => {
		// @ts-ignore
		const result = new entity[ Constructor.TypeName ]( ...args );
		return result;
	};
};

export const decorate = function ( parentClass: unknown = undefined, proto?: object, config?: constructorOptions ) {
	const decorator = function <T extends { new(): unknown }> ( cstr: T, s: ClassDecoratorContext<T> ): T {
		if ( parentClass === undefined ) {
			return define( s.name, cstr, proto, config ) as unknown as T ;
		}
		// @ts-ignore
		return parentClass.define( s.name, cstr, proto, config ) as unknown as T;
	};
	return decorator;
};

export const registerHook = function <T extends object> ( Constructor: IDEF<T>, hookType: hooksTypes, cb: hook ): void {
	// @ts-ignore
	Constructor.registerHook( hookType, cb );
};

export const mnemonica = Object.entries( {

	define,
	lookup,
	apply,
	call,
	bind,
	decorate,
	registerHook,

	...descriptors,

	...errorsApi,
	...constants,

} ).reduce( ( acc: { [ index: string ]: unknown }, entry: [ string, unknown ] ) => {
	const [ name, code ] = entry;
	odp( acc, name, {
		get () {
			return code;
		},
		enumerable : true
	} );
	return acc;
}, {} );

export const {

	SymbolParentType,
	SymbolConstructorName,
	SymbolGaia,
	SymbolReplaceGaia,
	SymbolDefaultTypesCollection,
	SymbolConfig,
	MNEMONICA,
	MNEMOSYNE,
	GAIA,
	URANUS,
	TYPE_TITLE_PREFIX,
	ErrorMessages,
	createTypesCollection,

} = mnemonica;


export const defaultCollection = defaultTypes.subtypes;
export const errors = descriptors.ErrorsTypes;

export { utils } from './utils';
export { defineStackCleaner } from './utils';
/* eslint-enable @typescript-eslint/ban-ts-comment, indent, new-cap, space-before-function-paren */
