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

function checkThis (pointer: typeof mnemonica | typeof exports | unknown): boolean {
	return pointer === mnemonica || pointer === exports;
}

type Proto <P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;

interface IDefinitor {
	<T, P extends object, N extends Proto<P, T>, ID extends string> (
		this: unknown,
		TypeName: ID,
		constructHandler: IDEF<T>,
		proto?: P,
		config?: object,
	): {
		new(): N
		define: IDefinitor
	}
}

export const define = function <T, P extends object, N extends Proto<P, T>> (
	this: unknown,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: P,
	config = {},
): {
	// new(): T & P // s → never
	// new(): P & T // s → never
	// new(): T
	new(): N
	define: TypeAbsorber
} {
	const types = checkThis(this) ? defaultTypes : this || defaultTypes;
	return types.define(TypeName, constructHandler, proto, config);
} as IDefinitor;

// const SSS = define('MyType', function (this: { s: number }) {
// 	this.s = 123;
// }, { m : '321', s : '321'});

// const s = new SSS;
// type ss = typeof s.s;
// const z: ss = s.s;
// console.log(z);
// s.m = '123';
// s.s = 123;
// // s.z = '123';

export const tsdefine = function <T> (
	this: unknown,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: object,
): ITypeClass<T> {
	return defaultTypes.define(TypeName, constructHandler, proto, config);
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

}).reduce((acc: { [index: string]: unknown }, entry: [string, unknown]) => {
	const [name, code] = entry;
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
