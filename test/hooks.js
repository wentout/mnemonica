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

			// +24 (increased due to dotted parent() tests adding types and instances)
			// assert.equal( 215, typesFlowCheckerInvocations.length );
			// +2 (subtype lookup caching test types)
			// +6 (hott-laws.js witness types defined at load)
			// +2 (async-null resolution tests adding types)
			// +16 (async-class main-suite equivalents: 8 types)
			// +3 (inst.Sub.call(other) adopting parent instance construction)
			// +2 (re-defined C0ArrowProbe after its rejected arrow define)
			// +2 (strictChain sentinel-path pin types in parse.js)
			// +4 (define-paths pin types in environment.js)
			assert.equal( 276, typesFlowCheckerInvocations.length );

			// +3 (increased due to explicit .lazy() API adding extra creations)
			// +12 (increased due to dotted parent() tests adding instances)
			// +1 (subtype lookup caching test instances)
			// +3 (hott-laws.js root/mid/leaf constructed at load)
			// +2 (async-null resolution tests adding instances)
			// +10 (async-class main-suite equivalents: instances)
			// +1 (inst.Sub.call(other) adopting parent instance)
			// +1 (re-defined C0ArrowProbe instance)
			// +1 (strictChain sentinel-path pin: the refused construction
			//     still fires preCreation before the check throws)
			// +2 (define-paths pins: two fresh constructions)
			assert.equal( 149, typesPreCreationInvocations.length );
			// there are two errors on creation
			// checked before
			// that is why, and with clones
			// +6 (increased due to explicit .lazy() API adding extra creations)
			// +24 (increased due to dotted parent() tests adding instances)
			// +2 (subtype lookup caching test instances)
			// +6 (hott-laws.js root/mid/leaf constructed at load, chain levels fire per level)
			// +12 (async-class main-suite equivalents: instances, per level)
			// +4 (inst.Sub.call(other) adopting parent + child levels)
			// +2 (re-defined C0ArrowProbe type + instance levels)
			// +2 (new pin types' levels in parse.js/utils.js: the
			//     strictChain sentinel-path pin and the toJSON pins)
			// +4 (define-paths pins: fresh construction levels)
			assert.equal( 254, typesPostCreationInvocations.length );
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
