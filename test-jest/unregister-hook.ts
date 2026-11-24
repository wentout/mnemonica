'use strict';

import { describe, expect, it } from '@jest/globals';

import {
	createTypesCollection,
	errors,
	registerHook,
	unregisterHook
} from '../src/index';

// every type lives in its own collection: the suite counts the hooks of
// defaultTypes
const makeType = () => {
	const collection = createTypesCollection();
	const Type = collection.define('HookOffType', function (this: { mark: string }) {
		this.mark = 'made';
	});
	const result = { collection, Type };
	return result;
};

describe('unregisterHook, on / off and the short hook names', () => {

	it('removes exactly the given callback', () => {
		const { Type } = makeType();
		const calls: string[] = [];
		const first = () => { calls.push('first'); };
		const second = () => { calls.push('second'); };
		Type.registerHook('preCreation', first);
		Type.registerHook('preCreation', second);
		expect(Type.unregisterHook('preCreation', first)).toBe(true);
		new Type();
		expect(calls).toEqual(['second']);
	});

	it('returns false for an unknown callback or an empty hook type', () => {
		const { Type } = makeType();
		const cb = () => {};
		expect(Type.unregisterHook('preCreation', cb)).toBe(false);
		Type.registerHook('preCreation', cb);
		expect(Type.unregisterHook('preCreation', () => {})).toBe(false);
		expect(Type.unregisterHook('preCreation', cb)).toBe(true);
		expect(Type.unregisterHook('preCreation', cb)).toBe(false);
	});

	it('validates its arguments as registerHook does', () => {
		const { Type } = makeType();
		expect(() => {
			// @ts-expect-error — not a hook name
			Type.unregisterHook('WrongHookType', () => {});
		}).toThrow(errors.WRONG_HOOK_TYPE);
		expect(() => {
			// @ts-expect-error — the callback is required
			Type.unregisterHook('preCreation');
		}).toThrow(errors.MISSING_HOOK_CALLBACK);
	});

	it('on / off take the short names, for types, collections and the free form', () => {
		const { collection, Type } = makeType();
		const calls: string[] = [];
		const typePre = () => { calls.push('type pre'); };
		const collectionPre = () => { calls.push('collection pre'); };
		const freePost = () => { calls.push('free post'); };
		Type.on('pre', typePre);
		collection.on('pre', collectionPre);
		registerHook(Type, 'post', freePost);
		new Type();
		expect(calls).toEqual(['collection pre', 'type pre', 'free post']);
		calls.length = 0;
		expect(Type.off('pre', typePre)).toBe(true);
		expect(collection.off('pre', collectionPre)).toBe(true);
		expect(unregisterHook(Type, 'post', freePost)).toBe(true);
		new Type();
		expect(calls).toEqual([]);
	});

	it('the flow checker stops with the last callback', () => {
		const { collection, Type } = makeType();
		const checks: unknown[] = [];
		collection.registerFlowChecker((opts) => { checks.push(opts.hookType); });
		const cb = () => {};
		collection.on('pre', cb);
		new Type();
		expect(checks).toEqual(['preCreation']);
		collection.off('pre', cb);
		new Type();
		expect(checks).toEqual(['preCreation']);
	});

});
