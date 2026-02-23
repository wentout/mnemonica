/* eslint-disable @typescript-eslint/ban-ts-comment, space-before-function-paren */
'use strict';

import type {
	CreateTypesCollectionFunction,
	IDEF,
	hook,
	hooksTypes,
	constructorOptions,
	Proto,
	SN,
	IDefinitorInstance,
	Constructor,
	DecoratedClass,
	TypeClass,
	TypeAbsorber
} from './types';

import TypesUtils from './api/utils/index';
export const {
	isClass,
	findSubTypeFromParent,
} = TypesUtils;

export type { IDEF, ConstructorFunction } from './types';
export { getProps, setProps } from './api/types/Props';

import { constants } from './constants';
const { odp } = constants;

import * as errorsApi from './api/errors';
import { descriptors } from './descriptors';

const { WRONG_MODIFICATION_PATTERN } = descriptors.ErrorsTypes;

import mnemosynes from './api/types/Mnemosyne';
const { prepareSubtypeForConstruction } = mnemosynes;

export const {
	defaultTypes,
} = descriptors;

function checkThis(pointer: typeof mnemonica | typeof exports | unknown): boolean {
	return pointer === mnemonica || pointer === exports;
}

// Define function using TypeAbsorber interface with proper type casting
export const define = function <
	T extends object,
	P extends object = object,
	N extends Proto<P, T> = Proto<P, T>
>(
	this: unknown,
	TypeName?: string | CallableFunction,
	// Allow both strict IDEF and more flexible function signatures
	constructHandler?: IDEF<T> | CallableFunction | object | boolean,
	config?: constructorOptions,
): IDefinitorInstance<N, SN, constructorOptions> {
	const types = checkThis(this) ? defaultTypes : this || defaultTypes;
	// Type assertion needed because TypesCollectionProxy is a Proxy
	return (types as { define: TypeAbsorber }).define(TypeName as string, constructHandler as IDEF<T>, config) as unknown as IDefinitorInstance<N, SN, constructorOptions>;
} as TypeAbsorber;

export const lookup = function (
	this: unknown,
	TypeNestedPath: string
): TypeClass | undefined {
	const types = checkThis(this) ? defaultTypes : this || defaultTypes;
	// Type assertion needed because TypesCollectionProxy is a Proxy
	return (types as { lookup: (path: string) => TypeClass | undefined }).lookup(TypeNestedPath);
};


const $run = function <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Ctor: IDEF<T>,
	args: unknown[]
): {
		[key in keyof S]: S[key]
	} {

	// debugger;
	// @ts-expect-error - extracting TypeName from function
	const { TypeName } = Ctor;
	const Cstr = prepareSubtypeForConstruction(TypeName, entity) as { new(...ars: unknown[]): unknown };
	// TODO: check lines below and if Constructor is not mnemonized ...
	if (Cstr === undefined) {
		throw new (WRONG_MODIFICATION_PATTERN as unknown as new (msg: string) => Error)(`[ ${TypeName} ] is not defined as a Type Constructor on used instance`);
	}
	const result = new Cstr(...args);
	// @ts-expect-error - returning result as merged proto type
	return result;
};

// TODO: apply instance .to type .with arguments
export const apply = function <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Ctor: IDEF<T>,
	args: unknown[] = []
): {
		[key in keyof S]: S[key]
	} {
	return $run<E, T, S>(entity, Ctor, args);
};

// TODO: call type .by instance .with arguments
export const call = function <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Ctor: IDEF<T>,
	...args: unknown[]
): {
		[key in keyof S]: S[key]
	} {
	return $run<E, T, S>(entity, Ctor, args);
};

// TODO: bind type .with instance → (...args)
export const bind = function <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Ctor: IDEF<T>
): (...args: unknown[]) => {
	[key in keyof S]: S[key]
} {
	return (...args: unknown[]) => {
		return $run<E, T, S>(entity, Ctor, args);
	};
};

export const decorate = function <
	T extends Constructor<object> | constructorOptions | undefined = undefined
>(
	target?: T,
	config?: constructorOptions
): <U extends Constructor<object>>(cstr: U) => DecoratedClass<U> {
	const opts = (config === undefined && typeof target === 'object' && !(target instanceof Function))
		? target as constructorOptions
		: config;

	const parentType = (target instanceof Function)
		? target as Constructor<object>
		: undefined;

	const decorator = function <U extends Constructor<object>>(cstr: U): DecoratedClass<U> {
		const { name } = cstr;
		if (parentType === undefined) {
			return define(name, cstr as IDEF<object>, opts) as unknown as DecoratedClass<U>;
		}
		const parent = parentType as unknown as {
			define: TypeAbsorber;
		};
		return parent.define(name, cstr as IDEF<object>, opts) as unknown as DecoratedClass<U>;
	};
	return decorator;
};


export const registerHook = function <T extends object>(Ctor: IDEF<T>, hookType: hooksTypes, cb: hook): void {
	// @ts-ignore
	Ctor.registerHook(hookType, cb);
};

export const mnemonica = Object.entries({

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

}).reduce((acc: { [index: string]: unknown }, entry: [string, unknown]) => {
	const [ name, code ] = entry;
	odp(acc, name, {
		get() {
			return code;
		},
		enumerable : true
	});
	return acc;
}, {});

import * as api from './api';

export const {
	define: _define,
	lookup: _lookup
} = api.types;

export const {

	SymbolParentType,
	SymbolConstructorName,
	SymbolDefaultTypesCollection,
	SymbolConfig,
	MNEMONICA,
	MNEMOSYNE,
	TYPE_TITLE_PREFIX,
	ErrorMessages,

} = mnemonica;

// Export createTypesCollection with proper type
 
const typedCreateTypesCollection: CreateTypesCollectionFunction = mnemonica.createTypesCollection as CreateTypesCollectionFunction;
 
export const createTypesCollection: CreateTypesCollectionFunction = typedCreateTypesCollection;


export const defaultCollection = (defaultTypes as any).subtypes;
export const errors = descriptors.ErrorsTypes;

export { utils } from './utils';
export { defineStackCleaner } from './utils';
/* eslint-enable @typescript-eslint/ban-ts-comment, space-before-function-paren */
