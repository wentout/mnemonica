'use strict';
/* eslint no-unused-vars: "off" */

import type { TypeRegistry } from '../index';

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

/**
 * Minimal constructor shape used for the TypeRegistry index signature.
 * It accepts any mnemonica-compatible constructor, but deliberately returns
 * `object` so unaugmented registry lookups are not useful without an explicit
 * per-key constructor type.
 */
export interface TypeConstructorBase {
	new (...args: unknown[]): object;
}

/**
 * Instance type produced by a TypeRegistry constructor.
 */
export type InstanceOfTypeRegistry<K extends keyof TypeRegistry> =
	TypeRegistry[K] extends new (...args: unknown[]) => infer R ? R : never;


/**
 * Extract only the literal string keys of a type, filtering out generic
 * index signatures. This lets us iterate over augmented TypeRegistry keys
 * without picking up the `[key: string]` signature.
 */
export type LiteralKeysOf<T> = keyof T extends infer K
	? K extends string
		? string extends K ? never : K
		: never
	: never;

/**
 * Given a dotted TypeRegistry key, extract the parent path.
 * `ParentPath<'A.B.C'>` → `'A.B'`.
 */
export type ParentPath<K extends string> =
	K extends `${infer P}.${string}` ? P : never;

/**
 * Given a dotted TypeRegistry key, return the union of all ancestor prefixes.
 * `AllParentPrefixes<'A.B.C'>` → `'A' | 'A.B'`.
 */
export type AllParentPrefixes<K extends string> =
	K extends `${infer P}.${string}` ? P | AllParentPrefixes<P> : never;

/**
 * Given a parent path, return the union of TypeRegistry keys that are direct
 * or indirect children of that path.
 */
export type ChildKeysOf<P extends string> = {
	[K in keyof TypeRegistry]: K extends `${P}.${string}` ? K : never
}[keyof TypeRegistry];

/**
 * Given an instance type, find the TypeRegistry key(s) whose constructor
 * returns that instance type. This inverts the registry at the type level
 * so utilities like `parent()` can derive an instance's path from its
 * type alone.
 */
export type PathOfInstance<T extends object> = {
	[K in LiteralKeysOf<TypeRegistry>]: TypeRegistry[K] extends new (...args: unknown[]) => infer R
		? T extends R ? K : never
		: never
}[LiteralKeysOf<TypeRegistry>];

/**
 * Given an instance type, return the union of TypeRegistry paths that are
 * valid parent lookups for that instance. Root types produce `never` because
 * they have no parent path.
 */
export type ParentPathOfInstance<T extends object> = {
	[K in LiteralKeysOf<TypeRegistry>]: TypeRegistry[K] extends new (...args: unknown[]) => infer R
		? T extends R ? AllParentPrefixes<K> : never
		: never
}[LiteralKeysOf<TypeRegistry>];

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

// Constructor options for define
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
// Global registry shape used as the default for TypeLookup. It combines any
// augmented TypeRegistry entries with a broad string index signature so the
// generic TypeLookup constraint is satisfied.
export type GlobalRegistry = TypeRegistry & Record<string, TypeConstructorBase>;

// Extract the instance type returned by a mnemonica-compatible constructor.
// Falls back to `object` so generic helpers that require an object constraint
// do not fail when the constructor shape is not yet narrowed.
export type ExtractConstructorInstance<C> =
	C extends { new (...args: unknown[]): infer I }
		? I extends object ? I : object
		: object;

// Map dotted registry paths that extend `${Path}.${Child}` into child
// constructor properties on the parent instance. This lets typed lookups
// return a constructor whose instances carry their subtypes, e.g.
// `new (App.lookup('User'))(...).Admin`.
export type SubTypeConstructors<
	Registry extends object,
	Path extends string
> = {
	[K in keyof Registry as K extends `${Path}.${infer Child}` ? Child : never]:
		LookupResult<Registry, K & string>;
};

// Reconstruct a constructor with a new instance type while preserving every
// non-`prototype`, non-`lookup` property (`define`, hooks, etc.). `lookup` is
// replaced separately so it can be scoped to the constructor's own type path.
export type ReplaceConstructorInstance<
	C,
	NewInstance extends object
> = C extends {
	new (...args: infer A): unknown;
	(...args: infer A2): unknown;
	readonly prototype: unknown;
}
	? {
		new (...args: A): NewInstance;
		(this: NewInstance, ...args: A2): NewInstance;
		readonly prototype: NewInstance & {
			readonly constructor: ReplaceConstructorInstance<C, NewInstance>;
		};
	} & Omit<C, 'prototype' | 'lookup'>
	: never;

// Instance type produced by a typed lookup: the constructor's own instance
// shape plus child-constructor properties for every registered subtype.
// Kept as a named alias so hover tooltips show the base shape first instead of
// expanding the whole registry.
export type WithSubTypes<
	Instance extends object,
	Registry extends object,
	Path extends string
> = Instance & SubTypeConstructors<Registry, Path>;

// Constructor returned by a typed lookup, with its instance type augmented by
// the subtypes registered under that path. Kept as a named alias so the
// recursive reference from `SubTypeConstructors` resolves cleanly.
export type AugmentedConstructor<
	Registry extends object,
	Path extends keyof Registry & string
> = ReplaceConstructorInstance<
	Registry[Path],
	WithSubTypes<ExtractConstructorInstance<Registry[Path]>, Registry, Path>
>;

// Result of a typed lookup: the augmented constructor plus a `lookup` method
// scoped to the constructor's own type path for relative subtype lookups.
export type LookupResult<
	Registry extends object,
	Path extends keyof Registry & string
> = Registry[Path] extends TypeConstructorBase
	? AugmentedConstructor<Registry, Path> & {
		lookup: NestedTypeLookup<Registry, Path>;
	}
	: never;

export interface TypeLookup<T extends object = GlobalRegistry> extends CallableFunction {
	<const K extends keyof T & string>(this: unknown, TypeNestedPath: K): LookupResult<T, K>;
	(this: unknown, TypeNestedPath: string): TypeClass | undefined;
}

// Relative keys of a registry under a given dotted path. For a root path (`''`)
// this is all string keys; for a non-empty path it is the tail after `${Path}.`.
export type RelativeKeys<
	Registry extends object,
	Path extends string
> = Path extends ''
	? keyof Registry & string
	: (keyof Registry extends infer K
		? K extends `${Path}.${infer Child}` ? Child : never
		: never);

// Full registry key that corresponds to a relative key `K` under `Path`.
export type FullKey<
	Registry extends object,
	Path extends string,
	K extends string
> = Path extends '' ? K : Extract<keyof Registry & string, `${Path}.${K}`>;

// Lookup function type for constructors and registry holders that know their
// own dotted type path. Root holders use `Path = ''` and behave like the global
// `TypeLookup`; child constructors use their own path for relative lookups.
export type NestedTypeLookup<
	Registry extends object,
	Path extends string = ''
> = (Path extends ''
	? {
		<const K extends keyof Registry & string>(this: unknown, TypeNestedPath: K): LookupResult<Registry, K>;
	}
	: {
		<const K extends RelativeKeys<Registry, Path> & string>(
			this: unknown,
			TypeNestedPath: K
		): LookupResult<Registry, Extract<keyof Registry & string, `${Path}.${K}`>>;
	}) & {
		(this: unknown, TypeNestedPath: string): TypeClass | undefined;
	};

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
// When the parent contributes no properties, collapse to the child type so
// hover tooltips stay readable.
export type Proto<P extends object, T extends object> =
	[Exclude<keyof P, keyof T>] extends [never]
		? T
		: T & Pick<P, Exclude<keyof P, keyof T>>;


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

// Mnemonica instance method keys. These are filtered out of extracted/merged
// field-only views because they belong to the prototype, not to the user's
// enumerable data properties.
export type MnemonicaInstanceMethodKeys =
	'extract' | 'pick' | 'parent' | 'clone' | 'fork' | 'exception' | 'sibling';

export type Flatten<F> = { [key in keyof F]: F[key] }

// Extracted<T>: the shape returned by utils.extract(instance).
// It contains the enumerable string-keyed user properties of the instance,
// omitting MnemonicaInstance methods (extract, pick, parent, clone, fork,
// exception, sibling). Optionality is preserved from the source type.
// The `& {}` trick forces TypeScript to expand the alias in hover tooltips
// so it renders as a plain object literal instead of "Extracted<{...}>".
export type Extracted<T extends object> = {
	[K in keyof T as K extends string ? (K extends MnemonicaInstanceMethodKeys ? never : K) : never]: T[K];
} & {};

// Parsed<T>: the shape returned by utils.parse(instance).
// It is a one-level snapshot of the instance's prototype chain.
// `props` contains the instance's enumerable user properties;
// `joint` contains enumerable properties copied from the immediate prototype;
// `parent` is the next link up the chain (currently not recursively parsed).
export type Parsed<T extends object> = {
	name: string;
	props: Extracted<T>;
	self: T;
	proto: object;
	joint: Record<string, unknown>;
	parent: object | undefined;
};

// Sibling type accessor
export interface SiblingAccessor {
	(SiblingTypeName: string): TypeClass | undefined;
	[key: string]: TypeClass | undefined;
}

// Mnemonica instance methods interface (opt-in).
// These methods used to be auto-injected onto every instance. They are now
// available only when a type explicitly adds them to its prototype.
// Users can still use this interface to type their own root-level helpers.
export interface MnemonicaInstance<T extends object = object> {
	extract(): Extracted<T>;
	pick<K extends keyof T>(...keys: (K | K[])[]): { [P in K]: T[P] } & {};
	pick(...keys: string[]): Record<string, unknown>;
	parent(): object | undefined;
	parent<K extends ParentPathOfInstance<this> & string>(
		constructorLookupPath: K
	): InstanceOfTypeRegistry<K> | undefined;
	parent(constructorLookupPath: string): object | undefined;
	readonly clone: this;
	fork(...forkArgs: unknown[]): this;
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
	__self__: InstanceInternalProps;
	[key: string]: unknown;
};

// Combined instance type: plain object with the user's fields only.
// Instance methods (extract, pick, fork, etc.) are no longer auto-injected.
// The inline mapped type is used instead of the Flatten alias so that hover
// tooltips show the actual field object literal first, not "Flatten<{...}>".
export type InstanceResult<
  N extends object,
> = { [K in keyof N]: N[K] };

// Lightweight constructor type stored inside a typed registry map.
// It preserves the dotted `Path` so that `.define()` on a looked-up constructor
// computes the correct child path, but it omits the full `GlobalRegistry`
// generic to keep hover tooltips readable.
export type StoredConstructor<
	F extends object,
	Path extends string = ''
> = _Internal_TC_<F> & RegistryHolderBase<{}, F, Path>;

// Registry holder base - provides the accumulating .define() method.
// `Parent` tracks the instance type of the last defined constructor, so chained
// subtypes get the correct merged `Proto<Parent, N>` instance type.
// `Path` is the dotted type path of the holder (empty for root holders).
export interface RegistryHolderBase<
	T extends object = {},
	Parent extends object = object,
	Path extends string = ''
> {
	// Legacy overload: define(constructHandler, config?)
	define<SubType extends object>(
		this: RegistryHolderBase<T, Parent, Path>,
		TypeOrTypeName: CallableFunction,
		constructHandlerOrConfig?: IDEF<SubType> | object | boolean | CallableFunction,
		configOrUndefined?: constructorOptions | CallableFunction | boolean
	): IDefinitorInstance<SubType>;

	// Modern overload: define(TypeName, constructHandler, config?)
	define<
		const Name extends string,
		N extends object,
		Args extends unknown[],
		F extends Proto<Parent, N> = Proto<Parent, N>,
		ChildPath extends string = Path extends '' ? Name : `${Path}.${Name}`
	>(
		this: RegistryHolderBase<T, Parent, Path>,
		TypeName: Name,
		constructHandler?: IDEF<N, Args>,
		config?: constructorOptions
	): IDefinitorInstance<
		F,
		InstanceResult<F>,
		T & Record<ChildPath, StoredConstructor<F, ChildPath>>,
		ChildPath
	>;
}

// Full registry holder - adds typed .lookup() for collections that are not
// also constructors (createTypesCollection, the mnemonica module object).
export interface RegistryHolder<
	T extends object = {},
	Parent extends object = object,
	Path extends string = ''
>
	extends RegistryHolderBase<T, Parent, Path> {
	lookup: NestedTypeLookup<T, Path>;
}

// Definitor instance - the constructor function returned by define
// N = instance type (properties available on instances)
// R = wrapped result instance type
// Registry = typed registry map for lookup()
// Path = dotted type path of this constructor (empty for root types)
export interface IDefinitorInstance<
	N extends object,
	R extends InstanceResult<N> = InstanceResult<N>,
	Registry extends object = GlobalRegistry,
	Path extends string = ''
>
	extends RegistryHolderBase<Registry, N, Path> {

	TypeName: string;
	prototype: N;

	
	// the line below declares a `new ...` invocation,
	// so makes interface constructible
	// new(...args: unknown[]): { [key in keyof R]: R[key] };
	new(...args: unknown[]): R;

	
	// TODO: need check if line below works
	// also TS hinting check as well
	// the line below should make is a @decorate decorator working
	(...args: unknown[]): IDefinitorInstance<R>;

	lookup: TypeLookup<Registry>;

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
export interface TypeAbsorber extends CallableFunction {
	<T extends object>(
		this: unknown,
		TypeOrTypeName: string | CallableFunction,
		constructHandlerOrConfig?: IDEF<T> | object | boolean | CallableFunction,
		configOrUndefined?: constructorOptions | CallableFunction | boolean
	): IDefinitorInstance<T>;
}

// TypesCollection interface for createTypesCollection
// This represents the actual return type of createTypesCollection
export interface TypesCollection<
	T extends object = {},
	Parent extends object = object,
	Path extends string = ''
>
	extends RegistryHolder<T, Parent, Path>, Hookable {
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
export type CreateTypesCollectionFunction =
	<T extends object = {}, Parent extends object = object>(
		config?: constructorOptions
	) => TypesCollection<T, Parent>;

// Type class - base type constructor
export type TypeClass = IDefinitorInstance<object>;

// Generic registry map used by typed collections and the mnemonica builder.
// Keys are dotted type paths; values are mnemonica-compatible constructors.
export type TypeRegistryMap = Record<string, TypeConstructorBase>;

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

// Name of a constructor as a string literal type.
export type ConstructorName<T extends Constructor<object>> =
	T extends { name: infer N } ? N extends string ? N : string : string;

// Decorated class type - includes call signature for decorator pattern and
// aligns with `IDefinitorInstance` so decorated classes expose the same
// constructor/lookup surface as builder-created types. It still relies on the
// global `TypeRegistry` for typed lookups because decorators cannot carry a
// local accumulating registry across independent class declarations.
export type DecoratedClass<T extends Constructor<object>> =
	T &
	Omit<
		IDefinitorInstance<InstanceType<T>, InstanceType<T>, TypeRegistry, ConstructorName<T>>,
		'define' | 'lookup'
	> &
	(<U extends Constructor<object>>(target: U) => DecoratedClass<U>) & {
		define: TypeAbsorber;
		lookup: TypeLookup<TypeRegistry>;
	};

// Helper: merge parent entity (E) and child constructor instance (T) into a
// single flat object type, filtering out MnemonicaInstance method names.
// Used by apply/call/bind.
export type Merge<E extends object, T extends object> = {
	[K in keyof T | keyof E as K extends MnemonicaInstanceMethodKeys ? never : K]:
		K extends keyof T ? T[K] : E[K & keyof E];
};

// Apply/Call/Bind function types
// The return type merges the parent entity fields with the child constructor
// fields (filtering out MnemonicaInstance method names), producing the same
// `{ fields }` hover style as `new Type()`.
export interface ApplyFunction extends CallableFunction {
	<E extends object, T extends object>(
		entity: E,
		Constructor: IDEF<T>,
		args?: unknown[]
	): InstanceResult<Merge<E, T>>;
}

export interface CallFunction extends CallableFunction {
	<E extends object, T extends object>(
		entity: E,
		Constructor: IDEF<T>,
		...args: unknown[]
	): InstanceResult<Merge<E, T>>;
}

export interface BindFunction extends CallableFunction {
	<E extends object, T extends object>(
		entity: E,
		Constructor: IDEF<T>
	): (...args: unknown[]) => InstanceResult<Merge<E, T>>;
}

// Utils object type
export interface UtilsCollection {
	extract<T extends object>(instance: T): Extracted<T>;
	pick<T extends object, K extends keyof T>(instance: T, ...args: (K | K[])[]): { [P in K]: T[P] } & {};
	pick<T extends object>(instance: T, ...args: (string | string[])[]): Record<string, unknown>;
	clone<T extends object>(instance: T): T;
	fork<T extends object>(instance: T): (this: object, ...forkArgs: unknown[]) => T;
	sibling(instance: object): SiblingAccessor;
	collectConstructors: (instance: object, flat?: boolean) => (CallableFunction | string)[];
	merge<A extends object, B extends object>(
		a: A,
		b: B,
		...args: unknown[]
	): InstanceResult<Merge<B, A>>;
	parse<T extends object>(self: T): Parsed<T>;
	parent<T extends object>(instance: T): object | undefined;
	parent<T extends object, K extends ParentPathOfInstance<T> & string>(
		instance: T,
		path: K
	): InstanceOfTypeRegistry<K> | undefined;
	parent<T extends object>(instance: T, path: string): object | undefined;
	toJSON<T extends object>(instance: T): string;
	[key: string]: CallableFunction;
}

// Main mnemonica module interface - represents the exported module object.
// The optional Registry generic lets the object act as a typed registry holder
// when chaining .define() calls.
export interface MnemonicaModule<Registry extends object = {}>
	extends RegistryHolder<Registry, object> {
	// Core functions not covered by RegistryHolder
	apply: ApplyFunction;
	call: CallFunction;
	bind: BindFunction;
	decorate: <T extends Constructor<object> | constructorOptions | undefined = undefined>(
		target?: T,
		config?: constructorOptions
	) => <U extends Constructor<object>>(cstr: U) => DecoratedClass<U>;
	registerHook: <T extends object>(Constructor: IDEF<T>, hookType: hooksTypes, cb: hook) => void;

	// Descriptors
	defaultTypes: TypesCollection<Registry>;

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
