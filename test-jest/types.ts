'use strict';

/**
 * Type definitions for mnemonica test files
 * These types replace all `any` usage with proper TypeScript definitions
 */

import type { hooksOpts, TypeDef, CollectionDef, MnemonicaInstance } from '../src/types';

// ============================================================================
// Hook Invocation Types
// ============================================================================

export interface HookInvocationEntry {
	kind: 'pre' | 'post' | 'error';
	sort: 'type' | 'collection';
	self: unknown;
	opts: unknown;
	order?: string;
}

export type HookInvocationsArray = HookInvocationEntry[];

// ============================================================================
// Test Instance Types
// ============================================================================

export interface SomeADTCInstance {
	test: number;
	SubOfSomeADTCType?: new (...args: unknown[]) => SubOfSomeADTCInstance;
}

export interface SubOfSomeADTCInstance {
	sub_test: number;
	args: unknown[];
}

export interface UserTypeInstance extends MnemonicaInstance {
	email: string;
	password: number | undefined;
	description: string;
	UserTypePL1?: new () => UserTypePL1Instance;
	UserTypePL2?: new () => UserTypePL2Instance;
}

export interface UserTypePL1Instance extends MnemonicaInstance {
	user_pl_1_sign: string;
	UserTypePL2?: new () => UserTypePL2Instance;
}

export interface UserTypePL2Instance extends MnemonicaInstance {
	user_pl_2_sign: string;
	shape: number;
	getSign(): string;
}

export interface UserTypeConstructorInstance extends MnemonicaInstance {
	email: string;
	password: number;
	description: string;
	WithoutPassword?: new () => UserWithoutPasswordInstance;
}

export interface UserWithoutPasswordInstance extends MnemonicaInstance {
	email: string;
	password: undefined;
	description: string;
	WithAdditionalSign?: (sign: string) => WithAdditionalSignInstance;
}

export interface WithAdditionalSignInstance extends MnemonicaInstance {
	sign: string;
	MoreOver?: (str: string) => MoreOverInstance;
}

export interface MoreOverInstance extends MnemonicaInstance {
	str: string;
	OverMore?: () => OverMoreInstance;
	EvenMore?: () => EvenMoreInstance;
}

export interface OverMoreInstance extends MnemonicaInstance {
	str: string;
	EvenMore?: (str?: string) => EvenMoreInstance;
}

export interface EvenMoreInstance extends MnemonicaInstance {
	str: string;
	EvenMoreSign: string;
}

export interface EmptyTypeInstance extends MnemonicaInstance {
	EmptySubType?: (sign: string) => EmptySubTypeInstance;
}

export interface EmptySubTypeInstance extends MnemonicaInstance {
	emptySign: string;
}

// ============================================================================
// Async Instance Types
// ============================================================================

export interface AsyncTypeInstance extends MnemonicaInstance {
	arg123: number;
	data: unknown;
	getThisPropMethod(propName: string): unknown;
	erroredNestedConstructMethod(): void;
	erroredAsyncMethod(error?: unknown): Promise<never>;
	thrownForReThrow?: Error;
	SubOfAsync?: new (data: unknown) => SubOfAsyncInstance;
}

export interface SubOfAsyncInstance extends MnemonicaInstance {
	arg123: number;
	data: unknown;
	getThisPropMethod(propName: string): unknown;
	hookedMethod(propName: string): unknown;
	NestedAsyncType?: new (data: unknown) => NestedAsyncTypeInstance;
	parent(): AsyncTypeInstance;
}

export interface NestedAsyncTypeInstance extends MnemonicaInstance {
	data: unknown;
	description: string;
	getThisPropMethod(propName: string): unknown;
	SubOfNestedAsync?: (data: unknown) => SubOfNestedAsyncInstance;
}

export interface SubOfNestedAsyncInstance extends MnemonicaInstance {
	arg123: number;
	data: unknown;
	getThisPropMethod(propName: string): unknown;
	hookedMethod(propName: string): unknown;
	parent(): SubOfAsyncInstance;
}

// ============================================================================
// Decorated Instance Types
// ============================================================================

export interface MyDecoratedInstance extends MnemonicaInstance {
	field: number;
}

export interface MyDecoratedSubInstance extends MnemonicaInstance {
	sub_field: number;
}

export interface MyDecoratedSubSubInstance extends MnemonicaInstance {
	sub_sub_field: number;
}

export interface MyOtherInstance extends MnemonicaInstance {
	field: number;
	prop: number;
}

// ============================================================================
// Collection Instance Types
// ============================================================================

export interface AnotherCollectionInstance extends MnemonicaInstance {
	check: unknown;
}

export interface OneElseCollectionInstance extends MnemonicaInstance {
	self: unknown;
}

// ============================================================================
// Error Types
// ============================================================================

export interface MnemonicaError extends Error {
	BaseStack?: string;
	message: string;
	exceptionReason?: Error;
	reasons?: Error[];
	surplus?: unknown[];
	args?: unknown[];
	originalError?: Error;
	instance?: Error;
	extract?(): Record<string, unknown>;
	parse?(): unknown;
}

// Error instance from exception method with error property
export interface MnemonicaErrorWithError extends MnemonicaError {
	error: unknown;
}

// Type for bound method that can also be used as a constructor
export interface BoundMethodAsConstructor {
	(...args: unknown[]): unknown;
	new (...args: unknown[]): { [key: string]: unknown };
}

// Type for dynamic property access on async instances
export interface AsyncInstanceWithSymbols extends MnemonicaInstance {
	[key: symbol]: unknown;
}

// Type for the exception method on instances - returns a constructor
export interface InstanceWithException {
	exception: new (error: Error, ...args: unknown[]) => MnemonicaError;
}

// Type for chained method call results
export interface ChainedMethodResult {
	call(context: unknown, ...args: unknown[]): unknown;
}

// Type for flexible constructor in tests
export interface FlexibleConstructor {
	new (...args: unknown[]): unknown;
	prototype: { clone?: object };
}

// Type for user instance with NamedFunction
export interface UserWithNamedFunction extends MnemonicaInstance {
	NamedFunction: new () => MnemonicaInstance;
}

// Type for user instance with NamedClass
export interface UserWithNamedClass extends MnemonicaInstance {
	NamedClass: new (n: number) => MnemonicaInstance & {
		type: string;
		snc: number;
		getTypeValue(): string;
		SubNamedClass?: new () => MnemonicaInstance;
	};
}

// Type for test type with apply decorator pattern
export interface TypeWithApplyDecorator extends TestTypeClass {
	apply(thisArg: undefined, args: unknown[], opts: { strictChain: boolean }[]): TestTypeClass;
}

// ============================================================================
// Hook Data Types
// ============================================================================

export interface SubOfNestedAsyncPostHookData {
	existentInstance: NestedAsyncTypeInstance;
	inheritedInstance: SubOfNestedAsyncInstance;
}

// ============================================================================
// Test Type Class - simplified flexible type for test constructors
// ============================================================================

export interface TestTypeClass {
	new(...args: unknown[]): object;
	(...args: unknown[]): object;
	define: (TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: CallableFunction | object, configOrUndefined?: object | boolean) => TestTypeClass;
	lookup: (TypeNestedPath: string) => TestTypeClass | undefined;
	registerHook(hookType: string, cb: (opts: unknown) => void): void;
	TypeName: string;
	prototype: object;
	subtypes: Map<string, TypeDef>;
	__type__?: TypeDef;
	collection?: CollectionDef;
	[key: string]: unknown;
}

// ============================================================================
// Test Options Types
// ============================================================================

export interface AsyncChainTestOptions {
	UserType: TestTypeClass;
	UserTypeConstructor: TestTypeClass;
	AsyncWOReturn: new () => Promise<unknown>;
	AsyncWOReturnNAR: new () => Promise<unknown>;
}

export interface EnvironmentTestOptions {
	user: UserTypeInstance;
	userTC: UserTypeConstructorInstance;
	UserType: TestTypeClass;
	overMore: OverMoreInstance;
	moreOver: MoreOverInstance;
	someADTCInstance: SomeADTCInstance;
	SubOfSomeADTCTypePre: hooksOpts | null;
	SubOfSomeADTCTypePost: hooksOpts | null;
	subOfSomeADTCInstanceA: SubOfSomeADTCInstance;
	backSub: SubOfSomeADTCInstance;
	subOfSomeADTCInstanceANoArgs: SubOfSomeADTCInstance;
	subOfSomeADTCInstanceC: SubOfSomeADTCInstance;
	subOfSomeADTCInstanceB: SubOfSomeADTCInstance;
	myDecoratedInstance: MyDecoratedInstance;
	myDecoratedSubInstance: MyDecoratedSubInstance;
	myDecoratedSubSubInstance: MyDecoratedSubSubInstance;
	myOtherInstance: MyOtherInstance;
	anotherTypesCollection: CollectionDef;
	oneElseTypesCollection: CollectionDef;
	anotherCollectionInstance: AnotherCollectionInstance;
	AnotherCollectionType: TestTypeClass;
	oneElseCollectionInstance: OneElseCollectionInstance;
	OneElseCollectionType: TestTypeClass;
	userWithoutPassword: UserWithoutPasswordInstance;
	UserWithoutPassword: TestTypeClass;
	unchainedUserWithoutPassword: UserWithoutPasswordInstance;
	chained: UserTypeConstructorInstance;
	derived: UserWithoutPasswordInstance;
	rounded: WithAdditionalSignInstance;
	chained2: WithAdditionalSignInstance;
	merged: UserTypeInstance & OverMoreInstance;
}

// ============================================================================
// Utility Types
// ============================================================================

export type TypeDefinitionEntry = [
	Map<string, TypeDef>,
	string,
	Record<string, unknown> | undefined
];

export interface StackLineData {
	line: string;
	pattern: string;
	match: boolean;
}

// Type for async chain test data
export interface AsyncChainEtalonData {
	WithAdditionalSignSign?: string;
	WithoutPasswordSign?: string;
	async1st?: string;
	description?: string;
	email?: string;
	password?: undefined;
	sign?: string;
	async2nd?: string;
	sync?: string;
	async?: string;
}

// Hook thrown type instance
export interface HookThrownTypeInstance extends MnemonicaInstance {
	throwModificationError(error: Error): void;
}

// Sleep type instance
export interface SleepTypeInstance extends MnemonicaInstance {
	slept: boolean;
	description: string;
}

// Error with exception reason
export interface ErrorWithExceptionReason extends Error {
	exceptionReason?: Error;
	reasons?: Error[];
	surplus?: unknown[];
}

// Extended instance with extract method for async chain tests
export interface ExtractableInstance extends MnemonicaInstance {
	extract(): Record<string, unknown>;
}

// Type for test instances with WithoutPassword method
export interface UserTypeWithPassword extends MnemonicaInstance {
	WithoutPassword(): unknown;
	WithAdditionalSign(sign: string): unknown;
	AsyncChain1st(opts: { async1st: string }): Promise<unknown>;
}

// Type for async chain test instances
export interface AsyncChainInstance extends MnemonicaInstance {
	extract(): Record<string, unknown>;
	AsyncChain2nd(opts: { async2nd: string }): Promise<AsyncChainInstance>;
	Async2Sync2nd(opts: { sync: string }): AsyncChainInstance;
	AsyncChain3rd(opts: { async: string }): Promise<AsyncChainInstance>;
}

// ============================================================================
// Async Chain Test Types
// ============================================================================

// User data for constructor parameters
export interface UserData {
	email: string;
	password: number;
}

// Type that supports both Promise-like behavior and direct method chaining
// (mnemonica returns a special thenable that allows both)
type AsyncChainable = Promise<ChainedAsyncInstance> & ChainedAsyncInstance;

// Instance with chained methods for async tests
export interface ChainedAsyncInstance extends ExtractableInstance {
	WithoutPassword(): ChainedAsyncInstance;
	WithAdditionalSign(sign: string): ChainedAsyncInstance;
	AsyncChain1st(opts: { async1st: string }): AsyncChainable;
	AsyncChain2nd(opts: { async2nd: string }): AsyncChainable;
	Async2Sync2nd(opts: { sync: string }): ChainedAsyncInstance;
	AsyncChain3rd(opts: { async: string }): AsyncChainable;
}

// Error types for wrong modification pattern tests
export interface WrongSyncTypeInstance extends MnemonicaError {
	stack: string;
	message: string;
	extract(): Record<string, unknown>;
}

export interface WrongAsyncTypeInstance extends MnemonicaError {
	stack: string;
	message: string;
	extract(): Record<string, unknown>;
}

// Sleep type and related error types
export interface SleepTypeInstance extends MnemonicaInstance {
	slept: boolean;
	AsyncErroredType(data: { argsTest: number }): Promise<SleepErrorInstance>;
	SyncErroredType(data: { argsTest: number }): SleepErrorInstance;
}

export interface SleepErrorInstance extends MnemonicaError {
	slept: boolean;
}

// Constructor function types for error-generating functions
export type ErrorConstructorFunction = (
	this: MnemonicaInstance,
	...args: unknown[]
) => void;

export type AsyncErrorConstructorFunction = (
	this: MnemonicaInstance,
	...args: unknown[]
) => Promise<void>;
