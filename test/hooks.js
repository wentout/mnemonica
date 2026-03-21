'use strict';

const { assert, expect } = require( 'chai' );

const {
	defaultTypes,
	errors
} = require( '..' );

const tests = ( opts ) => {

	const {
		userTypeHooksInvocations,
		typesFlowCheckerInvocations,
		typesPreCreationInvocations,
		typesPostCreationInvocations,
	} = opts;


	describe( 'Hooks Tests', () => {
		it( 'check invocations count', () => {
			/*

			!!!

			here huge decrease may happen
			it would mean something is wrong with tests
			for example you used some global variable
			because of copy-pasting from tests
			so it is wiping or something like that

			*/


			assert.equal( 8, userTypeHooksInvocations.length );
			// +2 (increased due to strictChain check adding extra flow checks)
			// assert.equal( 188, typesFlowCheckerInvocations.length );
			// assert.equal( 90, typesFlowCheckerInvocations.length );

			assert.equal( 197, typesFlowCheckerInvocations.length );

			// +1
			assert.equal( 107, typesPreCreationInvocations.length );
			// there are two errors on creation
			// checked before
			// that is why, and with clones
			// +1
			assert.equal( 180, typesPostCreationInvocations.length );
		} );
	} );

	describe( 'check invocations of "this"', () => {
		userTypeHooksInvocations.forEach( entry => {
			const {
				self,
				opts: {
					type
				},
				sort,
				kind,
			} = entry;
			it( `'this' for ${kind}-hook of ${sort} should refer to type ${type.TypeName}`, () => {
				assert.equal( self, type );
			} );
		} );
		typesPreCreationInvocations.forEach( entry => {
			const {
				self,
				sort,
				kind,
			} = entry;
			it( `'this' for ${kind}-hook of ${sort} should refer to type defaultTypes`, () => {
				assert.equal( self, defaultTypes );
			} );
		} );
		typesPostCreationInvocations.forEach( entry => {
			const {
				self,
				sort,
				kind,
			} = entry;
			it( `'this' for ${kind}-hook of ${sort} should refer to type defaultTypes`, () => {
				assert.equal( self, defaultTypes );
			} );
		} );
	} );

	describe( 'hooks environment', () => {
		try {
			defaultTypes.registerFlowChecker();
		} catch ( error ) {
			it( 'Thrown with Missing Callback', () => {
				expect( error ).instanceOf( Error );
				expect( error ).instanceOf( errors.MISSING_CALLBACK_ARGUMENT );
			} );
		}
		// try {
		// 	defaultTypes.registerFlowChecker( () => { } );
		// } catch ( error ) {
		// 	it( 'Thrown with Re-Definition', () => {
		// 		expect( error ).instanceOf( Error );
		// 		expect( error ).instanceOf( errors.FLOW_CHECKER_REDEFINITION );
		// 	} );
		// }
		try {
			defaultTypes.registerHook( 'WrongHookType', () => { } );
		} catch ( error ) {
			it( 'Thrown with Re-Definition', () => {
				expect( error ).instanceOf( Error );
				expect( error ).instanceOf( errors.WRONG_HOOK_TYPE );
			} );
		}
		try {
			defaultTypes.registerHook( 'postCreation' );
		} catch ( error ) {
			it( 'Thrown with Re-Definition', () => {
				expect( error ).instanceOf( Error );
				expect( error ).instanceOf( errors.MISSING_HOOK_CALLBACK );
			} );
		}
	} );

};

module.exports = tests;
