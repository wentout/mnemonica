'use strict';

const { assert } = require('chai');

const mnemonica = require('..');

const {
	define,
	errors,
} = mnemonica;

// Import raw utilities directly for testing
const { exception } = require('../build/utils/exception');
const { sibling } = require('../build/utils/sibling');
const { fork } = require('../build/utils/fork');

const tests = () => {

	describe('utils/exception', () => {

		const SomeType = define('ExceptionTestTypeMocha', function () { });
		const instance = new SomeType();

		describe('called without new', () => {
			it('should throw WRONG_INSTANCE_INVOCATION', () => {
				try {
					exception(instance, new Error('test'));
					assert.fail('should have thrown');
				} catch (error) {
					assert.instanceOf(error, errors.WRONG_INSTANCE_INVOCATION);
				}
			});
		});

		describe('called with new', () => {

			it('should throw when error is not instanceof Error', () => {
				try {
					new exception(instance, 'not an error');
					assert.fail('should have thrown');
				} catch (error) {
					assert.instanceOf(error, errors.WRONG_ARGUMENTS_USED);
				}
			});

			it('should create proper exception instance', () => {
				const originalError = new Error('original');
				const exceptionInstance = new exception(
					instance,
					originalError,
					1,
					2,
					3
				);

				assert.instanceOf(exceptionInstance, Error);
				assert.equal(exceptionInstance.instance, instance);
				assert.equal(exceptionInstance.originalError, originalError);
				assert.deepEqual(exceptionInstance.args, [ 1, 2, 3 ]);
			});

			it('should have extract method matching instance', () => {
				const originalError = new Error('original');
				const exceptionInstance = new exception(
					instance,
					originalError
				);

				assert.deepEqual(
					exceptionInstance.extract(),
					instance.extract()
				);
			});

		});

	});

	describe('utils/sibling', () => {

		const CollectionA = define('SiblingTestCollectionAMocha', function () { });
		const CollectionB = define('SiblingTestCollectionBMocha', function () { });
		const instanceA = new CollectionA();
		const instanceB = new CollectionB();

		describe('direct call (apply trap)', () => {
			it('should find sibling by name', () => {
				const siblingProxy = sibling(instanceA);
				const result = siblingProxy('SiblingTestCollectionBMocha');
				assert.equal(result, CollectionB);
			});

			it('should return undefined for missing sibling', () => {
				const siblingProxy = sibling(instanceA);
				const result = siblingProxy('NonExistentType');
				assert.equal(result, undefined);
			});
		});

		describe('property access (get trap)', () => {
			it('should find sibling by property access', () => {
				const siblingProxy = sibling(instanceA);
				const result = siblingProxy.SiblingTestCollectionBMocha;
				assert.equal(result, CollectionB);
			});

			it('should return undefined for missing sibling property', () => {
				const siblingProxy = sibling(instanceA);
				const result = siblingProxy.NonExistentType;
				assert.equal(result, undefined);
			});
		});

		describe('with different instances', () => {
			it('should return sibling from instanceB collection', () => {
				const siblingProxy = sibling(instanceB);
				const result = siblingProxy('SiblingTestCollectionAMocha');
				assert.equal(result, CollectionA);
			});
		});

	});

	describe('utils/fork', () => {

		const originalData = { value : 'original' };
		const ForkTestType = define('ForkTestTypeMocha', function (data) {
			this.value = data.value;
		});
		const instance = new ForkTestType(originalData);

		describe('fork with original args', () => {
			it('should create fork with original args when called with no args', () => {
				const forkFn = fork(instance);
				const forked = forkFn.call(instance);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'original');
			});
		});

		describe('fork with new args', () => {
			it('should create fork with new args', () => {
				const newData = { value : 'forked' };
				const forkFn = fork(instance);
				const forked = forkFn.call(instance, newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked');
			});
		});

		describe('fork preserves type', () => {
			it('should preserve instanceof relationship', () => {
				const forkFn = fork(instance);
				const forked = forkFn.call(instance);

				assert.instanceOf(forked, ForkTestType);
				assert.instanceOf(instance, ForkTestType);
			});
		});

		describe('fork with different this', () => {
			it('should use InstanceCreator when this is not __self__', () => {
				const OtherType = define('ForkOtherTypeMocha', function () { });
				const otherInstance = new OtherType();
				const newData = { value : 'forked from other' };
				const forkFn = fork(instance);
				const forked = forkFn.call(otherInstance, newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked from other');
			});
		});

		describe('fork on subtype', () => {
			it('should fork subtype using existentInstance as Constructor', () => {
				const ParentType = define('ForkParentTypeMocha', function (data) {
					this.parentVal = data.parentVal;
				});
				const SubType = ParentType.define('ForkSubTypeMocha', function (data) {
					this.subVal = data.subVal;
				});
				const parentInstance = new ParentType({ parentVal : 'parent' });
				const subInstance = new parentInstance.ForkSubTypeMocha({ subVal : 'sub' });

				const forkFn = fork(subInstance);
				const forked = forkFn.call(subInstance);

				assert.instanceOf(forked, SubType);
				assert.equal(forked.subVal, 'sub');
			});
		});

		describe('fork with primitive wrapper this', () => {
			it('should work when called with new Boolean(this)', () => {
				const newData = { value : 'forked with boolean wrapper' };
				const forkFn = fork(instance);
				const forked = forkFn.call(new Boolean(5), newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked with boolean wrapper');
			});

			it('should work when called with new String(this)', () => {
				const newData = { value : 'forked with string wrapper' };
				const forkFn = fork(instance);
				const forked = forkFn.call(new String('test'), newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked with string wrapper');
			});

			it('should work when called with new Number(this)', () => {
				const newData = { value : 'forked with number wrapper' };
				const forkFn = fork(instance);
				const forked = forkFn.call(new Number(42), newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked with number wrapper');
			});
		});

	});

};

module.exports = tests;
