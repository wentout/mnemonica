'use strict';

const { assert, expect } = require( 'chai' );

const hop = ( o, p ) => Object.prototype.hasOwnProperty.call( o, p );

const mnemonica = require( '..' );

const {
	errors,
	define,
	lookup,
	utils: {
		extract,
		collectConstructors,
		toJSON,
		parent
	},
	defaultTypes: types,
	SymbolConstructorName,
	MNEMONICA
} = mnemonica;


const tests = ( opts ) => {

	const {
		userTC,
		UserType,
		evenMore,
		USER_DATA,
		moreOver,
		overMore,
		OverMore,
		UserTypeConstructorProto,
		userWithoutPassword,
		userWithoutPassword_2,
		userWPWithAdditionalSign,
		sign2add,
		moreOverStr,
		evenMoreNecessaryProps,
		MoreOverProto,
		UserWithoutPassword,
		MoreOver
	} = opts;


	describe( 'more nested types', () => {

		describe( 'inheritance works', () => {
			it( '.prototype is correct', () => {
				expect( userTC.constructor.prototype ).to.be.an( 'object' )
					.that.includes( UserTypeConstructorProto );
			} );
			it( 'definition is correct', () => {
				const checker = Object.assign( UserTypeConstructorProto, USER_DATA );
				Object.keys( USER_DATA ).forEach( key => {
					assert.isFalse( hop( userTC[ key ], key ) );
				} );
				Object.entries( checker ).forEach( entry => {
					const [ key, value ] = entry;
					assert.equal( userTC[ key ], value );
				} );
			} );
			it( 'siblings are correct', () => {
				const proto1 =
					// Object.getPrototypeOf(
					Object.getPrototypeOf(
						Object.getPrototypeOf(
							// Object.getPrototypeOf(userWithoutPassword)))),
							Object.getPrototypeOf( userWithoutPassword ) ) );
				assert.equal(
					proto1,
					userTC
				);
				const proto2 =
					// Object.getPrototypeOf(
					Object.getPrototypeOf(
						Object.getPrototypeOf(
							// Object.getPrototypeOf(userWithoutPassword)))),
							Object.getPrototypeOf( userWithoutPassword ) ) );
				assert.equal(
					proto2,
					userTC
				);
				assert.deepOwnInclude( userWithoutPassword, userWithoutPassword_2 );
			} );
			it( 'siblings are nested include', () => {
				assert.deepNestedInclude( userWithoutPassword, {
					password : undefined
				} );
				assert.notDeepOwnInclude( userWithoutPassword, userTC );
				assert.deepOwnInclude( userWPWithAdditionalSign, {
					sign : sign2add
				} );
				assert.deepOwnInclude( moreOver, {
					str : moreOverStr
				} );

			} );
		} );

		describe( 'constructors sequence is ok', () => {
			const constructorsSequence = collectConstructors( evenMore, true );
			it( 'must be ok', () => {
				// assert.equal(constructorsSequence.length, 25);
				assert.equal( constructorsSequence.length, 20 );
				assert.deepEqual( constructorsSequence, [
					'EvenMore',
					'EvenMore',
					// 'OverMore',
					'OverMore',
					'OverMore',
					'OverMore',
					// 'MoreOver',
					'MoreOver',
					'MoreOver',
					'MoreOver',
					// 'WithAdditionalSign',
					'WithAdditionalSign',
					'WithAdditionalSign',
					'WithAdditionalSign',
					// 'WithoutPassword',
					'WithoutPassword',
					'WithoutPassword',
					'WithoutPassword',
					// 'UserTypeConstructor',
					'UserTypeConstructor',
					'UserTypeConstructor',
					'UserTypeConstructor',
					'Mnemonica',
					'Mnemosyne',
					'Object'
				] );
			} );

			const constructors = collectConstructors( evenMore );
			const constructorsKeys = Object.keys( constructors );

			var base = types;
			// debugger;
			constructorsKeys
				.reverse()
				.map( ( name, idx ) => {
					assert.include( constructorsSequence, name );
					var iof = false;
					if ( name === 'Gaia' ) {
						debugger;
					}

					if ( name === 'Object' ) {
						iof = evenMore instanceof Object;
					} else if ( base && base[ name ] ) {
						// name follows the sequence :
						// 
						// Mnemosyne
						// UserTypeConstructor
						// ..
						// EvenMore
						// 
						// so the first call : Mnemosyne is checked
						// with types[DEFAULT_NAMESPACE_NAME] instanceof

						iof = evenMore instanceof base[ name ];
						base = base[ name ];
					} else if ( !base ) {
						return { idx, name, iof };
					}
					return { idx, name, iof };
				} )
				.reverse()
				.forEach( props => {
					if ( !props ) {
						return;
					}
					const { idx, name, iof } = props;
					const str = `${idx} evenMore instanceof ${name}`;
					it( `must be true : ${str}`, () => {
						assert.isTrue( iof, str );
					} );
				} );
		} );

		describe( 'extraction works properly', () => {
			const extracted = extract( evenMore );
			const extractedJSON = toJSON( extracted );
			// no password
			const extractedFromJSON = JSON.parse( extractedJSON );
			const extractedFromInstance = evenMore.extract();
			const nativeExtractCall = extract.call( evenMore );
			const nativeToJSONCall = JSON.parse( toJSON.call( evenMore ) );
			it( 'toJSON should work', () => {
				assert.equal( extractedJSON.length > 0, true );
			} );
			it( 'should be equal objects', () => {
				assert.deepOwnInclude( evenMoreNecessaryProps, extracted );
				assert.deepOwnInclude( extracted, evenMoreNecessaryProps );
				assert.deepOwnInclude( extracted, extractedFromInstance );
				assert.deepOwnInclude( extractedFromInstance, extracted );
				assert.deepOwnInclude( extracted, extractedFromJSON );
			} );
			it( 'should respect data flow', () => {
				assert.isTrue( hop( extracted, 'password' ) );
				assert.equal( extracted.password, undefined );
				assert.isFalse( hop( extractedFromJSON, 'password' ) );
				assert.equal( extractedFromJSON.password, undefined );
			} );
			it( 'should work the same for all the ways of extraction', () => {
				assert.deepOwnInclude( nativeExtractCall, extractedFromInstance );
				assert.deepOwnInclude( extractedFromInstance, nativeExtractCall );
				assert.deepOwnInclude( extractedFromJSON, nativeToJSONCall );
				assert.deepOwnInclude( nativeToJSONCall, extractedFromJSON );
			} );
			assert.isDefined( evenMore.MoreOverSign );
			assert.equal( evenMore.MoreOverSign, MoreOverProto.MoreOverSign );
		} );

		describe( 'lookup test', () => {

			describe( 'should throw proper error when looking up without TypeName', () => {
				try {
					lookup( null );
				} catch ( error ) {
					it( 'thrown should be ok with instanceof', () => {
						expect( error ).to.be.an
							.instanceof( errors
								.WRONG_TYPE_DEFINITION );
						expect( error ).to.be.an
							.instanceof( Error );
					} );
					it( 'thrown error should be ok with props', () => {
						expect( error.message ).exist.and.is.a( 'string' );
						assert.equal( error.message, 'wrong type definition : arg : type nested path must be a string' );
					} );
				}
			} );

			describe( 'should throw proper error when looking up for empty TypeName', () => {
				try {
					lookup( '' );
				} catch ( error ) {
					it( 'thrown should be ok with instanceof', () => {
						expect( error ).to.be.an
							.instanceof( errors
								.WRONG_TYPE_DEFINITION );
						expect( error ).to.be.an
							.instanceof( Error );
					} );
					it( 'thrown error should be ok with props', () => {
						expect( error.message ).exist.and.is.a( 'string' );
						assert.equal( error.message, 'wrong type definition : arg : type nested path has no path' );
					} );
				}
			} );

			describe( 'should throw proper error when defining from wrong lookup', () => {
				try {
					define( 'UserTypeConstructor.WithoutPassword.WrongPath.WrongNestedType' );
				} catch ( error ) {
					it( 'thrown should be ok with instanceof', () => {
						expect( error ).to.be.an
							.instanceof( errors
								.WRONG_TYPE_DEFINITION );
						expect( error ).to.be.an
							.instanceof( Error );
					} );
					it( 'thrown error should be ok with props', () => {
						expect( error.message ).exist.and.is.a( 'string' );
						assert.equal( error.message, 'wrong type definition : WrongPath definition is not yet exists' );
					} );
				}
			} );

			describe( 'should throw proper error when declaring with empty TypeName', () => {
				try {
					define( '' );
				} catch ( error ) {
					it( 'thrown should be ok with instanceof', () => {
						expect( error ).to.be.an
							.instanceof( errors
								.WRONG_TYPE_DEFINITION );
						expect( error ).to.be.an
							.instanceof( Error );
					} );
					it( 'thrown error should be ok with props', () => {
						expect( error.message ).exist.and.is.a( 'string' );
						assert.equal( error.message, 'wrong type definition : TypeName must not be empty' );
					} );
				}
			} );

			it( 'should seek proper reference of passed TypeName', () => {
				const ut = lookup( 'UserType' );
				assert.equal( ut.__type__, UserType.__type__ );
				const up = lookup( 'UserTypeConstructor.WithoutPassword' );
				assert.equal( up.__type__, UserWithoutPassword.__type__ );
				const om = lookup( 'UserTypeConstructor.WithoutPassword.WithAdditionalSign.MoreOver.OverMore' );
				assert.equal( om.__type__, OverMore.__type__ );
				const emShort = MoreOver.lookup( 'OverMore.EvenMore' );
				const emFull = mnemonica.lookup( 'UserTypeConstructor.WithoutPassword.WithAdditionalSign.MoreOver.OverMore.EvenMore' );
				assert.equal( emShort.__type__, emFull.__type__ );
			} );

		} );


		describe( '.parent("TypeName") cheks', () => {

			it( 'should seek proper .parent()', () => {

				const parentStraight = parent( evenMore, 'UserTypeConstructor' );
				const parentThroughMethod = evenMore.parent( 'UserTypeConstructor' );

				assert.equal( userTC, parentStraight );
				assert.equal( userTC, parentThroughMethod );
				assert.equal( parentStraight, parentThroughMethod );

				const wrong = evenMore.parent( 'SomeWrongName' );
				assert.equal( wrong, undefined );

				const oneParent = evenMore.parent();
				assert.equal( oneParent, overMore );

			} );

			try {
				parent( null );
			} catch ( error ) {
				it( 'thrown by parent(null) should be ok with instanceof', () => {
					expect( error ).to.be.an
						.instanceof( errors
							.WRONG_INSTANCE_INVOCATION );
					expect( error ).to.be.an
						.instanceof( Error );
				} );
				it( 'thrown error should be ok with props', () => {
					expect( error.BaseStack ).exist.and.is.a( 'string' );
					expect( error.constructor[ SymbolConstructorName ].toString() )
						.exist.and.is.a( 'string' )
						.and.equal( `base of : ${MNEMONICA} : errors` );
				} );
			}
		} );
	} );


};

module.exports = tests;
