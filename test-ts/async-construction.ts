'use strict';

// Compile-only pins: an async construction handler produces a Promise on
// instance-carried subtype constructors, while the resolved value remains the
// instance for inheritance, hooks, lookups, and extracted registry entries.

import {
	apply, bind, call, createTypesCollection, define, lazy, lookup, mnemonica, registerHook
} from '..';
import type { AsyncRegistryEntry, LookedUpInstance, RegistryOf } from '..';

type IsPromise<T> = T extends PromiseLike<unknown> ? true : false;
type HasKey<T, K extends string> = K extends keyof T ? true : false;

type AsyncUserShape = {
	name: string;
};

type AsyncAdminShape = {
	role: string;
};

type AsyncSessionShape = {
	token: string;
};

type AsyncScopeShape = {
	scope: string;
};

type AsyncLazyShape = {
	note: string;
};

const AsyncApp = mnemonica
	.define('AsyncTypingUser', function (this: AsyncUserShape, data: { name: string }) {
		this.name = data.name;
	})
	.define('AsyncTypingAdmin', function (this: AsyncAdminShape, role: string) {
		this.role = role;
	});

const AsyncSessions = AsyncApp.lookup('AsyncTypingUser').define(
	'AsyncTypingSession',
	async function (this: AsyncSessionShape, token: string) {
		this.token = token;
		return this;
	}
);

const AsyncScopes = AsyncSessions.lookup('AsyncTypingUser.AsyncTypingSession').define(
	'AsyncTypingScope',
	function (this: AsyncScopeShape, scope: string) {
		this.scope = scope;
	}
);

const AsyncUser = AsyncScopes.lookup('AsyncTypingUser');
const asyncUser = new AsyncUser({ name : 'Ada' });

// A synchronous sibling keeps its ordinary instance result and inherited data.
const asyncAdmin = new asyncUser.AsyncTypingAdmin('root');
export const adminIsSync: IsPromise<typeof asyncAdmin> = false;
export const adminRole: string = asyncAdmin.role;
export const adminName: string = asyncAdmin.name;

// The async subtype is pending: its fields are available only after await.
const pendingSession = new asyncUser.AsyncTypingSession('t');
export const sessionIsPromise: IsPromise<typeof pendingSession> = true;
export const noSyncToken: HasKey<typeof pendingSession, 'token'> = false;
// @ts-expect-error — the pending Promise has no instance field
pendingSession.token;

const readSession = async () => {
	const session = await pendingSession;
	const token: string = session.token;
	const name: string = session.name;
	const scope = new session.AsyncTypingScope('read');
	const scopeIsSync: IsPromise<typeof scope> = false;
	const scopeValue: string = scope.scope;
	const scopeToken: string = scope.token;
	const result = [ token, name, scopeIsSync, scopeValue, scopeToken ];
	return result;
};
export const sessionResult = readSession();

const AsyncSessionCtor = AsyncScopes.lookup('AsyncTypingUser.AsyncTypingSession');
AsyncSessionCtor.registerHook('postCreation', (opts) => {
	const token: string = opts.inheritedInstance.token;
	const parentName: string = opts.existentInstance.name;
	void token;
	void parentName;
});

type AsyncRegistry = RegistryOf<typeof AsyncScopes>;
export const entryIsAsync: AsyncRegistry['AsyncTypingUser.AsyncTypingSession'] extends {
	new (...args: never[]): PromiseLike<unknown>;
} ? true : false = true;
type AsyncSessionInstance = LookedUpInstance<AsyncRegistry, 'AsyncTypingUser.AsyncTypingSession'>;
export const instanceIsNotPromise: IsPromise<AsyncSessionInstance> = false;
export const instanceHasScope: HasKey<AsyncSessionInstance, 'AsyncTypingScope'> = true;

// lazy() has the same callable-handler pattern: its returned async handler
// must store an async registry entry too.
const AsyncLazy = AsyncScopes.lookup('AsyncTypingUser').lazy(
	'AsyncTypingLazySession',
	() => async function (this: AsyncLazyShape, note: string) {
		this.note = note;
		return this;
	}
);
const AsyncLazyUser = AsyncLazy.lookup('AsyncTypingUser');
const asyncLazyUser = new AsyncLazyUser({ name : 'Lazy' });
const pendingLazy = new asyncLazyUser.AsyncTypingLazySession('note');
export const lazyIsPromise: IsPromise<typeof pendingLazy> = true;
const readLazy = async () => {
	const resolved = await pendingLazy;
	const note: string = resolved.note;
	const name: string = resolved.name;
	const result = [ note, name ];
	return result;
};
export const lazyResult = readLazy();

// The free-lookup bridge and tactica-style extracted entries use the same
// public async registry vocabulary.
type ExtractedAsyncShape = {
	serial: string;
};

declare module '..' {
	interface TypeRegistry extends RegistryOf<typeof AsyncScopes> {
		'AsyncTypingExtracted': AsyncRegistryEntry<
			ExtractedAsyncShape,
			'AsyncTypingExtracted',
			object,
			[serial: string]
		>;
	}
}

const BridgedUser = lookup('AsyncTypingUser');
const bridgedUser = new BridgedUser({ name : 'Bridge' });
const bridgedPending = new bridgedUser.AsyncTypingSession('bridge');
export const bridgeIsPromise: IsPromise<typeof bridgedPending> = true;

const ExtractedAsync = lookup('AsyncTypingExtracted');
const extractedPending = new ExtractedAsync('s1');
export const extractedIsPromise: IsPromise<typeof extractedPending> = true;
const readExtracted = async () => {
	const extracted = await extractedPending;
	const serial: string = extracted.serial;
	return serial;
};
export const extractedSerial = readExtracted();
ExtractedAsync.registerHook('postCreation', (opts) => {
	const serial: string = opts.inheritedInstance.serial;
	void serial;
});

// ---------------------------------------------------------------------------
// The constructor define() / lazy() returns types `new` the same way: a
// Promise for an async handler, whichever path defined it.

// what a construction gives: 'ok' is a Promise resolving to the entity's
// fields merged with the child's, with none of them on the Promise itself
type Pending<T, Entity extends string, Child extends string> =
	T extends Promise<infer R>
		? HasKey<T, Entity> extends true ? 'garbage'
			: HasKey<R, Entity> extends true
				? HasKey<R, Child> extends true ? 'ok' : 'noChild'
				: 'noEntity'
		: 'notPromise';

const asyncResult = new AsyncSessions('direct');
export const defineResultIsPromise: IsPromise<typeof asyncResult> = true;
// @ts-expect-error — the pending Promise has no instance field
asyncResult.token;
export const awaitDefineResult = async () => {
	const session = await new AsyncSessions('direct');
	const token: string = session.token;
	return token;
};
// @ts-expect-error — the async overload keeps the handler's arguments
new AsyncSessions(42);

const FreeAsync = define('AsyncTypingFree', async function (this: AsyncSessionShape, token: string) {
	this.token = token;
	return this;
});
const freeAsync = new FreeAsync('free');
export const freeIsPromise: IsPromise<typeof freeAsync> = true;

const FreeSingleAsync = define(async function AsyncTypingSingle (this: AsyncSessionShape, token: string) {
	this.token = token;
	return this;
});
const freeSingleAsync = new FreeSingleAsync('single');
export const singleIsPromise: IsPromise<typeof freeSingleAsync> = true;

const BuilderSingleAsync = AsyncSessions.define(async function AsyncTypingBuilderSingle (this: AsyncScopeShape, scope: string) {
	this.scope = scope;
	return this;
}, { strictChain : false });
const builderSingleAsync = new BuilderSingleAsync('single');
export const builderSingleIsPromise: IsPromise<typeof builderSingleAsync> = true;
export const awaitBuilderSingle = async () => {
	const child = await new BuilderSingleAsync('single');
	const scope: string = child.scope;
	const token: string = child.token;
	const result = { scope, token };
	return result;
};

const FreeLazyAsync = lazy('AsyncTypingFreeLazy', () => async function (this: AsyncLazyShape, note: string) {
	this.note = note;
	return this;
});
const freeLazyAsync = new FreeLazyAsync('lazy');
export const freeLazyIsPromise: IsPromise<typeof freeLazyAsync> = true;

const asyncCollection = createTypesCollection();
const CollectionAsync = asyncCollection.define('AsyncTypingCollection', async function (this: AsyncSessionShape, token: string) {
	this.token = token;
	return this;
});
const collectionAsync = new CollectionAsync('collection');
export const collectionIsPromise: IsPromise<typeof collectionAsync> = true;

// a sync handler stays an instance, whatever it returns
const SyncFree = define('AsyncTypingSyncFree', function (this: AsyncUserShape, data: { name: string }) {
	this.name = data.name;
});
const syncFree = new SyncFree({ name : 'sync' });
export const syncIsInstance: IsPromise<typeof syncFree> = false;
const syncAnyHandler = function (this: AsyncUserShape, data: { name: string }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result: any = Object.assign(this, data);
	return result;
};
const AnyReturning = define('AsyncTypingAny', syncAnyHandler);
const anyReturning = new AnyReturning({ name : 'any' });
export const anyIsInstance: IsPromise<typeof anyReturning> = false;
// ... a handler that only throws (its result is never) ...
const throwing = new (define('AsyncTypingThrow', function () { throw new Error('sync'); }))();
export const throwIsInstance: IsPromise<typeof throwing> = false;
const throwingFn = new (define(function AsyncTypingThrowFn () { throw new Error('sync'); }))();
export const throwFnIsInstance: IsPromise<typeof throwingFn> = false;
const throwingBuilder = new (asyncCollection.define('AsyncTypingThrowB', function () { throw new Error('sync'); }))();
export const throwBuilderIsInstance: IsPromise<typeof throwingBuilder> = false;
const throwingBuilderFn = new (asyncCollection.define(function AsyncTypingThrowBFn () { throw new Error('sync'); }))();
export const throwBuilderFnIsInstance: IsPromise<typeof throwingBuilderFn> = false;
// ... and an `any` handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const anyHandler: any;
const anyNamed = new (define('AsyncTypingAnyNamed', anyHandler))();
export const anyNamedIsInstance: IsPromise<typeof anyNamed> = false;
const anyFn = new (define(anyHandler))();
export const anyFnIsInstance: IsPromise<typeof anyFn> = false;
const anyLazy = new (lazy('AsyncTypingAnyLazy', () => anyHandler))();
export const anyLazyIsInstance: IsPromise<typeof anyLazy> = false;
const anyBuilder = new (asyncCollection.define('AsyncTypingAnyBuilder', anyHandler))();
export const anyBuilderIsInstance: IsPromise<typeof anyBuilder> = false;

// A declared constructor of a Promise is async the same way. (A class that
// returns one cannot be written: TS2409.)
declare const PromiseCtor: new (size: number) => Promise<{ size: number }>;
const CtorFree = new (define('AsyncTypingCtorFree', PromiseCtor))(1);
export const ctorFreeIsPromise: IsPromise<typeof CtorFree> = true;
export const ctorFreeHasNoField: HasKey<typeof CtorFree, 'size'> = false;
export const ctorFreeSize: Promise<number> = CtorFree.then((instance) => instance.size);
const CtorFn = new (define(PromiseCtor))(1);
export const ctorFnIsPromise: IsPromise<typeof CtorFn> = true;
export const ctorFnHasNoField: HasKey<typeof CtorFn, 'size'> = false;
export const ctorFnSize: Promise<number> = CtorFn.then((instance) => instance.size);
const CtorLazy = new (lazy('AsyncTypingCtorLazy', () => PromiseCtor))(1);
export const ctorLazyIsPromise: IsPromise<typeof CtorLazy> = true;
export const ctorLazyHasNoField: HasKey<typeof CtorLazy, 'size'> = false;
export const ctorLazySize: Promise<number> = CtorLazy.then((instance) => instance.size);
const CtorBuilder = asyncCollection.define('AsyncTypingCtor', PromiseCtor);
const ctorBuilder = new CtorBuilder(1);
export const ctorBuilderIsPromise: IsPromise<typeof ctorBuilder> = true;
export const ctorBuilderHasNoField: HasKey<typeof ctorBuilder, 'size'> = false;
export const ctorBuilderSize: Promise<number> = ctorBuilder.then((instance) => instance.size);
// @ts-expect-error — the declared arguments stay
new CtorBuilder('1');
const CtorKid = CtorBuilder.define('AsyncTypingCtorKid', function (this: AsyncScopeShape) {
	this.scope = 's';
});
const CtorLookedUp = CtorKid.lookup('AsyncTypingCtor');
export async function ctorSubtype (): Promise<[ number, string, number ]> {
	const instance = await new CtorLookedUp(1);
	const kid = new instance.AsyncTypingCtorKid();
	const result: [ number, string, number ] = [ instance.size, kid.scope, kid.size ];
	return result;
}

// subtypes of an async type merge over the resolved instance
const AsyncChild = AsyncSessions.define('AsyncTypingChild', function (this: AsyncScopeShape, scope: string) {
	this.scope = scope;
});
export const childRegistryKeepsAsync: RegistryOf<typeof AsyncChild> extends {
	'AsyncTypingUser.AsyncTypingSession': unknown;
} ? true : false = true;

// apply / call / bind take an async constructor, looked up or defined
const asyncUserForApply = new AsyncUser({ name : 'Apply' });
const applied = apply(asyncUserForApply, AsyncSessionCtor, [ 't' ]);
export const appliedIsPending: Pending<typeof applied, 'name', 'token'> = 'ok';
const called = call(asyncUserForApply, AsyncSessionCtor, 't');
export const calledIsPending: Pending<typeof called, 'name', 'token'> = 'ok';
const bound = bind(asyncUserForApply, AsyncSessionCtor)('t');
export const boundIsPending: Pending<typeof bound, 'name', 'token'> = 'ok';
const appliedDefined = apply(asyncUserForApply, AsyncSessions, [ 't' ]);
export const appliedDefinedIsPending: Pending<typeof appliedDefined, 'name', 'token'> = 'ok';
const appliedModule = mnemonica.apply(asyncUserForApply, AsyncSessions, [ 't' ]);
export const appliedModuleIsPending: Pending<typeof appliedModule, 'name', 'token'> = 'ok';
// @ts-expect-error — apply checks the async constructor's arguments
apply(asyncUserForApply, AsyncSessions, [ 42 ]);
const syncApplied = apply(asyncUserForApply, SyncFree, [ { name : 'sync' } ]);
export const syncAppliedIsInstance: IsPromise<typeof syncApplied> = false;

// hooks see the resolved instance
registerHook(AsyncSessions, 'postCreation', (opts) => {
	const token: string = opts.inheritedInstance.token;
	void token;
});
registerHook(AsyncSessionCtor, 'postCreation', (opts) => {
	const token: string = opts.inheritedInstance.token;
	void token;
});
