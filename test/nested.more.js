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
	MNEMONICA,
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
				// debugger;
				// assert.equal(constructorsSequence.length, 25);
				assert.equal( constructorsSequence.length, 19 );
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
					// 'Object: null prototype',
					// 'Object'
				] );
			} );

			const constructors = collectConstructors( evenMore );
			const constructorsKeys = Object.keys( constructors );
			// debugger;

			var base = types;
			// debugger;
			constructorsKeys
				.reverse()
				.map( ( name, idx ) => {
					assert.include( constructorsSequence, name );
					var iof = false;

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
						const baseResult = { idx, name, iof };
						return baseResult;
					}
					const chainResult = { idx, name, iof };
					return chainResult;
				} )
				.reverse()
				.forEach( props => {
					if ( !props ) {
						return;
					}
					// debugger;
					const { idx, name, iof } = props;
					const str = `${idx} evenMore instanceof ${name}`;
					it( `must be true : ${str}`, () => {
						try {
							assert.isTrue( iof, str );
						} catch ( _error ) {
							// debugger;
							_error; idx; name; iof;
						}
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

		describe( 'lookup typed test', () => {

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
						assert.equal( error.message, 'wrong type definition : parent WrongPath definition is not yet exists!' );
						// assert.equal( error.message, 'wrong type definition : WrongPath definition is not yet exists' );
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

		describe( 'lookup test', () => {

			it( 'should return type when found', () => {
				const ut = lookup( 'UserType' );
				assert.equal( ut, UserType );
			} );

			it( 'should return undefined when not found', () => {
				const notFound = lookup( 'NonExistentType' );
				assert.equal( notFound, undefined );
			} );

			it( 'should work with nested types', () => {
				const wp = lookup( 'UserTypeConstructor.WithoutPassword' );
				assert.equal( wp, UserWithoutPassword );
				const om = lookup( 'UserTypeConstructor.WithoutPassword.WithAdditionalSign.MoreOver.OverMore' );
				assert.equal( om, OverMore );
			} );

			it( 'should work with custom this context', () => {
				const customCollection = {
					lookup ( path ) {
						if ( path === 'CustomType' ) {
							const lookupResult = { __type__ : { TypeName : 'CustomType' } };
							return lookupResult;
						}
						return undefined;
					}
				};
				const result = lookup.call( customCollection, 'CustomType' );
				assert.equal( result.__type__.TypeName, 'CustomType' );
			} );

			it( 'should work without this context (uses defaultTypes)', () => {
				const ut = lookup( 'UserType' );
				assert.equal( ut, UserType );
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

		describe( '.parent("A.B") dotted path checks', () => {

			const DotA = define( 'DotA', function () { this.mark = 'DotA'; } );
			const DotB = DotA.define( 'DotB', function () { this.mark = 'DotB'; } );
			DotB.define( 'DotC', function () { this.mark = 'DotC'; } );

			const dotA = new DotA();
			const dotB = new dotA.DotB();
			const dotC = new dotB.DotC();

			it( 'should return the endpoint instance of a contiguous path', () => {
				assert.equal( parent( dotC, 'DotA.DotB' ), dotB );
				assert.equal( parent( dotC, 'DotB' ), dotB );
			} );

			it( 'should return undefined for non-contiguous path', () => {
				assert.equal( parent( dotC, 'DotA.DotC' ), undefined );
			} );

			it( 'should return undefined when window walks past the root', () => {
				assert.equal( parent( dotC, `DotA.${MNEMONICA}` ), undefined );
			} );

			it( 'should never return the instance itself, even via full path', () => {
				assert.equal( parent( dotC, 'DotA.DotB.DotC' ), undefined );
			} );

			it( 'should return undefined when a leading segment mismatches', () => {
				// dotA matches the last segment, but its parent is the chain
				// root, not a "DotB" instance
				assert.equal( parent( dotC, 'DotB.DotA' ), undefined );
			} );

			it( 'should return undefined for props-less instances', () => {
				assert.equal( parent( {}, 'DotA' ), undefined );
			} );

			describe( 'repeated names in one lineage', () => {

				const ReUser = define( 'ReUser', function () { this.level = 'ReUser'; } );
				const ReData1Type = ReUser.define( 'ReData', function () { this.level = 'ReData1'; } );
				const ReData2Type = ReData1Type.define( 'ReData', function () { this.level = 'ReData2'; } );
				ReData2Type.define( 'ReData', function () { this.level = 'ReData3'; } );

				const reUser = new ReUser();
				const reData1 = new reUser.ReData();
				const reData2 = new reData1.ReData();
				const reData3 = new reData2.ReData();

				it( 'leaf name returns the nearest ancestor', () => {
					assert.equal( parent( reData3, 'ReData' ), reData2 );
				} );

				it( 'dotted path disambiguates repeated names', () => {
					assert.equal( parent( reData3, 'ReData.ReData' ), reData2 );
					assert.equal( parent( reData3, 'ReUser.ReData' ), reData1 );
					assert.equal( parent( reData3, 'ReUser.ReData.ReData' ), reData2 );
				} );

			} );

			describe( 'strictChain off ancestor re-construction', () => {

				const AncUser = define( 'AncUser', function () { this.level = 'AncUser'; } );
				// strictChain guards two gates, both must be off for re-construction:
				// 1. Mnemosyne's prepareSubtypeForConstruction checks the config of the
				//    entity's type (AncSub) before resolving a subtype from ancestors
				// 2. InstanceCreator's postProcessing checks the config of the target
				//    type (AncData) before accepting a parent of a "wrong" type
				const AncDataType = AncUser.define( 'AncData', function () { this.level = 'AncData'; }, {
					strictChain : false
				} );
				AncDataType.define( 'AncSub', function () { this.level = 'AncSub'; }, {
					strictChain : false
				} );

				const ancUser = new AncUser();
				const ancData = new ancUser.AncData();
				const ancSub = new ancData.AncSub();
				const reConstructed = mnemonica.apply( ancSub, AncDataType );
				// lineage: ancUser → ancData → ancSub → reConstructed(AncData) → deepSub(AncSub)
				const deepSub = new reConstructed.AncSub();

				it( 're-constructs a predecessor type on a deeper ancestor', () => {
					assert.equal( mnemonica.getProps( reConstructed ).__parent__, ancSub );
				} );

				it( 'leaf name still seeks the nearest matching ancestor', () => {
					assert.equal( parent( reConstructed, 'AncData' ), ancData );
					assert.equal( parent( deepSub, 'AncData' ), reConstructed );
				} );

				it( 'dotted path resumes scanning after a window mismatch', () => {
					// the nearest "AncData" is reConstructed, but its parent is
					// ancSub, not an "AncUser" — the older ancData ← ancUser pair must win
					assert.equal( parent( deepSub, 'AncUser.AncData' ), ancData );
				} );

				it( 'dotted path matches repeated names contiguously', () => {
					assert.equal( parent( deepSub, 'AncData.AncSub' ), ancSub );
					assert.equal( parent( deepSub, 'AncSub.AncData' ), reConstructed );
					assert.equal( parent( deepSub, 'AncData.AncSub.AncData' ), reConstructed );
				} );

			} );

		} );

		describe( 'subtype lookup caching', () => {

			const CacheRoot = define( 'CacheRoot', function () { this.v = 0; } );
			CacheRoot.define( 'CacheSub', function () { this.s = 1; } );
			const cacheInst = new CacheRoot();

			it( 'repeated subtype access returns the same constructor', () => {
				assert.equal( cacheInst.CacheSub, cacheInst.CacheSub );
			} );

			it( 'cached constructor still builds proper instances', () => {
				const cacheSub = new cacheInst.CacheSub();
				assert.equal( cacheSub.s, 1 );
				assert.equal( mnemonica.getProps( cacheSub ).__parent__, cacheInst );
			} );

		} );
	} );


};

module.exports = tests;
