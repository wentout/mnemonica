'use strict';

// Compile-only pins: an async construction handler produces a Promise on
// instance-carried subtype constructors, while the resolved value remains the
// instance for inheritance, hooks, lookups, and extracted registry entries.

import { lookup, mnemonica } from '..';
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
