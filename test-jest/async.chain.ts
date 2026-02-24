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
			expect(thrown!.message).toEqual('wrong modification pattern : should inherit from AsyncWOReturn: seems async AsyncWOReturn has no return statement');
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

			expect(wrongAsyncTypeErr!.message).toEqual('wrong modification pattern : should inherit from WrongAsyncType but got UserType');
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

};
