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

function checkThis (pointer: typeof mnemonica | typeof exports | unknown): boolean {
	return pointer === mnemonica || pointer === exports;
}

type Proto <P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;

// type Narrowable =
//   string | number | boolean | symbol | object | undefined | void | null | [];
type RN = Record<string|symbol, unknown>
type SN = Record<string, new() => unknown>

interface IDefinitorInstance<N extends RN, S> {
		new(): {
			[key in keyof S]: S[key]
		}
		define: IDefinitor<N, string>
}

interface IDefinitor<P extends RN, SubTypeName extends string> {
	<PP extends object, T extends RN, M extends Proto<P, Proto<PP, T>>, S extends SN & M> (
		this: unknown,
		TypeName: SubTypeName,
		constructHandler: IDEF<T>,
		proto?: PP,
		config?: object,
	): IDefinitorInstance<M, S>
}

export const define = function <
	T extends RN,
	// K extends IDEF<T>,
	// H extends ThisType<IDEF<T>>,
	P extends object,
	N extends Proto<P, T>,
	SubTypeName extends string,
	// so S it just basically allows nested constructors
	// and gives extracted props from constructHandler & proto
	// then it goes to new() keyword of define output
	S extends SN & N,
	R extends {
		new (): {
			[key in keyof S]: S[key]
		} 
		define: IDefinitor<N, SubTypeName>
	},
> (
	this: unknown,
	TypeName?: string,
	constructHandler?: IDEF<T>,
	proto?: P,
	config = {},
): R {
	const types = checkThis(this) ? defaultTypes : this || defaultTypes;
	// if (typeof constructHandler !== 'function') {
	// 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// 	// @ts-ignore
	// 	// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
	// 	return function (decoratorConstructHandler: Function, y: unknown) {
	// 		if (typeof decoratorConstructHandler === 'function') {
	// 			types.define(decoratorConstructHandler.name, decoratorConstructHandler, proto, config);
	// 		}
	// 	};
	// }
	return types.define(TypeName, constructHandler, proto, config);
};

export const lookup = function (TypeNestedPath) {
	const types = checkThis(this) ? defaultTypes : this || defaultTypes;
	return types.lookup(TypeNestedPath);
} as TypeLookup;

export const mnemonica = Object.entries({

	define,
	lookup,

	...descriptors,

	...errorsApi,
	...constants,

}).reduce((acc: { [ index: string ]: unknown }, entry: [ string, unknown ]) => {
	const [ name, code ] = entry;
	odp(acc, name, {
		get () {
			return code;
		},
		enumerable : true
	});
	return acc;
}, {});

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

export function apply <E extends RN, T extends RN, S extends Proto<E, T>> (entity: E, Constructor: IDEF<T>, args?: unknown[]): {
	[key in keyof S]: S[key]
} {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const result = Constructor.apply(entity, args);
	return result;
}

export function call <E extends RN, T extends RN, S extends Proto<E, T>> (entity: E, Constructor: IDEF<T>, ...args: unknown[]): {
	[key in keyof S]: S[key]
} {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const result = Constructor.call(entity, ...args);
	return result;
}

export function bind <E extends RN, T extends RN, S extends Proto<E, T>> (entity: E, Constructor: IDEF<T>): (...args: unknown[]) => {
	[key in keyof S]: S[key]
} {
	return (...args) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const result = Constructor.call(entity, ...args);
		return result;
	};
}
