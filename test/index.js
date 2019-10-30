'use strict';

const { assert, expect } = require('chai');

const { inspect } = require('util');

const hooksTest = true;
const parseTest = true;
const uncaughtExceptionTest = true;
const asyncConstructionTest = true;

const {
	define,
	defaultTypes: types,
	createNamespace,
	createTypesCollection,
	MNEMONICA,
	URANUS,
	SymbolSubtypeCollection,
	SymbolConstructorName,
	SymbolGaia,
	defaultNamespace,
	utils: {
		extract,
		pick,
		collectConstructors,
		merge
	},
	errors,
} = require('..');

const USER_DATA = {
	email: 'went.out@gmail.com',
	password: 321
};

const UserTypeProto = {
	email: '',
	password: '',
	description: 'UserType'
};

const UserType = define('UserType', function (userData) {
	const {
		email,
		password
	} = userData;
	this.email = email;
	this.password = password;
	return this;
}, UserTypeProto, true);


const userTypeHooksInvocations = [];

UserType.registerHook('preCreation', function (opts) {
	userTypeHooksInvocations.push({
		kind: 'pre',
		sort: 'type',
		self: this,
		opts
	});
});

UserType.registerHook('postCreation', function (opts) {
	userTypeHooksInvocations.push({
		kind: 'post',
		sort: 'type',
		self: this,
		opts
	});
});


const pl1Proto = {
	UserTypePL1: 'UserTypePL_1',
	UserTypePL1Extra: 'UserTypePL_1_Extra',
};

UserType.define(() => {
	const UserTypePL1 = function () {
		this.user_pl_1_sign = 'pl_1';
	};
	UserTypePL1.prototype = pl1Proto;
	return UserTypePL1;
}, true);

const pl2Proto = {
	UserTypePL2: 'UserTypePL_2_AlwaysIncluded'
};
UserType.define(() => {
	class UserTypePL2 {
		constructor() {
			this.user_pl_2_sign = 'pl_2';
		}
		get UserTypePL2() {
			return pl2Proto.UserTypePL2;
		}
	}
	return UserTypePL2;
});

const typesFlowCheckerInvocations = [];
const typesPreCreationInvocations = [];
const typesPostCreationInvocations = [];
const namespaceFlowCheckerInvocations = [];
const namespacePreCreationInvocations = [];
const namespacePostCreationInvocations = [];

types.registerFlowChecker((opts) => {
	typesFlowCheckerInvocations.push(opts);
});

types.registerHook('preCreation', function (opts) {
	typesPreCreationInvocations.push({
		kind: 'pre',
		sort: 'collection',
		self: this,
		opts
	});
});

types.registerHook('postCreation', function (opts) {
	typesPostCreationInvocations.push({
		kind: 'post',
		sort: 'collection',
		self: this,
		opts
	});
});


defaultNamespace.registerFlowChecker((opts) => {
	namespaceFlowCheckerInvocations.push(opts);
});

defaultNamespace.registerHook('preCreation', function (opts) {
	namespacePreCreationInvocations.push({
		kind: 'pre',
		sort: 'namespace',
		self: this,
		opts
	});
});

defaultNamespace.registerHook('postCreation', function (opts) {
	namespacePostCreationInvocations.push({
		kind: 'pre',
		sort: 'namespace',
		self: this,
		order: 'first',
		opts
	});
});

defaultNamespace.registerHook('postCreation', function (opts) {
	namespacePostCreationInvocations.push({
		kind: 'pre',
		sort: 'namespace',
		self: this,
		order: 'second',
		opts
	});
});


const anotherDefaultTypesCollection = createTypesCollection();

const {
	define: adtcDefine
} = anotherDefaultTypesCollection;

const SomeADTCType = adtcDefine('SomeADTCType', function () {
	this.test = 123;
});
const someADTCInstance = new SomeADTCType();


const anotherNamespace = createNamespace('anotherNamespace');
const anotherTypesCollection = createTypesCollection(anotherNamespace);
const oneElseTypesCollection = createTypesCollection(anotherNamespace);

const AnotherCollectionType = anotherTypesCollection.define('AnotherCollectionType', function (check) {
	Object.assign(this, { check });
});
const anotherCollectionInstance = AnotherCollectionType.call(process, 'check');

const OneElseCollectionType = oneElseTypesCollection.define('OneElseCollectionType', function () {
	this.self = this;
});
const oneElseCollectionInstance = new OneElseCollectionType();


const user = new UserType(USER_DATA);
const userPL1 = new user.UserTypePL1();
const userPL2 = new user.UserTypePL2();
const userPL_1_2 = new userPL1.UserTypePL2();
const userPL_NoNew = userPL1.UserTypePL2();


const AsyncType = define('AsyncType', async function (data) {
	return Object.assign(this, {
		data
	});
});

const SubOfAsync = AsyncType.define('SubOfAsync', function (data) {
	Object.assign(this, {
		data
	});
});

const NestedAsyncType = SubOfAsync.define('NestedAsyncType', async function (data) {
	return Object.assign(this, {
		data
	});
}, {
	description: 'nested async instance'
});

const SubOfNestedAsync = NestedAsyncType.define('SubOfNestedAsync', function (data) {
	Object.assign(this, {
		data
	});
});

var SubOfNestedAsyncPostHookData;
SubOfNestedAsync.registerHook('postCreation', function (opts) {
	SubOfNestedAsyncPostHookData = opts;
});



// debugger;
describe('Main Test', () => {

	/*
	UserTypeConstructor and nested types
	*/

	const UserTypeConstructorProto = {
		email: '',
		password: '',
		description: 'UserTypeConstructor'
	};

	const evenMoreNecessaryProps = {
		str: 're-defined EvenMore str',
		EvenMoreSign: 'EvenMoreSign',
		OverMoreSign: 'OverMoreSign',
		sign: 'userWithoutPassword_2.WithAdditionalSign',
		WithAdditionalSignSign: 'WithAdditionalSignSign',
		WithoutPasswordSign: 'WithoutPasswordSign',
		email: 'went.out@gmail.com',
		description: 'UserTypeConstructor',
		password: undefined
	};

	const UserTypeConstructor = define('UserTypeConstructor', function (userData) {
		const {
			email,
			password
		} = userData;

		Object.assign(this, {
			email,
			password
		});

		if (email === USER_DATA.email && password === USER_DATA.password) {

			var self;

			Object.defineProperty(this, 'uncaughtExceptionHandler', {
				get() {
					return function () {
						const extracted = extract(self);
						self.uncaughtExceptionData = extracted;
					};
				}
			});

			Object.defineProperty(this, 'throwTypeError', {
				get() {
					self = this;
					return function () {
						const a = {
							b: 1
						};
						a.b.c.d = 2;
					};
				}
			});
		}


	}, UserTypeConstructorProto);

	const WithoutPasswordProto = {
		WithoutPasswordSign: 'WithoutPasswordSign'
	};

	const UserWithoutPassword = types.UserTypeConstructor.define(() => {
		const WithoutPassword = function () {
			this.password = undefined;
		};
		WithoutPassword.prototype = WithoutPasswordProto;
		return WithoutPassword;
	});

	const WithAdditionalSignProto = {
		WithAdditionalSignSign: 'WithAdditionalSignSign'
	};
	const WithAdditionalSign = UserWithoutPassword.define(() => {
		const WithAdditionalSign = function (sign) {
			this.sign = sign;
		};
		WithAdditionalSign.prototype = WithAdditionalSignProto;
		return WithAdditionalSign;
	});

	const MoreOverProto = {
		MoreOverSign: 'MoreOverSign'
	};
	const MoreOver = WithAdditionalSign.define(() => {
		class MoreOver {
			constructor(str) {
				this.str = str || 'moreover str';
			}
			get MoreOverSign() {
				return MoreOverProto.MoreOverSign;
			}
		}
		return MoreOver;
	});

	const OverMoreProto = {
		OverMoreSign: 'OverMoreSign'
	};
	const OverMore = WithAdditionalSign
		.define('MoreOver.OverMore',
			function (str) {
				this.str = str || 're-defined OverMore str';
			}, OverMoreProto);

	const EvenMoreProto = {
		EvenMoreSign: 'EvenMoreSign'
	};

	WithAdditionalSign.define('MoreOver.OverMore', function () {
		const EvenMore = function (str) {
			this.str = str || 're-defined EvenMore str';
		};
		EvenMore.prototype = Object.assign({}, EvenMoreProto);
		return EvenMore;
	});

	const AsyncChain1st = WithAdditionalSign.define('AsyncChain1st', async function (opts) {
		return Object.assign(this, opts);
	});
	const AsyncChain2nd = AsyncChain1st.define('AsyncChain2nd', async function (opts) {
		return Object.assign(this, opts);
	});
	const Async2Sync2nd = AsyncChain2nd.define('Async2Sync2nd', function (opts) {
		Object.assign(this, opts);
	});
	Async2Sync2nd.define('AsyncChain3rd', async function (opts) {
		return Object.assign(this, opts);
	});


	const EmptyType = define('EmptyType');
	EmptyType.define('EmptySubType', function (sign) {
		this.emptySign = sign || 'DefaultEmptySign';
	});

	// *****************************************************
	// *****************************************************
	// *****************************************************


	// const userTC = new types.UserTypeConstructor(USER_DATA);
	const userTC = new UserTypeConstructor(USER_DATA);

	const userWithoutPassword = new userTC.WithoutPassword();
	const userWithoutPassword_2 = new userTC.WithoutPassword();

	const sign2add = 'userWithoutPassword_2.WithAdditionalSign';
	const userWPWithAdditionalSign = new userWithoutPassword_2
		.WithAdditionalSign(sign2add);

	const moreOverStr = 'moreOver str from test scope';
	const moreOver = userWPWithAdditionalSign.MoreOver(moreOverStr);

	const overMore = moreOver.OverMore();
	const evenMore = overMore.EvenMore();
	const empty = new EmptyType();
	const filledEmptySign = 'FilledEmptySign';
	const emptySub = empty.EmptySubType(filledEmptySign);



	const strFork = 'fork of evenMore';
	const strForkOfFork = 'fork of fork of evenMore';

	const overMoreFork = overMore.fork();

	const evenMoreArgs = evenMore.__args__;

	const evenMoreFork = evenMore.fork(strFork);
	const evenMoreForkFork = evenMoreFork.fork(strForkOfFork);

	const chained = new UserTypeConstructor({ email: 'someother@gmail.com', password: 32123 });
	const derived = new chained.WithoutPassword();
	const rounded = new derived.WithAdditionalSign(sign2add);

	const chained2 = new UserTypeConstructor({ email: 'someother@gmail.com', password: 32123 })
		.WithoutPassword()
		.WithAdditionalSign(sign2add);
		
	const merged = merge(user, overMore);
	debugger;

	require('./test.environment')({
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
		merged
	});

	if (hooksTest) {
		require('./test.hooks')({
			userTypeHooksInvocations,
			namespaceFlowCheckerInvocations,
			typesFlowCheckerInvocations,
			typesPreCreationInvocations,
			typesPostCreationInvocations,
			namespacePreCreationInvocations,
			namespacePostCreationInvocations,
		});
	}


	const checkTypeDefinition = (types, TypeName, proto, useOldStyle) => {
		const parentType = types[SymbolSubtypeCollection];
		const isSubType = parentType ? true : false;
		describe(`initial type declaration ${TypeName}`, () => {
			const def = types[TypeName];
			it('should exist', () => {
				assert.isDefined(def);
			});
			it('and have proper name', () => {
				assert.ok(def.TypeName === TypeName);
			});
			it('.subtypes must be an object', () => {
				assert.isObject(def.subtypes);
			});
			if (proto) {
				it('.proto must be equal with definition', () => {
					assert.deepEqual(def.proto, proto);
					assert.deepEqual(proto, def.proto);
				});
			}
			it(`and declared as proper SubType : ${def.isSubType} `, () => {
				assert.equal(def.isSubType, isSubType);
			});
			it(`will force use of proper style contructor : ${useOldStyle}`, () => {
				assert.equal(def.useOldStyle, useOldStyle);
			});
			it('contructor exists', () => {
				assert.isFunction(def.constructHandler);
			});
		});
	};

	describe('Type Definitions Tests', () => {
		[
			[types, 'UserType', UserTypeProto, true],
			[UserType.subtypes, 'UserTypePL1', pl1Proto, false],
			[UserType.subtypes, 'UserTypePL2'],
			[types, 'UserTypeConstructor', UserTypeConstructorProto],
			[types.UserTypeConstructor.subtypes, 'WithoutPassword', WithoutPasswordProto],
			[UserWithoutPassword.subtypes, 'WithAdditionalSign', WithAdditionalSignProto],
			[WithAdditionalSign.subtypes, 'MoreOver'],
			[MoreOver.subtypes, 'OverMore', OverMoreProto],
			[OverMore.subtypes, 'EvenMore', EvenMoreProto],
		].forEach(entry => {
			const [types, def, proto, useOldStyle] = entry;
			checkTypeDefinition(types, def, proto, useOldStyle || false);
		});
	});


	describe('Instance Constructors Tests', () => {

		it('type constructor itself is correct', () => {
			assert.instanceOf(user, types.UserType);
			assert.equal(types.UserType.__type__, UserType.__type__);
		});
		it('actually do construction', () => {
			assert.instanceOf(user, UserType);
			assert.instanceOf(user, types.UserType);
		});
		it('.constructor.name is correct', () => {
			assert.equal(user.constructor.name, 'UserType');
		});
		it('.prototype is correct', () => {
			assert.deepEqual(user.constructor.prototype, UserTypeProto);
		});

		it('.SubTypes definition is correct 20XX', () => {
			expect(user.hasOwnProperty('UserTypePL1')).is.false;
			expect(user.hasOwnProperty('UserTypePL2')).is.false;
		});
		it('.SubTypes definition is correct  20XX First Child', () => {
			expect(Object.getPrototypeOf(Object.getPrototypeOf(user)).hasOwnProperty('UserTypePL1')).is.true;
			expect(Object.getPrototypeOf(Object.getPrototypeOf(user)).hasOwnProperty('UserTypePL2')).is.true;
		});


		describe('empty constructor works properly', () => {
			it('should construct an object', () => {
				assert.isDefined(empty);
				assert.isObject(empty);
			});
			it('nested object of empty object is well', () => {
				assert.isDefined(emptySub);
				assert.isObject(emptySub);
			});
			it('nested object of empty object rules are ok', () => {
				assert.isTrue(emptySub.hasOwnProperty('emptySign'));
				assert.isDefined(emptySub.emptySign);
				assert.isString(emptySub.emptySign);
				assert.equal(emptySub.emptySign, filledEmptySign);
			});
			it('nested object of empty object .extract() ok', () => {
				const sample = {
					emptySign: filledEmptySign
				};
				const extracted = emptySub.extract();
				assert.deepOwnInclude(extracted, sample);
				assert.deepOwnInclude(sample, extracted);
			});
			it('nested object of empty object .pick() ok', () => {
				const sample = {
					emptySign: filledEmptySign
				};
				const pickedArg = emptySub.pick('emptySign');
				const pickedArR = emptySub.pick(['emptySign']);
				assert.deepOwnInclude(pickedArg, sample);
				assert.deepOwnInclude(sample, pickedArg);
				assert.deepOwnInclude(pickedArR, sample);
				assert.deepOwnInclude(sample, pickedArR);
			});
		});

		describe('instancof checks', () => {
			it('userWithoutPassword instanceof userTC', () => {
				expect(userWithoutPassword).to.be.an.instanceof(userTC);
			});
			it('userTC NOT instanceof userWithoutPassword', () => {
				expect(userTC).not.to.be.an.instanceof(userWithoutPassword);
			});
			it('other instances in chain should follow the rules', () => {
				expect(evenMore).to.be.an.instanceof(userTC);
				expect(evenMore).to.be.an.instanceof(userWithoutPassword);
			});
		});

		describe('util.inspect tests', () => {

			it('should have proper util inspect 4 UserType', () => {
				expect(inspect(user).indexOf('UserType')).equal(0);
			});

			it('should have proper util inspect 4 UserTypeConstructor', () => {
				expect(inspect(userTC).indexOf('UserTypeConstructor')).equal(0);
			});

			it('should have proper util inspect 4 WithoutPassword', () => {
				expect(inspect(userWithoutPassword).indexOf('WithoutPassword')).equal(0);
				expect(inspect(userWithoutPassword_2).indexOf('WithoutPassword')).equal(0);
			});

			it('should have proper util inspect 4 WithAdditionalSign', () => {
				expect(inspect(userWPWithAdditionalSign).indexOf('WithAdditionalSign')).equal(0);
			});

			it('should have proper util inspect 4 MoreOver', () => {
				expect(inspect(moreOver).indexOf('MoreOver')).equal(0);
			});

			it('should have proper util inspect 4 OverMore', () => {
				expect(inspect(overMore).indexOf('OverMore')).equal(0);
			});

			it('should have proper util inspect 4 EvenMore', () => {
				expect(inspect(evenMore).indexOf('EvenMore')).equal(0);
			});

		});

		describe('errors tests', () => {
			it('should throw on wrong instance 4 .extract()', () => {
				expect(() => {
					extract(null);
				}).to.throw();
			});
			try {
				extract(null);
			} catch (error) {
				it('thrown by extract(null) should be ok with instanceof', () => {
					expect(error).to.be.an
						.instanceof(errors
							.WRONG_INSTANCE_INVOCATION);
					expect(error).to.be.an
						.instanceof(Error);
				});
				it('thrown error should be ok with props', () => {
					expect(error.BaseStack).exist.and.is.a('string');
					expect(error.constructor[SymbolConstructorName])
						.exist.and.is.a('string')
						.and.equal(`base of : ${MNEMONICA} : errors`);
				});
			}

			it('should throw on wrong instance 4 .pick()', () => {
				expect(() => {
					pick(null);
				}).to.throw();
			});
			try {
				pick(null);
			} catch (error) {
				it('thrown by pick(null) should be ok with instanceof', () => {
					expect(error).to.be.an
						.instanceof(errors
							.WRONG_INSTANCE_INVOCATION);
					expect(error).to.be.an
						.instanceof(Error);
				});
				it('thrown error should be ok with props', () => {
					expect(error.BaseStack).exist.and.is.a('string');
					expect(error.constructor[SymbolConstructorName])
						.exist.and.is.a('string')
						.and.equal(`base of : ${MNEMONICA} : errors`);
				});
			}
			it('should throw on wrong instance 4 .collectConstructors()', () => {
				expect(() => {
					collectConstructors(null);
				}).to.throw();
			});
			try {
				collectConstructors(null);
			} catch (error) {
				it('thrown by collectConstructors(null) should be ok with instanceof', () => {
					expect(error).to.be.an
						.instanceof(errors
							.WRONG_MODIFICATION_PATTERN);
					expect(error).to.be.an
						.instanceof(Error);
				});
			}

		});
		
		if (parseTest) {
			require('./test.parse')({
				user,
				userPL1,
				userPL2,
				userTC,
				evenMore,
				EmptyType,
			});
		}

		require('./test.nested')({
			user,
			userPL1,
			userPL2,
			pl1Proto,
			pl2Proto,
			userPL_NoNew,
			userPL_1_2,
			UserTypeProto,
			USER_DATA,
		});

		require('./test.nested.more')({
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
		});

		require('./test.instance.proto')({
			user,
			userPL1,
			userTC,
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
			userWithoutPassword,
			userWPWithAdditionalSign
		});

		if (asyncConstructionTest) {
			describe('Async Constructors Test', () => {
				var asyncInstance,
					asyncInstancePromise,
					asyncSub,
					nestedAsyncInstance,
					nestedAsyncSub,
					asyncInstanceClone,
					asyncInstanceFork;

				before(function (done) {
					const wait = async function () {
						asyncInstancePromise = new AsyncType.call(process, 'tada');
						asyncInstance = await asyncInstancePromise;
						asyncSub = asyncInstance.SubOfAsync('some');
						nestedAsyncInstance = await new asyncSub
							.NestedAsyncType('nested');
						nestedAsyncSub = nestedAsyncInstance
							.SubOfNestedAsync('done');
							
						asyncInstanceClone = await asyncInstance.clone;
						asyncInstanceFork = await asyncInstance.fork('dada');
						done();
					};
					wait();
				});

				it('should be able to construct async', () => {
					expect(asyncInstance.data).equal('tada');
					expect(asyncInstanceClone.data).equal('tada');
					expect(asyncInstanceFork.data).equal('dada');
				});

				it('should be able to construct nested async', () => {
					expect(asyncInstancePromise).instanceof(Promise);
					expect(asyncInstancePromise).instanceof(AsyncType);
					expect(asyncInstance).instanceof(AsyncType);
					expect(asyncInstanceClone).instanceof(AsyncType);
					expect(asyncInstanceFork).instanceof(AsyncType);
					expect(asyncInstanceFork).instanceof(AsyncType);
					expect(typeof asyncInstance.on === 'function').is.true;
					expect(Object.getPrototypeOf(asyncInstance[SymbolGaia]) === process).is.true;
					debugger;
					expect(asyncInstance[SymbolGaia][MNEMONICA] === URANUS).is.true;
					expect(nestedAsyncInstance).instanceof(AsyncType);
					expect(nestedAsyncInstance).instanceof(NestedAsyncType);
					expect(nestedAsyncSub).instanceof(AsyncType);
					expect(nestedAsyncSub).instanceof(SubOfAsync);
					expect(nestedAsyncSub).instanceof(NestedAsyncType);
					expect(nestedAsyncSub).instanceof(SubOfNestedAsync);
					expect(SubOfNestedAsyncPostHookData
						.existentInstance)
						.equal(nestedAsyncInstance);

					expect(SubOfNestedAsyncPostHookData
						.inheritedInstance)
						.equal(nestedAsyncSub);

					expect(nestedAsyncInstance.data).equal('nested');
					expect(nestedAsyncInstance.description)
						.equal('nested async instance');
				});

			});
		}

		if (uncaughtExceptionTest) {
			describe('uncaughtException test', () => {
				it('should throw proper error', (passedCb) => {
					setTimeout(() => {

						process.removeAllListeners('uncaughtException');

						process.on('uncaughtException', userTC.uncaughtExceptionHandler);
						const onUncaughtException = function () {
							assert.deepOwnInclude(
								evenMore.uncaughtExceptionData,
								evenMoreNecessaryProps
							);
							passedCb();
						};
						process.on('uncaughtException', onUncaughtException);
						evenMore.throwTypeError();

					}, 100);
				});
			});
		}

	});
});
