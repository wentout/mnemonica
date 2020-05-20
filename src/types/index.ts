'use strict';

export interface ConstructorFunction<ConstructorInstance extends object> {
	new( ...args: any[] ): ConstructorInstance;
	( this: ConstructorInstance, ...args: any[] ): ConstructorInstance;
	prototype: ConstructorInstance;
}

export type TypeModificator<T extends object> = ( ...args: any[] ) => ConstructorFunction<T>;

export type TypeLookup = ( this: Map<string, any>, TypeNestedPath: string ) => TypeClass;
// export type TypeLookup = ( this: Map<string, any>, TypeNestedPath: string ) => TypeClass<object>;

export type TypeClass = {
	new( ...args: any[] ): any;
	define: TypeAbsorber;
	lookup: TypeLookup;
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hook: CallableFunction ) => any;
};

export type TypeAbsorber = (
	this: any,
	TypeName: string,
	// constructHandler: NewableFunction,
	constructHandler: CallableFunction,
	proto?: object,
	config?: object
) => TypeClass;

export type IDEF<T> = {
	new( ...args: any[] ): T;
	( this: T, ...args: any[] ): T;
	prototype?: ThisType<T>;
}

export type ITypeAbsorber<T> = (
	this: any,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: object
) => ITypeClass<T>;

export interface ITypeClass<T> {
	// construct
	new( ...args: any[] ): T;
	// define, lookup, registerHook
	( this: T, ...args: any[] ): T;
	// props
	define: ITypeAbsorber<T>,
	// define: typeof define,
	lookup: TypeLookup,
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hook: CallableFunction ) => any;
}

