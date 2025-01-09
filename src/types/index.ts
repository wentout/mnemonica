'use strict';
/* eslint no-unused-vars: "off" */

// type RN = Record<string|symbol, unknown>

// type narrowable = string | number | boolean | symbol | object | undefined | void | null | [];
// export type IDEF<T extends RN> = {	new(): T } | { (this: T): void };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IDEF<T> = { new(): T } | { ( this: T, ...args: any[] ): void };

export interface ConstructorFunction<ConstructorInstance extends object> {
	new( ...args: unknown[] ): ConstructorInstance;
	( this: ConstructorInstance, ...args: unknown[] ): ConstructorInstance;
	prototype: ConstructorInstance;
}

export type TypeLookup = ( this: Map<string, unknown>, TypeNestedPath: string ) => TypeClass;
// export type TypeLookup = ( this: Map<string, unknown>, TypeNestedPath: string ) => TypeClass<object>;

export type TypeClass = {
	new( ...args: unknown[] ): unknown;
	define: TypeAbsorber;
	lookup: TypeLookup;
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hookCb: CallableFunction ) => unknown;
};

export type TypeAbsorber = (
	this: unknown,
	TypeName: string,
	// constructHandler: NewableFunction,
	constructHandler: CallableFunction,
	proto?: object,
	config?: object
) => TypeClass;

// export type ITypeAbsorber<T extends RN> = (
export type ITypeAbsorber<T> = (
	this: unknown,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: object
) => ITypeClass<T>;

// export interface ITypeClass<T extends RN> {
export interface ITypeClass<T> {
	// construct
	new( ...args: unknown[] ): T;
	// define, lookup, registerHook
	( this: T, ...args: unknown[] ): T;
	// props
	define: ITypeAbsorber<T>,
	// define: typeof define,
	lookup: TypeLookup,
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hookCb: CallableFunction ) => unknown;
}

export type hooksTypes = 'preCreation' | 'postCreation' | 'creationError'
export type hooksOpts = {
	TypeName: string,
	args: unknown[],
	existentInstance: object,
	inheritedInstance: object,
}
export type hook = {
	( opts: hooksOpts ): void
}

export type constructorOptions = {

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

};


export type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;

// type Narrowable =
//   string | number | boolean | symbol | object | undefined | void | null | [];
// type RN = Record<string|symbol, unknown>
export type SN = Record<string, new () => unknown>

export interface IDefinitorInstance<N extends object, S> {
	new( ...arg: unknown[] ): {
		[ key in keyof S ]: S[ key ]
	}
	define: IDefinitor<N, string>
	registerHook: ( hookType: hooksTypes, cb: hook ) => void
}

export interface IDefinitor<P extends object, SubTypeName extends string> {
	<PP extends object, T, M extends Proto<P, Proto<PP, T>>, S extends SN & M> (
		this: unknown,
		TypeName: SubTypeName,
		constructHandler: IDEF<T>,
		proto?: PP,
		config?: constructorOptions,
	): IDefinitorInstance<M, S>
}

export type TypeDescriptorInstance = {
	define: CallableFunction;
	lookup: CallableFunction;
	subtypes: object;
};
