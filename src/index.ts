/* eslint-disable @typescript-eslint/ban-ts-comment, indent, new-cap, space-before-function-paren */
'use strict';

import { TypeLookup, IDEF } from './types';

import { constants } from './constants';
const { odp } = constants;

import * as errorsApi from './api/errors';
import { descriptors } from './descriptors';

export type { IDEF } from './types';

export const {
	defaultTypes,
} = descriptors;

function checkThis ( pointer: typeof mnemonica | typeof exports | unknown ): boolean {
	return pointer === mnemonica || pointer === exports;
}

type hooksTypes = 'preCreation' | 'postCreation' | 'creationError'
type hooksOpts = {
	TypeName: string,
	args: unknown[],
	existentInstance: object,
	inheritedInstance: object,
}
type hook = {
	( opts: hooksOpts ): void
}

type constructorOptions = {

	// explicit declaration we wish use
	// an old style based constructors
	// e.g. with prototype described with:
	//    createInstanceModificator200XthWay
	// or more general with: createInstanceModificator
	ModificationConstructor?: CallableFunction,

	// shall or not we use strict checking
	// for creation sub-instances Only from current type
	// or we might use up-nested sub-instances from chain
	strictChain?: boolean,

	// should we use forced errors checking
	// to make all inherited types errored
	// if there is an error somewhere in chain
	// disallow instance construction
	// if there is an error in prototype chain
	blockErrors?: boolean,

	// if it is necessary to collect stack
	// as a __stack__ prototype property
	// during the process of instance creation
	submitStack?: boolean,

	// await new Constructor()
	// must return value
	// optional ./issues/106
	awaitReturn?: boolean,

}


type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;

// type Narrowable =
//   string | number | boolean | symbol | object | undefined | void | null | [];
// type RN = Record<string|symbol, unknown>
type SN = Record<string, new () => unknown>

interface IDefinitorInstance<N extends object, S> {
	new( ...arg: unknown[] ): {
		[ key in keyof S ]: S[ key ]
	}
	define: IDefinitor<N, string>
	registerHook: ( hookType: hooksTypes, cb: hook ) => void
}

interface IDefinitor<P extends object, SubTypeName extends string> {
	<PP extends object, T, M extends Proto<P, Proto<PP, T>>, S extends SN & M> (
		this: unknown,
		TypeName: SubTypeName,
		constructHandler: IDEF<T>,
		proto?: PP,
		config?: constructorOptions,
	): IDefinitorInstance<M, S>
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
			return define( s.name, cstr, proto, config ) as unknown as typeof cstr;
		}
		// @ts-ignore
		return parentClass.define( s.name, cstr, proto, config ) as unknown as typeof cstr;
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
/* eslint-enable @typescript-eslint/ban-ts-comment, indent, new-cap, space-before-function-paren */
