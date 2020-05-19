'use strict';

export interface ConstructorFunction<ConstructorInstance extends object> {
	new( ...args: any[] ): ConstructorInstance;
	( this: ConstructorInstance, ...args: any[] ): ConstructorInstance;
	prototype: ConstructorInstance;
}

export type TypeModificator<T extends object> = ( ...args: any[] ) => ConstructorFunction<T>;

export type TypeLookup = (this: Map<string, any>, TypeNestedPath: string) => TypeClass<object>;


export type IDEF<T> = {
	new( ...args: any[] ): T;
	( this: T, ...args: any[] ): T;
	prototype?: ThisType<T>;
}

type TypeAbsorber<T> = (
	this: any,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: object
) => TypeClass<T>;

export interface TypeClass<T> {
	// construct
	new( ...args: any[] ): T;
	// define, lookup, registerHook
	( this: T, ...args: any[] ): T;
	// props
	define: TypeAbsorber<T>,
	// define: typeof define,
	lookup: TypeLookup,
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hook: CallableFunction ) => any;
}

