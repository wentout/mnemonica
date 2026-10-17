'use strict';

// Per-type lazy definition cell.
//
// .lazy(TypeName, callback) is a regular define whose construct handler is
// resolved on every `new`: the callback runs exactly ONCE per construction,
// at its entry point (TypeProxy.construct for a direct `new`, the
// SubTypeProxy in Mnemosyne.ts for `new instance.SubType()`, addThen in
// InstanceCreator.ts for an async chain link), and the gathered handler
// lives in this cell until InstanceCreator's setup has snapshotted it —
// then the cell returns to its define-time state, so between constructions
// every read (the proto / config / constructHandler facades installed by
// typeDescriptorCreator in api/types/index.ts, the ancestor facade in
// TypeProxy.ts) sees the define-time state: no handler retained, the shim's
// empty prototype, asClass off.
//
// The cells live in a module-level WeakMap keyed by the type DESCRIPTOR —
// and by its TypeProxy too (TypeProxy registers itself at creation),
// because the subtype construction entries (makeSubTypeProxy, addThen)
// hold the proxy, not the descriptor. Both keys resolve to the same
// LazyDefinition.

import type { ConstructHandler } from './compileNewModificatorFunctionBody';

export interface LazyDefinitionCell {
	handler: ConstructHandler | undefined;
	asClass: boolean;
	proto: object;
	// the gather outcome flag: distinct from the error VALUE, because a
	// callback may legitimately throw undefined
	failed: boolean;
	// whatever the callback threw or whatever rejected shape it produced —
	// unknown on purpose: the error path gets it exactly as the
	// constructor-body path gets a thrown non-Error
	error: unknown;
}

export interface LazyDefinition {
	cell: LazyDefinitionCell;
	// the type's merged config value at define time (handler-independent):
	// a blocked construction (errored parent + blockErrors on) never runs
	// user code on the body path — the callback must not run either
	blockErrors: boolean;
	gather: () => void;
	reset: () => void;
}

const lazyDefinitions = new WeakMap<object, LazyDefinition>();

export const setLazyDefinition = function ( key: object, definition: LazyDefinition ) {
	lazyDefinitions.set(
		key,
		definition
	);
};

export const readLazyDefinition = function ( type: unknown ): LazyDefinition | undefined {
	if (type === null || (typeof type !== 'object' && typeof type !== 'function')) {
		return undefined;
	}
	const result = lazyDefinitions.get( type );
	return result;
};

// runs the callback at a construction entry; a no-op for direct types, and
// skipped when the construction is about to be blocked (an errored parent
// with blockErrors on): the circuit breaker in InstanceCreator then throws
// the parent's error exactly as on the body path
export const gatherLazyDefinition = function ( type: unknown, existentInstance?: unknown ) {
	const lazy = readLazyDefinition( type );
	if ( lazy === undefined ) {
		return;
	}
	if ( lazy.blockErrors && existentInstance instanceof Error ) {
		return;
	}
	lazy.gather();
};

// returns the cell to the define-time state; called by InstanceCreator's
// setup once the construction has snapshotted everything it needs
export const resetLazyDefinition = function ( type: unknown ) {
	const lazy = readLazyDefinition( type );
	if ( lazy === undefined ) {
		return;
	}
	lazy.reset();
};

// the gather failure snapshotted by InstanceCreator's setup: `failed` is
// the explicit outcome flag (a callback may throw undefined), `error` the
// thrown value itself
export const readLazyDefinitionFailure = function ( type: unknown ): { failed: boolean; error: unknown } | undefined {
	const lazy = readLazyDefinition( type );
	if ( lazy === undefined ) {
		return undefined;
	}
	const { cell } = lazy;
	const result = {
		failed : cell.failed,
		error  : cell.error
	};
	return result;
};
