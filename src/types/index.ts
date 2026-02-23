'use strict';
/* eslint no-unused-vars: "off" */

// Core type definitions for mnemonica

// Base constructor function type
export type IDEF<T> = { new(): T } | { ( this: T, ...args: any[] ): void };

export interface ConstructorFunction<ConstructorInstance extends object> {
	new( ...args: unknown[] ): ConstructorInstance;
	( this: ConstructorInstance, ...args: unknown[] ): ConstructorInstance;
	prototype: ConstructorInstance;
}

// Type lookup function type
export type TypeLookup = ( this: Map<string, unknown>, TypeNestedPath: string ) => TypeClass;

// Type class definition
export type TypeClass = {
	new( ...args: unknown[] ): unknown;
	define: TypeAbsorber;
	lookup: TypeLookup;
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hookCb: CallableFunction ) => unknown;
};

// Type absorber function type
export type TypeAbsorber = (
	this: unknown,
	TypeName: string,
	constructHandler: CallableFunction,
	proto?: object,
	config?: object
) => TypeClass;

// Generic type absorber
export type ITypeAbsorber<T> = (
	this: unknown,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: object
) => ITypeClass<T>;

// Generic type class
export interface ITypeClass<T> {
	new( ...args: unknown[] ): T;
	( this: T, ...args: unknown[] ): T;
	define: ITypeAbsorber<T>;
	lookup: TypeLookup;
	registerHook: ( type: 'preCreation' | 'postCreation' | 'creationError', hookCb: CallableFunction ) => unknown;
}

// Hook types
export type hooksTypes = 'preCreation' | 'postCreation' | 'creationError';

export type hooksOpts = {
	TypeName: string;
	args: unknown[];
	existentInstance: object;
	inheritedInstance: object;
};

export type hook = {
	( opts: hooksOpts ): void;
};

// Constructor options for define
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

// String-Name map for nested constructors
export type SN = Record<string, new () => unknown>;

// Definitor instance interface
export interface IDefinitorInstance<N extends object, S> {
	new( ...arg: unknown[] ): {
		[ key in keyof S ]: S[ key ];
	} & IDefinitor<N, string>;
	define: IDefinitorInstance<N, string>;
	registerHook: ( hookType: hooksTypes, cb: hook ) => void;
}

// Definitor interface for nested types
export interface IDefinitor<P extends object, SubTypeName extends string> {
	<PP extends object, T, M extends Proto<P, Proto<PP, T>>, S extends SN & M> (
		this: unknown,
		TypeName: SubTypeName,
		constructHandler: IDEF<T>,
		proto?: PP,
		config?: constructorOptions,
	): IDefinitorInstance<M, S>;
}

// Type descriptor instance
export type TypeDescriptorInstance = {
	define: CallableFunction;
	lookup: CallableFunction;
	subtypes: object;
};

// Collection definition (from Props.ts)
export type CollectionDef = {
	define: CallableFunction;
	lookup: CallableFunction;
	invokeHook: CallableFunction;
	registerHook: CallableFunction;
	registerFlowChecker: CallableFunction;
	subtypes: object;
	hooks: object;
	[key: string]: unknown;
};

// Type definition (from Props.ts)
export type TypeDef = {
	proto: object;
	collection: CollectionDef;
	invokeHook: CallableFunction;
	config: {
		strictChain: boolean;
	};
	subtypes: Map<string, Props>;
	isSubType: boolean;
	TypeName: string;
	prototype: unknown;
	stack?: string;
};

// Props type for instance properties (from Props.ts)
export type Props = {
	__proto_proto__: object;
	__args__: unknown[];
	__collection__: CollectionDef;
	__subtypes__: Map<string, object>;
	__type__: TypeDef;
	__parent__: Props;
	__stack__?: string;
	__creator__: TypeDef;
	__timestamp__: number;
	__self__?: {
		extract: CallableFunction;
		[key: string]: unknown;
	};
};

// Constructor type for decorate function
export type Constructor<T = unknown> = new(...args: unknown[]) => T;

// Decorated class type
export type DecoratedClass<T extends Constructor<object>> =
	T &
	(<U extends Constructor<object>>(target: U) => DecoratedClass<U>) &
	{
		define: IDefinitorInstance<InstanceType<T>, unknown>['define'];
		registerHook: IDefinitorInstance<InstanceType<T>, unknown>['registerHook'];
		lookup: TypeLookup;
	};

// TypeDescriptor constructor type
export type TypeDescriptorConstructor = ConstructorFunction<TypeDescriptorInstance>;

// TypesCollection constructor type
export type TypesCollectionConstructor = ConstructorFunction<object>;
