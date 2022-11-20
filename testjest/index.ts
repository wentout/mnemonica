'use strict';

const mnemonica = require('..');
const { mnemonica: _mnemonica } = mnemonica;

describe('props tests', () => {

	test('base instance has props', () => {
		expect(mnemonica).not.toBeInstanceOf(Object);
		expect(mnemonica instanceof Object).not.toBe(true);
		expect(_mnemonica).toBeInstanceOf(Object);
		expect(_mnemonica instanceof Object).toBe(true);
	});

});

const {
	inspect,
	callbackify,
	promisify
} = require('util');

const ogp = Object.getPrototypeOf;
const hop = (o: unknown, p: string) => Object.prototype.hasOwnProperty.call(o, p);

const hooksTest = true;
const parseTest = true;
const uncaughtExceptionTest = false;
const asyncConstructionTest = true;

debugger;
const {
	define,
	tsdefine,
	defaultTypes: types,
	createNamespace,
	createTypesCollection,
	MNEMONICA,
	URANUS,
	SymbolSubtypeCollection,
	SymbolConstructorName,
	SymbolGaia,
	SymbolConfig,
	defaultNamespace,
	utils: {
		extract,
		pick,
		collectConstructors,
		merge,
		parse
	},
	errors,
} = mnemonica;

const USER_DATA = {
	email: 'went.out@gmail.com',
	password: 321
};

type TUserData = typeof USER_DATA;

const UserTypeProto = {
	email: '',
	password: '',
	description: 'UserType'
};

const UserType = mnemonica.define('UserType', function (this: TUserData, userData: TUserData) {
	const {
		email,
		password
	} = userData;
	this.email = email;
	this.password = password;
	return this;
}, UserTypeProto, true);
// debugger;

const userTypeHooksInvocations: any[] = [];

UserType.registerHook('preCreation', function (this: unknown, opts: unknown) {
	userTypeHooksInvocations.push({
		kind: 'pre',
		sort: 'type',
		self: this,
		opts
	});
});

UserType.registerHook('postCreation', function (this: unknown, opts: unknown) {
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
	const UserTypePL1 = function (this: { user_pl_1_sign: string }) {
		this.user_pl_1_sign = 'pl_1';
	};
	UserTypePL1.prototype = pl1Proto;
	return UserTypePL1;
}, {
	strictChain: false,
	submitStack: true
});

const pl2Proto = {
	UserTypePL2: 'UserTypePL_2_AlwaysIncluded'
};


const shaperFactory = () => {
	return class Shaper {
		shape: number;
		constructor() {
			// const zzz = new.target;
			// Shaper;
			// debugger;
			this.shape = 123;
		}
	};
};

UserType.define(() => {
	// const Shaper = shaperFactory(true);
	const Shaper = shaperFactory();
	class UserTypePL2 extends Shaper {
		user_pl_2_sign: string;
		constructor() {
			// debugger;
			super();
			// const zzz = new.target;
			// Shaper;
			// debugger;
			this.user_pl_2_sign = 'pl_2';
		}
		get UserTypePL2() {
			return pl2Proto.UserTypePL2;
		}
		getSign() {
			return this.user_pl_2_sign;
		}
	}
	// @ts-ignore
	UserTypePL2.Shaper = Shaper;
	return UserTypePL2;
}, {
	useOldStyle: true,
	strictChain: false
});


const ProxyTyped = function (this: { str: string }, str: string) {
	this.str = str;
};
ProxyTyped.prototype = {
	proxyTyped: true,
	SaySomething() {
		return `something : ${this.proxyTyped}`;
	}
};
Object.assign(UserType, {
	ProxyTyped
});


const typesFlowCheckerInvocations: any[] = [];
const typesPreCreationInvocations: any[] = [];
const typesPostCreationInvocations: any[] = [];
const namespaceFlowCheckerInvocations: any[] = [];
const namespacePreCreationInvocations: any[] = [];
const namespacePostCreationInvocations: any[] = [];

types.registerFlowChecker((opts: unknown) => {
	typesFlowCheckerInvocations.push(opts);
});

types.registerHook('preCreation', function (this: unknown, opts: unknown) {
	typesPreCreationInvocations.push({
		kind: 'pre',
		sort: 'collection',
		self: this,
		opts
	});
});

types.registerHook('postCreation', function (this: unknown, opts: unknown) {
	typesPostCreationInvocations.push({
		kind: 'post',
		sort: 'collection',
		self: this,
		opts
	});
});

defaultNamespace.registerFlowChecker((opts: unknown) => {
	namespaceFlowCheckerInvocations.push(opts);
});

defaultNamespace.registerHook('preCreation', function (this: unknown, opts: unknown) {
	namespacePreCreationInvocations.push({
		kind: 'pre',
		sort: 'namespace',
		self: this,
		opts
	});
});

defaultNamespace.registerHook('postCreation', function (this: unknown, opts: unknown) {
	namespacePostCreationInvocations.push({
		kind: 'pre',
		sort: 'namespace',
		self: this,
		order: 'first',
		opts
	});
});

defaultNamespace.registerHook('postCreation', function (this: unknown, opts: unknown) {
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

const SomeADTCType = adtcDefine('SomeADTCType', function (this: { test: number }) {
	this.test = 123;
});

const someADTCInstance = new SomeADTCType();

const anotherNamespace = createNamespace('anotherNamespace');
const anotherTypesCollection = createTypesCollection(anotherNamespace, 'another types collection');
const oneElseTypesCollection = createTypesCollection(anotherNamespace);

const AnotherCollectionType = anotherTypesCollection.define('AnotherCollectionType', function (this: object, check: unknown) {
	Object.assign(this, { check });
});

//@ts-ignore
process.TestForAddition = 'passed';
const anotherCollectionInstance = AnotherCollectionType.apply(process, ['check']);

const OneElseCollectionType = oneElseTypesCollection.define('OneElseCollectionType', function (this: { self: ThisType<unknown> }) {
	this.self = this;
});
const oneElseCollectionInstance = new OneElseCollectionType();

const user = UserType(USER_DATA);
const userPL1 = new user.UserTypePL1();
const userPL2 = new user.UserTypePL2();

try {
	var userPL_1_2 = new userPL1.UserTypePL2();
} catch (err) { console.error(err); }
try {
	var userPL_NoNew = userPL1.UserTypePL2();
} catch (err) { console.error(err); }

const AsyncWOReturn = define('AsyncWOReturn', async function () { });

const AsyncWOReturnNAR = define('AsyncWOReturnNAR', async function () { }, {}, {
	awaitReturn: false
});

const Main = define('Main', function (this: any) {
	this.constructNested = function (this: any) {
		return new this.NestedConstruct();
	};
});
const NestedConstruct = Main.define('NestedConstruct', function (this: any) {
	// 1. direct
	// throw new Error('Nested Constructor Special Error');
	// 2. sub
	this.nested = new this.NestedSubError(123);
});
NestedConstruct.define('NestedSubError', function (this: any, ...args: any[]) {
	this.args = args;
	debugger;
	throw new Error('Nested SubError Constructor Special Error');
});

types[SymbolConfig].bindedProto = false;
const AsyncType = tsdefine('AsyncType', async function (this: any, data: unknown) {
	return Object.assign(this, {
		arg123: 123
	}, {
		data
	});
}, {
	getThisPropMethod: function (propName: string) {
		if (new.target) {
			this[propName] = propName;
			return this;
		}
		if (this[propName]) {
			return this[propName];
		}
		throw new Error('prop is missing');

	},

	erroredNestedConstructMethod() {
		// will throw RangeError : max stack size
		debugger;
		const main = new Main();
		main.nested = main.constructNested();
	},

	async erroredAsyncMethod(error: any) {
		const result = error === undefined ? new Error('async error') : error;
		throw result;
	}

}, {
	bindedProto: true
});

AsyncType.SubOfAsync = function (data: unknown) {
	this.arg123 = 321;
	Object.assign(this, {
		data
	});
};
AsyncType.SubOfAsync.registerHook('postCreation', (hookData: any) => {
	hookData.bindProtoMethods();
	hookData.bindMethod('hookedMethod', function (this: any, propName: string) {
		return this[propName];
	});
});

types[SymbolConfig].bindedProto = true;

AsyncType.SubOfAsync.NestedAsyncType = async function (data: unknown) {
	return Object.assign(this, {
		data
	});
};
AsyncType.SubOfAsync.NestedAsyncType.prototype = {
	description: 'nested async instance'
};
const { NestedAsyncType } = AsyncType.SubOfAsync;

const SubOfNestedAsync = NestedAsyncType.define('SubOfNestedAsync', function (this: any, data: any) {
	Object.assign(this, {
		data
	});
	this.arg123 = 456;
}, {}, { bindedProto: false });

var SubOfNestedAsyncPostHookData: any;
SubOfNestedAsync.registerHook('postCreation', function (opts: unknown) {
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

	// const evenMoreNecessaryProps = {
	// 	str: 're-defined EvenMore str',
	// 	EvenMoreSign: 'EvenMoreSign',
	// 	OverMoreSign: 'OverMoreSign',
	// 	sign: 'userWithoutPassword_2.WithAdditionalSign',
	// 	WithAdditionalSignSign: 'WithAdditionalSignSign',
	// 	WithoutPasswordSign: 'WithoutPasswordSign',
	// 	email: 'went.out@gmail.com',
	// 	description: 'UserTypeConstructor',
	// 	password: undefined
	// };

	const UserTypeConstructor = define('UserTypeConstructor', function (this: any, userData: TUserData) {
		const {
			email,
			password
		} = userData;

		Object.assign(this, {
			email,
			password
		});

	}, UserTypeConstructorProto, {
		submitStack: true
	});

	const WithoutPasswordProto = {
		WithoutPasswordSign: 'WithoutPasswordSign'
	};

	// debugger;

	const UserWithoutPassword = types.UserTypeConstructor.define(() => {
		const WithoutPassword = function (this: any) {
			this.password = undefined;
		};
		WithoutPassword.prototype = WithoutPasswordProto;
		return WithoutPassword;
	}, {
		submitStack: true
	});

	const WithAdditionalSignProto = {
		WithAdditionalSignSign: 'WithAdditionalSignSign'
	};
	const WithAdditionalSignTypeDef = UserWithoutPassword.define(() => {
		const WithAdditionalSign = function (this: any, sign: string) {
			this.sign = sign;
		};
		WithAdditionalSign.prototype = WithAdditionalSignProto;
		return WithAdditionalSign;
	}, {
		submitStack: true
	});

	const MoreOverProto = {
		MoreOverSign: 'MoreOverSign'
	};
	const MoreOverTypeDef = WithAdditionalSignTypeDef.define(() => {
		class MoreOver {
			str: string;;
			constructor(str: string) {
				this.str = str || 'moreover str';
			}
			get MoreOverSign() {
				return MoreOverProto.MoreOverSign;
			}
		}
		return MoreOver;
	}, {
		submitStack: true
	});

	const OverMoreProto = {
		OverMoreSign: 'OverMoreSign'
	};
	// debugger;
	const OverMore = WithAdditionalSignTypeDef
		.define('MoreOver.OverMore',
			function (this: any, str: string) {
				this.str = str || 're-defined OverMore str';
			}, OverMoreProto, {
			submitStack: true
		});

	const EvenMoreProto = {
		EvenMoreSign: 'EvenMoreSign'
	};

	//@ts-ignore
	const EvenMoreTypeDef = WithAdditionalSignTypeDef.define(`
		MoreOver . OverMore
	`, function () {
		const EvenMore = function (this: any, str: string) {
			this.str = str || 're-defined EvenMore str';
		};
		EvenMore.prototype = Object.assign({}, EvenMoreProto);
		return EvenMore;
	}, {}, {
		submitStack: true
	});

	// if (uncaughtExceptionTest) {
	// 	const ThrowTypeError = EvenMoreTypeDef.define('ThrowTypeError', require('./throw-type-error'));
	// }


	const AsyncChain1st = WithAdditionalSignTypeDef.define('AsyncChain1st', async function (this: any, opts: any) {
		return Object.assign(this, opts);
	}, {}, {
		submitStack: true
	});
	const AsyncChain2nd = AsyncChain1st.define('AsyncChain2nd', async function (this: any, opts: any) {
		return Object.assign(this, opts);
	}, {}, {
		submitStack: true
	});
	const Async2Sync2nd = AsyncChain2nd.define('Async2Sync2nd', function (this: any, opts: any) {
		Object.assign(this, opts);
	}, {}, {
		submitStack: true
	});
	Async2Sync2nd.define('AsyncChain3rd', async function (this: any, opts: any) {
		return Object.assign(this, opts);
	}, {}, {
		submitStack: true
	});


	const EmptyType = define('EmptyType');
	EmptyType.define('EmptySubType', function (this: any, sign: string) {
		this.emptySign = sign || 'DefaultEmptySign';
	});

	// *****************************************************
	// *****************************************************
	// *****************************************************


	// const userTC = new types.UserTypeConstructor(USER_DATA);
	const userTC = new UserTypeConstructor(USER_DATA);

	// const FORK_CALL_DATA = {
	// 	email: 'forkmail@gmail.com',
	// 	password: '54321'
	// };

	// const userTCForkCall = userTC.fork.call(user, FORK_CALL_DATA);
	// const userTCForkApply = userTC.fork.apply(user, [
	// 	FORK_CALL_DATA
	// ]);
	// const userTCForkBind = userTC.fork.bind(user)(FORK_CALL_DATA);
	// const utcfcwp = userTCForkCall.WithoutPassword();

	// check unchained construction
	// const unchainedUserWithoutPassword = new UserWithoutPassword();

	const userWithoutPassword = new userTC.WithoutPassword();
	// debugger;
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

	// const evenMoreForkCall = evenMore.fork.call(user, USER_DATA);

	// const strFork = 'fork of evenMore';
	// const strForkOfFork = 'fork of fork of evenMore';

	// const overMoreFork = overMore.fork();

	// const overMoreCallEvenMoreUndefined = overMore.EvenMore.call(undefined);
	// const overMoreCallEvenMoreNull = overMore.EvenMore.call(null);
	// const overMoreCallEvenMoreNumber = overMore.EvenMore.call(new Number(5));
	// const overMoreCallEvenMoreString = overMore.EvenMore.call(new String(5));
	// const overMoreCallEvenMoreBoolean = overMore.EvenMore.call(new Boolean(5));
	// const overMoreCallEvenMoreProcess = overMore.EvenMore.call(process);

	// const evenMoreArgs = evenMore.__args__;
	// const evenMoreFork = evenMore.fork(strFork);
	// const evenMoreForkFork = evenMoreFork.fork(strForkOfFork);

	// const chained = new UserTypeConstructor({ email: 'someother@gmail.com', password: 32123 });
	// const derived = new chained.WithoutPassword();
	// const rounded = new derived.WithAdditionalSign(sign2add);

	// const chained2 = new UserTypeConstructor({ email: 'someother@gmail.com', password: 32123 })
	// 	.WithoutPassword()
	// 	.WithAdditionalSign(sign2add);

	// const merged = merge(user, overMore, FORK_CALL_DATA);

	// const userTCdirectDAG = UserTypeConstructor.call(new Boolean(5), FORK_CALL_DATA);
	// const userTCforkDAG = userTC.fork.call(new Boolean(5), FORK_CALL_DATA);

	// require('./environment')({
	// 	user,
	// 	userTC,
	// 	UserType,
	// 	overMore,
	// 	moreOver,
	// 	anotherDefaultTypesCollection,
	// 	someADTCInstance,
	// 	anotherNamespace,
	// 	anotherTypesCollection,
	// 	oneElseTypesCollection,
	// 	anotherCollectionInstance,
	// 	AnotherCollectionType,
	// 	oneElseCollectionInstance,
	// 	OneElseCollectionType,
	// 	userWithoutPassword,
	// 	UserWithoutPassword,
	// 	unchainedUserWithoutPassword,
	// 	UserTypeConstructor,
	// 	chained,
	// 	derived,
	// 	rounded,
	// 	chained2,
	// 	merged
	// });

	// require('./async.chain')({
	// 	UserType,
	// 	UserTypeConstructor,
	// 	AsyncWOReturn,
	// 	AsyncWOReturnNAR,
	// });


	// if (hooksTest) {
	// 	require('./hooks')({
	// 		userTypeHooksInvocations,
	// 		namespaceFlowCheckerInvocations,
	// 		typesFlowCheckerInvocations,
	// 		typesPreCreationInvocations,
	// 		typesPostCreationInvocations,
	// 		namespacePreCreationInvocations,
	// 		namespacePostCreationInvocations,
	// 	});
	// }


	const checkTypeDefinition = (_types: any, TypeName: string, proto: any, useOldStyle: boolean) => {
		const parentType = _types[SymbolSubtypeCollection];
		const isSubType = parentType ? true : false;
		describe(`initial type declaration ${TypeName}`, () => {
			const def = _types.get(TypeName);
			it('should exist', () => {
				expect(def).not.toEqual(undefined);
			});
			it('and have proper name', () => {
				expect(def.TypeName).toStrictEqual(TypeName);
			});
			it('.subtypes must be Map', () => {
				expect(def.subtypes).toBeInstanceOf(Map);
			});
			if (proto) {
				it('.proto must be equal with definition', () => {
					expect(def.proto).toEqual(proto);
					expect(proto).toEqual(def.proto);
				});
			}
			it(`and declared as proper SubType : ${def.isSubType} `, () => {
				expect(def.isSubType).toEqual(isSubType);
				expect(isSubType).toEqual(def.isSubType);
			});
			it(`will force use of proper style contructor for ${TypeName} as: ${useOldStyle}`, () => {
				expect(def.config.useOldStyle).toEqual(useOldStyle);
			});
			it('contructor exists', () => {
				expect(def.constructHandler).toBeInstanceOf(Function);
			});
		});
	};

	describe('Type Definitions Tests', () => {
		[
			[types.subtypes, 'UserType', UserTypeProto, true],
			[UserType.subtypes, 'UserTypePL1', pl1Proto, false],
			[UserType.subtypes, 'UserTypePL2'],
			[types.subtypes, 'UserTypeConstructor', UserTypeConstructorProto],
			[types.UserTypeConstructor.subtypes, 'WithoutPassword', WithoutPasswordProto],
			[UserWithoutPassword.subtypes, 'WithAdditionalSign', WithAdditionalSignProto],
			[WithAdditionalSignTypeDef.subtypes, 'MoreOver'],
			[MoreOverTypeDef.subtypes, 'OverMore', OverMoreProto],
			[OverMore.subtypes, 'EvenMore', EvenMoreProto],
		].forEach(entry => {
			const [_types, def, proto, useOldStyle] = entry;
			checkTypeDefinition(_types, def, proto, useOldStyle || false);
		});
	});


	describe('Instance Constructors Tests', () => {

		it('type constructor itself is correct', () => {
			expect(user).toBeInstanceOf(types.UserType);
			expect(types.UserType.__type__).toEqual(UserType.__type__);
		});
		it('actually do construction', () => {
			expect(user).toBeInstanceOf(UserType);
			expect(user).toBeInstanceOf(types.UserType);
		});
		it('.constructor.name is correct', () => {
			expect(user.constructor.name).toEqual('UserType');
		});
		it('.prototype is correct', () => {
			expect(user.constructor.prototype).toEqual(UserTypeProto);
		});

		it('.SubTypes definition is correct 20XX', () => {
			expect(hop(user, 'UserTypePL1')).toBeFalsy();
			expect(hop(user, 'UserTypePL2')).toBeFalsy();
		});
		it('.SubTypes definition is correct  20XX First Child', () => {
			expect(user.__subtypes__.has('UserTypePL1')).toEqual(true);
			expect(user.__subtypes__.has('UserTypePL2')).toEqual(true);
			const oogpuser = ogp(ogp(user));
			// 0.8.4 -- changed interface, no more methods inside of prototype chain
			// expect(hop(oogpuser, 'UserTypePL1')).toEqual(true);
			// expect(hop(oogpuser, 'UserTypePL2')).toEqual(true);
			// but we still can check __subtypes__
			expect(oogpuser.__subtypes__.has('UserTypePL2')).toEqual(true);
			expect(oogpuser.__subtypes__.has('UserTypePL2')).toEqual(true);
		});


		describe('empty constructor works properly', () => {
			it('should construct an object', () => {
				expect(empty).not.toEqual(undefined);
				expect(empty).toBeInstanceOf(Object);
			});
			it('nested object of empty object is well', () => {
				expect(emptySub).not.toEqual(undefined);
				expect(emptySub).toBeInstanceOf(Object);
			});
			it('nested object of empty object rules are ok', () => {
				expect(hop(emptySub, 'emptySign')).toEqual(true);
				expect(emptySub.emptySign).not.toEqual(undefined);
				expect(typeof emptySub.emptySign).toEqual('string');
				expect(emptySub.emptySign).toEqual(filledEmptySign);
			});
			it('nested object of empty object .extract() ok', () => {
				const sample = {
					emptySign: filledEmptySign
				};
				const extracted = emptySub.extract();
				expect(extracted).toEqual(sample);
				expect(sample).toEqual(extracted);
			});
			it('nested object of empty object .pick() ok', () => {
				const sample = {
					emptySign: filledEmptySign
				};
				const pickedArg = emptySub.pick('emptySign');
				const pickedArR = emptySub.pick(['emptySign']);
				expect(pickedArg).toEqual(sample);
				expect(sample).toEqual(pickedArg);
				expect(pickedArR).toEqual(sample);
				expect(sample).toEqual(pickedArR);
			});
		});

		describe('instancof checks', () => {
			it('userWithoutPassword instanceof userTC', () => {
				expect(userWithoutPassword instanceof userTC).toEqual(true);
			});
			it('userTC NOT instanceof userWithoutPassword', () => {
				expect(userTC instanceof userWithoutPassword).toEqual(false);
			});
			it('other instances in chain should follow the rules', () => {
				expect(evenMore instanceof userTC).toEqual(true);
				expect(evenMore instanceof userWithoutPassword).toEqual(true);
			});
		});

		describe('util.inspect tests', () => {

			it('should have proper util inspect 4 UserType', () => {
				expect(inspect(user).indexOf('UserType')).toEqual(0);
			});

			it('should have proper util inspect 4 UserTypeConstructor', () => {
				expect(inspect(userTC).indexOf('UserTypeConstructor')).toEqual(0);
			});

			it('should have proper util inspect 4 WithoutPassword', () => {
				expect(inspect(userWithoutPassword).indexOf('WithoutPassword')).toEqual(0);
				expect(inspect(userWithoutPassword_2).indexOf('WithoutPassword')).toEqual(0);
			});

			it('should have proper util inspect 4 WithAdditionalSign', () => {
				expect(inspect(userWPWithAdditionalSign).indexOf('WithAdditionalSign')).toEqual(0);
			});

			it('should have proper util inspect 4 MoreOver', () => {
				expect(inspect(moreOver).indexOf('MoreOver')).toEqual(0);
			});

			it('should have proper util inspect 4 OverMore', () => {
				expect(inspect(overMore).indexOf('OverMore')).toEqual(0);
			});

			it('should have proper util inspect 4 EvenMore', () => {
				expect(inspect(evenMore).indexOf('EvenMore')).toEqual(0);
			});

		});

		describe('errors tests', () => {
			it('should throw on wrong instance 4 .extract()', () => {
				expect(() => {
					extract(null);
				}).toThrow();
			});
			try {
				extract(null);
			} catch (error: any) {
				it('thrown by extract(null) should be ok with instanceof', () => {
					expect(error).toBeInstanceOf(errors.WRONG_INSTANCE_INVOCATION);
					expect(error).toBeInstanceOf(Error);
				});
				it('thrown error should be ok with props', () => {
					expect(typeof error.BaseStack).toEqual('string');
					expect(typeof error.constructor[SymbolConstructorName])
						.toEqual('string');
					expect(error.constructor[SymbolConstructorName])
						.toEqual(`base of : ${MNEMONICA} : errors`);
				});
			}

			it('should throw on wrong instance 4 .pick()', () => {
				expect(() => {
					pick(null);
				}).toThrow();
			});
			try {
				pick(null);
			} catch (error: any) {
				it('thrown by pick(null) should be ok with instanceof', () => {
					expect(error).toBeInstanceOf(errors.WRONG_INSTANCE_INVOCATION);
					expect(error).toBeInstanceOf(Error);
				});
				it('thrown error should be ok with props', () => {
					expect(typeof error.BaseStack).toEqual('string');
					expect(typeof error.constructor[SymbolConstructorName])
						.toEqual('string');
					expect(error.constructor[SymbolConstructorName])
						.toEqual(`base of : ${MNEMONICA} : errors`);
				});
			}
			[
				undefined,
				null,
				true,
				false,
				NaN,
				+0,
				-0,
				// eslint-disable-next-line no-undef
				BigInt(0),
				Symbol('azaza'),
				new Proxy({}, {}),
				new Date(),
				new Set(),
				new Map(),
				new WeakMap(),
				new WeakSet(),
				[],
				{}
			].forEach((value, idx) => {
				it(`should not throw on wrong instance 4 .collectConstructors() ${typeof value}`, () => {
					let collected;
					expect(() => {
						collected = collectConstructors(value, true);
					}).not.toThrow();
					expect(Array.isArray(collected)).toEqual(true);
					// ! typeof object
					if (idx < 9) {
						// @ts-ignore
						expect(collected.length).toStrictEqual(0);
					}
				});
			});
		});

		// if (parseTest) {
		// 	require('./parse')({
		// 		user,
		// 		userPL1,
		// 		userPL2,
		// 		userTC,
		// 		evenMore,
		// 		EmptyType,
		// 	});
		// }

		// require('./nested')({
		// 	user,
		// 	userPL1,
		// 	userPL2,
		// 	pl1Proto,
		// 	pl2Proto,
		// 	userPL_1_2,
		// 	userPL_NoNew,
		// 	UserTypeProto,
		// 	USER_DATA
		// });

		// require('./nested.more')({
		// 	userTC,
		// 	UserType,
		// 	evenMore,
		// 	USER_DATA,
		// 	moreOver,
		// 	overMore,
		// 	OverMore,
		// 	UserTypeConstructorProto,
		// 	userWithoutPassword,
		// 	userWithoutPassword_2,
		// 	userWPWithAdditionalSign,
		// 	sign2add,
		// 	moreOverStr,
		// 	evenMoreNecessaryProps,
		// 	MoreOverProto,
		// 	UserWithoutPassword,
		// 	MoreOver: MoreOverTypeDef
		// });

		// require('./instance.proto')({
		// 	user,
		// 	userPL1,
		// 	userTC,
		// 	userTCForkCall,
		// 	userTCForkApply,
		// 	userTCForkBind,
		// 	utcfcwp,
		// 	FORK_CALL_DATA,
		// 	UserType,
		// 	evenMore,
		// 	USER_DATA,
		// 	overMore,
		// 	moreOver,
		// 	UserTypeConstructor,
		// 	OverMore,
		// 	EvenMoreProto,
		// 	evenMoreArgs,
		// 	strFork,
		// 	strForkOfFork,
		// 	overMoreFork,
		// 	evenMoreFork,
		// 	evenMoreForkFork,
		// 	evenMoreForkCall,
		// 	overMoreCallEvenMoreUndefined,
		// 	overMoreCallEvenMoreNull,
		// 	overMoreCallEvenMoreNumber,
		// 	overMoreCallEvenMoreString,
		// 	overMoreCallEvenMoreBoolean,
		// 	overMoreCallEvenMoreProcess,
		// 	userTCdirectDAG,
		// 	userTCforkDAG,
		// });

		if (asyncConstructionTest) {
			describe('Async Constructors Test', () => {
				var asyncInstance: any,
					asyncInstanceDirect: any,
					asyncInstanceDirectApply: any,
					asyncInstancePromise: any,
					asyncSub: any,
					nestedAsyncInstance: any,
					nestedAsyncSub: any,
					asyncInstanceClone: any,
					asyncInstanceFork: any,
					asyncInstanceForkCb: any;

				beforeAll(function (done: CallableFunction) {
					const wait = async function () {
						asyncInstancePromise = new AsyncType('tada');
						asyncInstance = await asyncInstancePromise;
						asyncInstanceDirect = await AsyncType.call(process, 'dadada');
						asyncInstanceDirectApply = await AsyncType.apply(process, ['da da da']);
						asyncSub = asyncInstance.SubOfAsync('some');
						nestedAsyncInstance = await new asyncSub
							.NestedAsyncType('nested');
						nestedAsyncSub = nestedAsyncInstance
							.SubOfNestedAsync('done');

						asyncInstanceClone = await asyncInstance.clone;
						asyncInstanceFork = await asyncInstance.fork('dada');

						await (promisify((cb: CallableFunction) => {
							const cbfork = callbackify(asyncInstance.fork);
							// @ts-ignore
							cbfork.call(asyncInstance, 'cb forked data', (err: never, result: unknown) => {
								asyncInstanceForkCb = result;
								cb();
							});
						}))();

						done();
					};
					wait();
				});

				it('should be able to call binded methods properly', () => {

					const result1 = asyncInstance.getThisPropMethod('arg123');
					expect(result1).toEqual(123);

					const result2 = asyncInstanceClone.getThisPropMethod('arg123');
					expect(result2).toEqual(123);

					const result3 = nestedAsyncSub.getThisPropMethod('arg123');
					expect(result3).toEqual(456);

					const result4 = new nestedAsyncSub.getThisPropMethod('arg123');
					expect(typeof result4).toEqual('object');
					expect(result4.arg123).toEqual('arg123');

					const getThisPropMethod1 = asyncSub.getThisPropMethod;
					const result5 = getThisPropMethod1('arg123');
					expect(result5).toEqual(321);

					const { getThisPropMethod } = asyncSub;
					const result6 = getThisPropMethod('arg123');
					expect(result6).toEqual(321);

					const result7 = new getThisPropMethod('arg123');
					expect(typeof result7).toEqual('object');
					expect(result7.arg123).toEqual('arg123');

					const result8 = asyncSub.parent().getThisPropMethod('arg123');
					expect(result8).toEqual(123);

					const result9 = nestedAsyncInstance.getThisPropMethod('arg123');
					expect(result9).toEqual(321);

					const {
						getThisPropMethod: getThisPropMethod2,
						hookedMethod
					} = nestedAsyncSub;

					const result10 = getThisPropMethod2('arg123');
					expect(result10).toEqual(456);

					const result11 = hookedMethod('getThisPropMethod')('arg123');
					expect(result11).toEqual(456);
				});

				it('should be able to throw binded methods invocations properly', () => {
					const {
						hookedMethod
					} = nestedAsyncSub;

					let thrown: any;
					try {
						hookedMethod('getThisPropMethod')('missingProp');
					} catch (error) {
						thrown = error;
					}
					expect(thrown).toBeInstanceOf(Error);
					expect(thrown).toBeInstanceOf(SubOfNestedAsync);
					expect(typeof thrown.message).toEqual('string');
					expect(thrown.message).toEqual('prop is missing');
					expect(thrown.originalError).toBeInstanceOf(Error);
					expect(thrown.originalError).not.toBeInstanceOf(SubOfNestedAsync);

					let thrown2: any;
					try {
						hookedMethod.call(null, 'getThisPropMethod');
					} catch (error) {
						thrown2 = error;
					}
					expect(thrown2).toBeInstanceOf(Error);
					expect(typeof thrown2.message).toEqual('string');
					// expect(thrown2.originalError).instanceOf(Error);
					expect(thrown2.exceptionReason).toBeInstanceOf(Object);
					expect(thrown2.exceptionReason.methodName).toEqual('hookedMethod');


					Object.defineProperty(asyncSub, 'exception', {
						get() {
							return function () {
								return null;
							};
						}
					});

					let thrown3: any;
					try {
						hookedMethod('getThisPropMethod')('missingProp');
					} catch (error) {
						thrown3 = error;
					}
					expect(thrown3).toBeInstanceOf(Error);
					expect(typeof thrown3.message).toEqual('string');
					// expect(thrown2.originalError).instanceOf(Error);
					expect(thrown3.exceptionReason).toBeInstanceOf(Object);
					expect(thrown3.exceptionReason.methodName).toEqual('getThisPropMethod');

					const cae = 'check additional error';
					Object.defineProperty(nestedAsyncInstance, 'exception', {
						get() {
							return function () {
								throw new Error(cae);
							};
						}
					});

					let thrown4: any;
					try {
						hookedMethod('getThisPropMethod')('missingProp');
					} catch (error) {
						thrown4 = error;
					}
					expect(thrown4).toBeInstanceOf(Error);
					expect(typeof thrown4.message).toEqual('string');
					// expect(thrown2.originalError).instanceOf(Error);
					expect(thrown4.exceptionReason).toBeInstanceOf(Object);
					expect(thrown4.exceptionReason.methodName).toEqual('getThisPropMethod');
					expect(thrown4.surplus[0]).toBeInstanceOf(Error);
					expect(thrown4.surplus[0].message).toEqual(cae);

				});

				// it('should be able to throw on returned after invocations', () => {
				// 	debugger;
				// 	hookedMethod.call({
				// 		getThisPropMethod (arg) {
				// 			return this[arg];
				// 		}
				// 	}, 'getThisPropMethod')('arg123');
				// });

				it('should be able to throw on construct inside binded methods after invocations', () => {

					const {
						erroredNestedConstructMethod
					} = asyncInstanceClone;
					let thrown: any;


					try {
						debugger;
						erroredNestedConstructMethod();
					} catch (error) {
						debugger;
						thrown = error;
					}

					expect(thrown).toBeInstanceOf(Error);
					expect(thrown).not.toBeInstanceOf(AsyncType);
					expect(typeof thrown.message).toEqual('string');
					expect(thrown.message).toEqual('Nested SubError Constructor Special Error');
					expect(thrown.originalError).toBeInstanceOf(Error);
					expect(thrown.originalError).not.toBeInstanceOf(AsyncType);

					const {
						args,
						instance
					} = thrown;

					expect(args[0]).toEqual(123);
					expect(instance.constructor.name).toEqual('NestedSubError');
					const parsed = thrown.parse();
					expect(parsed.name).toEqual('NestedSubError');

					const extracted = thrown.extract();
					expect(typeof extracted.constructNested).toEqual('function');

				});

				it('should be able to throw async binded methods invocations properly', async () => {
					const {
						erroredAsyncMethod
					} = asyncInstanceClone;

					let thrown: any;
					try {
						await erroredAsyncMethod();
					} catch (error) {
						thrown = error;
					}

					asyncInstanceClone.thrownForReThrow = thrown;
					expect(thrown).toBeInstanceOf(Error);
					expect(thrown).toBeInstanceOf(AsyncType);
					expect(typeof thrown.message).toEqual('string');
					expect(thrown.message).toEqual('async error');
					expect(thrown.originalError).toBeInstanceOf(Error);
					expect(thrown.originalError).not.toBeInstanceOf(AsyncType);

				});

				it('should be able to re-throw async binded methods invocations properly', async () => {
					const {
						erroredAsyncMethod,
						thrownForReThrow
					} = asyncInstanceClone;

					let thrown: any;
					try {
						await erroredAsyncMethod(thrownForReThrow);
					} catch (error) {
						thrown = error;
					}

					debugger;

					expect(thrown).toBeInstanceOf(Error);
					expect(thrown).toBeInstanceOf(AsyncType);
					expect(typeof thrown.message).toEqual('string');
					expect(thrown.message).toStrictEqual('async error');
					expect(thrown.originalError).toBeInstanceOf(Error);
					expect(thrown.originalError).not.toBeInstanceOf(AsyncType);
					expect(thrown.surplus[0]).toBeInstanceOf(AsyncType);

					expect(thrown.reasons.length).toEqual(2);

				});

				it('should be able to construct async', () => {
					expect(asyncInstance.data).toEqual('tada');
					expect(asyncInstanceClone.data).toEqual('tada');
					expect(asyncInstanceFork.data).toEqual('dada');
					expect(asyncInstanceDirect.data).toEqual('dadada');
					expect(asyncInstanceDirectApply.data).toEqual('da da da');
					expect(asyncInstanceForkCb.data).toEqual('cb forked data');
				});

				it('should be able to construct nested async', () => {
					expect(asyncInstancePromise).toBeInstanceOf(Promise);
					expect(asyncInstancePromise).toBeInstanceOf(AsyncType);
					expect(asyncInstance).toBeInstanceOf(AsyncType);
					expect(asyncInstanceClone).toBeInstanceOf(AsyncType);
					expect(asyncInstanceFork).toBeInstanceOf(AsyncType);
					expect(asyncInstanceFork).toBeInstanceOf(AsyncType);

					expect(typeof asyncInstanceDirect.on === 'function').toEqual(true);
					expect(ogp(ogp(asyncInstanceDirect[SymbolGaia])) === process).toEqual(true);
					expect(asyncInstanceDirect[SymbolGaia][MNEMONICA] === URANUS).toEqual(true);
					expect(typeof asyncInstanceDirectApply.on === 'function').toEqual(true);
					expect(ogp(ogp(asyncInstanceDirectApply[SymbolGaia])) === process).toEqual(true);
					expect(asyncInstanceDirectApply[SymbolGaia][MNEMONICA] === URANUS).toEqual(true);

					expect(nestedAsyncInstance).toBeInstanceOf(AsyncType);
					expect(nestedAsyncInstance).toBeInstanceOf(NestedAsyncType);
					expect(nestedAsyncSub).toBeInstanceOf(AsyncType);
					expect(nestedAsyncSub).toBeInstanceOf(AsyncType.SubOfAsync);
					expect(nestedAsyncSub).toBeInstanceOf(NestedAsyncType);
					expect(nestedAsyncSub).toBeInstanceOf(SubOfNestedAsync);
					expect(SubOfNestedAsyncPostHookData
						.existentInstance)
						.toEqual(nestedAsyncInstance);

					expect(SubOfNestedAsyncPostHookData
						.inheritedInstance)
						.toEqual(nestedAsyncSub);

					expect(nestedAsyncInstance.data).toEqual('nested');
					expect(nestedAsyncInstance.description)
						.toEqual('nested async instance');
				});

				it('parse shouls work with async .call\'ed instances', () => {
					const etalon = ['name', 'props', 'self', 'proto', 'joint', 'parent', 'gaia'];
					const keys = Object.keys(parse(asyncInstance));
					expect(keys).toEqual(etalon);
				});

			});
		}

		// if (uncaughtExceptionTest) {
		// 	require('./uncaughtExceptionTest')({
		// 		evenMore,
		// 		ThrowTypeError
		// 	});
		// }

	});
});
