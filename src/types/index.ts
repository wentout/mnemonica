'use strict';
/* eslint no-unused-vars: "off" */

// Core type definitions for mnemonica

// Base constructor function type - can be a class constructor or a function
export type IDEF<T> = { new(): T } | { (this: T, ...args: unknown[]): void };

// Constructor function with prototype
export interface ConstructorFunction<ConstructorInstance extends object> {
	new(...args: unknown[]): ConstructorInstance;
	(this: ConstructorInstance, ...args: unknown[]): ConstructorInstance;
	prototype: ConstructorInstance;
}

// Hook types
export type hooksTypes = 'preCreation' | 'postCreation' | 'creationError';

// Hook options passed to hook callbacks
export type hooksOpts = {
	TypeName?: string;
	type?: TypeDef;
	args: unknown[];
	existentInstance: object;
	inheritedInstance: object;
	creator?: object;
};

// Hook callback type
export type hook = (opts: hooksOpts) => void;

// Constructor options for define
export type constructorOptions = {
	// explicit declaration we wish use
	// an old style based constructors
	ModificationConstructor?: CallableFunction,
	// shall or not we use strict checking
	// for creation sub-instances Only from current type
	// or we might use up-nested sub-instances from chain
	strictChain?: boolean,
	// should we use forced errors checking
	// to make all inherited types errored
	// if there is an error somewhere in chain
	blockErrors?: boolean,
	// if it is necessary to collect stack
	// as a __stack__ prototype property
	// during the process of instance creation
	submitStack?: boolean,
	// await new Constructor()
	// must return value
	awaitReturn?: boolean,
	// Force class mode (auto-detected by default)
	asClass?: boolean,
};

// Subtypes map - represents the subtypes property
export type SubtypesMap = Map<string, TypeClass>;

// Type definition object (internal properties)
export type TypeDef = {
	TypeName: string;
	proto: object;
	isSubType: boolean;
	subtypes: SubtypesMap;
	collection: CollectionDef;
	config: {
		strictChain: boolean;
		blockErrors?: boolean;
		submitStack?: boolean;
		awaitReturn?: boolean;
		asClass?: boolean;
		ModificationConstructor?: CallableFunction;
	};
	parentType?: TypeDef;
	constructHandler: () => CallableFunction;
	title: string;
	hooks: Record<string, hook[]>;
	invokeHook: (hookType: hooksTypes, opts: hooksOpts) => void;
	prototype: unknown;
	stack?: string;
};

// Collection definition
export type CollectionDef = {
	define: TypeAbsorber;
	lookup: TypeLookup;
	invokeHook: (hookType: hooksTypes, opts: hooksOpts) => void;
	registerHook: (hookType: hooksTypes, cb: hook) => void;
	registerFlowChecker: (cb: () => unknown) => void;
	subtypes: SubtypesMap;
	hooks: Record<string, hook[]>;
	[key: string]: unknown;
};

// Type lookup function type
export type TypeLookup = (this: Map<string, unknown>, TypeNestedPath: string) => TypeClass | undefined;

// Type absorber function type - used for defining subtypes
export type TypeAbsorber = <T extends object, P extends object = object>(
	this: unknown,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: P,
	config?: constructorOptions
) => IDefinitorInstance<Proto<P, T>, SN & Proto<P, T>>;

// Proto merge type - combines parent and child types
export type Proto<P extends object, T extends object> = Pick<P, Exclude<keyof P, keyof T>> & T;

// String-Name map for nested constructors - represents subtypes on instances
export type SN = Record<string, IDefinitorInstance<object, object>>;

// Instance properties (internal)
export type Props = {
	__proto_proto__: object;
	__args__: unknown[];
	__collection__: CollectionDef;
	__subtypes__: Map<string, object>;
	__type__: TypeDef;
	__parent__: object;
	__stack__?: string;
	__creator__: TypeDef;
	__timestamp__: number;
	__self__?: {
		extract: () => Record<string, unknown>;
		pick: (...keys: string[]) => Record<string, unknown>;
		parent: (constructorLookupPath?: string) => object | undefined;
		clone: object;
		fork: (...forkArgs: unknown[]) => object;
		exception: (error: Error, ...args: unknown[]) => Error;
		sibling: SiblingAccessor;
		[key: string]: unknown;
	};
};

// Sibling type accessor
export interface SiblingAccessor {
	(SiblingTypeName: string): TypeClass | undefined;
	[key: string]: TypeClass | undefined;
}

// Instance methods available on all mnemonica instances
export interface MnemonicaInstance {
	extract(): Record<string, unknown>;
	pick(...keys: string[]): Record<string, unknown>;
	pick(keys: string[]): Record<string, unknown>;
	parent(): object | undefined;
	parent(constructorLookupPath: string): object | undefined;
	readonly clone: object;
	fork(...forkArgs: unknown[]): object;
	exception(error: Error, ...args: unknown[]): Error;
	readonly sibling: SiblingAccessor;
	[key: string]: unknown;
}

// Definitor instance - the constructor function returned by define
// N = instance type (properties available on instances)
// S = subtypes map
export interface IDefinitorInstance<N extends object, S = SN> {
	new(...args: unknown[]): N & MnemonicaInstance & S;
	(...args: unknown[]): N & MnemonicaInstance & S;
	define: TypeAbsorber;
	lookup: TypeLookup;
	registerHook(hookType: hooksTypes, cb: hook): void;
	TypeName: string;
	prototype: N;
	subtypes: SubtypesMap;
}

// Definitor interface for nested types - callable constructor with define method
export interface IDefinitor<P extends object, SubTypeName extends string> {
	<PP extends object, T extends object, M extends Proto<P, Proto<PP, T>>, S extends SN & M>(
		this: unknown,
		TypeName: SubTypeName,
		constructHandler: IDEF<T>,
		proto?: PP,
		config?: constructorOptions,
	): IDefinitorInstance<M, S>;
}

// Type class - base type constructor
export type TypeClass = IDefinitorInstance<object, SN>;

// Generic type class
export interface ITypeClass<T> {
	new(...args: unknown[]): T;
	(this: T, ...args: unknown[]): T;
	define: ITypeAbsorber<T>;
	lookup: TypeLookup;
	registerHook(hookType: hooksTypes, cb: hook): void;
}

// Generic type absorber
export type ITypeAbsorber<T> = (
	this: unknown,
	TypeName: string,
	constructHandler: IDEF<T>,
	proto?: object,
	config?: constructorOptions
) => ITypeClass<T>;

// Type descriptor instance
export type TypeDescriptorInstance = {
	define: CallableFunction;
	lookup: CallableFunction;
	subtypes: object;
};

// TypeDescriptor constructor type
export type TypeDescriptorConstructor = ConstructorFunction<TypeDescriptorInstance>;

// TypesCollection constructor type
export type TypesCollectionConstructor = ConstructorFunction<object>;

// Constructor type for decorate function
export type Constructor<T = object> = new (...args: unknown[]) => T;

// Decorated class type - includes call signature for decorator pattern
export type DecoratedClass<T extends Constructor<object>> =
	T &
	(<U extends Constructor<object>>(target: U) => DecoratedClass<U>) & {
		define: TypeAbsorber;
		registerHook(hookType: hooksTypes, cb: hook): void;
		lookup: TypeLookup;
		TypeName: string;
	};

// Function that returns a constructor (factory pattern)
export type ConstructorFactory<T> = () => Constructor<T>;

// Apply/Call/Bind function types
export type ApplyFunction = <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Ctor: IDEF<T>,
	args?: unknown[]
) => S;

export type CallFunction = <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Ctor: IDEF<T>,
	...args: unknown[]
) => S;

export type BindFunction = <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Ctor: IDEF<T>
) => (...args: unknown[]) => S;
