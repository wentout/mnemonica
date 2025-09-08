'use strict';

const { assert, expect } = require( 'chai' );

const mnemonica = require( '..' );

const hop = ( o, p ) => Object.prototype.hasOwnProperty.call( o, p );

const {
	define,
	defaultTypes: types,
	defaultCollection,
	SymbolDefaultTypesCollection,
	SymbolParentType,
	SymbolConstructorName,
	SymbolGaia,
	SymbolConfig,
	MNEMONICA,
	MNEMOSYNE,
	GAIA,
	createTypesCollection,
	utils: {
		toJSON,
		merge,
		parse,
	},
	errors,
	ErrorMessages,
	defineStackCleaner,
	getProps
} = mnemonica;

const dirname = require( 'path' ).resolve( __dirname, '../build' );
const stackCleanerRegExp = new RegExp( dirname );

const tests = ( opts ) => {

	const {
		user,
		userTC,
		UserType,
		overMore,
		moreOver,
		someADTCInstance,
		SubOfSomeADTCTypePre,
		SubOfSomeADTCTypePost,
		subOfSomeADTCInstanceA,
		backSub,
		subOfSomeADTCInstanceANoArgs,
		subOfSomeADTCInstanceC,
		subOfSomeADTCInstanceB,
		myDecoratedSubInstance,
		myDecoratedSubSubInstance,
		myOtherInstance,
		anotherTypesCollection,
		oneElseTypesCollection,
		anotherCollectionInstance,
		AnotherCollectionType,
		oneElseCollectionInstance,
		OneElseCollectionType,
		userWithoutPassword,
		UserWithoutPassword,
		unchainedUserWithoutPassword,
		chained,
		derived,
		rounded,
		chained2,
		merged
	} = opts;

	describe( 'Check Environment', () => {

		describe( 'constructors may give any answer', () => {

			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new
			/*
			If the constructor function returns a non-primitive,
			this return value becomes the result of the whole new expression.
			Otherwise, if the constructor function doesn't return anything or returns a primitive,
			newInstance is returned instead.
			(Normally constructors don't return a value, but they can choose
			 to do so to override the normal object creation process.)
			*/
			const NullishReturn = define( 'NullishReturn', () => {
				return null;
			} );

			const nullR = new NullishReturn( 'NullishReturn' );

			expect( nullR ).instanceOf( Object );

		} );
		describe( 'interface test', () => {

			const interface_keys = [
				'SymbolParentType',
				'SymbolConstructorName',
				'SymbolGaia',
				'SymbolReplaceUranus',
				'SymbolDefaultTypesCollection',
				'SymbolConfig',
				'MNEMONICA',
				'MNEMOSYNE',
				'GAIA',
				'URANUS',
				'TYPE_TITLE_PREFIX',
				'ErrorMessages',
				'defineStackCleaner',
				'createTypesCollection',
				'defaultTypes',
				'defaultCollection',
				'errors',
				'utils',
				'define',
				'lookup',
				'mnemonica',
				'apply',
				'call',
				'bind',
				'decorate',
				'registerHook',
				'getProps',
			];

			const mnemonica_keys = Object.keys( mnemonica );

			it( 'interface length', () => {
				expect( mnemonica_keys.length ).equal( interface_keys.length );
			} );

			it( 'interface keys', () => {
				const missingKeys = interface_keys.filter( key => {
					return !mnemonica_keys.includes( key );
				} );
				expect( missingKeys.length ).equal( 0 );
			} );

			it( 'mnemonica keys', () => {
				const missingKeys = mnemonica_keys.filter( key => {
					return !interface_keys.includes( key );
				} );
				expect( missingKeys.length ).equal( 0 );
			} );

		} );

		describe( 'named constructor define', async () => {

			const NamedFunction = UserType.define( async function NamedFunction () {
				this.type = 'function';
				return this;
			}, {
				getTypeValue () {
					return this.type;
				}
			} );

			it( 'named function definition exist', () => {
				const { __subtypes__ } = getProps(user);
				expect( __subtypes__.has( 'NamedFunction' ) ).is.true;
			} );

			const NamedClassPtr = UserType.define( () => {
				return class NamedClass {
					constructor ( snc ) {
						this.type = 'class';
						this.snc = snc;
					}

					getTypeValue () {
						return this.type;
					}
				};
			} );

			UserType.define( function () {
				return class NamedClass2 {
					constructor ( snc ) {
						this.type = 'class';
						this.snc = snc;
					}

					getTypeValue () {
						return this.type;
					}
				};
			} );

			const SubNamedClassPtr = NamedClassPtr.define( () => {
				return class SubNamedClass {
					constructor () {
						this.type = 'subclass';
					}
				};
			} );

			it( 'named class definition exist', () => {
				const { __subtypes__ } = getProps(user);
				expect( __subtypes__.has( 'NamedClass' ) ).is.true;
			} );

			const nf = await new user.NamedFunction();
			it( 'instance made through named function instanceof & props', () => {
				expect( nf ).instanceOf( NamedFunction );
			} );
			it( 'instance made with named function props', () => {
				expect( nf.type ).is.equal( 'function' );
			} );
			it( 'instance made with named function prototype methods', () => {
				expect( nf.getTypeValue() ).is.equal( 'function' );
			} );

			const nc = new user.NamedClass( 1 );

			it( 'instance made through named class instanceof', () => {
				expect( nc ).instanceOf( NamedClassPtr );
			} );
			it( 'instance made with named class props', () => {
				expect( nc.type ).is.equal( 'class' );
			} );
			it( 'instance made with named class  prototype methods', () => {
				expect( nc.getTypeValue() ).is.equal( 'class' );
			} );

			try {
				var snc1 = new nc.SubNamedClass();
				var snc2 = new user.NamedClass( 2 ).SubNamedClass();
			} catch ( err ) {
				console.error( err );
			}

			it( 'instance made through sub-named class instanceof', () => {
				expect( snc1 ).instanceOf( NamedClassPtr );
				expect( snc1 ).instanceOf( SubNamedClassPtr );
				expect( snc2 ).instanceOf( NamedClassPtr );
				expect( snc2 ).instanceOf( SubNamedClassPtr );
			} );

			it( 'sub instance made with named class  prototype methods', () => {
				expect( snc1.getTypeValue() ).is.equal( 'subclass' );
				expect( snc2.getTypeValue() ).is.equal( 'subclass' );
			} );

			it( 'instance made with sub-named class props', () => {

				expect( snc1.type ).is.equal( 'subclass' );
				const extracted1 = snc1.extract();
				expect( extracted1.email ).is.equal( 'went.out@gmail.com' );
				expect( extracted1.snc ).is.equal( 1 );
				const parsed1 = parse( snc1 );
				expect( parsed1.props.type ).is.equal( 'subclass' );
				expect( parsed1.name ).is.equal( 'SubNamedClass' );

				expect( snc2.type ).is.equal( 'subclass' );
				const extracted2 = snc2.extract();
				expect( extracted2.email ).is.equal( 'went.out@gmail.com' );
				expect( extracted2.snc ).is.equal( 2 );
				const parsed2 = parse( snc2 );
				expect( parsed2.props.type ).is.equal( 'subclass' );
				expect( parsed2.name ).is.equal( 'SubNamedClass' );

			} );

		} );

		describe( 'error defineStackCleaner test ', () => {
			let madeError = null;
			try {
				defineStackCleaner( null );
			} catch ( error ) {
				madeError = error;
			}
			it( 'defineStackCleaner wrong definition should be instancof error', () => {
				expect( madeError ).instanceOf( Error );
			} );

			it( 'defineStackCleaner wrong definition should be instancof error', () => {
				expect( madeError ).instanceOf( errors.BASE_MNEMONICA_ERROR );
				expect( madeError ).instanceOf( errors.WRONG_STACK_CLEANER );
			} );
		} );

		describe( 'core env tests', () => {

			it( 'Symbol Gaia', () => {
				expect( userTC[ SymbolGaia ][ MNEMONICA ] === GAIA ).is.true;
			} );
			it( '.SubTypes definition is correct Regular', () => {
				expect( hop( userTC, 'WithoutPassword' ) ).is.false;
			} );
			it( '.SubTypes definition is correct Regular FirstChild', () => {
				// 0.8.4 -- changed interface, no more methods inside of prototype chain
				// expect(Object.getPrototypeOf(Object.getPrototypeOf(userTC)).hasOwnProperty('WithoutPassword')).is.true;
				const { __subtypes__ } = getProps(userTC);
				expect( __subtypes__.has( 'WithoutPassword' ) ).is.true;
			} );

			it( '.SubTypes definition is correct Regular Nested Children', () => {
				assert.notEqual(
					Object.getPrototypeOf( Object.getPrototypeOf( overMore ) ),
					Object.getPrototypeOf( Object.getPrototypeOf( moreOver ) )
				);
				const { __subtypes__: os } = getProps(overMore);
				expect( os.has( 'EvenMore' ) ).is.true;
				const { __subtypes__: ms } = getProps(moreOver);
				expect( ms.has( 'OverMore' ) ).is.true;
				// 0.8.4 -- changed interface, no more methods inside of prototype chain
				// expect(Object.getPrototypeOf(Object.getPrototypeOf(overMore)).hasOwnProperty('EvenMore')).is.true;
				// expect(Object.getPrototypeOf(Object.getPrototypeOf(moreOver)).hasOwnProperty('OverMore')).is.true;
			} );

			it( 'SymbolDefaultTypesCollection shoud be default', () => {
				expect( types[ SymbolDefaultTypesCollection ] ).equal( true );
			} );
			it( 'MNEMONICA shoud be defined', () => {
				expect( MNEMONICA ).to.be.a( 'string' ).and.equal( 'Mnemonica' );
			} );
			it( 'MNEMOSYNE shoud be defined', () => {
				expect( MNEMOSYNE ).to.be.a( 'string' ).and.equal( 'Mnemosyne' );
			} );
			it( 'SymbolParentType shoud be defined', () => {
				expect( SymbolParentType ).to.be.a( 'symbol' );
			} );
			it( 'SymbolConstructorName shoud be defined', () => {
				expect( SymbolConstructorName ).to.be.a( 'symbol' );
			} );
			it( 'instance checking works', () => {
				expect( true instanceof UserType ).to.be.false;
				expect( undefined instanceof UserType ).to.be.false;
				expect( Object.create( null ) instanceof UserType ).to.be.false;
			} );

			it( 'should refer defaultCollection from defaultTypes.subtypes', () => {
				expect( types.subtypes ).equal( defaultCollection );
			} );
			it( 'should refer defaultCollection from defaultTypes.subtypes', () => {
				expect( defaultCollection ).instanceof( Map );
			} );
			it( 'should create instances for in anotherDefaultTypesCollection', () => {
				expect( someADTCInstance.test ).equal( 123 );
			} );

			it( 'decorate works correctly', () => {
				expect( myDecoratedSubInstance.sub_field ).equal( 321 );
				expect( myDecoratedSubInstance.field ).equal( 123 );
				expect( myOtherInstance.prop ).equal( 321 );
				expect( myDecoratedSubSubInstance.sub_sub_field ).equal( 321 );
				expect( myDecoratedSubSubInstance.sub_field ).equal( 321 );
				expect( myDecoratedSubSubInstance.field ).equal( 123 );
			} );

			it( 'apply & call works correctly', () => {

				expect( SubOfSomeADTCTypePre.existentInstance ).equal( someADTCInstance );
				expect( SubOfSomeADTCTypePost.existentInstance ).equal( someADTCInstance );
				expect( subOfSomeADTCInstanceANoArgs.test ).equal( 123 );
				expect( subOfSomeADTCInstanceA.test ).equal( 123 );
				expect( subOfSomeADTCInstanceANoArgs.sub_test ).equal( 321 );
				expect( subOfSomeADTCInstanceA.sub_test ).equal( 321 );
				expect( subOfSomeADTCInstanceA.args ).deep.to.equal( [ 1, 2, 3 ] );

				expect( subOfSomeADTCInstanceC.test ).equal( 123 );
				expect( subOfSomeADTCInstanceC.sub_test ).equal( 321 );
				expect( subOfSomeADTCInstanceC.args ).deep.to.equal( [ 1, 2, 3 ] );

				expect( subOfSomeADTCInstanceB.test ).equal( 123 );
				expect( subOfSomeADTCInstanceB.sub_test ).equal( 321 );
				expect( subOfSomeADTCInstanceB.args ).deep.to.equal( [ 1, 2, 3 ] );

			} );

			it( 'non strict chain works correctly', () => {

				expect( backSub.sub_test ).equal( 321 );
				expect( backSub.constructor.name ).equal( 'SubOfSomeADTCType' );
				const { __parent__ } = getProps(backSub);
				expect( __parent__.constructor.name ).equal( 'SubOfSomeADTCType' );
				const { __parent__: pp } = getProps(__parent__);
				expect( pp.constructor.name ).equal( 'SomeADTCType' );
				const { __parent__: ppp } = getProps(pp);
				expect( ppp.constructor.name ).equal( 'Mnemonica' );

			} );

			describe( 'should create type from Proxy.set()', () => {
				it( 'type creation from Proxy.set()', () => {
					const userProxyTyped = user.ProxyTyped( 'aha' );
					expect( userProxyTyped.str ).equal( 'aha' );
					expect( userProxyTyped.proxyTyped ).is.true;
					expect( UserType.ProxyTyped.prototype.proxyTyped ).is.true;
					expect( userProxyTyped.SaySomething() ).equal( 'something : true' );
				} );
				try {
					UserType.ProxyType1 = null;
				} catch ( error ) {
					it( 'should respect the rules', () => {
						expect( error ).instanceOf( Error );
					} );
					it( 'thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect( error ).instanceOf( errors.WRONG_TYPE_DEFINITION );
					} );
					it( 'thrown error should be ok with props', () => {
						expect( error.message ).exist.and.is.a( 'string' );
						assert.equal( error.message, 'wrong type definition : should use function for type definition' );
					} );
				}
				try {
					UserType[ '' ] = function () { };
				} catch ( error ) {
					it( 'should respect the rules', () => {
						expect( error ).instanceOf( Error );
					} );
					it( 'thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect( error ).instanceOf( errors.WRONG_TYPE_DEFINITION );
					} );
					it( 'thrown error should be ok with props', () => {
						expect( error.message ).exist.and.is.a( 'string' );
						assert.equal( error.message, 'wrong type definition : should use non empty string as TypeName' );
					} );
				}
			} );

			try {
				userTC.UserTypeMissing();
			} catch ( error ) {
				it( 'should fail on missing constructs', () => {
					expect( error ).instanceOf( Error );
					expect( error ).instanceOf( TypeError );
				} );
			}

		} );

		describe( 'sibling test', () => {
			const UserTypePtr1 = user.sibling( 'UserType' );
			const { UserType: UserTypePtr2 } = user.sibling;
			it( 'direct sibling works', () => {
				expect( UserType ).equal( UserTypePtr1 );
			} );
			it( 'destructured sibling works', () => {
				expect( UserType ).equal( UserTypePtr2 );
			} );
		} );

		describe( 'base error shoud be defined', () => {
			it( 'BASE_MNEMONICA_ERROR exists', () => {
				expect( errors.BASE_MNEMONICA_ERROR ).to.exist;
			} );
			try {
				throw new errors.BASE_MNEMONICA_ERROR();
			} catch ( error ) {
				it( 'base error instanceof Error', () => {
					expect( error ).instanceOf( Error );
				} );
				it( 'base error instanceof BASE_MNEMONICA_ERROR', () => {
					expect( error ).instanceOf( errors.BASE_MNEMONICA_ERROR );
				} );
				it( 'base error .message is correct', () => {
					expect( error.message ).is.equal( ErrorMessages.BASE_ERROR_MESSAGE );
				} );
			}
		} );

		describe( 'should respect DFD', () => {
			const BadBadType = define( 'BadBadType', function () {
				return null;
			}, {
				constructor () { }
			}, {
				submitStack : true
			} );

			const badbad = new BadBadType( {} );

			it( 'checks primitives are omitted as spec describes', () => {
				expect( badbad ).instanceOf( BadBadType );
			} );

			it( 'checks prototype constructor property is omited', () => {
				expect( badbad.constructor.name ).equal( 'BadBadType' );
			} );

		} );

		describe( 'should respect DFD', () => {
			const BadType = define( 'BadType', function ( NotThis ) {
				// returns not instanceof this
				return NotThis;
			}, {}, {
				submitStack : true
			} );
			var hookInstance;
			BadType.registerHook( 'creationError', ( _hookInstance ) => {
				hookInstance = _hookInstance;
				return true;
			} );
			const errored = new BadType( {} );
			const stackstart = '<-- creation of [ BadType ] traced -->';
			it( 'should respect the rules', () => {
				expect( errored ).instanceOf( Error );
				expect( hookInstance.inheritedInstance ).instanceOf( Error );
			} );
			it( 'should be instanceof BadType', () => {
				expect( errored ).instanceOf( BadType );
				expect( hookInstance.inheritedInstance ).instanceOf( BadType );
			} );
			it( 'thrown error instanceof WRONG_MODIFICATION_PATTERN', () => {
				expect( errored ).instanceOf( errors.WRONG_MODIFICATION_PATTERN );
				expect( hookInstance.inheritedInstance ).instanceOf( errors.WRONG_MODIFICATION_PATTERN );
			} );
			it( 'thrown error should be ok with props', () => {
				expect( errored.message ).exist.and.is.a( 'string' );
				assert.equal( errored.message, 'wrong modification pattern : should inherit from mnemonica instance' );
			} );
			it( 'thrown error should have own .stack property', () => {
				assert.equal( hop( errored, 'stack' ), true );
			} );
			it( 'thrown error.stack should have seekable definition without stack cleaner', () => {
				expect( errored.stack.indexOf( stackstart ) ).equal( 1 );
				expect( errored.stack
					.indexOf( 'environment.js' ) > 0 ).is.true;
			} );
			it( 'thrown error.stack should have seekable definition without Error.captureStackTrace', () => {
				const { captureStackTrace } = Error;
				Error.captureStackTrace = null;
				const errored1 = new BadType( {} );
				Error.captureStackTrace = captureStackTrace;
				expect( errored1.stack.indexOf( stackstart ) ).equal( 1 );
				expect( errored1.stack
					.indexOf( 'environment.js' ) > 0 ).is.true;
			} );
			it( 'thrown error.stack should have seekable definition with stack cleaner', () => {
				defineStackCleaner( stackCleanerRegExp );
				const errored2 = new BadType( {} );
				expect( errored2.stack.indexOf( stackstart ) ).equal( 1 );
				expect( errored2.stack
					.indexOf( 'environment.js' ) > 0 ).is.true;
			} );
		} );

		describe( 'should not hack DFD', () => {
			const BadTypeReThis = define( 'BadTypeReThis', function () {
				// removing constructor
				this.constructor = undefined;
			} );
			const ThrownHackType = BadTypeReThis.define( 'ThrownHackType' );
			try {
				new BadTypeReThis().ThrownHackType();
			} catch ( error ) {
				it( 'should respect construction rules', () => {
					expect( error ).instanceOf( Error );
				} );
				it( 'should be instanceof BadTypeReThis', () => {
					expect( error ).instanceOf( BadTypeReThis );
				} );
				it( 'should be not instanceof ThrownHackType', () => {
					// cause there was no .constructor
					expect( error ).not.instanceOf( ThrownHackType );
				} );
				it( 'thrown error instanceof WRONG_MODIFICATION_PATTERN', () => {
					expect( error ).instanceOf( errors.WRONG_MODIFICATION_PATTERN );
				} );
				it( 'thrown error should be ok with props', () => {
					expect( error.message ).exist.and.is.a( 'string' );
					assert.equal( error.message, 'wrong modification pattern : should inherit from mnemonica instance' );
				} );
			}
		} );

		describe( 'subtype property inside type re-definition', () => {
			const BadTypeReInConstruct = define( 'BadTypeReInConstruct', function () { } );
			BadTypeReInConstruct.define( 'ExistentConstructor', function () {
				this.ExistentConstructor = undefined;
			} );
			let errored = null;
			try {
				const badType = new BadTypeReInConstruct();
				const existent = badType.ExistentConstructor();
				existent.ExistentConstructor();
			} catch ( error ) {
				errored = error;
			}
			it( 'Thrown with General JS Error', () => {
				expect( errored ).instanceOf( Error );
			} );
		} );

		describe( 'should define through typesCollection proxy', () => {
			it( 'check typesCollection proxified creation', () => {
				types.ProxifiedCreation = function () { };
			} );
		} );

		describe( 'should throw with wrong definition', () => {
			[
				[ 'wrong type definition : expect prototype to be an object', () => {
					define( 'Wrong', function () { }, true );
				}, errors.WRONG_TYPE_DEFINITION ],
				[ 'wrong type definition : TypeName should start with Uppercase Letter', () => {
					// next line same as 
					// define('wrong', function () { /* ... */ });
					types.wrong = function () { };
				}, errors.WRONG_TYPE_DEFINITION ],
				[ 'wrong type definition : TypeName of reserved keyword', () => {
					types[ MNEMONICA ] = function () { };
				}, errors.WRONG_TYPE_DEFINITION ],
				[ 'wrong type definition : definition is not provided', () => {
					define();
				}, errors.WRONG_TYPE_DEFINITION ],
				[ 'handler must be a function', () => {
					define( 'NoConstructFunctionType', NaN, '', 'false' );
				}, errors.HANDLER_MUST_BE_A_FUNCTION ],
				[ 'handler must be a function', () => {
					define( () => {
						return {
							name : null
						};
					} );
				}, errors.HANDLER_MUST_BE_A_FUNCTION ],
				[ 'this type has already been declared', () => {
					define( 'UserTypeConstructor', () => {
						return function WithoutPassword () { };
					} );
				}, errors.ALREADY_DECLARED ],
				[ 'typename must be a string', () => {
					define( 'UserType.UserTypePL1', () => {
						return function () { };
					} );
				}, errors.TYPENAME_MUST_BE_A_STRING ],
			].forEach( entry => {
				const [ errorMessage, fn, err ] = entry;
				it( `check throw with : '${errorMessage}'`, () => {
					expect( fn ).throw();
					try {
						fn();
					} catch ( error ) {
						expect( error ).to.be.an
							.instanceof( err );
						expect( error ).to.be.an
							.instanceof( Error );
						expect( error.message ).equal( errorMessage );
					}
				} );
			} );
		} );

		describe( 'another instances', () => {
			it( 'Another typesCollections gather types', () => {
				// expect(anotherTypesCollection).hasOwnProperty('AnotherCollectionType');
				expect( hop( anotherTypesCollection, 'AnotherCollectionType' ) ).is.true;
				// expect(oneElseTypesCollection).hasOwnProperty('OneElseCollectionType');
				expect( hop( anotherTypesCollection, 'SomethingThatDoesNotExist' ) ).is.false;
				expect( hop( oneElseTypesCollection, 'OneElseCollectionType' ) ).is.true;
				expect( hop( oneElseTypesCollection, 'SomethingThatDoesNotExist' ) ).is.false;
			} );

			it( 'Instance Of Another and AnotherCollectionType', () => {
				expect( anotherCollectionInstance ).instanceOf( AnotherCollectionType );
			} );
			it( 'anotherCollectionInstance.TestForAddition pass gaia proxy', () => {
				expect( anotherCollectionInstance.TestForAddition ).equal( 'passed' );
			} );
			it( 'starter Instance can extend', () => {
				const {
					on,
					check
				} = anotherCollectionInstance;
				expect( check ).equal( 'check' );
				expect( on ).equal( process.on );
			} );
			it( 'Instance Of OneElse and OneElseCollectionType', () => {
				expect( oneElseCollectionInstance ).instanceOf( OneElseCollectionType );
			} );
			it( 'Instance circular .toJSON works', () => {
				const circularExtracted = JSON.parse( toJSON( oneElseCollectionInstance ) );
				const { description } = circularExtracted.self;
				expect( description ).equal( 'This value type is not supported by JSON.stringify' );
			} );
			it( 'Instance circular .toJSON works', () => {
				const proto = Object.getPrototypeOf(
					Object.getPrototypeOf(
						Object.getPrototypeOf(
							oneElseCollectionInstance ) ) );
				const {
					constructor: {
						name,
						prototype: {
							[ SymbolConstructorName ]: protoConstructSymbol
						}
					},
					[ SymbolConstructorName ]: CstrName
				} = proto;
				expect( name ).equal( MNEMONICA );
				expect( protoConstructSymbol ).equal( MNEMONICA );
				expect( CstrName ).equal( 'Mnemonica' );
			} );
		} );

		describe( 'strict chain test', () => {
			it( 'deep chained type should be undefined', () => {
				expect( userWithoutPassword.WithoutPassword ).equal( undefined );
			} );
		} );

		describe( 'check uncained construction', () => {
			it( 'check instance creation without chain', () => {
				expect( unchainedUserWithoutPassword ).instanceof( UserWithoutPassword );
			} );
		} );

		describe( 'merge tests', () => {
			const mergedSample = {
				OverMoreSign           : 'OverMoreSign',
				WithAdditionalSignSign : 'WithAdditionalSignSign',
				WithoutPasswordSign    : 'WithoutPasswordSign',
				description            : 'UserType',
				email                  : 'forkmail@gmail.com',
				password               : '54321',
				sign                   : 'userWithoutPassword_2.WithAdditionalSign',
				str                    : 're-defined OverMore str',
			};
			it( 'merge works correctly', () => {
				assert.deepEqual( merged.extract(), mergedSample );
			} );

			describe( 'wrong A 1', () => {
				try {
					merge( null, userTC );
				} catch ( error ) {
					it( 'should respect the rules', () => {
						expect( error ).instanceOf( Error );
					} );
					it( 'thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect( error ).instanceOf( errors.WRONG_ARGUMENTS_USED );
					} );
					it( 'thrown error should be ok with props', () => {
						expect( error.message ).exist.and.is.a( 'string' );
						assert.equal( error.message, 'wrong arguments : should use proper invocation : A should be an object' );
					} );
				}
			} );
			describe( 'wrong A 2', () => {
				const Cstr = function () { };
				Cstr.prototype.clone = Object.create( {} );
				const d = new Cstr();
				try {
					merge( d, userTC );
				} catch ( error ) {
					it( 'should respect the rules', () => {
						expect( error ).instanceOf( Error );
					} );
					it( 'thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect( error ).instanceOf( errors.WRONG_ARGUMENTS_USED );
					} );
					it( 'thrown error should be ok with props', () => {
						expect( error.message ).exist.and.is.a( 'string' );
						assert.equal( error.message, 'wrong arguments : should use proper invocation : A should have A.fork()' );
					} );
				}
			} );
			describe( 'wrong B', () => {
				try {
					merge( userTC, null );
				} catch ( error ) {
					it( 'should respect the rules', () => {
						expect( error ).instanceOf( Error );
					} );
					it( 'thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect( error ).instanceOf( errors.WRONG_ARGUMENTS_USED );
					} );
					it( 'thrown error should be ok with props', () => {
						expect( error.message ).exist.and.is.a( 'string' );
						assert.equal( error.message, 'wrong arguments : should use proper invocation : B should be an object' );
					} );
				}
			} );
		} );

		describe( 'chain repeat check', () => {
			const keys1_1 = Object.keys( userTC );
			const keys1_2 = Object.keys( chained );
			const keys2_1 = Object.keys( userWithoutPassword );
			const keys2_2 = Object.keys( derived );
			it( 'simple chain is ok', () => {
				assert.deepEqual( keys1_1, keys1_2 );
				assert.deepEqual( keys2_1, keys2_2 );
			} );
			it( 'real chain is ok too', () => {
				assert.deepEqual( rounded.extract(), chained2.extract() );
			} );
		} );

	} );

	describe( 'immediate error shape', () => {
		const ErroredShapePtr = UserType.define( class ErroredShape {
			constructor () {
				this.shape = 321;
			}
		} );
		const esi = new ErroredShapePtr;
		assert.equal( esi.shape, 321 );

		let errorPtr;
		try {
			new ErroredShapePtr;
		} catch ( error ) {
			errorPtr = error;
		}

		it( 'wrong ErroredShapePtr creation instanceof Error', () => {
			expect( errorPtr ).instanceOf( Error );
		} );
		it( 'wrong .exception() creation instanceof WRONG_INSTANCE_INVOCATION', () => {
			expect( errorPtr ).instanceOf( errors.PROTOTYPE_USED_TWICE );
		} );
		it( 'wrong .exception() creation should have nice message', () => {
			expect( errorPtr.message.includes( '.prototype used twice' ) ).is.true;
			expect( errorPtr.message.includes( 'ErroredShape' ) ).is.true;
		} );
	} );

	describe( 'delayed error shape', () => {

		class DelayedErrorShape {
			constructor () {
				this.shape = 321;
			}
		}

		const ErroredShapePtr = UserType.define( () => {
			return class ShapeMyError extends DelayedErrorShape { };
		} );

		const esi = new ErroredShapePtr;
		assert.equal( esi.shape, 321 );

		let errorPtr;
		try {
			new ErroredShapePtr;
		} catch ( error ) {
			errorPtr = error;
		}

		it( 'wrong ErroredShapePtr creation instanceof Error', () => {
			expect( errorPtr ).instanceOf( Error );
		} );
		it( 'wrong .exception() creation instanceof WRONG_INSTANCE_INVOCATION', () => {
			expect( errorPtr ).instanceOf( errors.PROTOTYPE_USED_TWICE );
		} );
		it( 'wrong .exception() creation should have nice message', () => {
			expect( errorPtr.message.includes( '.prototype used twice' ) ).is.true;
			expect( errorPtr.message.includes( 'DelayedErrorShape' ) ).is.true;
			expect( errorPtr.message.includes( 'ShapeMyError' ) ).is.true;
		} );
	} );

	describe( 'wrong creation', () => {

		const ModificationConstructor = require( './createInstanceModificator200XthWay' );
		const goodNamespaceTC = createTypesCollection( {
			ModificationConstructor
		} );
		it( 'types collection creation check', () => {
			expect( goodNamespaceTC[ SymbolConfig ].ModificationConstructor ).is.equal( ModificationConstructor );
			expect( goodNamespaceTC[ SymbolConfig ].strictChain ).is.equal( true );
		} );

	} );

	describe( 'prepareException', () => {
		let errorInstance = null;
		let exceptionError = new Error( 'asdf' );
		try {
			throw new someADTCInstance.exception( exceptionError, 1, 2, 3 );
		} catch ( error ) {
			errorInstance = error;
		}
		it( '.exception() shoud have own stack property', () => {
			expect( hop( errorInstance, 'stack' ) ).equal( true );
			// console.log(errorInstance.stack.indexOf('<-- of constructor definitions stack -->'), '!!!!!!!!!!!!!');
			// expect(errorInstance.stack.indexOf('<-- of constructor definitions stack -->')).equal(1985); v20
			// expect(errorInstance.stack.indexOf('<-- of constructor definitions stack -->')).equal(2126); v22
			expect( errorInstance.stack.indexOf( '<-- of constructor definitions stack -->' ) > 1000 ).equal( true );
			// process.exit(0);
		} );
		it( '.exception() shoud create instanceof Error', () => {
			expect( errorInstance ).instanceOf( Error );
		} );
		it( '.exception() shoud create instanceof CreationType', () => {
			const { __type__ } = getProps(someADTCInstance);
			expect( errorInstance ).instanceOf( __type__ );
		} );
		it( '.exception() args should exists create instanceof CreationType', () => {
			const { __type__ } = getProps(someADTCInstance);
			expect( errorInstance ).instanceOf( __type__ );
		} );
		it( '.exception() .instance should be existent instance', () => {
			expect( errorInstance.instance ).equal( someADTCInstance );
		} );
		it( '.exception() should have nice .args property', () => {
			expect( errorInstance.args[ 0 ] ).equal( 1 );
			expect( errorInstance.args[ 1 ] ).equal( 2 );
			expect( errorInstance.args[ 2 ] ).equal( 3 );
		} );

		it( '.exception() .extract() works property', () => {
			assert.deepOwnInclude( errorInstance.extract(), someADTCInstance.extract() );
			assert.deepOwnInclude( someADTCInstance.extract(), errorInstance.extract() );
		} );
		it( '.exception() .extract() works property', () => {
			assert.deepOwnInclude( errorInstance.parse(), parse( someADTCInstance ) );
			assert.deepOwnInclude( parse( someADTCInstance ), errorInstance.parse() );
		} );


		let wrongErrorInstanceNoNew = null;
		try {
			throw someADTCInstance.exception( exceptionError, 1, 2, 3 );
		} catch ( error ) {
			wrongErrorInstanceNoNew = error;
		}
		it( 'wrong .exception() creation instanceof Error', () => {
			expect( wrongErrorInstanceNoNew ).instanceOf( Error );
		} );
		it( 'wrong .exception() creation instanceof WRONG_INSTANCE_INVOCATION', () => {
			expect( wrongErrorInstanceNoNew ).instanceOf( errors.WRONG_INSTANCE_INVOCATION );
		} );
		it( 'wrong .exception() creation should have nice message', () => {
			expect( wrongErrorInstanceNoNew.message.includes( 'exception should be made with new keyword' ) ).is.true;
		} );



		let wrongErrorInstanceIsNotAnError = null;
		try {
			throw new someADTCInstance.exception( 'asdf', 1, 2, 3 );
		} catch ( error ) {
			wrongErrorInstanceIsNotAnError = error;
		}
		it( 'wrong .exception() creation instanceof Error', () => {
			expect( wrongErrorInstanceIsNotAnError ).instanceOf( Error );
		} );
		it( 'wrong .exception() creation instanceof WRONG_ARGUMENTS_USED', () => {
			expect( wrongErrorInstanceIsNotAnError ).instanceOf( errors.WRONG_ARGUMENTS_USED );
		} );
		it( 'wrong .exception() creation should have nice message', () => {
			expect( wrongErrorInstanceIsNotAnError.message.includes( 'error must be instanceof Error' ) ).is.true;
		} );

		it( 'wrong .exception() .instance should be existent instance', () => {
			expect( wrongErrorInstanceIsNotAnError.instance ).equal( someADTCInstance );
		} );
		it( 'wrong .exception() .error should be given error', () => {
			expect( wrongErrorInstanceIsNotAnError.error ).equal( 'asdf' );
		} );
		it( 'wrong .exception() .args should be given args', () => {
			expect( wrongErrorInstanceIsNotAnError.args[ 0 ] ).equal( 1 );
			expect( wrongErrorInstanceIsNotAnError.args[ 1 ] ).equal( 2 );
			expect( wrongErrorInstanceIsNotAnError.args[ 2 ] ).equal( 3 );
		} );


		let wrongErrorInstanceIsNotAConstructor = null;
		try {
			throw new someADTCInstance.exception.call( null, 'asdf', 1, 2, 3 );
		} catch ( error ) {
			wrongErrorInstanceIsNotAConstructor = error;
		}
		it( 'wrong .exception() creation instanceof Error', () => {
			expect( wrongErrorInstanceIsNotAConstructor ).instanceOf( Error );
		} );
		it( 'wrong .exception() creation instanceof TypeError', () => {
			// is not a constructor
			expect( wrongErrorInstanceIsNotAConstructor ).instanceOf( TypeError );
		} );


	} );

};

module.exports = tests;
