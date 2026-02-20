/* eslint-disable @typescript-eslint/ban-ts-comment, space-before-function-paren */
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
>(
	this: unknown,
	TypeName?: string,
	constructHandler?: IDEF<T>,
	config?: constructorOptions,
): R {
	const types = checkThis(this) ? defaultTypes : this || defaultTypes;
	return types.define(TypeName, constructHandler, config);
};

export const lookup = function (TypeNestedPath) {
	const types = checkThis(this) ? defaultTypes : this || defaultTypes;
	return types.lookup(TypeNestedPath);
} as TypeLookup;


const $run = function <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Constructor: IDEF<T>,
	args: unknown[]
): {
		[key in keyof S]: S[key]
	} {

	// debugger;
	// @ts-ignore
	const { TypeName } = Constructor;
	const Cstr = prepareSubtypeForConstruction(TypeName, entity) as { new(...ars: unknown[]): unknown };
	// TODO: check lines below and if Constructor is not mnemonized ...
	if (Cstr === undefined) {
		throw new WRONG_MODIFICATION_PATTERN(`[ ${TypeName} ] is not defined as a Type Constructor on used instance`);
	}
	const result = new Cstr(...args);
	// @ts-ignore
	return result;
};

// TODO: apply instance .to type .with arguments
export const apply = function <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Constructor: IDEF<T>,
	args: unknown[] = []
): {
		[key in keyof S]: S[key]
	} {
	return $run<E, T, S>(entity, Constructor, args);
};

// TODO: call type .by instance .with arguments
export const call = function <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Constructor: IDEF<T>,
	...args: unknown[]
): {
		[key in keyof S]: S[key]
	} {
	return $run<E, T, S>(entity, Constructor, args);
};

// TODO: bind type .with instance → (...args)
export const bind = function <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Constructor: IDEF<T>
): (...args: unknown[]) => {
	[key in keyof S]: S[key]
} {
	return (...args) => {
		return $run<E, T, S>(entity, Constructor, args);
	};
};




type Constructor<T = unknown> = new (...args: unknown[]) => T;

type ClassDecorator<T = unknown> = (
  target: Constructor<unknown>
) => Constructor<T> | void;


interface CallableClassWithDecoratorFactory<C> {
  // 1. As constructor (normal usage)
  new (...args: unknown[]): C;

  // 2. As call signature → returns a class decorator
  <T>(target?: Constructor<T>): ClassDecorator<T>;
}


export const decorate = function (
	parentClass?: { new(): unknown } | constructorOptions | undefined,
	config?: constructorOptions
) {
	if (config === undefined && typeof parentClass === 'object' && !(parentClass instanceof Function)) {
		config = parentClass as constructorOptions;
		parentClass = undefined;
	}
	// const decorator = function <T extends { new(): unknown }>(cstr: T, s?: ClassDecoratorContext<T>): T {
	const decorator = function <
		T extends Constructor<unknown>,
		R extends CallableClassWithDecoratorFactory<InstanceType<T>> & T
	>(cstr: T): R {
		// const name = typeof s === 'object' ? s.name : cstr.constructor.name;
		const { name } = cstr;
		if (parentClass === undefined) {
			return define(name, cstr, config) as unknown as R;
		}
		// @ts-ignore
		return parentClass.define(name, cstr, config) as unknown as R;
	};
	return decorator;
};


export const registerHook = function <T extends object>(Constructor: IDEF<T>, hookType: hooksTypes, cb: hook): void {
	// @ts-ignore
	Constructor.registerHook(hookType, cb);
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

export const {

	SymbolParentType,
	SymbolConstructorName,
	SymbolDefaultTypesCollection,
	SymbolConfig,
	MNEMONICA,
	MNEMOSYNE,
	TYPE_TITLE_PREFIX,
	ErrorMessages,
	createTypesCollection,

} = mnemonica;


export const defaultCollection = defaultTypes.subtypes;
export const errors = descriptors.ErrorsTypes;

export { utils } from './utils';
export { defineStackCleaner } from './utils';
/* eslint-enable @typescript-eslint/ban-ts-comment, space-before-function-paren */
