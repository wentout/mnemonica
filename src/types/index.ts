'use strict';
/* eslint no-unused-vars: "off" */

// Props type for getProps/setProps
export type PropsType = Record<string, unknown>;

// Core type definitions for mnemonica

// Base constructor function type - can be a class constructor or a function
export type IDEF<T> = { new(): T } | { (this: T, ...args: unknown[]): void };
// More flexible version that accepts typed arguments for common patterns
export type IDEFWithArgs<T, Args extends unknown[] = unknown[]> = { new(): T } | { (this: T, ...args: Args): void };

// Error message types - all error messages are strings
export type ErrorMessageKey =
	| 'BASE_ERROR_MESSAGE'
	| 'HANDLER_MUST_BE_A_FUNCTION'
	| 'WRONG_TYPE_DEFINITION'
	| 'WRONG_INSTANCE_INVOCATION'
	| 'WRONG_MODIFICATION_PATTERN'
	| 'ALREADY_DECLARED'
	| 'WRONG_ARGUMENTS_USED'
	| 'WRONG_HOOK_TYPE'
	| 'MISSING_HOOK_CALLBACK'
	| 'MISSING_CALLBACK_ARGUMENT'
	| 'OPTIONS_ERROR'
	| 'WRONG_STACK_CLEANER';
	// | 'TYPENAME_MUST_BE_A_STRING'
	// | 'FLOW_CHECKER_REDEFINITION'

// Error messages object type
export type ErrorMessages = Record<ErrorMessageKey, string>;

// Error constructor from constructError - constructable function with prototype
export interface MnemonicaErrorConstructor {
	new(addition?: string, stack?: string[]): Error;
	(name: string): Error;
	prototype: {
		constructor: CallableFunction;
	};
}

// Errors types map - indexable record of error constructors
export type ErrorsTypesMap = Record<string, MnemonicaErrorConstructor>;

// Mnemonica error interface for extended Error objects
export interface MnemonicaError extends Error {
	exceptionReason?: Error;
	reasons?: Error[];
	surplus?: Error[];
}

// Constructor function with prototype
export interface _Internal_TC_<ConstructorInstance extends object> {
	new(...args: unknown[]): ConstructorInstance;
	(this: ConstructorInstance, ...args: unknown[]): ConstructorInstance;
	readonly prototype: ConstructorInstance & {
		readonly constructor: _Internal_TC_<ConstructorInstance>
	};
}

// Constructor function with prototype
export interface TypeConstructor<ConstructorInstance extends object> {
	new(...args: unknown[]): ConstructorInstance;
	(this: ConstructorInstance, ...args: unknown[]): ConstructorInstance;
	readonly prototype: ConstructorInstance & {
		readonly constructor: TypeConstructor<ConstructorInstance>
	};
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

// Constructor options for define - default (exposeInstanceMethods defaults to true behavior)
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
	// Expose instance methods (extract, pick, parent, clone, fork, exception, sibling)
	// on the instance type. When false, these methods are still available on the prototype
	// but hidden from the type definition unless explicitly exposed.
	exposeInstanceMethods?: boolean,
};

// Constructor options that explicitly hide instance methods
export type HideInstanceMethodsOptions = constructorOptions & {
	exposeInstanceMethods: true;
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
	config: constructorOptions;
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

// Type lookup function type: may have augmentation by Tactica re-definition
export type TypeLookup = (this: Map<string, unknown>, TypeNestedPath: string) => TypeClass | undefined;

// Proto merge type - combines parent and child types
export type Proto<P extends object, T extends object> = T & Pick<P, Exclude<keyof P, keyof T>>;


// export type ProtoFlat<
// 	P extends object,
// 	T extends object,
// 	F extends Proto<P, T> = Proto<P, T>
// > = { [key in keyof F]: F[key]} ;

export type ProtoFlat<
	P extends object,
	T extends object,
	L extends Exclude<keyof P, keyof T> = Exclude<keyof P, keyof T>,
> = {
    [key in keyof T]: T[key];
} & {
	[key in L]: P[key];
};

export type Flatten<F> = { [key in keyof F]: F[key] }

// Sibling type accessor
export interface SiblingAccessor {
	(SiblingTypeName: string): TypeClass | undefined;
	[key: string]: TypeClass | undefined;
}

// Mnemonica instance methods interface
// These methods are always available on the prototype chain
// but can be hidden from type definitions via exposeInstanceMethods option
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
}

// Instance properties for __self__ reference
// This merges internal props with the instance methods
export type InstanceSelfProps = InstanceInternalProps & {
	__self__: InstanceInternalProps & MnemonicaInstance;
};

// Combined Props type for internal used inside of ./src
export type Props = InstanceSelfProps & {
	[key: string]: unknown;
};


// Internal instance properties (non-enumerable)
// These are always present on instances but accessed via getProps/setProps
export type InstanceInternalProps = {
	__proto_proto__: object;
	__args__: unknown[];
	__collection__: CollectionDef;
	__subtypes__: Map<string, object>;
	__type__: TypeDef;
	__parent__: object;
	__stack__?: string;
	__creator__: TypeDef;
	__timestamp__: number;
	// __self__: InstanceInternalProps & MnemonicaInstance;3333
};


// Helper type to detect if exposeInstanceMethods is explicitly false
export type IsHidingMethods<Config extends constructorOptions> =
  Config extends { exposeInstanceMethods: false } ? true : false;

// Combined instance type based on config
export type InstanceResult<
  N extends object,
  Config extends constructorOptions,
  R extends Flatten<N> = Flatten<N>,
  I extends { [key in keyof R]: R[key] } = { [key in keyof R]: R[key] },
  M extends I & MnemonicaInstance = I & MnemonicaInstance
> = IsHidingMethods<Config> extends true
	// Only user-defined properties (hiding MnemonicaInstance & subtypes)
  ? R
	// User props + instance methods + subtypes
  : M;

// Definitor instance - the constructor function returned by define
// N = instance type (properties available on instances)
// S = subtypes map
// Config = constructor options controlling type visibility
export interface IDefinitorInstance<
	N extends object,
	Config extends constructorOptions = constructorOptions,
	R extends InstanceResult<N, Config> = InstanceResult<N, Config>
> {

	TypeName: string;
	prototype: N;

	
	// the line below declares a `new ...` invocation,
	// so makes interface constructible
	// new(...args: unknown[]): { [key in keyof R]: R[key] };
	new(...args: unknown[]): R;

	
	// TODO: need check if line below works
	// also TS hinting check as well
	// the line below should make is a @decorate decorator working
	(...args: unknown[]): IDefinitorInstance<R, Config>;


	// Define method that combines parent N with new type T using Proto
	define<
		T extends object,

		// this will be instance type for sub-type !!!
		// F extends Flatten<Proto<N, T>>
		F extends Proto<N, T>
	>(
		TypeOrTypeName: string | CallableFunction,
		constructHandlerOrConfig?: IDEF<T> | object | boolean | CallableFunction,
		configOrUndefined?: constructorOptions | CallableFunction | boolean
	): IDefinitorInstance<F, Config>;
	
	lookup: TypeLookup;
	
	registerHook(hookType: hooksTypes, cb: hook): void;
	
	
	subtypes: SubtypesMap;
	
	// Internal properties accessed by tests
	__type__?: TypeDef;
	collection?: CollectionDef;

	/*
	// Allow dynamic property access for subtypes
	[key: string]: unknown;
	*/
}

// Type absorber function type - used for defining subtypes
// Supports multiple calling conventions:
// 1. Modern: define(TypeName, constructHandler, config?)
// 2. Legacy: define(constructHandler, config?) - TypeName from constructor name
// 3. Nested: parentType.define(TypeName, constructHandler, config?)
// Using interface with overloads to properly handle exposeInstanceMethods option
export interface TypeAbsorber {
	// Overload: with exposeInstanceMethods: false - hide instance methods
	<T extends object>(
		this: unknown,
		TypeOrTypeName: string | CallableFunction,
		constructHandlerOrConfig: IDEF<T> | object | boolean | CallableFunction,
		configOrUndefined: HideInstanceMethodsOptions
	): IDefinitorInstance<T, HideInstanceMethodsOptions>;
	
	// Overload: without config or with exposeInstanceMethods not false - show all
	<T extends object>(
		this: unknown,
		TypeOrTypeName: string | CallableFunction,
		constructHandlerOrConfig?: IDEF<T> | object | boolean | CallableFunction,
		configOrUndefined?: constructorOptions | CallableFunction | boolean
	): IDefinitorInstance<T, constructorOptions>;
}

// TypesCollection interface for createTypesCollection
// This represents the actual return type of createTypesCollection
export interface TypesCollection {
	define: TypeAbsorber;
	lookup: TypeLookup;
	registerHook(hookType: hooksTypes, cb: hook): void;
	invokeHook(hookType: hooksTypes, opts: hooksOpts): void;
	registerFlowChecker(cb: () => unknown): void;
	subtypes: SubtypesMap;
	hooks: Record<string, hook[]>;
	[key: string]: unknown;
}

// createTypesCollection function type
export type CreateTypesCollectionFunction = (config?: constructorOptions) => TypesCollection;

// Type class - base type constructor
export type TypeClass = IDefinitorInstance<object>;

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
	TypeName: string;
};

// TypeDescriptor constructor type
export type TypeDescriptorConstructor = TypeConstructor<TypeDescriptorInstance>;

// TypesCollection constructor type
export type TypesCollectionConstructor = TypeConstructor<object>;

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

// Utils object type
export interface UtilsCollection {
	extract: (instance: object) => Record<string, unknown>;
	pick: (instance: object, ...args: (string | string[])[]) => Record<string, unknown>;
	collectConstructors: (instance: object, flat?: boolean) => (CallableFunction | string)[];
	merge: (...args: unknown[]) => unknown;
	parse: (value: unknown) => object | undefined;
	parent: (instance: object, strict?: boolean) => object | undefined;
	toJSON: (instance: object) => string;
	[key: string]: CallableFunction;
}

// Main mnemonica module interface - represents the exported module object
export interface MnemonicaModule {
	// Core functions
	define: TypeAbsorber;
	lookup: (TypeNestedPath: string) => TypeClass | undefined;
	apply: ApplyFunction;
	call: CallFunction;
	bind: BindFunction;
	decorate: <U extends Constructor<object>>(target?: object, config?: object) => DecoratedClass<U>;
	registerHook: <T extends object>(Ctor: IDEF<T>, hookType: hooksTypes, cb: hook) => void;

	// Descriptors
	defaultTypes: TypesCollection;

	// Errors
	BASE_MNEMONICA_ERROR: MnemonicaErrorConstructor;
	WRONG_TYPE_DEFINITION: MnemonicaErrorConstructor;
	WRONG_INSTANCE_INVOCATION: MnemonicaErrorConstructor;
	WRONG_MODIFICATION_PATTERN: MnemonicaErrorConstructor;
	ALREADY_DECLARED: MnemonicaErrorConstructor;
	WRONG_ARGUMENTS_USED: MnemonicaErrorConstructor;
	WRONG_HOOK_TYPE: MnemonicaErrorConstructor;
	MISSING_CALLBACK_ARGUMENT: MnemonicaErrorConstructor;
	// FLOW_CHECKER_REDEFINITION: MnemonicaErrorConstructor;
	MISSING_HOOK_CALLBACK: MnemonicaErrorConstructor;
	TYPENAME_MUST_BE_A_STRING: MnemonicaErrorConstructor;
	HANDLER_MUST_BE_A_FUNCTION: MnemonicaErrorConstructor;
	OPTIONS_ERROR: MnemonicaErrorConstructor;
	WRONG_STACK_CLEANER: MnemonicaErrorConstructor;

	// Constants
	MNEMONICA: string;
	MNEMOSYNE: string;
	URANUS: string;
	SymbolParentType: symbol;
	SymbolConstructorName: symbol;
	SymbolDefaultTypesCollection: symbol;
	SymbolConfig: symbol;
	SymbolGaia: symbol;
	TYPE_TITLE_PREFIX: string;
	ErrorMessages: ErrorMessages;

	// Utils
	utils: UtilsCollection;
	getProps: (instance: object) => PropsType | undefined;
	setProps: (instance: object, values: object) => string[] | false;
	findSubTypeFromParent: (instance: object | undefined, subType: string) => object | null;
	isClass: (fn: CallableFunction) => boolean;

	// createTypesCollection
	createTypesCollection: CreateTypesCollectionFunction;

	// Allow additional properties
	[key: string]: unknown;
}
