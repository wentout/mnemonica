'use strict';

const { assert, expect } = require('chai');

const {
	define,
	errors,
} = require('..');

const test = (opts) => {
	
	const {
		UserType,
		UserTypeConstructor,
	} = opts;

	describe('async chain check', () => {

		var WrongSyncType = define('WrongSyncType', function (data) {
			return new UserType(data);
		});
		
		var WrongAsyncType = define('WrongAsyncType', async function (data) {
			return new UserType(data);
		});


		var
			syncWAsync1,
			syncWAsync2,
			wrongSyncTypeErr,
			wrongAsyncTypeErr;

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

		var syncWAsyncChained;

		before(function (done) {

			(async () => {

				// debugger;
				// working one
				syncWAsync1 =
					await (
						(
							await (
								await (

									new UserTypeConstructor({
										email: 'async@gmail.com', password: 32123
									})
										.WithoutPassword()
										.WithAdditionalSign('async sign')

								).AsyncChain1st({ async1st: '1_1st' })

								// after promise
							).AsyncChain2nd({ async2nd: '1_2nd' })
							// sync 2 async
						).Async2Sync2nd({ sync: '1_is' })
					).AsyncChain3rd({ async: '1_3rd' });

				// debugger;
				// working two
				syncWAsync2 = await (

					new UserTypeConstructor({
						email: 'async@gmail.com', password: 32123
					})
						.WithoutPassword()
						.WithAdditionalSign('async sign')

				).AsyncChain1st({ async1st: '2_1st' })
					// after promise
					// .then(async function (instance) {
						// return await instance.AsyncChain1st({ async1st: '2_1st' });
					// })
					.then(async function (instance) {
						return await instance.AsyncChain2nd({ async2nd: '2_2nd' });
					})
					.then(async function (instance) {
						// sync 2 async
						return await instance.Async2Sync2nd({ sync: '2_is' });
					})
					.then(async function (instance) {
						return await instance.AsyncChain3rd({ async: '2_3rd' });
					});

				// debugger;
				syncWAsyncChained = await /* (await (await sure */
					new UserTypeConstructor({
						email: 'async@gmail.com',
						password: 32123
					})
						.WithoutPassword()
						.WithAdditionalSign('async sign')
						.AsyncChain1st({ async1st: '1st' })
						// after promise
						.AsyncChain2nd({ async2nd: '2nd' })
						.Async2Sync2nd({ sync: 'is' })
						.AsyncChain3rd({ async: '3rd' });

				// debugger;
				done();

				try {
					new WrongSyncType({
						email: 'wrong@gmail.com',
						password: 111
					});
				} catch (err) {
					wrongSyncTypeErr = err;
				}

				try {
					await new WrongAsyncType({
						email: 'wrong@gmail.com',
						password: 111
					});
				} catch (err) {
					wrongAsyncTypeErr = err;
				}

			})();

		});
		it('chain should work', () => {
			assert.deepEqual(etalon1, syncWAsync1.extract());
			assert.deepEqual(etalon2, syncWAsync2.extract());

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

			assert.deepEqual(etalon3, syncWAsyncChained.extract());
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
			const {
				__stack__
			} = syncWAsyncChained;
			expect(__stack__.indexOf(stackstart)).equal(1);
			stackTrack.forEach(line => {
				expect(__stack__.indexOf(line) > 0).is.true;
			});
			expect(__stack__.indexOf('test.async.chain.js:1') > 0).is.true;

		});

		it('SyncError.stack should have seekable definition', () => {
			const stackstart = '<-- creation of [ WrongSyncType ] traced -->';
			const {
				stack
			} = wrongSyncTypeErr;
			expect(stack.indexOf(stackstart)).equal(1);
			expect(stack.indexOf('test.async.chain.js:1') > 0).is.true;
			expect(wrongSyncTypeErr).instanceOf(Error);
			expect(wrongSyncTypeErr).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
			expect(wrongSyncTypeErr.message).exist.and.is.a('string');

			assert.equal(wrongSyncTypeErr.message, 'wrong modification pattern : should inherit from WrongSyncType but got UserType');
		});

		it('AsyncError.stack should have seekable definition', () => {
			const stackstart = '<-- creation of [ WrongAsyncType ] traced -->';
			const {
				stack
			} = wrongAsyncTypeErr;
			expect(stack.indexOf(stackstart)).equal(1);
			expect(stack.indexOf('test.async.chain.js:1') > 0).is.true;
			expect(wrongAsyncTypeErr).instanceOf(Error);
			expect(wrongAsyncTypeErr).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
			expect(wrongAsyncTypeErr.message).exist.and.is.a('string');

			assert.equal(wrongAsyncTypeErr.message, 'wrong modification pattern : should inherit from WrongAsyncType but got UserType');
		});

	});
	
	describe('async chain forced errors types check', () => {
		
		var sleepError = null;
		var sleepInstance = null;
		var otherSleepInstance = null;
		var anotherSleepInstance = null;
		var syncError = null;
		
		const sleep = (time) =>{
			return new Promise((resolve) => setTimeout(resolve, time));
		};
	
		const SleepType = define('SleepType', async function () {
			
			await sleep(100);
			this.slept = true;
			return this;
			
		});
		
		const AsyncErroredType = SleepType.define('AsyncErroredType', async function () {
			await sleep(100);
			const b = {};
			b.c.async = null; // TypeError
		}, {}, {
			forceErrors : true
		});
		
		const SyncErroredType = SleepType.define('SyncErroredType', function () {
			this.SyncErroredType = true;
			const b = {};
			b.c.sync = null; // TypeError
		}, {}, {
			forceErrors : true
		});
		
		before(function (done) {
			(async () => {
				
				sleepInstance = await new SleepType();
				
				try {
					await sleepInstance.AsyncErroredType();
				} catch (error) {
					sleepError = error;
				}
				
				otherSleepInstance = await new SleepType();
				
				anotherSleepInstance = await new SleepType();
				
				try {
					anotherSleepInstance.SyncErroredType();
				} catch (error) {
					syncError = error;
				}
				
				try {
					debugger;
					anotherSleepInstance.SyncErroredType();
				} catch (error) {
					syncError = error;
				}
				
				done();
				
			})();
		});
		
		it('shold have props', () => {
			expect(sleepInstance.slept).is.true;
			expect(sleepError.slept).is.true;
			expect(otherSleepInstance.slept).is.true;
		});
		
		it('sleepError shold be instanceof Error', () => {
			expect(sleepError).instanceOf(Error);
		});
		it('sleepError shold be instanceof TypeError', () => {
			expect(sleepError).instanceOf(TypeError);
		});
		it('sleepError shold be instanceof SleepType', () => {
			expect(sleepError).instanceOf(SleepType);
		});
		it('sleepError shold be instanceof AsyncErroredType', () => {
			expect(sleepError).instanceOf(AsyncErroredType);
		});
		
		it('sleepInstance shold be instanceof SleepType', () => {
			expect(sleepInstance).instanceOf(SleepType);
		});
		it('sleepInstance shold be instanceof Error', () => {
			expect(sleepInstance).instanceOf(Error);
		});
		it('sleepInstance shold be instanceof TypeError', () => {
			expect(sleepInstance).instanceOf(TypeError);
		});
		
		it('otherSleepInstance shold be instanceof SleepType', () => {
			expect(otherSleepInstance).instanceOf(SleepType);
		});
		it('otherSleepInstance sholdn\'t be instanceof Error', () => {
			expect(otherSleepInstance).not.instanceOf(Error);
		});
		it('otherSleepInstance sholdn\'t be instanceof TypeError', () => {
			expect(otherSleepInstance).not.instanceOf(TypeError);
		});
		
		it('anotherSleepInstance shold be instanceof SleepType', () => {
			const insof = anotherSleepInstance instanceof SleepType;
			expect(insof).is.true;
		});
		it('anotherSleepInstance shold be instanceof Error', () => {
			expect(anotherSleepInstance).instanceOf(Error);
		});
		it('anotherSleepInstance shold be instanceof TypeError', () => {
			expect(anotherSleepInstance).instanceOf(TypeError);
		});
		
		it('sleepInstance sholdn\'t be instanceof AsyncErroredType', () => {
			expect(sleepInstance).not.instanceOf(AsyncErroredType);
		});
		it('syncError shold be instanceof Error', () => {
			expect(syncError).instanceOf(Error);
		});
		it('syncError shold be instanceof TypeError', () => {
			expect(syncError).instanceOf(TypeError);
		});
		it('sleepInstance shold be instanceof SyncErroredType', () => {
			expect(syncError).instanceOf(SyncErroredType);
		});

		
	});

};

module.exports = test;
