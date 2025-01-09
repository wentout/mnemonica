'use strict';

const ogp = Object.getPrototypeOf;

const hop = ( o, p ) => Object.prototype.hasOwnProperty.call( o, p );

const { assert, expect } = require( 'chai' );

const {
	defaultTypes: types,
} = require( '..' );

const tests = ( opts ) => {

	const {
		user,
		userPL1,
		userPL2,
		pl1Proto,
		pl2Proto,
		userPL_1_2,
		userPL_NoNew,
		UserTypeProto,
		USER_DATA
	} = opts;

	describe( 'nested type with old style check', () => {
		it( 'actually do construction', () => {
			assert.instanceOf( userPL1, types.UserType.subtypes.get( 'UserTypePL1' ) );
			assert.instanceOf( userPL1, user.UserTypePL1 );
			assert.equal( ogp( ogp( ogp( userPL1 ) ) ), user );
			assert.equal( ogp( ogp( ogp( userPL2 ) ) ), user );
		} );
		it( 'actually do construction with nested methods', () => {
			assert.equal( userPL2.getSign(), 'pl_2' );
		} );
		it( '.constructor.name is correct', () => {
			assert.equal( userPL1.constructor.name, 'UserTypePL1' );
		} );
		it( '.prototype is correct', () => {
			expect( userPL1.constructor.prototype ).to.be.an( 'object' )
				.that.includes( pl1Proto );
			Object.entries( pl1Proto ).forEach( entry => {
				const [ key, value ] = entry;
				assert.equal( userPL1[ key ], value );
			} );
		} );
		it( 'definition is correct', () => {
			const checker = {
				user_pl_1_sign : 'pl_1',
			};
			Object.entries( checker ).forEach( entry => {
				const [ key, value ] = entry;
				assert.isTrue( hop( userPL1, key ) );
				assert.equal( userPL1[ key ], value );
			} );
		} );
	} );

	describe( 'nested .getPrototypeOf(instence.constructor)', () => {
		it( 'must follow constructor inheritance for classes', () => {
			const protoConstructor = ogp( ogp( userPL2.constructor ) );
			assert.equal( protoConstructor, user.constructor );
		} );
	} );

	describe( 'nested type with new style check', () => {
		it( 'actually do construction', () => {
			assert.instanceOf( userPL2, types.UserType.subtypes.get( 'UserTypePL2' ) );
			assert.instanceOf( userPL2, user.UserTypePL2 );
			// assert.notInstanceOf(userPL2, Shaper);
			const shouldNot = userPL2 instanceof userPL2.constructor.Shaper;
			assert.equal( shouldNot, false );
		} );
		it( '.constructor.name is correct', () => {
			assert.equal( userPL2.constructor.name, 'UserTypePL2' );
		} );
		it( 'can construct without "new" keyword', () => {
			assert.instanceOf( userPL_NoNew, types.UserType );
			// debugger;
			assert.instanceOf( userPL_NoNew, types.UserType.subtypes.get( 'UserTypePL2' ) );
		} );
		it( 'and insanceof stays ok', () => {
			assert.instanceOf( userPL_NoNew, user.UserTypePL2 );
		} );
		it( 'and even for sibling type', () => {
			assert.instanceOf( userPL_1_2, userPL1.UserTypePL2 );
		} );
		it( 'and for sibling type constructed without "new"', () => {
			assert.instanceOf( userPL_NoNew, userPL1.UserTypePL2 );
		} );
		it( '.prototype is correct', () => {
			expect( userPL2.constructor.prototype )
				.to.be.an( 'object' )
				.that.includes( pl2Proto );
		} );
		it( 'definitions are correct 4 class instances', () => {
			const checker = Object.assign( {
				user_pl_2_sign : 'pl_2',
				description    : UserTypeProto.description
			}, USER_DATA, pl2Proto );
			Object.keys( USER_DATA ).forEach( key => {
				assert.isFalse( hop( userPL2[ key ], key ) );
				assert.equal( userPL2[ key ], USER_DATA[ key ] );
			} );

			Object.entries( checker ).forEach( entry => {
				const [ key, value ] = entry;
				assert.equal( userPL2[ key ], value );
			} );
		} );
		it( 'definitions are correct for general', () => {
			const checker = Object.assign( {
				user_pl_1_sign : 'pl_1',
				description    : UserTypeProto.description
			}, USER_DATA, pl1Proto );
			Object.keys( USER_DATA ).forEach( key => {
				assert.isFalse( hop( userPL1[ key ], key ) );
			} );
			Object.entries( checker ).forEach( entry => {
				const [ key, value ] = entry;
				assert.equal( userPL1[ key ], value );
			} );
		} );
	} );
};

module.exports = tests;
