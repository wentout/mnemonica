'use strict';

/**
 * Strict-mode pins for typed hooks (compile-time only).
 *
 * A hook registered on a TYPE gets that type's data typed by inference:
 * the callback's opts are inferred from the hookType and from the
 * parent/instance pair the hook is registered on — no narrowing, no casts.
 * preCreation fires before the created instance exists, so its opts carry
 * no inheritedInstance/creator. Collection-wide (global) handlers stay
 * untyped by design (see .ai/rules-hooks.md).
 */

import {
	define,
	lazy,
	lookup,
	decorate,
	registerHook,
	createTypesCollection,
	mnemonica,
	RegistryEntry,
} from '..';

// --- builder types ------------------------------------------------------------

const HookUser = define('HookUser', function (
	this: HookUser,
	data: { name: string }
) {
	this.name = data.name;
});
interface HookUser {
	name: string;
}

const HookAdmin = HookUser.define('HookAdmin', function (
	this: HookAdmin,
	data: { role: string }
) {
	this.role = data.role;
});
interface HookAdmin extends HookUser {
	role: string;
}

// root type: postCreation types inheritedInstance as the type itself

HookUser.registerHook('postCreation', (opts) => {
	const created: HookUser = opts.inheritedInstance;
	const name: string = opts.inheritedInstance.name;
	const parent: object = opts.existentInstance;
	const args: unknown[] = opts.args;
	opts.creator.throwModificationError(new Error('pin'));
	void created;
	void name;
	void parent;
	void args;
	// @ts-expect-error — HookUser has no 'role'
	opts.inheritedInstance.role;
});

// root type: creationError carries the errored instance, typed as well

HookUser.registerHook('creationError', (opts) => {
	const errored: HookUser = opts.inheritedInstance;
	void errored;
});

// root type: preCreation fires before the instance exists

HookUser.registerHook('preCreation', (opts) => {
	const parent: object = opts.existentInstance;
	void parent;
	// @ts-expect-error — preCreation opts have no inheritedInstance
	opts.inheritedInstance;
	// @ts-expect-error — preCreation opts have no creator
	opts.creator;
});

// subtype: existentInstance is typed as the PARENT instance

HookAdmin.registerHook('postCreation', (opts) => {
	const created: HookAdmin = opts.inheritedInstance;
	const parentName: string = opts.existentInstance.name;
	void created;
	void parentName;
	// @ts-expect-error — the parent instance has no 'role'
	opts.existentInstance.role;
	// @ts-expect-error — the created instance has no 'wrongField'
	opts.inheritedInstance.wrongField;
});

// --- lazy types ----------------------------------------------------------------
// (lazy construct handlers with concrete params hit the pre-existing
// IDEF unknown[] strictness gap — pins use no-arg handlers)

const LazyHookUser = HookUser.lazy('LazyHookUser', () => function (
	this: HookLazyUser
) {
	this.tag = 'lazy';
});
interface HookLazyUser {
	tag: string;
}

LazyHookUser.registerHook('postCreation', (opts) => {
	const created: HookLazyUser = opts.inheritedInstance;
	const tag: string = opts.inheritedInstance.tag;
	// parent of a lazy subtype is the holder instance type
	const parentName: string = opts.existentInstance.name;
	void created;
	void tag;
	void parentName;
	// @ts-expect-error — the lazy instance has no 'role' (only parent fields)
	opts.inheritedInstance.role;
});

const FreeLazy = lazy('FreeLazyHook', () => function (
	this: HookFreeLazy
) {
	this.name = 'free';
});
interface HookFreeLazy {
	name: string;
}

// free lazy keeps the getter's instance type for hook callbacks
// (see the lazy overloads returning IDefinitorInstance<T>)

FreeLazy.registerHook('postCreation', (opts) => {
	const name: string = opts.inheritedInstance.name;
	void name;
	// @ts-expect-error — HookFreeLazy has no 'role'
	opts.inheritedInstance.role;
});

// --- typed collection registry (hand-written entries, tactica Option B style) ---

interface HookRoot {
	v: number;
}

interface HookChild extends HookRoot {
	w: number;
}

// RegistryEntry carries the typed registerHook; the third generic is the
// parent instance type, so looked-up subtypes type their existentInstance
interface HookCollRegistry {
	'HookRoot': RegistryEntry<HookRoot, 'HookRoot'>;
	'HookRoot.HookChild': RegistryEntry<HookChild, 'HookRoot.HookChild', HookRoot>;
}

const hookCollection = createTypesCollection<HookCollRegistry>();

const HookRootCtor = hookCollection.define('HookRoot', function (
	this: HookRoot,
	data: { v: number }
) {
	this.v = data.v;
});

const HookChildCtor = HookRootCtor.define('HookChild', function (
	this: HookChild,
	data: { w: number }
) {
	this.w = data.w;
});

// collection lookup preserves the entry's typed registerHook

const LookedChild = hookCollection.lookup('HookRoot.HookChild');

LookedChild.registerHook('postCreation', (opts) => {
	const created: HookChild = opts.inheritedInstance;
	const parentV: number = opts.existentInstance.v;
	void created;
	void parentV;
	// @ts-expect-error — the parent instance has no 'w'
	opts.existentInstance.w;
});

// a define chain threads the parent instance into the registry entries,
// so the looked-up constructor types existentInstance as the parent

const ChainChild = HookChildCtor.lookup('HookRoot.HookChild');

ChainChild.registerHook('postCreation', (opts) => {
	const parentV: number = opts.existentInstance.v;
	void parentV;
	// @ts-expect-error — inheritedInstance is HookChild, it has no 'tag'
	opts.inheritedInstance.tag;
});

// free explicit-source lookup resolves the same registry

const FreeLookedChild = lookup(hookCollection, 'HookRoot.HookChild');

FreeLookedChild.registerHook('postCreation', (opts) => {
	const parentV: number = opts.existentInstance.v;
	void parentV;
	// @ts-expect-error — the parent instance has no 'w'
	opts.existentInstance.w;
});

// --- augmented / tactica-style registry entries ---------------------------------

declare module '..' {
	interface TypeRegistry {
		'Hooked': new (data: { name: string }) => Hooked;
		'Hooked.Child': new (data: { extra: number }) => HookedChildEntry;
	}
}

interface Hooked {
	name: string;
}

interface HookedChildEntry extends Hooked {
	extra: number;
}

// bare augmented entries gain registerHook through WithHookRegister:
// the created-instance type is recovered from the entry's construct return

const HookedCtor = lookup('Hooked');

HookedCtor.registerHook('postCreation', (opts) => {
	const created: Hooked = opts.inheritedInstance;
	const name: string = opts.inheritedInstance.name;
	void created;
	void name;
	// @ts-expect-error — Hooked has no 'extra'
	opts.inheritedInstance.extra;
});

HookedCtor.registerHook('preCreation', (opts) => {
	// parent instance of an augmented root entry is object
	const parent: object = opts.existentInstance;
	void parent;
	// @ts-expect-error — preCreation opts have no inheritedInstance
	opts.inheritedInstance;
});

const HookedChildCtor = lookup('Hooked.Child');

HookedChildCtor.registerHook('postCreation', (opts) => {
	const created: HookedChildEntry = opts.inheritedInstance;
	const extra: number = opts.inheritedInstance.extra;
	void created;
	void extra;
});

// --- free registerHook(Type, ...) ------------------------------------------------

class HookedClass {
	name: string;
	constructor (name: string) {
		this.name = name;
	}
}

const HookedDecorated = decorate()(HookedClass);

registerHook(HookedDecorated, 'postCreation', (opts) => {
	const created: HookedClass = opts.inheritedInstance;
	const name: string = opts.inheritedInstance.name;
	void created;
	void name;
	// @ts-expect-error — HookedClass has no 'missing'
	opts.inheritedInstance.missing;
});

registerHook(HookedDecorated, 'preCreation', (opts) => {
	// @ts-expect-error — preCreation opts have no inheritedInstance
	opts.inheritedInstance;
});

// module-level registerHook (mnemonica.registerHook) types the callback the same way

mnemonica.registerHook(HookUser, 'postCreation', (opts) => {
	const name: string = opts.inheritedInstance.name;
	void name;
	// @ts-expect-error — HookUser has no 'role'
	opts.inheritedInstance.role;
});
