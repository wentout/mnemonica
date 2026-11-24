'use strict';

const { assert, expect } = require( 'chai' );

const {
	defaultTypes,
	errors,
	createTypesCollection,
	registerHook,
	unregisterHook
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


			// +12 (lazy handler-shape pins: six fresh UserType constructions —
			//      a failed subtype construction splices the error at the top
			//      of the ROOT instance's chain, poisoning everything under
			//      that root, so each pin needs a disposable root)
			assert.equal( 20, userTypeHooksInvocations.length );
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
			// +22 (environment.js 'named constructor define' tests now run in
			//     place: its async describe used to register them after load,
			//     past this count)
			// +14 (lazy handler-shape pins: six fresh parent constructions
			//     plus the now-successful first LazyLatePin construction —
			//     the rejected forms moved from define time to construction)
			// -2 (the detached overMore.EvenMore.call(undefined) fixture is
			//     gone: that form now throws before any construction)
			assert.equal( 310, typesFlowCheckerInvocations.length );

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
			// +11 (environment.js 'named constructor define' tests now run
			//     in place, before this count)
			// +7 (lazy handler-shape pins: six fresh parents + the successful
			//     first LazyLatePin construction)
			// -1 (the detached .call(undefined) fixture now throws before
			//     any construction)
			assert.equal( 166, typesPreCreationInvocations.length );
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
			// +22 (environment.js 'named constructor define' tests now run
			//     in place, before this count)
			// +14 (lazy handler-shape pins: six fresh parents + the
			//     now-successful first LazyLatePin construction + the
			//     failing constructions' levels)
			// -2 (the detached .call(undefined) fixture's levels: that form
			//     now throws before any construction)
			assert.equal( 288, typesPostCreationInvocations.length );
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

	// every type lives in its own collection: the counters above count
	// defaultTypes only
	describe( 'unregisterHook, on / off and the short hook names', () => {

		const makeType = () => {
			const collection = createTypesCollection();
			const Type = collection.define( 'HookOffType', function () {} );
			const result = { collection, Type };
			return result;
		};

		it( 'removes exactly the given callback', () => {
			const { Type } = makeType();
			const calls = [];
			const first = () => { calls.push( 'first' ); };
			const second = () => { calls.push( 'second' ); };
			Type.registerHook( 'preCreation', first );
			Type.registerHook( 'preCreation', second );
			expect( Type.unregisterHook( 'preCreation', first ) ).to.equal( true );
			new Type();
			expect( calls ).to.deep.equal( [ 'second' ] );
		} );

		it( 'returns false for an unknown callback or an empty hook type', () => {
			const { Type } = makeType();
			const cb = () => {};
			expect( Type.unregisterHook( 'preCreation', cb ) ).to.equal( false );
			Type.registerHook( 'preCreation', cb );
			expect( Type.unregisterHook( 'preCreation', () => {} ) ).to.equal( false );
			expect( Type.unregisterHook( 'postCreation', cb ) ).to.equal( false );
			expect( Type.unregisterHook( 'preCreation', cb ) ).to.equal( true );
			expect( Type.unregisterHook( 'preCreation', cb ) ).to.equal( false );
		} );

		it( 'validates its arguments as registerHook does', () => {
			const { Type } = makeType();
			expect( () => Type.unregisterHook( 'WrongHookType', () => {} ) ).to.throw( errors.WRONG_HOOK_TYPE );
			expect( () => Type.unregisterHook( 'constructor', () => {} ) ).to.throw( errors.WRONG_HOOK_TYPE );
			expect( () => Type.unregisterHook( 'preCreation' ) ).to.throw( errors.MISSING_HOOK_CALLBACK );
		} );

		it( 'on / off take the short names, for types, collections and the free form', () => {
			const { collection, Type } = makeType();
			const calls = [];
			const typePre = () => { calls.push( 'type pre' ); };
			const typePost = () => { calls.push( 'type post' ); };
			const collectionPre = () => { calls.push( 'collection pre' ); };
			const freePost = () => { calls.push( 'free post' ); };
			Type.on( 'pre', typePre );
			Type.on( 'postCreation', typePost );
			collection.on( 'pre', collectionPre );
			registerHook( Type, 'post', freePost );
			new Type();
			expect( calls ).to.deep.equal( [ 'collection pre', 'type pre', 'type post', 'free post' ] );
			calls.length = 0;
			expect( Type.off( 'preCreation', typePre ) ).to.equal( true );
			expect( Type.off( 'post', typePost ) ).to.equal( true );
			expect( collection.off( 'pre', collectionPre ) ).to.equal( true );
			expect( unregisterHook( Type, 'post', freePost ) ).to.equal( true );
			new Type();
			expect( calls ).to.deep.equal( [] );
		} );

		it( 'the short error name is creationError', () => {
			const { Type } = makeType();
			const BadType = Type.define( 'HookOffBadType', function () {
				throw new Error( 'bad' );
			} );
			const caught = [];
			const onError = ( hookData ) => {
				caught.push( hookData.inheritedInstance );
				return true;
			};
			BadType.on( 'error', onError );
			const parent = new Type();
			const errored = new parent.HookOffBadType();
			expect( errored ).instanceOf( Error );
			expect( caught.length ).to.equal( 1 );
			expect( BadType.off( 'creationError', onError ) ).to.equal( true );
			expect( () => new ( new Type() ).HookOffBadType() ).to.throw();
			expect( caught.length ).to.equal( 1 );
		} );

		it( 'the flow checker stops with the last callback', () => {
			const { collection, Type } = makeType();
			const checks = [];
			collection.registerFlowChecker( ( hookData ) => { checks.push( hookData.hookType ); } );
			const cb = () => {};
			collection.on( 'pre', cb );
			new Type();
			expect( checks ).to.deep.equal( [ 'preCreation' ] );
			collection.off( 'pre', cb );
			new Type();
			expect( checks ).to.deep.equal( [ 'preCreation' ] );
		} );

		it( 'a callback may remove itself while running', () => {
			const { Type } = makeType();
			const calls = [];
			const once = () => {
				calls.push( 'once' );
				Type.off( 'pre', once );
			};
			Type.on( 'pre', once );
			Type.on( 'pre', () => { calls.push( 'always' ); } );
			new Type();
			new Type();
			expect( calls ).to.deep.equal( [ 'once', 'always', 'always' ] );
		} );

	} );

};

module.exports = tests;
