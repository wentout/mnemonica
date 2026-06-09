'use strict';

import { beforeAll, describe, expect, it } from '@jest/globals';
import type { MnemonicaModule } from '../src/types';

const mnemonica = require('../src/index') as MnemonicaModule;

const {
	define,
	errors,
} = mnemonica;

// Import raw utilities (not wrapped by wrapThis) to test them directly
import { exception } from '../src/utils/exception';
import { sibling } from '../src/utils/sibling';
import { fork } from '../src/utils/fork';

describe('utils/exception', () => {

	const SomeType = define('ExceptionTestType', function () { });
	const instance = new SomeType();

	describe('called without new', () => {
		it('should throw WRONG_INSTANCE_INVOCATION', () => {
			expect(() => {
				exception(instance, new Error('test'));
			}).toThrow(errors.WRONG_INSTANCE_INVOCATION);
		});
	});

	describe('called with new', () => {

		it('should throw when error is not instanceof Error', () => {
			expect(() => {
				new (exception as CallableFunction)(instance, 'not an error' as unknown as Error);
			}).toThrow(errors.WRONG_ARGUMENTS_USED);
		});

		it('should create proper exception instance', () => {
			const originalError = new Error('original');
			const exceptionInstance = new (exception as CallableFunction)(
				instance,
				originalError,
				1,
				2,
				3
			);

			expect(exceptionInstance).toBeInstanceOf(Error);
			expect(exceptionInstance.instance).toEqual(instance);
			expect(exceptionInstance.originalError).toEqual(originalError);
			expect(exceptionInstance.args).toEqual([1, 2, 3]);
		});

		it('should have extract method matching instance', () => {
			const originalError = new Error('original');
			const exceptionInstance = new (exception as CallableFunction)(
				instance,
				originalError
			);

			expect(exceptionInstance.extract()).toMatchObject(instance.extract());
		});

	});

});

describe('utils/sibling', () => {

	const CollectionA = define('SiblingTestCollectionA', function () { });
	const CollectionB = define('SiblingTestCollectionB', function () { });
	const instanceA = new CollectionA();
	const instanceB = new CollectionB();

	describe('direct call (apply trap)', () => {
		it('should find sibling by name', () => {
			const siblingProxy = sibling(instanceA) as { (name: string): unknown };
			const result = siblingProxy('SiblingTestCollectionB');
			expect(result).toEqual(CollectionB);
		});

		it('should return undefined for missing sibling', () => {
			const siblingProxy = sibling(instanceA) as { (name: string): unknown };
			const result = siblingProxy('NonExistentType');
			expect(result).toBeUndefined();
		});
	});

	describe('property access (get trap)', () => {
		it('should find sibling by property access', () => {
			const siblingProxy = sibling(instanceA) as Record<string, unknown>;
			const result = siblingProxy.SiblingTestCollectionB;
			expect(result).toEqual(CollectionB);
		});

		it('should return undefined for missing sibling property', () => {
			const siblingProxy = sibling(instanceA) as Record<string, unknown>;
			const result = siblingProxy.NonExistentType;
			expect(result).toBeUndefined();
		});
	});

	describe('with different instances', () => {
		it('should return sibling from instanceB collection', () => {
			const siblingProxy = sibling(instanceB) as { (name: string): unknown };
			const result = siblingProxy('SiblingTestCollectionA');
			expect(result).toEqual(CollectionA);
		});
	});

});

	describe('utils/fork', () => {

		const originalData = { value: 'original' };
		const ForkTestType = define('ForkTestType', function (this: { value: string }, data: { value: string }) {
			this.value = data.value;
		});
		const instance = new ForkTestType(originalData);

		describe('fork with original args', () => {
			it('should create fork with original args when called with no args', () => {
				const forkFn = fork(instance);
				const forked = (forkFn as CallableFunction).call(instance);

				expect(forked).toBeInstanceOf(ForkTestType);
				expect((forked as { value: string }).value).toEqual('original');
			});
		});

		describe('fork with new args', () => {
			it('should create fork with new args', () => {
				const newData = { value: 'forked' };
				const forkFn = fork(instance);
				const forked = (forkFn as CallableFunction).call(instance, newData);

				expect(forked).toBeInstanceOf(ForkTestType);
				expect((forked as { value: string }).value).toEqual('forked');
			});
		});

	describe('fork preserves type', () => {
		it('should preserve instanceof relationship', () => {
			const forkFn = fork(instance);
			const forked = (forkFn as CallableFunction).call(instance);

			expect(forked).toBeInstanceOf(ForkTestType);
			expect(instance).toBeInstanceOf(ForkTestType);
		});
	});

	describe('fork with different this', () => {
		it('should use InstanceCreator when this is not __self__', () => {
			const OtherType = define('ForkOtherType', function () { });
			const otherInstance = new OtherType();
			const newData = { value: 'forked from other' };
			const forkFn = fork(instance);
			const forked = (forkFn as CallableFunction).call(otherInstance, newData);

			expect(forked).toBeInstanceOf(ForkTestType);
			expect((forked as { value: string }).value).toEqual('forked from other');
		});
	});

	describe('fork on subtype', () => {
		it('should fork subtype using existentInstance as Constructor', () => {
			const ParentType = define('ForkParentType', function (this: { parentVal: string }, data: { parentVal: string }) {
				this.parentVal = data.parentVal;
			});
			const SubType = ParentType.define('ForkSubType', function (this: { subVal: string }, data: { subVal: string }) {
				this.subVal = data.subVal;
			});
			const parentInstance = new ParentType({ parentVal: 'parent' });
			const subInstance = new parentInstance.ForkSubType({ subVal: 'sub' });

			const forkFn = fork(subInstance);
			const forked = (forkFn as CallableFunction).call(subInstance);

			expect(forked).toBeInstanceOf(SubType);
			expect((forked as { subVal: string }).subVal).toEqual('sub');
		});
	});

	describe('fork with primitive wrapper this', () => {
		it('should work when called with new Boolean(this)', () => {
			const newData = { value: 'forked with boolean wrapper' };
			const forkFn = fork(instance);
			const forked = (forkFn as CallableFunction).call(new Boolean(5), newData);

			expect(forked).toBeInstanceOf(ForkTestType);
			expect((forked as { value: string }).value).toEqual('forked with boolean wrapper');
		});

		it('should work when called with new String(this)', () => {
			const newData = { value: 'forked with string wrapper' };
			const forkFn = fork(instance);
			const forked = (forkFn as CallableFunction).call(new String('test'), newData);

			expect(forked).toBeInstanceOf(ForkTestType);
			expect((forked as { value: string }).value).toEqual('forked with string wrapper');
		});

		it('should work when called with new Number(this)', () => {
			const newData = { value: 'forked with number wrapper' };
			const forkFn = fork(instance);
			const forked = (forkFn as CallableFunction).call(new Number(42), newData);

			expect(forked).toBeInstanceOf(ForkTestType);
			expect((forked as { value: string }).value).toEqual('forked with number wrapper');
		});
	});

});
