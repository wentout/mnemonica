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
			assert.equal( 8, userTypeHooksInvocations.length );
			// +2
			assert.equal( 173, typesFlowCheckerInvocations.length );
			// +1
			assert.equal( 94, typesPreCreationInvocations.length );
			// there are two errors on creation
			// checked before
			// that is why, and with clones
			// +1
			assert.equal( 158, typesPostCreationInvocations.length );
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
		try {
			defaultTypes.registerFlowChecker( () => { } );
		} catch ( error ) {
			it( 'Thrown with Re-Definition', () => {
				expect( error ).instanceOf( Error );
				expect( error ).instanceOf( errors.FLOW_CHECKER_REDEFINITION );
			} );
		}
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
