'use strict';
/* eslint no-unused-vars: "off" */

// Props type for getProps/setProps
export type PropsType = Record<string, unknown>;

// Core type definitions for mnemonica

// Base constructor function type - can be a class constructor or a function.
// Args defaults to unknown[] so IDEF<T> is backwards compatible;
// supply Args to get typed constructor params: IDEF<MyType, [string, number]>
export type IDEF<T, Args extends unknown[] = unknown[]> = { new(): T } | { (this: T, ...args: Args): void };

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

// Hook callback — passed to registerHook and invoked by invokeHook
export interface hook extends CallableFunction {
	(opts: hooksOpts): unknown;
}

// Error constructor from constructError - constructable function with prototype
export interface MnemonicaErrorConstructor {
	new(addition?: string, stack?: string | string[]): Error;
	(name: string): Error;
	prototype: {
		constructor: MnemonicaErrorConstructor;
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

/**
 * Internal Type Constructor.
 * "Type" here is used in the Computer Science sense — an interface/contract
 * describing what a constructor must satisfy (both `new`-able and callable).
 * TC = Type Constructor; "Internal" means this is the library's own constructor
 * shape, distinct from user-facing TypeConstructor below.
 */
export interface _Internal_TC_<ConstructorInstance extends object> {
	new(...args: unknown[]): ConstructorInstance;
	(this: ConstructorInstance, ...args: unknown[]): ConstructorInstance;
	readonly prototype: ConstructorInstance & {
		readonly constructor: _Internal_TC_<ConstructorInstance>
	};
}

/**
 * Public alias for _Internal_TC_ — the shape of constructor functions returned by `define()`.
 * Augmented by tactica-generated TypeRegistry to become user-specific types.
 * Kept as a named alias (rather than inlining _Internal_TC_) so tactica can reference it
 * cleanly in generated declaration files.
 */
export type TypeConstructor<ConstructorInstance extends object> = _Internal_TC_<ConstructorInstance>;

// Hook types
export type hooksTypes = 'preCreation' | 'postCreation' | 'creationError';

// Hook options passed to hook callbacks
// P = parent / existent instance (proto)
// T = child / inherited instance (type being created)
export type hooksOpts<P = object, T = P> = {
	TypeName: string;
	type: TypeDef;
	args: unknown[];
	existentInstance: P;
	inheritedInstance?: T;
	creator?: { throwModificationError(error: Error): void };
};

// Callback passed into ModificationConstructor to attach internal props to the prototype
export interface AddPropsCallback extends CallableFunction {
	(proto: object): void;
}

// ModificationConstructor: wires prototype chain during instance creation
export interface ModificationConstructor extends CallableFunction {
	(
		this: object,
		ModificatorType: MnemonicaConstructor,
		ModificatorTypePrototype: object,
		_addProps: AddPropsCallback
	): MnemonicaConstructor;
}

// Factory that returns a ModificationConstructor (used in constructorOptions)
export interface ModificationConstructorFactory extends CallableFunction {
	(): ModificationConstructor;
}

// Factory that returns a MnemonicaConstructor (stored in TypeDef.constructHandler)
export interface MnemonicaConstructorFactory extends CallableFunction {
	(): MnemonicaConstructor;
}

// Marks the top of a captured stack trace (passed to Error.captureStackTrace as constructorOpt)
export interface StackBoundary extends CallableFunction {}

// A wrappable utility method — any callable that wrapThis() can proxy
export interface WrappableMethod extends CallableFunction {}

// Constructor options for define - default (exposeInstanceMethods defaults to true behavior)
export type constructorOptions = {
	// explicit declaration we wish use
	// an old style based constructors
	ModificationConstructor?: ModificationConstructorFactory,
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
	constructHandler: MnemonicaConstructorFactory;
	title: string;
	hooks: Record<string, Set<hook>>;
	invokeHook: (hookType: hooksTypes, opts: hooksOpts) => Set<unknown>;
	prototype: unknown;
	stack?: string;
	[Symbol.hasInstance]: (instance: object) => boolean;
};

// Collection definition
export type CollectionDef = Hookable & {
	define: TypeAbsorber;
	lookup: TypeLookup;
	subtypes: SubtypesMap;
	[key: string]: unknown;
};

// Type lookup function type: may have augmentation by Tactica re-definition
export interface TypeLookup extends CallableFunction {
	(this: Map<string, unknown>, TypeNestedPath: string): TypeClass | undefined;
}

// Specification for chained subtype creation with .then()
export interface ThenSpec {
	subtype: object;
	args: unknown[];
	name?: string;
}

// Context object passed through the InstanceCreator pipeline
export interface InstanceCreatorContext {
	type: TypeDef;
	TypeName: string;
	existentInstance: object;
	args: unknown[];
	ModificationConstructor: ModificationConstructor;
	ModificatorType: MnemonicaConstructor;
	InstanceModificator: MnemonicaConstructor;
	inheritedInstance: object | Promise<object>;
	config: constructorOptions;
	proto: object;
	__proto_proto__?: object;
	stack?: string[];

	getExistentAsyncStack(existentInstance: object): unknown;
	postProcessing(continuationOf?: TypeDef): void;
	makeAwaiter(type: TypeDef, then?: ThenSpec): Promise<object>;
	addThen(then: ThenSpec): void;
	invokePreHooks(): void;
	invokePostHooks(): { type: Set<unknown>; collection: Set<unknown> };
	throwModificationError(error: MnemonicaError): void;
}

/**
 * Proto merge type - combines parent and child types without property conflicts.
 *
 * When a subtype is defined from a parent instance, we want the child properties
 * to take precedence. `Exclude<keyof P, keyof T>` removes overlapping keys from P,
 * so `Pick<P, ...>` only brings in parent properties that don't clash with child.
 *
 * Result: child T gets all its own props, plus parent's non-overlapping props.
 */
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
	__creator__: InstanceCreatorContext;
	__timestamp__: number;
};

// Combined Props type for internal use inside ./src
export type Props = InstanceInternalProps & {
	__self__: InstanceInternalProps & MnemonicaInstance;
	[key: string]: unknown;
};

// Helper type: true when exposeInstanceMethods is explicitly false
export type IsHidingMethods<Config extends constructorOptions> =
  Config extends { exposeInstanceMethods: false } ? true : false;

// Combined instance type based on config:
//   hiding → Flatten<N> (user props only)
//   showing → Flatten<N> & MnemonicaInstance (user props + extract/fork/etc.)
export type InstanceResult<
  N extends object,
  Config extends constructorOptions,
> = IsHidingMethods<Config> extends true ? Flatten<N> : Flatten<N> & MnemonicaInstance;

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
export interface TypeAbsorber extends CallableFunction {
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
export interface TypesCollection extends Hookable {
	define: TypeAbsorber;
	lookup: TypeLookup;
	subtypes: SubtypesMap;
	[key: string]: unknown;
}

// Shared interface for objects that support hooks (TypeDef and CollectionDef)
export interface Hookable {
	hooks: Record<string, Set<hook>>;
	invokeHook(hookType: hooksTypes, opts: hooksOpts): Set<unknown>;
	registerHook(hookType: hooksTypes, cb: hook): void;
	registerFlowChecker(cb: (opts: object) => unknown): void;
}

// createTypesCollection function type
export type CreateTypesCollectionFunction = (config?: constructorOptions) => TypesCollection;

// Type class - base type constructor
export type TypeClass = IDefinitorInstance<object>;

// Mnemonica constructor — the constructor function returned by constructHandler()
// Has SymbolConstructorName attached and is both newable and callable
export interface MnemonicaConstructor extends NewableFunction {
	new (...args: unknown[]): object;
	(this: object, ...args: unknown[]): unknown;
	[key: symbol]: unknown;
}

// Type descriptor instance — internal shape of TypeDescriptor objects
export interface TypeDescriptorDefine extends CallableFunction {
	(
		TypeOrTypeName: string | CallableFunction,
		constructHandlerOrConfig?: CallableFunction | object,
		config?: object
	): TypeClass;
}

export interface TypeDescriptorLookup extends CallableFunction {
	(TypeNestedPath: string): TypeClass | undefined;
}

export type TypeDescriptorInstance = {
	define: TypeDescriptorDefine;
	lookup: TypeDescriptorLookup;
	subtypes: Map<string, object>;
	TypeName: string;
};

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

// Apply/Call/Bind function types
export type ApplyFunction = <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Constructor: IDEF<T>,
	args?: unknown[]
) => S;

export type CallFunction = <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Constructor: IDEF<T>,
	...args: unknown[]
) => S;

export type BindFunction = <E extends object, T extends object, S extends Proto<E, T>>(
	entity: E,
	Constructor: IDEF<T>
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
	registerHook: <T extends object>(Constructor: IDEF<T>, hookType: hooksTypes, cb: hook) => void;

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
	SymbolParentType: symbol;
	SymbolConstructorName: symbol;
	SymbolDefaultTypesCollection: symbol;
	SymbolConfig: symbol;
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
