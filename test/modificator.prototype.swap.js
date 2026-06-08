'use strict';

// Guards the prototype-swap in
//   src/api/types/compileNewModificatorFunctionBody.ts  (getFunctionConstructor)
//
//     const _proto = ConstructHandler.prototype;
//     ConstructHandler.prototype = this.constructor.prototype;   // <-- line 96
//     answer = new ConstructHandler( ...args );
//     ConstructHandler.prototype = _proto;                       // <-- line 98 (restore)
//
// Coverage proves those lines RUN; it does not prove the contract:
//   (a) the user constructor's instance is grafted onto the mnemonica lineage
//       (this.constructor.prototype), and
//   (b) the user constructor function's own prototype is restored intact
//       (the "!!! it MUST be strict replacement !!!" comment).
// This suite asserts both behaviourally.

const { assert, expect } = require( 'chai' );

const mnemonica = require( '..' );
const {
	createTypesCollection,
	getProps
} = mnemonica;

// Isolated collection: defaultTypes carries the suite's global flow-checker /
// hook counters (see test/index.js + test/hooks.js). Defining test types there
// would perturb those exact-count assertions. line 96 lives in the per-type
// modificator compilation, so an isolated collection exercises it identically.
const collection = createTypesCollection();

const gof = Object.getPrototypeOf;

const inPrototypeChain = ( obj, target ) => {
	let p = gof( obj );
	while ( p ) {
		if ( p === target ) {
			return true;
		}
		p = gof( p );
	}
	return false;
};

const ownKeysBesidesConstructor = ( fn ) =>
	Object.getOwnPropertyNames( fn.prototype ).filter( ( k ) => k !== 'constructor' );

const tests = () => {

	describe( 'modificator prototype swap (compileNewModificatorFunctionBody line 96)', () => {

		describe( 'grafts the user constructor onto the mnemonica lineage', () => {

			function ParentCtor ( d ) { this.p = d; }
			function ChildCtor ( d ) { this.c = d; }

			const Parent = collection.define( 'PSwap_Parent', ParentCtor );
			const parent = new Parent( 'pa' );
			const Child = Parent.define( 'PSwap_Child', ChildCtor );
			const child = new parent.PSwap_Child( 'ca' );

			it( 'inherits the parent instance props through the chain', () => {
				// child.p is only resolvable if the swap grafted child onto `parent`
				assert.equal( child.p, 'pa' );
				assert.equal( child.c, 'ca' );
			} );

			it( 'records the parent instance as __parent__', () => {
				assert.equal( getProps( child ).__parent__, parent );
			} );

			it( 'places the parent instance in the child prototype chain', () => {
				assert.isTrue( inPrototypeChain( child, parent ) );
			} );

			it( 'keeps instanceof correct up the lineage', () => {
				expect( child ).instanceof( Child );
				expect( child ).instanceof( Parent );
			} );

		} );

		describe( 'restores the user constructor prototype (strict replacement, line 98)', () => {

			function UserCtor ( d ) { this.u = d; }
			const protoRef = UserCtor.prototype;

			const T = collection.define( 'PSwap_Restore', UserCtor );
			const inst = new T( 'x' );

			it( 'preserves the user prototype object identity', () => {
				assert.equal( UserCtor.prototype, protoRef );
			} );

			it( 'does not pollute the user prototype with lineage props', () => {
				assert.deepEqual( ownKeysBesidesConstructor( UserCtor ), [] );
			} );

			it( 'leaves the user function usable standalone (swap fully reverted)', () => {
				const plain = new UserCtor( 'y' );
				assert.equal( gof( plain ), UserCtor.prototype );
				assert.equal( plain.u, 'y' );
			} );

			it( 'still produced a correct mnemonica instance', () => {
				assert.equal( inst.u, 'x' );
				expect( inst ).instanceof( T );
			} );

		} );

		describe( 'reuses one user constructor across distinct types without bleed', () => {

			function Shared ( d ) { this.s = d; }
			const protoRef = Shared.prototype;

			const T1 = collection.define( 'PSwap_Shared1', Shared );
			const T2 = collection.define( 'PSwap_Shared2', Shared );
			const a = new T1( 'a' );
			const b = new T2( 'b' );

			it( 'keeps the shared prototype pristine after both constructions', () => {
				assert.equal( Shared.prototype, protoRef );
				assert.deepEqual( ownKeysBesidesConstructor( Shared ), [] );
			} );

			it( 'isolates instances to their own types', () => {
				expect( a ).instanceof( T1 );
				expect( b ).instanceof( T2 );
				assert.isFalse( a instanceof T2 );
				assert.isFalse( b instanceof T1 );
			} );

		} );

	} );

};

module.exports = tests;
