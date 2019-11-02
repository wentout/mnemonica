'use strict';

const { assert, expect } = require('chai');

const {
	define,
	defaultTypes: types,
	defaultNamespace,
	namespaces,
	SymbolDefaultNamespace,
	SymbolSubtypeCollection,
	SymbolConstructorName,
	SymbolGaia,
	MNEMONICA,
	MNEMOSYNE,
	GAIA,
	createTypesCollection,
	utils: {
		toJSON,
		merge
	}
} = require('..');


const test = (opts) => {

	const {
		user,
		userTC,
		UserType,
		overMore,
		moreOver,
		anotherDefaultTypesCollection,
		someADTCInstance,
		anotherNamespace,
		anotherTypesCollection,
		oneElseTypesCollection,
		anotherCollectionInstance,
		AnotherCollectionType,
		oneElseCollectionInstance,
		OneElseCollectionType,
		userWithoutPassword,
		UserTypeConstructor,
		chained,
		derived,
		rounded,
		chained2,
		merged,
	} = opts;

	describe('Check Environment', () => {
		const {
			errors,
			ErrorMessages,
		} = require('..');

		describe('core env tests', () => {

			it('Symbol Gaia', () => {
				expect(userTC[SymbolGaia][MNEMONICA] === GAIA).is.true;
			});
			it('.SubTypes definition is correct Regular', () => {
				expect(userTC.hasOwnProperty('WithoutPassword')).is.false;
			});
			it('.SubTypes definition is correct Regular FirstChild', () => {
				expect(Object.getPrototypeOf(Object.getPrototypeOf(userTC)).hasOwnProperty('WithoutPassword')).is.true;
			});

			it('.SubTypes definition is correct Regular Nested Children', () => {
				assert.notEqual(
					Object.getPrototypeOf(Object.getPrototypeOf(overMore)),
					Object.getPrototypeOf(Object.getPrototypeOf(moreOver))
				);
				expect(Object.getPrototypeOf(Object.getPrototypeOf(overMore)).hasOwnProperty('EvenMore')).is.true;
				expect(Object.getPrototypeOf(Object.getPrototypeOf(moreOver)).hasOwnProperty('OverMore')).is.true;
			});

			it('namespaces shoud be defined', () => {
				expect(namespaces).exist.and.is.a('map');
			});
			it('defaultNamespace shoud be defined', () => {
				expect(defaultNamespace).to.be.an('object')
					.and.equal(namespaces.get(SymbolDefaultNamespace));
				expect(defaultNamespace.name).to.be.a('symbol')
					.and.equal(SymbolDefaultNamespace);
			});
			it('MNEMONICA shoud be defined', () => {
				expect(MNEMONICA).to.be.a('string').and.equal('Mnemonica');
			});
			it('MNEMOSYNE shoud be defined', () => {
				expect(MNEMOSYNE).to.be.a('string').and.equal('Mnemosyne');
			});
			it('SymbolSubtypeCollection shoud be defined', () => {
				expect(SymbolSubtypeCollection).to.be.a('symbol');
			});
			it('SymbolConstructorName shoud be defined', () => {
				expect(SymbolConstructorName).to.be.a('symbol');
			});
			it('instance checking works', () => {
				expect(true instanceof UserType).to.be.false;
				expect(undefined instanceof UserType).to.be.false;
				expect(Object.create(null) instanceof UserType).to.be.false;
			});
			try {
				createTypesCollection({});
			} catch (error) {
				it('should register types collection for proper namespace', () => {
					expect(error.message).is.equal(ErrorMessages.NAMESPACE_DOES_NOT_EXIST);
				});
			}
			it('should refer defaultTypes from types.get(defaultNamespace)', () => {
				expect(defaultNamespace.typesCollections.has(types)).is.true;
			});
			it('should create collections in defaultNamespace by default', () => {
				expect(anotherDefaultTypesCollection.namespace).equal(defaultNamespace);
			});
			it('should create instances for in anotherDefaultTypesCollection', () => {
				expect(someADTCInstance.test).equal(123);
			});
			describe('should create type from Proxy.set()', () => {
				it('type creation from Proxy.set()', () => {
					const userProxyTyped = user.ProxyTyped('aha');
					expect(userProxyTyped.str).equal('aha');
					expect(userProxyTyped.proxyTyped).is.true;
					expect(UserType.ProxyTyped.prototype.proxyTyped).is.true;
				});
				try {
					UserType.ProxyType1 = null;
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).instanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).instanceOf(errors.WRONG_TYPE_DEFINITION);
					});
					it('thrown error should be ok with props', () => {
						expect(error.message).exist.and.is.a('string');
						assert.equal(error.message, 'wrong type definition : should use function for type definition');
					});
				}
				try {
					UserType[''] = function () {};
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).instanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).instanceOf(errors.WRONG_TYPE_DEFINITION);
					});
					it('thrown error should be ok with props', () => {
						expect(error.message).exist.and.is.a('string');
						assert.equal(error.message, 'wrong type definition : should use non empty string as TypeName');
					});
				}
			});
			
		});
		describe('base error shoud be defined', () => {
			it('BASE_MNEMONICA_ERROR exists', () => {
				expect(errors.BASE_MNEMONICA_ERROR).to.exist;
			});
			try {
				throw new errors.BASE_MNEMONICA_ERROR();
			} catch (error) {
				it('base error instanceof Error', () => {
					expect(error).instanceOf(Error);
				});
				it('base error instanceof BASE_MNEMONICA_ERROR', () => {
					expect(error).instanceOf(errors.BASE_MNEMONICA_ERROR);
				});
				it('base error .message is correct', () => {
					expect(error.message).is.equal(ErrorMessages.BASE_ERROR_MESSAGE);
				});
			}
		});
		describe('should respect DFD', () => {
			const BadType = define('BadType', function (NotThis) {
				// returns not instanceof this
				return NotThis;
			});
			BadType.define('ThrownBadType');
			try {
				new BadType({}).ThrownBadType();
			} catch (error) {
				it('should respect the rules', () => {
					expect(error).instanceOf(Error);
				});
				it('thrown error instanceof WRONG_MODIFICATION_PATTERN', () => {
					expect(error).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				});
				it('thrown error should be ok with props', () => {
					expect(error.message).exist.and.is.a('string');
					assert.equal(error.message, 'wrong modification pattern : should inherit from mnemonica instance');
				});
			}
		});
		describe('should not hack DFD', () => {
			const BadTypeReThis = define('BadTypeReThis', function () {
				// removing constructor
				this.constructor = undefined;
			});
			BadTypeReThis.define('ThrownHackType');
			try {
				new BadTypeReThis().ThrownHackType();
			} catch (error) {
				it('should respect construction rules', () => {
					expect(error).instanceOf(Error);
				});
				it('thrown error instanceof WRONG_MODIFICATION_PATTERN', () => {
					expect(error).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				});
				it('thrown error should be ok with props', () => {
					expect(error.message).exist.and.is.a('string');
					assert.equal(error.message, 'wrong modification pattern : should inherit from mnemonica instance');
				});
			}
		});
		describe('subtype property type re-definition', () => {
			const BadTypeReContruct = define('BadTypeReContruct', function () {
				this.ExistentConstructor = undefined;
			});
			BadTypeReContruct.define('ExistentConstructor');
			try {
				new BadTypeReContruct().ExistentConstructor();
			} catch (error) {
				it('should respect construction rules', () => {
					expect(error).instanceOf(Error);
				});
				it('thrown error instanceof EXISTENT_PROPERTY_REDEFINITION', () => {
					expect(error).instanceOf(errors.EXISTENT_PROPERTY_REDEFINITION);
				});
			}
		});
		describe('subtype property inside type re-definition', () => {
			const BadTypeReInConstruct = define('BadTypeReInConstruct', function () { });
			BadTypeReInConstruct.define('ExistentConstructor', function () {
				this.ExistentConstructor = undefined;
			});
			try {
				new BadTypeReInConstruct().ExistentConstructor();
			} catch (error) {
				it('Thrown with General JS Error', () => {
					expect(error).instanceOf(Error);
				});
			}
		});
		describe('should throw with wrong definition', () => {
			[
				['prototype is not an object', () => {
					define('wrong', function () { }, true);
				}, errors.WRONG_TYPE_DEFINITION],
				['no definition', () => {
					define();
				}, errors.WRONG_TYPE_DEFINITION],
				['intentionally bad definition', () => {
					define('NoConstructFunctionType', NaN, '', 'false');
				}, errors.HANDLER_MUST_BE_A_FUNCTION],
				['intentionally bad type definition', () => {
					define(() => {
						return {
							name: null
						};
					});
				}, errors.HANDLER_MUST_BE_A_FUNCTION],
				['re-definition', () => {
					define('UserTypeConstructor', () => {
						return function WithoutPassword() { };
					});
				}, errors.ALREADY_DECLARED],
				['prohibit anonymous', () => {
					define('UserType.UserTypePL1', () => {
						return function () { };
					});
				}, errors.TYPENAME_MUST_BE_A_STRING],
			].forEach(entry => {
				const [name, fn, err] = entry;
				it(`check throw with : ${name}`, () => {
					expect(fn).throw();
					try {
						fn();
					} catch (error) {
						expect(error).to.be.an
							.instanceof(err);
						expect(error).to.be.an
							.instanceof(Error);
					}
				});
			});
		});

		describe('another namespace instances', () => {
			anotherNamespace;
			it('Another Nnamespace has both defined collections', () => {
				expect(anotherNamespace.typesCollections.has(anotherTypesCollection)).is.true;
				expect(anotherNamespace.typesCollections.has(oneElseTypesCollection)).is.true;
			});
			it('Another Nnamespace typesCollections gather types', () => {
				expect(anotherTypesCollection).hasOwnProperty('AnotherCollectionType');
				expect(oneElseTypesCollection).hasOwnProperty('OneElseCollectionType');
			});

			it('Instance Of Another Nnamespace and AnotherCollectionType', () => {
				expect(anotherCollectionInstance).instanceOf(AnotherCollectionType);
			});
			it('starter Instance can extend', () => {
				const {
					on,
					check
				} = anotherCollectionInstance;
				expect(check).equal('check');
				expect(on).equal(process.on);
			});
			it('Instance Of OneElse Nnamespace and OneElseCollectionType', () => {
				expect(oneElseCollectionInstance).instanceOf(OneElseCollectionType);
			});
			it('Instance circular .toJSON works', () => {
				const circularExtracted = JSON.parse(toJSON(oneElseCollectionInstance));
				const { description } = circularExtracted.self;
				expect(description).equal('This value type is not supported by JSON.stringify');
			});
			it('Instance circular .toJSON works', () => {
				const proto = Object.getPrototypeOf(
					Object.getPrototypeOf(
						Object.getPrototypeOf(
							oneElseCollectionInstance)));
				const {
					constructor: {
						name,
						prototype: {
							[SymbolConstructorName]: protoConstructSymbol
						}
					},
					[SymbolConstructorName]: namespaceName
				} = proto;
				expect(name).equal(MNEMONICA);
				expect(protoConstructSymbol).equal(MNEMONICA);
				expect(namespaceName).equal('anotherNamespace');
			});
		});

		describe('hooks environment', () => {
			try {
				defaultNamespace.registerFlowChecker();
			} catch (error) {
				it('Thrown with Missing Callback', () => {
					expect(error).instanceOf(Error);
					expect(error).instanceOf(errors.MISSING_CALLBACK_ARGUMENT);
				});
			}
			try {
				defaultNamespace.registerFlowChecker(() => { });
			} catch (error) {
				it('Thrown with Re-Definition', () => {
					expect(error).instanceOf(Error);
					expect(error).instanceOf(errors.FLOW_CHECKER_REDEFINITION);
				});
			}
			try {
				defaultNamespace.registerHook('WrongHookType', () => { });
			} catch (error) {
				it('Thrown with Re-Definition', () => {
					expect(error).instanceOf(Error);
					expect(error).instanceOf(errors.WRONG_HOOK_TYPE);
				});
			}
			try {
				defaultNamespace.registerHook('postCreation');
			} catch (error) {
				it('Thrown with Re-Definition', () => {
					expect(error).instanceOf(Error);
					expect(error).instanceOf(errors.MISSING_HOOK_CALLBACK);
				});
			}
		});

		describe('merge tests', () => {
			const mergedSample = {
				OverMoreSign: 'OverMoreSign',
				WithAdditionalSignSign: 'WithAdditionalSignSign',
				WithoutPasswordSign: 'WithoutPasswordSign',
				description: 'UserType',
				email: 'forkmail@gmail.com',
				password: '54321',
				sign: 'userWithoutPassword_2.WithAdditionalSign',
				str: 're-defined OverMore str',
			};
			it('merge works correctly', () => {
				assert.deepEqual(merged.extract(), mergedSample);
			});

			describe('wrong A 1', () => {
				try {
					merge(null, userTC);
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).instanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).instanceOf(errors.WRONG_ARGUMENTS_USED);
					});
					it('thrown error should be ok with props', () => {
						expect(error.message).exist.and.is.a('string');
						assert.equal(error.message, 'wrong arguments : should use proper invocation : A should be an object');
					});
				}
			});
			describe('wrong A 2', () => {
				const Cstr = function () { };
				Cstr.prototype.clone = Object.create({});
				const d = new Cstr();
				try {
					merge(d, userTC);
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).instanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).instanceOf(errors.WRONG_ARGUMENTS_USED);
					});
					it('thrown error should be ok with props', () => {
						expect(error.message).exist.and.is.a('string');
						assert.equal(error.message, 'wrong arguments : should use proper invocation : A should have A.fork()');
					});
				}
			});
			describe('wrong B', () => {
				try {
					merge(userTC, null);
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).instanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).instanceOf(errors.WRONG_ARGUMENTS_USED);
					});
					it('thrown error should be ok with props', () => {
						expect(error.message).exist.and.is.a('string');
						assert.equal(error.message, 'wrong arguments : should use proper invocation : B should be an object');
					});
				}
			});
		});

		describe('chain repeat check', () => {
			const keys1_1 = Object.keys(userTC);
			const keys1_2 = Object.keys(chained);
			const keys2_1 = Object.keys(userWithoutPassword);
			const keys2_2 = Object.keys(derived);
			it('simple chain is ok', () => {
				assert.deepEqual(keys1_1, keys1_2);
				assert.deepEqual(keys2_1, keys2_2);
			});
			it('real chain is ok too', () => {
				assert.deepEqual(rounded.extract(), chained2.extract());
			});
		});

		describe('async chain check', () => {

			var
				syncWAsync1,
				syncWAsync2;

			const etalon1 = {
				WithAdditionalSignSign: 'WithAdditionalSignSign',
				WithoutPasswordSign: 'WithoutPasswordSign',
				async1st: '1_1st',
				description: 'UserTypeConstructor',
				email: 'async@gmail.com',
				password: undefined,
				sign: 'async sign',
				async2nd: '1_2nd',
				sync: '1_is',
				async: '1_3rd',
			};
			const etalon2 = {
				WithAdditionalSignSign: 'WithAdditionalSignSign',
				WithoutPasswordSign: 'WithoutPasswordSign',
				async1st: '2_1st',
				description: 'UserTypeConstructor',
				email: 'async@gmail.com',
				password: undefined,
				sign: 'async sign',
				async2nd: '2_2nd',
				sync: '2_is',
				async: '2_3rd',
			};

			var syncWAsyncChained;

			before(function (done) {

				(async () => {

					// debugger;
					// working one
					syncWAsync1 =
						await (
							(
								await (
									await (

										new UserTypeConstructor({
											email: 'async@gmail.com', password: 32123
										})
											.WithoutPassword()
											.WithAdditionalSign('async sign')

									).AsyncChain1st({ async1st: '1_1st' })

									// after promise
								).AsyncChain2nd({ async2nd: '1_2nd' })
								// sync 2 async
							).Async2Sync2nd({ sync: '1_is' })
						).AsyncChain3rd({ async: '1_3rd' });

					// debugger;
					// working two
					syncWAsync2 = await (

						new UserTypeConstructor({
							email: 'async@gmail.com', password: 32123
						})
							.WithoutPassword()
							.WithAdditionalSign('async sign')

					).AsyncChain1st({ async1st: '1st' })
						// after promise
						.then(async function (instance) {
							return await instance.AsyncChain1st({ async1st: '2_1st' });
						})
						.then(async function (instance) {
							return await instance.AsyncChain2nd({ async2nd: '2_2nd' });
						})
						.then(async function (instance) {
							// sync 2 async
							return await instance.Async2Sync2nd({ sync: '2_is' });
						})
						.then(async function (instance) {
							return await instance.AsyncChain3rd({ async: '2_3rd' });
						});

					// debugger;
					syncWAsyncChained = await /* (await (await sure */
						new UserTypeConstructor({
							email: 'async@gmail.com',
							password: 32123
						})
							.WithoutPassword()
							.WithAdditionalSign('async sign')
							.AsyncChain1st({ async1st: '1st' })
							// after promise
							.AsyncChain2nd({ async2nd: '2nd' })
							.Async2Sync2nd({ sync: 'is' })
							.AsyncChain3rd({ async: '3rd' });

					// debugger;
					done();

				})();

			});
			it('chain should work', () => {

				assert.deepEqual(etalon1, syncWAsync1.extract());
				assert.deepEqual(etalon2, syncWAsync2.extract());

				// debugger;
				const etalon3 = {
					WithAdditionalSignSign: 'WithAdditionalSignSign',
					WithoutPasswordSign: 'WithoutPasswordSign',
					async1st: '1st',
					description: 'UserTypeConstructor',
					email: 'async@gmail.com',
					password: undefined,
					sign: 'async sign',
					async2nd: '2nd',
					sync: 'is',
					async: '3rd',
				};

				assert.deepEqual(etalon3, syncWAsyncChained.extract());
			});
		});

	});

};

module.exports = test;
