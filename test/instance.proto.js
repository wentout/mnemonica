'use strict';

const mnemonica = require( '..' );

const {
	lookup
} = mnemonica;

// _lookup is internal: reach it through the build tree, not the package
const { lookup: _lookup } = require( '../build/api/types' );

const gof = Object.getPrototypeOf;

const { assert, expect } = require( 'chai' );

const {
	getProps,
	errors
} = require( '..' );

const tests = ( opts ) => {

	const {
		user,
		userPL1,
		userTC,
		userTCForkCall,
		userTCForkApply,
		userTCForkBind,
		utcfcwp,
		FORK_CALL_DATA,
		UserType,
		evenMore,
		USER_DATA,
		overMore,
		moreOver,
		UserTypeConstructor,
		OverMore,
		EvenMoreProto,
		evenMoreArgs,
		strFork,
		strForkOfFork,
		overMoreFork,
		evenMoreFork,
		evenMoreForkFork,
		evenMoreForkCall,
		overMoreCallEvenMoreNull,
		overMoreCallEvenMoreNumber,
		overMoreCallEvenMoreString,
		overMoreCallEvenMoreBoolean,
		overMoreCallEvenMoreProcess,
		userTCdirectDAG,
		userTCforkDAG,
	} = opts;

	describe( 'instance .proto props tests', () => {

		it( 'should have proper prototype .__args__', () => {
			assert.equal( getProps(user).__args__[ 0 ], USER_DATA );
		} );
		it( 'should have proper prototype .__type__', () => {
			// undefined !
			assert.equal( getProps(user).__type__.TypeProxy, UserType.__type__ );
			assert.equal( getProps(user).__type__.TypeName, UserType.TypeName );
		} );
		it( 'should have proper prototype .__collection__', () => {
			assert.equal( getProps(user).__collection__, UserType.collection );
		} );
		it( 'should have proper prototype .__subtypes__', () => {
			assert.equal( getProps(user).__subtypes__, UserType.subtypes );
		} );
		it( 'should have proper prototype .__parent__', () => {
			assert.equal( getProps(evenMore).__parent__, overMore );
			assert.notEqual( getProps(evenMore).__parent__, moreOver );
		} );
		it( 'should have proper prototype .__timestamp__', () => {
			assert.exists( getProps(evenMore).__timestamp__ );
		} );

		it( 'should have proper first .clone old style', () => {

			const userClone = user.clone;

			assert.notEqual(
				gof( gof( user ) ),
				gof( gof( userClone ) )
			);

			assert.notEqual( user, userClone );
			assert.deepInclude( user, userClone );
			assert.deepInclude( userClone, user );
			assert.deepEqual( userClone, user );

		} );


		it( 'should have proper first .fork() old style', () => {

			const forkData = {
				email    : 'went.out@gmail.com',
				password : 'fork old style password'
			};
			const userArgs = getProps(user).__args__;

			const userFork = user.fork( forkData );

			const userPP = gof( gof( user ) );
			const userForkPP = gof( gof( userFork ) );

			assert.notEqual( userPP, userForkPP );

			assert.notEqual( user, userFork );
			assert.deepEqual( userArgs[ 0 ], USER_DATA );
			assert.deepEqual( new UserType( forkData ), userFork );
			assert.notDeepEqual( userArgs, getProps(userFork).__args__ );
			expect( userFork ).instanceof( UserType );
			assert.deepEqual( Object.keys( userFork ), Object.keys( user ) );

		} );

		it( 'should have proper first .fork() regular style', () => {

			const forkData = {
				email    : 'went.out@gmail.com',
				password : 'fork regular style password'
			};
			const userTCArgs = getProps(userTC).__args__;
			const userTCFork = userTC.fork( forkData );

			const userTCPP = gof( gof( userTC ) );
			const userTCForkPP = gof( gof( userTCFork ) );
			assert.notEqual( userTCPP, userTCForkPP );

			assert.notEqual( userTC, userTCFork );
			assert.deepEqual( userTCArgs[ 0 ], USER_DATA );
			const naiveFork = new UserTypeConstructor( forkData );
			assert.deepOwnInclude( naiveFork, userTCFork );
			assert.notDeepEqual( userTCArgs, getProps(userTCFork).__args__ );
			expect( userTCFork ).instanceof( UserTypeConstructor );
			assert.deepEqual( Object.keys( userTCFork ), Object.keys( userTC ) );

		} );

		it( 'should have seekable __stack__', () => {
			const stackstart = '<-- creation of [ UserTypePL1 ] traced -->';
			const {
				__stack__
			} = getProps(userPL1);
			// debugger;
			expect( __stack__.indexOf( stackstart ) ).equal( 1 );
		} );

		it( 'should have proper nested .fork() old style', () => {

			const userPL1Fork = userPL1.fork();

			const userPL1PP = gof( gof( userPL1 ) );
			const userPL1ForkPP = gof( gof( userPL1Fork ) );

			assert.equal( userPL1ForkPP.UserTypePL1.toString(), userPL1PP.UserTypePL1.toString() );
			assert.equal( userPL1ForkPP.UserTypePL2.toString(), userPL1PP.UserTypePL2.toString() );
			assert.deepInclude( userPL1ForkPP.UserTypePL1, userPL1PP.UserTypePL1 );
			assert.deepInclude( userPL1PP.UserTypePL1, userPL1ForkPP.UserTypePL1 );
			assert.deepInclude( userPL1ForkPP.UserTypePL2, userPL1PP.UserTypePL2 );
			assert.deepInclude( userPL1PP.UserTypePL2, userPL1ForkPP.UserTypePL2 );

			assert.notEqual( userPL1PP, userPL1ForkPP );
			assert.notEqual( userPL1, userPL1Fork );
			assert.deepInclude( userPL1, userPL1Fork );
			assert.deepInclude( userPL1Fork, userPL1 );
			assert.deepEqual( userPL1Fork.extract(), userPL1.extract() );

		} );

		it( 'should have proper nested .clone regular style', () => {

			const evenMoreClone = evenMore.clone;
			assert.deepEqual(
				gof( gof( evenMore ) ),
				gof( gof( evenMoreClone ) )
			);
			assert.notEqual( evenMore, evenMoreClone );
			assert.deepInclude( evenMore, evenMoreClone );
			assert.deepInclude( evenMoreClone, evenMore );
			assert.deepEqual( evenMoreClone.extract(), evenMore.extract() );

		} );

		it( 'should not mutate()', () => {
			assert.notEqual( getProps(evenMore).__proto_proto__, EvenMoreProto );
		} );

		it( 'should have proper nested .fork()', () => {
			assert.notEqual( getProps(overMore).__proto_proto__, getProps(overMoreFork).__proto_proto__ );

			assert.notEqual( getProps(evenMore).__proto_proto__, getProps(evenMoreFork).__proto_proto__ );
			// millisecond timestamps: a fast runner creates both in the same ms,
			// so a fork is only guaranteed to be no older than its original
			assert.isAtLeast( getProps(evenMoreFork).__timestamp__, getProps(evenMore).__timestamp__ );

			assert.notEqual( evenMore, evenMoreFork );
			assert.notEqual( evenMoreForkFork, evenMoreFork );

			const evenMorePP = gof( gof( evenMore ) );
			const evenMoreForkPP = gof( gof( evenMoreFork ) );

			assert.notEqual( evenMorePP, evenMoreForkPP );
			assert.equal( evenMoreFork.str, strFork );
			assert.equal( evenMoreForkFork.str, strForkOfFork );

			// debugger;

			assert.deepEqual( getProps(evenMore).__args__, evenMoreArgs );
			assert.notDeepEqual( getProps(evenMore).__args__, getProps(evenMoreFork).__args__ );

			const nativeFork = new overMore.EvenMore( strFork );

			assert.notEqual( nativeFork, evenMoreFork );
			assert.deepInclude( nativeFork, evenMoreFork );
			assert.deepInclude( evenMoreFork, nativeFork );
			assert.notEqual( getProps(overMore).__args__, getProps(evenMore).__args__ );
			const lookedUp = OverMore.lookup( 'EvenMore' );
			expect( evenMoreFork ).instanceof( lookedUp );

			// root fallback: absolute registry paths resolve from any constructor
			const lookedUpAbsolute = OverMore.lookup( 'UserTypeConstructor.WithoutPassword.WithAdditionalSign.MoreOver.OverMore.EvenMore' );
			expect( evenMoreFork ).instanceof( lookedUpAbsolute );
			assert.equal( lookedUpAbsolute, lookedUp );

			const lookedUpRoot = OverMore.lookup( 'UserTypeConstructor' );
			assert.equal( lookedUpRoot, UserTypeConstructor );

			const lookedUpMissing = OverMore.lookup( 'UserTypeConstructor.NoSuchType' );
			assert.equal( lookedUpMissing, undefined );

			// explicit-source form: lookup(source, path) resolves the same as the method
			const lookedUpTwoArg = lookup( OverMore, 'EvenMore' );
			assert.equal( lookedUpTwoArg, lookedUp );
			const lookedUpTwoArgMissing = lookup( OverMore, 'NoSuchType' );
			assert.equal( lookedUpTwoArgMissing, undefined );

			assert.deepEqual( Object.keys( evenMore ), Object.keys( evenMoreFork ) );
			
		} );

		it( 'api/types lookup() should cover the undefined type case', () => {
			// Create a mock subtypes map that returns undefined for the first lookup
			const mockSubtypes = new Map();
			// Test lookup with non-existent nested path - should return undefined
			const result = _lookup.call(mockSubtypes, 'NonExistent.Nested.Type');
			expect(result).equal(undefined);
		} );

		it( 'define(source, name, handler) registers like the method form', () => {
			const coll = mnemonica.createTypesCollection();
			const Root = mnemonica.define( coll, 'TwoArgRoot', function ( data ) { this.val = data.val; } );
			const rootInstance = new Root( { val : 42 } );
			assert.equal( rootInstance.val, 42 );
			const Sub = mnemonica.define( Root, 'TwoArgSub', function () { this.extra = 'x'; } );
			const subInstance = new rootInstance.TwoArgSub();
			assert.equal( subInstance.val, 42 );
			assert.equal( subInstance.extra, 'x' );
			assert.instanceOf( subInstance, Root );
			assert.instanceOf( subInstance, Sub );
		} );

		it( 'lookup coverage should work with custom this context', () => {
			// Create a mock types collection with lookup method
			const mockTypes = {
				lookup : () => undefined
			};
			// Test lookup with custom this context
			const result = lookup.call(mockTypes, 'NonExistent.Nested.Type');
			expect(result).equal(undefined);
		} );

		it( 'lookup should work when called with mnemonica as this', () => {
			// Test lookup when this === mnemonica (checkThis branch)
			const result = lookup.call(mnemonica, 'NonExistent.Type');
			expect(result).equal(undefined);
		} );

		describe( 'subtype detached from its instance needs new', () => {
			it( 'const { Sub } = instance; Sub() throws WRONG_INSTANCE_INVOCATION', () => {
				const { EvenMore } = overMore;
				expect( () => EvenMore() ).to.throw( errors.WRONG_INSTANCE_INVOCATION );
			} );
			it( 'instance.ConstructorName.call(undefined) throws WRONG_INSTANCE_INVOCATION', () => {
				expect( () => overMore.EvenMore.call( undefined ) ).to.throw( errors.WRONG_INSTANCE_INVOCATION );
			} );
			it( 'const { Sub } = instance; new Sub() builds over that instance', () => {
				const { EvenMore } = overMore;
				const detached = new EvenMore();
				expect( detached ).instanceof( overMore.EvenMore );
				expect( detached ).instanceof( evenMore );
				expect( detached.str ).equal( 're-defined EvenMore str' );
				expect( getProps( detached ).__parent__ ).equal( overMore );
			} );
			it( 'chains without new in the middle still work', () => {
				const DetachRoot = mnemonica.define( 'DetachRoot', function () {
					this.r = 1;
				} );
				const DetachSub = DetachRoot.define( 'DetachSub', function () {
					this.s = 2;
				} );
				DetachSub.define( 'DetachSubSub', function () {
					this.ss = 3;
				} );
				const chained = new DetachRoot()
					.DetachSub()
					.DetachSubSub();
				expect( chained ).instanceof( DetachSub );
				expect( [ chained.r, chained.s, chained.ss ] ).deep.equal( [ 1, 2, 3 ] );
				const root = new DetachRoot();
				const viaMember = root.DetachSub();
				expect( getProps( viaMember ).__parent__ ).equal( root );
			} );
		} );

		it( 'instance.ConstructorName.call(otherParent) builds over that parent — the DAG form', () => {
			const dagInstance = overMore.EvenMore.call( overMoreFork );
			expect( dagInstance ).instanceof( overMore.EvenMore );
			expect( dagInstance ).instanceof( evenMore );
			expect( getProps( dagInstance ).__parent__ ).equal( overMoreFork );
		} );

		it( 'instance.ConstructorName.call(primitive) throws WRONG_MODIFICATION_PATTERN — a primitive is not boxed', () => {
			expect( () => overMore.EvenMore.call( 5 ) ).to.throw( errors.WRONG_MODIFICATION_PATTERN, 'got number' );
			expect( () => overMore.EvenMore.call( 'str' ) ).to.throw( errors.WRONG_MODIFICATION_PATTERN, 'got string' );
			expect( () => overMore.EvenMore.call( true ) ).to.throw( errors.WRONG_MODIFICATION_PATTERN, 'got boolean' );
		} );

		describe( 'a failed construction over a parent outside mnemonica', () => {
			const catchThrown = ( construct ) => {
				let thrown;
				try {
					construct();
				} catch ( error ) {
					thrown = error;
				}
				return thrown;
			};
			it( 'strictChain over a wrapper: a real Error naming the parent, with its creation history', () => {
				const WrapperRoot = mnemonica.define( 'WrapperParentRoot', function () {
					this.r = 1;
				} );
				const WrapperSub = WrapperRoot.define( 'WrapperParentSub', function () {
					this.s = 2;
				} );
				const root = new WrapperRoot();
				const wrapper = new Number( 5 );
				const thrown = catchThrown( () => root.WrapperParentSub.call( wrapper ) );
				expect( thrown ).instanceof( Error );
				expect( thrown ).instanceof( errors.WRONG_MODIFICATION_PATTERN );
				expect( thrown ).instanceof( WrapperSub );
				expect( thrown.message ).equal(
					'wrong modification pattern : should inherit from WrapperParentRoot but made on Number'
				);
				const props = getProps( thrown );
				expect( props.__parent__ ).equal( wrapper );
				expect( props.exceptionReason ).instanceof( errors.WRONG_MODIFICATION_PATTERN );
				expect( props.originalError ).equal( props.exceptionReason );
				expect( props.reasons ).deep.equal( [ props.exceptionReason ] );
				expect( props.surplus ).deep.equal( [] );
				expect( props.instance ).equal( thrown );
			} );
			it( 'a function handler copy keeps getters as getters and skips non-enumerable members', () => {
				let getterCalls = 0;
				const handler = function () {};
				Object.defineProperty( handler.prototype, 'enumerableGetter', {
					get () {
						getterCalls++;
						return 'from getter';
					},
					enumerable : true
				} );
				Object.defineProperty( handler.prototype, 'hiddenMember', {
					value      : 'hidden',
					enumerable : false
				} );
				const CopyRoot = mnemonica.define( 'CopyRootPin', function () {} );
				CopyRoot.define( 'CopySubPin', handler );
				const sub = new ( new CopyRoot() ).CopySubPin();
				expect( getterCalls ).equal( 0 );
				expect( sub.enumerableGetter ).equal( 'from getter' );
				expect( getterCalls ).equal( 1 );
				expect( sub.hiddenMember ).equal( undefined );
			} );
			it( 'the outside parent and the built-ins stay untouched', () => {
				const WrapperRoot = lookup( 'WrapperParentRoot' );
				const root = new WrapperRoot();
				const wrapper = new Number( 5 );
				catchThrown( () => root.WrapperParentSub.call( wrapper ) );
				expect( gof( wrapper ) ).equal( Number.prototype );
				expect( gof( Number.prototype ) ).equal( Object.prototype );
				expect( gof( Object.prototype ) ).equal( null );
			} );
			it( 'strictChain false: a throwing constructor over a wrapper or a plain object', () => {
				const LooseRoot = mnemonica.define( 'LooseParentRoot', function () {} );
				const LooseSub = LooseRoot.define( 'LooseParentSub', function () {
					throw new RangeError( 'constructor failed' );
				}, {
					strictChain : false
				} );
				const root = new LooseRoot();
				[ new Number( 5 ), { plain : true } ].forEach( ( outsideParent ) => {
					const protoBefore = gof( outsideParent );
					const thrown = catchThrown( () => root.LooseParentSub.call( outsideParent ) );
					expect( thrown ).instanceof( RangeError );
					expect( thrown ).instanceof( LooseSub );
					expect( thrown.message ).equal( 'constructor failed' );
					expect( getProps( thrown ).__parent__ ).equal( outsideParent );
					expect( gof( outsideParent ) ).equal( protoBefore );
				} );
			} );
			it( 'a deeper failure keeps the levels mnemonica built over the outside parent', () => {
				const DeepRoot = mnemonica.define( 'DeepParentRoot', function () {} );
				const DeepMid = DeepRoot.define( 'DeepParentMid', function () {
					this.mid = 1;
				}, {
					strictChain : false
				} );
				const DeepLeaf = DeepMid.define( 'DeepParentLeaf', function () {
					throw new RangeError( 'leaf failed' );
				} );
				const wrapper = new Number( 5 );
				const root = new DeepRoot();
				const mid = root.DeepParentMid.call( wrapper );
				// a chain over an outside parent has no root Proxy, so no subtype
				// lookup on it: the leaf is taken from a regular instance
				const regularMid = new root.DeepParentMid();
				const thrown = catchThrown( () => regularMid.DeepParentLeaf.call( mid ) );
				expect( thrown ).instanceof( RangeError );
				expect( thrown ).instanceof( DeepLeaf );
				expect( thrown ).instanceof( DeepMid );
				expect( thrown.mid ).equal( 1 );
				expect( getProps( thrown ).__parent__ ).equal( mid );
				expect( gof( wrapper ) ).equal( Number.prototype );
			} );
		} );

		it( 'instance.ConstructorName.call(null) should work', () => {
			expect( overMoreCallEvenMoreNull ).instanceof( overMore.EvenMore );
			expect( overMoreCallEvenMoreNull ).instanceof( evenMore );
			expect( overMoreCallEvenMoreNull + 1 ).equal( 1 );
			expect( overMoreCallEvenMoreNull.valueOf() ).equal( null );
			expect( overMoreCallEvenMoreNull.toString() ).equal( 'null' );
		} );

		it( 'instance.ConstructorName.call(new Number) should work', () => {
			expect( overMoreCallEvenMoreNumber ).instanceof( overMore.EvenMore );
			expect( overMoreCallEvenMoreNumber ).instanceof( evenMore );
			expect( overMoreCallEvenMoreNumber ).instanceof( Number );
			expect( overMoreCallEvenMoreNumber + 2 ).equal( 7 );
			expect( overMoreCallEvenMoreNumber.valueOf() ).equal( 5 );
			expect( overMoreCallEvenMoreNumber.toString() ).equal( '5' );
		} );

		it( 'instance.ConstructorName.call(new String) should work', () => {

			expect( overMoreCallEvenMoreString ).instanceof( overMore.EvenMore );
			expect( overMoreCallEvenMoreString ).instanceof( evenMore );
			expect( overMoreCallEvenMoreString ).instanceof( String );
			expect( overMoreCallEvenMoreString + 2 ).equal( '52' );
			expect( overMoreCallEvenMoreString.valueOf() ).equal( '5' );
			expect( overMoreCallEvenMoreString.toString() ).equal( '5' );
		} );

		it( 'instance.ConstructorName.call(new Boolean) should work', () => {
			expect( overMoreCallEvenMoreBoolean ).instanceof( overMore.EvenMore );
			expect( overMoreCallEvenMoreBoolean ).instanceof( evenMore );
			expect( overMoreCallEvenMoreBoolean ).instanceof( Boolean );
			expect( overMoreCallEvenMoreBoolean + 1 ).equal( 2 );
			expect( overMoreCallEvenMoreBoolean.valueOf() ).equal( true );
			expect( overMoreCallEvenMoreBoolean.toString() ).equal( 'true' );
		} );

		it( 'instance.ConstructorName.call(process) should work', () => {
			expect( overMoreCallEvenMoreProcess ).instanceof( overMore.EvenMore );
			expect( overMoreCallEvenMoreProcess ).instanceof( evenMore );
			assert.isFunction( overMoreCallEvenMoreProcess.on );
		} );

		it( 'direct primitive DAG.call(new Boolean) should work', () => {
			expect( userTCdirectDAG ).instanceof( UserTypeConstructor );
			expect( userTCdirectDAG ).instanceof( Boolean );
			expect( userTCdirectDAG + 1 ).equal( 2 );
		} );

		it( 'direct primitive DAG somethin.fork.call(new Boolean) should work', () => {
			expect( userTCforkDAG ).instanceof( UserTypeConstructor );
			expect( userTCforkDAG ).instanceof( Boolean );
			expect( userTCforkDAG + 1 ).equal( 2 );
		} );

		it( 'instance.fork.call() should work + SomeType.SomeSubType', () => {
			expect( userTCForkCall ).instanceof( UserTypeConstructor );
			expect( userTCForkCall ).instanceof( UserType );
			expect( userTCForkCall ).instanceof( user );
			expect( userTCForkApply ).instanceof( UserTypeConstructor );
			expect( userTCForkApply ).instanceof( UserType );
			expect( userTCForkApply ).instanceof( user );
			expect( userTCForkBind ).instanceof( UserTypeConstructor );
			expect( userTCForkBind ).instanceof( UserType );
			expect( userTCForkBind ).instanceof( user );
			assert.equal( getProps(user).__args__[ 0 ], USER_DATA );
			assert.equal( getProps(userTC).__args__[ 0 ], USER_DATA );
			assert.deepEqual( getProps(userTCForkCall).__args__[ 0 ], FORK_CALL_DATA );
			assert.deepEqual( getProps(userTCForkApply).__args__[ 0 ], FORK_CALL_DATA );
			assert.deepEqual( getProps(userTCForkBind).__args__[ 0 ], FORK_CALL_DATA );
			assert.deepInclude( userTCForkCall, FORK_CALL_DATA );
			assert.deepInclude( userTCForkApply, FORK_CALL_DATA );
			assert.deepInclude( userTCForkBind, FORK_CALL_DATA );
			expect( utcfcwp.password ).equal( undefined );
			// debugger;
			const { EvenMore } = OverMore;
			expect( overMore ).instanceof( OverMore );
			expect( overMore ).instanceof( moreOver );
			expect( evenMore ).instanceof( EvenMore );
			expect( evenMore ).instanceof( OverMore );
			expect( evenMore ).instanceof( overMore );
			expect( evenMoreForkCall ).instanceof( EvenMore );
			expect( evenMoreForkCall ).instanceof( UserType );
			expect( evenMoreForkCall ).instanceof( user );
		} );
	
	
	} );
	
};

module.exports = tests;
