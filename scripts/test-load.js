'use strict';

// Load-time throw finder (npm run test:load).
//
// When test/index.js throws while mocha loads it (a fixture built in a
// describe() body), mocha loads the file a second time — and the second
// load fails first on the types the first load already defined, so the
// report shows ALREADY_DECLARED instead of the real error.
//
// This runs every describe() body eagerly, skips every it() and hook body,
// and prints the FIRST describe-time throw with its stack. Run it after a
// build (test:cov builds) whenever mocha reports ALREADY_DECLARED.

const path = require( 'path' );

const noop = () => {};

const describe = ( _name, fn ) => {
	fn();
};
describe.skip = noop;
describe.only = describe;

const it = noop;
it.skip = noop;
it.only = noop;

Object.assign( global, {
	describe,
	it,
	test       : it,
	before     : noop,
	after      : noop,
	beforeEach : noop,
	afterEach  : noop,
} );

const entry = path.join( __dirname, '..', 'test', 'index.js' );

try {
	require( entry );
	console.log( 'test/index.js loaded without a describe-time throw' );
} catch ( error ) {
	console.error( 'FIRST describe-time throw:' );
	console.error( error && error.stack ? error.stack : error );
	process.exitCode = 1;
}
