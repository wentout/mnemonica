'use strict';

// Generators CONSUMING constructions (off test:cov, own script —
// "npm run test:yields"). Generator/async-generator HANDLERS are a
// different matter: rejected at define time with the readable shape
// error (pinned in test_async/ and the main environment suites). These
// pins cover the consumer side, observed 2026-09-27:
//   - yield new X() yields the INSTANCE
//   - yield await new AsyncX() yields the resolved instance
//   - yield new AsyncX() UN-AWAITED inside an async generator still
//     yields the RESOLVED instance — the async generator spec AWAITS
//     yielded promises (AsyncGeneratorYield performs Await), so
//     mnemonica construction promises dissolve transparently

const { assert, expect } = require('chai');

const {
	define,
} = require('..');

const YieldsSyncType = define('YieldsSyncType', function () {
	this.sync = true;
});

const YieldsAsyncType = define('YieldsAsyncType', async function () {
	this.async = true;
	return this;
});

describe('generators consuming constructions', () => {

	describe('sync generator yielding new X()', () => {

		it('the yielded value is the instance, passing it back works', () => {
			function* gen () {
				const incoming = yield new YieldsSyncType();
				return incoming;
			}
			const g = gen();
			const first = g.next();
			expect( first.done ).equal( false );
			expect( first.value ).instanceOf( YieldsSyncType );
			const second = g.next( first.value );
			expect( second.done ).equal( true );
			expect( second.value ).instanceOf( YieldsSyncType );
		} );

		it('spread collects instances', () => {
			function* genLoop () {
				for ( let i = 0; i < 2; i++ ) {
					yield new YieldsSyncType();
				}
			}
			const instances = [ ...genLoop() ];
			expect( instances.length ).equal( 2 );
			expect( instances.every( ( x ) => x instanceof YieldsSyncType ) ).equal( true );
		} );

	} );

	describe('async generator yielding await new AsyncX()', () => {

		it('the yielded value is the resolved instance', async () => {
			async function* asyncGen () {
				const incoming = yield await new YieldsAsyncType();
				return incoming;
			}
			const ag = asyncGen();
			const first = await ag.next();
			expect( first.done ).equal( false );
			expect( first.value ).instanceOf( YieldsAsyncType );
			const second = await ag.next( first.value );
			expect( second.done ).equal( true );
		} );

		it('for-await collects resolved instances', async () => {
			async function* asyncGenLoop () {
				for ( let i = 0; i < 2; i++ ) {
					yield await new YieldsAsyncType();
				}
			}
			const collected = [];
			for await ( const inst of asyncGenLoop() ) {
				collected.push( inst );
			}
			expect( collected.length ).equal( 2 );
			expect( collected.every( ( x ) => x instanceof YieldsAsyncType ) ).equal( true );
		} );

	} );

	describe('async generator yielding UN-AWAITED new AsyncX()', () => {

		it('the consumer receives the resolved instance, not a Promise', async () => {
			async function* asyncGenNoAwait () {
				yield new YieldsAsyncType();
			}
			const ag = asyncGenNoAwait();
			const first = await ag.next();
			// the async generator spec AWAITS yielded promises — the
			// construction promise dissolves transparently
			assert.strictEqual( typeof first.value.then, 'undefined' );
			expect( first.value ).instanceOf( YieldsAsyncType );
		} );

	} );

} );
