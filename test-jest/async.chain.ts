'use strict';

import { beforeAll, describe, expect, it } from '@jest/globals';
import type {
	AsyncChainTestOptions,
	UserData,
	ChainedAsyncInstance,
	WrongSyncTypeInstance,
	WrongAsyncTypeInstance,
	SleepTypeInstance,
	SleepErrorInstance,
} from './types';
import type { MnemonicaInstance } from '../src/types';

const mnemonica = require('../src/index');
const {
	define,
	errors,
	getProps,
} = mnemonica;

export const asyncChainTests = (opts: AsyncChainTestOptions) => {

	const {
		UserType,
		UserTypeConstructor,
		AsyncWOReturn,
		AsyncWOReturnNAR,
		AsyncReturnsNull,
		AsyncReturnsNullNAR,
	} = opts;

	describe('async construct should return something', () => {

		let thrown: Error | undefined;
		beforeAll(async () => {
			try {
				await new AsyncWOReturn();
			} catch (error) {
				thrown = error as Error;
			}
		});

		it('should throw without return statement', () => {
			expect(thrown).toBeInstanceOf(Error);
			expect(thrown).toBeInstanceOf(AsyncWOReturn);
			expect(thrown).toBeInstanceOf(errors.WRONG_MODIFICATION_PATTERN);
			expect(thrown!.message).toBeDefined();
			expect(typeof thrown!.message).toEqual('string');
			expect(thrown!.message).toEqual('wrong modification pattern : async constructor AsyncWOReturn must `return this` (it resolved to undefined)');
		});

	});

	describe('test hook throwModificationError', () => {
		const thrownError = new Error('aha');
		let thrown: Error | undefined;
		const HookThrownType = define('HookThrownType', function () { });
		HookThrownType.registerHook('postCreation', (hookData: { throwModificationError: (error: Error) => void }) => {
			if (!(thrown instanceof Error)) {
				hookData.throwModificationError(thrownError);
			}
		});

		beforeAll(async () => {
			try {
				await new HookThrownType();
			} catch (error) {
				thrown = error as Error;
			}
		});

		it('should throw without return statement', () => {
			expect(thrown).toBeInstanceOf(Error);
			expect(thrown).toBeInstanceOf(HookThrownType);
			expect(thrown!.message).toEqual('aha');
		});
	});

	describe('async construct should NOT return something', () => {
		let thrown: unknown;
		beforeAll(async () => {
			try {
				thrown = await new AsyncWOReturnNAR();
			} catch (error) {
				thrown = error;
			}
		});

		it('should NOT throw without return statement', () => {
			expect(thrown).toBeUndefined();
		});

	});

	describe('async chain check', () => {

		const WrongSyncType = define('WrongSyncType', function (data: UserData) {
			const self = new UserType(data);
			return self;
		}, {
			submitStack: true
		});

		const WrongAsyncType = define('WrongAsyncType', async function (data: UserData) {
			const self = new UserType(data);
			return self;
		}, {
			submitStack: true,
		});

		let syncWAsync1: ChainedAsyncInstance,
			syncWAsync2: ChainedAsyncInstance,
			wrongSyncTypeErr: WrongSyncTypeInstance | undefined,
			wrongAsyncTypeErr: WrongAsyncTypeInstance | undefined;

		const etalon1 = {
			WithAdditionalSignSign: 'WithAdditionalSignSign',
			WithoutPasswordSign: 'WithoutPasswordSign',
			async1st: '1_1st',
			description: 'UserTypeConstructor',
			email: 'async@gmail.com',
			password: undefined,
			sign: 'async sign',
			async2nd: '1_2nd',
			sync: '1_is',
			async: '1_3rd',
		};
		const etalon2 = {
			WithAdditionalSignSign: 'WithAdditionalSignSign',
			WithoutPasswordSign: 'WithoutPasswordSign',
			async1st: '2_1st',
			description: 'UserTypeConstructor',
			email: 'async@gmail.com',
			password: undefined,
			sign: 'async sign',
			async2nd: '2_2nd',
			sync: '2_is',
			async: '2_3rd',
		};

		let syncWAsyncChained: ChainedAsyncInstance;

		beforeAll(function (done) {
			(async () => {
				// working one
				syncWAsync1 =
					await (
						(
							await (
								await (

									(new UserTypeConstructor({
										email: 'async@gmail.com', password: 32123
									}) as ChainedAsyncInstance)
										.WithoutPassword()
										.WithAdditionalSign('async sign')

								).AsyncChain1st({ async1st: '1_1st' })

								// after promise
							).AsyncChain2nd({ async2nd: '1_2nd' })
							// sync 2 async
						).Async2Sync2nd({ sync: '1_is' })
					).AsyncChain3rd({ async: '1_3rd' });

				// working two
				syncWAsync2 = (await (

					(new UserTypeConstructor({
						email: 'async@gmail.com', password: 32123
					}) as ChainedAsyncInstance)
						.WithoutPassword()
						.WithAdditionalSign('async sign')
						.AsyncChain1st({ async1st: '2_1st' })

				)
					// after promise
					.then(async function (instance: ChainedAsyncInstance) {
						return await instance.AsyncChain2nd({ async2nd: '2_2nd' });
					})
					.then(async function (instance: ChainedAsyncInstance) {
						// sync 2 async
						return await instance.Async2Sync2nd({ sync: '2_is' });
					})
					.then(async function (instance: ChainedAsyncInstance) {
						return await instance.AsyncChain3rd({ async: '2_3rd' });
					})) as ChainedAsyncInstance;

				syncWAsyncChained = await
					(new UserTypeConstructor({
						email: 'async@gmail.com',
						password: 32123
					}) as ChainedAsyncInstance)
						.WithoutPassword()
						.WithAdditionalSign('async sign')
						.AsyncChain1st({ async1st: '1st' })
						// after promise
						.AsyncChain2nd({ async2nd: '2nd' })
						.Async2Sync2nd({ sync: 'is' })
						.AsyncChain3rd({ async: '3rd' });

				done();

				try {
					new WrongSyncType({
						email: 'wrong@gmail.com',
						password: 111
					});
				} catch (err) {
					wrongSyncTypeErr = err as WrongSyncTypeInstance;
				}

				try {
					await new WrongAsyncType({
						email: 'wrong@gmail.com',
						password: 111
					});
				} catch (err) {
					wrongAsyncTypeErr = err as WrongAsyncTypeInstance;
				}

			})();

		}, 30000);

		it('chain should work', () => {
			expect(syncWAsync1.extract()).toEqual(etalon1);
			expect(syncWAsync2.extract()).toEqual(etalon2);

			const etalon3 = {
				WithAdditionalSignSign: 'WithAdditionalSignSign',
				WithoutPasswordSign: 'WithoutPasswordSign',
				async1st: '1st',
				description: 'UserTypeConstructor',
				email: 'async@gmail.com',
				password: undefined,
				sign: 'async sign',
				async2nd: '2nd',
				sync: 'is',
				async: '3rd',
			};

			expect(syncWAsyncChained.extract()).toEqual(etalon3);
		});

		it('.__stack__ should have seekable definition', () => {
			const stackstart = '<-- creation of [ AsyncChain3rd ] traced -->';
			const stackTrack = [
				'<-- creation of [ Async2Sync2nd ] traced -->',
				'<-- creation of [ AsyncChain2nd ] traced -->',
				'<-- creation of [ AsyncChain1st ] traced -->',
				'<-- creation of [ WithAdditionalSign ] traced -->',
				'<-- creation of [ WithoutPassword ] traced -->',
				'<-- creation of [ UserTypeConstructor ] traced -->'
			];
			const { __stack__ } = getProps(syncWAsyncChained);

			let lastIndex = __stack__.indexOf(stackstart);
			expect(lastIndex).toEqual(1);
			stackTrack.forEach((line: string) => {
				let newIndex = __stack__.indexOf(line);
				expect(newIndex > 0).toEqual(true);
				expect(newIndex > lastIndex).toEqual(true);
				lastIndex = newIndex;
			});
			expect(__stack__.indexOf('async.chain.ts:1') > 0).toEqual(true);

		});

		it('SyncError.stack should have seekable definition', () => {
			const stackstart = '<-- creation of [ WrongSyncType ] traced -->';
			const { stack } = wrongSyncTypeErr!;
			expect(stack.indexOf(stackstart)).toEqual(1);
			expect(stack.indexOf('async.chain.ts') > 0).toEqual(true);
			expect(wrongSyncTypeErr).toBeInstanceOf(Error);
			expect(wrongSyncTypeErr).toBeInstanceOf(WrongSyncType);
			expect(wrongSyncTypeErr).toBeInstanceOf(errors.WRONG_MODIFICATION_PATTERN);
			expect(wrongSyncTypeErr!.message).toBeDefined();

			expect(wrongSyncTypeErr!.message).toEqual('wrong modification pattern : should inherit from WrongSyncType but got UserType');
		});

		it('AsyncError.stack should have seekable definition', () => {
			const stackstart = '<-- creation of [ WrongAsyncType ] traced -->';
			const { stack } = wrongAsyncTypeErr!;
			expect(stack.indexOf(stackstart)).toEqual(1);
			expect(stack.indexOf('async.chain.ts') > 0).toEqual(true);
			expect(wrongAsyncTypeErr).toBeInstanceOf(Error);
			expect(wrongAsyncTypeErr).toBeInstanceOf(WrongAsyncType);
			expect(wrongAsyncTypeErr).toBeInstanceOf(errors.WRONG_MODIFICATION_PATTERN);
			expect(wrongAsyncTypeErr!.message).toBeDefined();

			expect(wrongAsyncTypeErr!.message).toEqual('wrong modification pattern : async constructor WrongAsyncType must resolve to its own instance (`return this`), got UserType');
		});

	});

	describe('async chain forced errors types check', () => {

		let sleepError: SleepErrorInstance | null = null;

		let sleepInstance: SleepTypeInstance | null = null;
		let otherSleepInstance: SleepTypeInstance | null = null;
		let anotherSleepInstance: SleepTypeInstance | null = null;

		let syncErrorStart: SleepErrorInstance | null = null;
		let syncErrorEnd: SleepErrorInstance | null = null;

		let straightErrorSync: Error | null = null;
		let straightErrorAsync: Error | null = null;

		const argsTest = { argsTest: 123 };

		const sleep = (time: number) => {
			return new Promise<void>((resolve) => setTimeout(resolve, time));
		};

		const SleepType = define('SleepType', async function (this: MnemonicaInstance) {
			await sleep(100);
			(this as SleepTypeInstance).slept = true;
			return this;
		});

		const AsyncErroredType = SleepType.define('AsyncErroredType', async function (this: MnemonicaInstance, ...args: unknown[]) {
			await sleep(100);
			const b = { ...args };
			// TypeError - intentional error creation
			((b as Record<string, unknown>).c as Record<string, unknown>).async = null;
		});

		const SyncErroredType = SleepType.define('SyncErroredType', function (this: MnemonicaInstance, ...args: unknown[]) {
			const b = { ...args };
			// TypeError - intentional error creation
			((b as Record<string, unknown>).c as Record<string, unknown>).sync = null;
		});

		const AsyncErroredTypeStraight = SleepType.define('AsyncErroredTypeStraight', async function (this: MnemonicaInstance, ...args: unknown[]) {
			await sleep(100);
			const b = { ...args };
			// TypeError - intentional error creation
			((b as Record<string, unknown>).c as Record<string, unknown>).async = null;
		}, {
			blockErrors: false
		});

		const SyncErroredTypeStraight = SleepType.define('SyncErroredTypeStraight', function (this: MnemonicaInstance, ...args: unknown[]) {
			const b = { ...args };
			// TypeError - intentional error creation
			((b as Record<string, unknown>).c as Record<string, unknown>).sync = null;
		}, {
			blockErrors: false
		});

		beforeAll(function (done) {
			(async () => {

				sleepInstance = await new SleepType() as SleepTypeInstance;

				try {
					await sleepInstance!.AsyncErroredType(argsTest);
				} catch (error) {
					sleepError = error as SleepErrorInstance;
				}

				otherSleepInstance = await new SleepType() as SleepTypeInstance;

				anotherSleepInstance = await new SleepType() as SleepTypeInstance;

				try {
					anotherSleepInstance!.SyncErroredType(argsTest);
				} catch (error) {
					syncErrorStart = error as SleepErrorInstance;
				}

				try {
					anotherSleepInstance!.SyncErroredType(argsTest);
				} catch (error) {
					syncErrorEnd = error as SleepErrorInstance;
				}

				try {
					await new SleepType().AsyncErroredTypeStraight(argsTest);
				} catch (error) {
					straightErrorAsync = error as Error;
				}

				try {
					await new SleepType().SyncErroredTypeStraight(argsTest);
				} catch (error) {
					straightErrorSync = error as Error;
				}

				done();

			})();
		}, 30000);

		it('should have props', () => {
			expect(sleepInstance!.slept).toEqual(true);
			expect(sleepError!.slept).toEqual(true);
			expect(otherSleepInstance!.slept).toEqual(true);
		});

		it('sleepError should be instanceof Error', () => {
			expect(sleepError).toBeInstanceOf(Error);
		});
		it('sleepError should be instanceof TypeError', () => {
			expect(sleepError).toBeInstanceOf(TypeError);
		});
		it('sleepError should be instanceof SleepType', () => {
			expect(sleepError).toBeInstanceOf(SleepType);
		});
		it('sleepError should be instanceof AsyncErroredType', () => {
			expect(sleepError).toBeInstanceOf(AsyncErroredType);
		});
		it('sleepError expect args of SyncErroredType', () => {
			expect(getProps(sleepError).__args__[0]).toEqual(argsTest);
		});

		it('sleepError.stack creation section should name the call site', () => {
			// async failure: the creation section must hold the stack captured
			// at `new` time (this test file's frames) — not rejection-processing
			// frames, which is all a fresh capture could see after the await
			const { stack } = sleepError!;
			const creationSection = stack.split('<-- with the following error -->')[0];
			expect(creationSection.indexOf('<-- creation of [ AsyncErroredType ] traced -->') > 0).toEqual(true);
			expect(creationSection.indexOf('async.chain.ts') > 0).toEqual(true);
		});


		it('straightErrorAsync expect args of AsyncErroredTypeStraight', () => {
			const props = getProps(straightErrorAsync);
			expect(props).toBeUndefined();
		});

		it('sleepError should be instanceof plain Error only', () => {
			expect(straightErrorAsync).toBeInstanceOf(Error);
			expect(straightErrorAsync).toBeInstanceOf(TypeError);
			expect(straightErrorAsync).not.toBeInstanceOf(AsyncErroredTypeStraight);
		});

		it('straightErrorSync expect args of SyncErroredTypeStraight', () => {
			const props = getProps(straightErrorSync);
			expect(props).toBeUndefined();
		});

		it('sleepError should be instanceof plain Error only', () => {
			expect(straightErrorSync).toBeInstanceOf(Error);
			expect(straightErrorSync).toBeInstanceOf(TypeError);
			expect(straightErrorSync).not.toBeInstanceOf(SyncErroredTypeStraight);
		});

		it('sleepInstance should be instanceof SleepType', () => {
			expect(sleepInstance).toBeInstanceOf(SleepType);
		});
		it('sleepInstance should be instanceof Error', () => {
			expect(sleepInstance).toBeInstanceOf(Error);
		});
		it('sleepInstance should be instanceof TypeError', () => {
			expect(sleepInstance).toBeInstanceOf(TypeError);
		});

		it('otherSleepInstance should be instanceof SleepType', () => {
			expect(otherSleepInstance).toBeInstanceOf(SleepType);
		});
		it('otherSleepInstance should not be instanceof Error', () => {
			expect(otherSleepInstance).not.toBeInstanceOf(Error);
		});
		it('otherSleepInstance should not be instanceof TypeError', () => {
			expect(otherSleepInstance).not.toBeInstanceOf(TypeError);
		});

		it('anotherSleepInstance should be instanceof SleepType', () => {
			const insof = anotherSleepInstance instanceof SleepType;
			expect(insof).toEqual(true);
		});
		it('anotherSleepInstance should be instanceof Error', () => {
			expect(anotherSleepInstance).toBeInstanceOf(Error);
		});
		it('anotherSleepInstance should be instanceof TypeError', () => {
			expect(anotherSleepInstance).toBeInstanceOf(TypeError);
		});


		it('sleepInstance should not be instanceof AsyncErroredType', () => {
			expect(sleepInstance).not.toBeInstanceOf(AsyncErroredType);
		});

		it('syncErrorStart should be instanceof Error', () => {
			expect(syncErrorStart).toBeInstanceOf(Error);
		});
		it('syncErrorStart should be instanceof TypeError', () => {
			expect(syncErrorStart).toBeInstanceOf(TypeError);
		});
		it('syncErrorStart should be instanceof SyncErroredType', () => {
			expect(syncErrorStart).toBeInstanceOf(SyncErroredType);
		});
		it('syncErrorStart expect args of SyncErroredType', () => {
			expect(getProps(syncErrorStart).__args__[0]).toEqual(argsTest);
		});

		it('syncErrorEnd should be instanceof Error', () => {
			expect(syncErrorEnd).toBeInstanceOf(Error);
		});
		it('syncErrorEnd should be instanceof TypeError', () => {
			expect(syncErrorEnd).toBeInstanceOf(TypeError);
		});
		it('syncErrorEnd should be instanceof SyncErroredType', () => {
			expect(syncErrorEnd).toBeInstanceOf(SyncErroredType);
		});
		it('syncErrorEnd expect args of SyncErroredType', () => {
			expect(getProps(syncErrorEnd).__args__[0]).toEqual(argsTest);
		});


	});

	describe('async super() return value propagation', () => {

		let asyncParentInstance: MnemonicaInstance & { parentAsyncValue: string };
		let asyncChildInstance: MnemonicaInstance & { parentAsyncValue: string; childAsyncValue: string };

		const sleep = (time: number) => {
			return new Promise<void>((resolve) => setTimeout(resolve, time));
		};

		const AsyncParentType = define('AsyncParentType', async function (this: MnemonicaInstance) {
			await sleep(50);
			(this as typeof asyncParentInstance).parentAsyncValue = 'parent';
			return this;
		});

		const AsyncChildType = AsyncParentType.define('AsyncChildType', async function (this: MnemonicaInstance) {
			await sleep(50);
			(this as typeof asyncChildInstance).childAsyncValue = 'child';
			return this;
		});

		beforeAll(async function () {
			asyncParentInstance = await new AsyncParentType() as typeof asyncParentInstance;
			asyncChildInstance = await asyncParentInstance.AsyncChildType() as typeof asyncChildInstance;
		});

		it('parent instance should have parent property', () => {
			expect(asyncParentInstance.parentAsyncValue).toEqual('parent');
		});

		it('child instance should have parent property', () => {
			expect(asyncChildInstance.parentAsyncValue).toEqual('parent');
		});

		it('child instance should have child property', () => {
			expect(asyncChildInstance.childAsyncValue).toEqual('child');
		});

		it('child instance should be instanceof AsyncParentType', () => {
			expect(asyncChildInstance).toBeInstanceOf(AsyncParentType);
		});

		it('child instance should be instanceof AsyncChildType', () => {
			expect(asyncChildInstance).toBeInstanceOf(AsyncChildType);
		});

		it('parent instance should not be instanceof AsyncChildType', () => {
			expect(asyncParentInstance).not.toBeInstanceOf(AsyncChildType);
		});

	});

	// appended at the END on purpose: the stack-trace pins above match
	// 'async.chain.ts:1' (a 1xx line) — inserting earlier shifts line
	// numbers and breaks them
	describe('async construct resolving to null', () => {

		let thrown: Error | undefined;
		beforeAll(async () => {
			try {
				await new AsyncReturnsNull();
			} catch (error) {
				thrown = error as Error;
			}
		});

		it('should throw the readable mnemonica error, never the internal TypeError', () => {
			expect(thrown).toBeInstanceOf(Error);
			expect(thrown).toBeInstanceOf(AsyncReturnsNull);
			expect(thrown).toBeInstanceOf(errors.WRONG_MODIFICATION_PATTERN);
			expect(thrown!.message).toEqual('wrong modification pattern : async constructor AsyncReturnsNull must `return this` (it resolved to null)');
		});

	});

	describe('async construct resolving to null with unchain:true', () => {

		let resolved: unknown;
		beforeAll(async () => {
			try {
				resolved = await new AsyncReturnsNullNAR();
			} catch (error) {
				resolved = error;
			}
		});

		it('should resolve null as-is', () => {
			expect(resolved).toBeNull();
		});

	});

	// the async-class cases of test_async/ as main-suite equivalents
	// (test_async/ stays its own script, off test:cov — these give the
	// coverage gate the same shapes), plus the new cases: an async class
	// resolving to ANOTHER object, and async class subtypes via the call
	// form and inst.Sub.call(other)
	describe('async class constructors (main suite)', () => {

		const AsyncClassParent = define('AsyncClassParent', class {
			parentField = 'parent-field';
			constructor() {
				return new Promise((resolve) => {
					setTimeout(() => resolve(this), 10);
				});
			}
		});

		const AsyncClassChild = AsyncClassParent.define('AsyncClassChild', class {
			childField = 'child-field';
			constructor() {
				return new Promise((resolve) => {
					setTimeout(() => resolve(this), 10);
				});
			}
		});

		const AsyncClassWOReturn = define('AsyncClassWOReturn', class {
			constructor() {
				return new Promise((resolve) => {
					setTimeout(() => resolve(), 10);
				});
			}
		});

		const AsyncClassWOReturnNAR = define('AsyncClassWOReturnNAR', class {
			constructor() {
				return new Promise((resolve) => {
					setTimeout(() => resolve(), 10);
				});
			}
		}, {
			unchain: true
		});

		const AsyncClassReturnsOther = define('AsyncClassReturnsOther', class {
			constructor() {
				return new Promise((resolve) => {
					setTimeout(() => resolve({ foreign: true }), 10);
				});
			}
		});

		class AsyncClassBase {
			baseField = 'base-field';
		}

		class AsyncClassExtends extends AsyncClassBase {
			extField = 'ext-field';
			constructor() {
				super();
				return new Promise((resolve) => {
					setTimeout(() => resolve(this), 10);
				});
			}
		}

		const AsyncClassPreExtended = define('AsyncClassPreExtended', AsyncClassExtends);

		const AsyncClassRooted = define('AsyncClassRooted', class {
			rootField = 'root-field';
			constructor() {
				return new Promise((resolve) => {
					setTimeout(() => resolve(this), 10);
				});
			}
		});

		const AsyncClassRootedSub = AsyncClassRooted.define('AsyncClassRootedSub', AsyncClassExtends);

		// shared across the sub-describes below
		let asyncClassParentInstance: unknown;

		describe('async class fields and inheritance', () => {

			let asyncClassChildInstance: unknown;
			let asyncClassCallFormInstance: unknown;

			beforeAll(async () => {
				asyncClassParentInstance = await new AsyncClassParent();
				const parent = asyncClassParentInstance as { AsyncClassChild: new () => Promise<unknown> };
				asyncClassChildInstance = await parent.AsyncClassChild();
				// the call form (no new) on an async class subtype
				asyncClassCallFormInstance = await parent.AsyncClassChild();
			});

			it('parent instance should have class field', () => {
				expect((asyncClassParentInstance as { parentField: string }).parentField).toEqual('parent-field');
			});

			it('child instance should have parent and child class fields', () => {
				const child = asyncClassChildInstance as { parentField: string, childField: string };
				expect(child.parentField).toEqual('parent-field');
				expect(child.childField).toEqual('child-field');
			});

			it('child instance should be instanceof parent and child types', () => {
				expect(asyncClassChildInstance).toBeInstanceOf(AsyncClassParent);
				expect(asyncClassChildInstance).toBeInstanceOf(AsyncClassChild);
				expect(asyncClassParentInstance).not.toBeInstanceOf(AsyncClassChild);
			});

			it('call form should produce an equal instance', () => {
				expect(asyncClassCallFormInstance).toBeInstanceOf(AsyncClassChild);
				expect((asyncClassCallFormInstance as { childField: string }).childField).toEqual('child-field');
			});

		});

		describe('async class subtype via inst.Sub.call(other)', () => {

			let asyncClassCalledInstance: unknown;

			beforeAll(async () => {
				// the era semantics: other must be a PARENT-type instance
				// (a plain object is rejected: "should inherit from X but
				// made on Object" — pinned in test-jest/index.ts) — the form
				// adopts the given parent's data into a new child
				const otherParent = await new AsyncClassParent() as { adopted?: string };
				otherParent.adopted = 'adopted-field';
				const parent = asyncClassParentInstance as {
					AsyncClassChild: { call: (self: object) => Promise<unknown> }
				};
				asyncClassCalledInstance = await parent.AsyncClassChild.call(otherParent);
			});

			it('should construct the subtype on the given parent instance', () => {
				const inst = asyncClassCalledInstance as { childField: string, adopted: string };
				expect(asyncClassCalledInstance).toBeInstanceOf(AsyncClassChild);
				expect(inst.childField).toEqual('child-field');
				expect(inst.adopted).toEqual('adopted-field');
			});

		});

		describe('async class construct should return something', () => {

			let thrown: Error | undefined;
			beforeAll(async () => {
				try {
					await new AsyncClassWOReturn();
				} catch (error) {
					thrown = error as Error;
				}
			});

			it('should throw without return statement for class', () => {
				expect(thrown).toBeInstanceOf(Error);
				expect(thrown).toBeInstanceOf(AsyncClassWOReturn);
				expect(thrown).toBeInstanceOf(errors.WRONG_MODIFICATION_PATTERN);
				expect((thrown as Error).message).toEqual('wrong modification pattern : async constructor AsyncClassWOReturn must `return this` (it resolved to undefined)');
			});

		});

		describe('async class construct should NOT return something', () => {
			let resolved: unknown;
			beforeAll(async () => {
				try {
					resolved = await new AsyncClassWOReturnNAR();
				} catch (error) {
					resolved = error;
				}
			});

			it('should NOT throw without return statement for class', () => {
				expect(resolved).toBeUndefined();
			});
		});

		describe('async class resolving to another object', () => {

			let thrown: Error | undefined;
			beforeAll(async () => {
				try {
					await new AsyncClassReturnsOther();
				} catch (error) {
					thrown = error as Error;
				}
			});

			it('should throw the should-inherit-from error naming the foreign object', () => {
				expect(thrown).toBeInstanceOf(Error);
				expect(thrown).toBeInstanceOf(AsyncClassReturnsOther);
				expect(thrown).toBeInstanceOf(errors.WRONG_MODIFICATION_PATTERN);
				expect((thrown as Error).message).toEqual('wrong modification pattern : async constructor AsyncClassReturnsOther must resolve to its own instance (`return this`), got Object');
			});

		});

		describe('pre-existing class hierarchy passed to define()', () => {

			let asyncClassPreExtInstance: unknown;

			beforeAll(async () => {
				asyncClassPreExtInstance = await new AsyncClassPreExtended();
			});

			it('instance should have base and extended class fields', () => {
				const inst = asyncClassPreExtInstance as { baseField: string, extField: string };
				expect(inst.baseField).toEqual('base-field');
				expect(inst.extField).toEqual('ext-field');
			});

			it('instance should be instanceof the mnemonica type and the original classes', () => {
				expect(asyncClassPreExtInstance).toBeInstanceOf(AsyncClassPreExtended);
				expect(asyncClassPreExtInstance).toBeInstanceOf(AsyncClassExtends);
				expect(asyncClassPreExtInstance).toBeInstanceOf(AsyncClassBase);
			});

		});

		describe('root type defines subtype with pre-existing class hierarchy', () => {

			let asyncClassRootInstance: unknown;
			let asyncClassRootedSubInstance: unknown;

			beforeAll(async () => {
				asyncClassRootInstance = await new AsyncClassRooted();
				const rooted = asyncClassRootInstance as { AsyncClassRootedSub: new () => Promise<unknown> };
				asyncClassRootedSubInstance = await rooted.AsyncClassRootedSub();
			});

			it('sub instance should have root, base and extended fields', () => {
				const inst = asyncClassRootedSubInstance as { rootField: string, baseField: string, extField: string };
				expect(inst.rootField).toEqual('root-field');
				expect(inst.baseField).toEqual('base-field');
				expect(inst.extField).toEqual('ext-field');
			});

			it('sub instance should be instanceof root and sub, root not instanceof sub', () => {
				expect(asyncClassRootedSubInstance).toBeInstanceOf(AsyncClassRooted);
				expect(asyncClassRootedSubInstance).toBeInstanceOf(AsyncClassRootedSub);
				expect(asyncClassRootInstance).toBeInstanceOf(AsyncClassRooted);
				expect(asyncClassRootInstance).not.toBeInstanceOf(AsyncClassRootedSub);
			});

		});

	});

};
