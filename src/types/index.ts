'use strict';
/* eslint no-unused-vars: "off" */

export interface ConstructorFunction<ConstructorInstance extends object> {
	new( ...args: unknown[] ): ConstructorInstance;
	( this: ConstructorInstance, ...args: unknown[] ): ConstructorInstance;
	prototype: ConstructorInstance;
}

export type TypeModificator<T extends object> = ( ...args: unknown[] ) => ConstructorFunction<T>;

export type TypeLookup = ( this: Map<string, unknown>, TypeNestedPath: string ) => TypeClass;
// export type TypeLookup = ( this: Map<string, unknown>, TypeNestedPath: string ) => TypeClass<object>;

export type TypeClass = {
	new( ...args: unknown[] ): unknown;
	define: TypeAbsorber;
	lookup: TypeLookup;
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hook: CallableFunction ) => unknown;
};

export type TypeAbsorber = (
	this: unknown,
	TypeName: string,
	// constructHandler: NewableFunction,
	constructHandler: CallableFunction,
	proto?: object,
	config?: object
) => TypeClass;

export type IDEF<T> = {	new(): T } | { (this: T): void };

export type ITypeAbsorber<T> = (
	this: unknown,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: object
) => ITypeClass<T>;

export interface ITypeClass<T> {
	// construct
	new( ...args: unknown[] ): T;
	// define, lookup, registerHook
	( this: T, ...args: unknown[] ): T;
	// props
	define: ITypeAbsorber<T>,
	// define: typeof define,
	lookup: TypeLookup,
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hook: CallableFunction ) => unknown;
}

