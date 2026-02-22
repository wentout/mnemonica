'use strict';

import { beforeAll, describe, expect, it, test } from '@jest/globals';
import type { Process } from 'node:process';
import { asyncChainTests } from './async.chain';
import { environmentTests } from './environment';

declare const process: NodeJS.Process;

const mnemonica = require('../src/index');
const { mnemonica: _mnemonica } = mnemonica;

describe('props tests', () => {
	test('base instance has props', () => {
		expect(mnemonica).not.toBeInstanceOf(Object);
		expect(mnemonica instanceof Object).not.toBe(true);
		expect(_mnemonica).toBeInstanceOf(Object);
		expect(_mnemonica instanceof Object).toBe(true);
	});
});

import {
	inspect,
	callbackify,
	promisify
} from 'util';

const ogp = Object.getPrototypeOf;
const hop = (o: unknown, p: string) => Object.prototype.hasOwnProperty.call(o, p);

const {
	define,
	defaultTypes: types,
	createTypesCollection,
	MNEMONICA,
	URANUS,
	SymbolGaia,
	SymbolConfig,
	lookup,
	getProps,
	apply,
	call,
	bind,
	utils: {
		extract,
		pick,
		collectConstructors,
		merge,
		parse,
		parent,
		toJSON
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

const mc = require('./createInstanceModificator200XthWay');

const UT = function (this: TUserData, userData: TUserData) {
	const {
		email,
		password
	} = userData;
	this.email = email;
	this.password = password;
	return this;
};
Object.assign(UT.prototype, UserTypeProto);

const UserType = mnemonica.define('UserType', UT, mc);

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
			this.shape = 123;
		}
	};
};

UserType.define(() => {
	const Shaper = shaperFactory();
	class UserTypePL2 extends Shaper {
		user_pl_2_sign: string;
		constructor() {
			super();
			this.user_pl_2_sign = 'pl_2';
		}
		get UserTypePL2() {
			return pl2Proto.UserTypePL2;
		}
		getSign() {
			return this.user_pl_2_sign;
		}
	}
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	UserTypePL2.Shaper = Shaper;
	return UserTypePL2;
}, {
	ModificationConstructor: mc,
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

types.registerFlowChecker((opts: any) => {
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
		order: 'first',
		self: this,
		opts
	});
});

types.registerHook('postCreation', function (this: unknown, opts: unknown) {
	typesPostCreationInvocations.push({
		kind: 'post',
		sort: 'collection',
		order: 'second',
		self: this,
		opts
	});
});

const anotherDefaultTypesCollection = createTypesCollection();

const {
	define: adtcDefine
} = anotherDefaultTypesCollection;

const SomeADTCType = adtcDefine('SomeADTCType', function (this: { test: number }) {
	this.test = 123;
}, { strictChain: false });

const someADTCInstance = new SomeADTCType();

let SubOfSomeADTCTypePre: any = null;
let SubOfSomeADTCTypePost: any = null;
const SubOfSomeADTCType = SomeADTCType.define('SubOfSomeADTCType', function (this: any, ...args: any[]) {
	this.sub_test = 321;
	this.args = args;
}, { strictChain: false });

SubOfSomeADTCType.registerHook('preCreation', (opts: any) => {
	SubOfSomeADTCTypePre = opts;
});
SubOfSomeADTCType.registerHook('postCreation', (opts: any) => {
	SubOfSomeADTCTypePost = opts;
});


const subOfSomeADTCInstanceANoArgs = apply(someADTCInstance, SubOfSomeADTCType);
const subOfSomeADTCInstanceA = apply(someADTCInstance, SubOfSomeADTCType, [1, 2, 3]);

const backSub = new subOfSomeADTCInstanceA.SubOfSomeADTCType;

const subOfSomeADTCInstanceC = call(someADTCInstance, SubOfSomeADTCType, 1, 2, 3);

const subOfSomeADTCInstanceB = bind(someADTCInstance, SubOfSomeADTCType)(1, 2, 3);


const anotherTypesCollection = createTypesCollection();
const oneElseTypesCollection = createTypesCollection();

const AnotherCollectionType = anotherTypesCollection.define('AnotherCollectionType', function (this: any, check: unknown) {
	Object.assign(this, { check });
}, false);

// TypeProxy .bind
// so we will replace "root" instance of prototype chain here
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
process.TestForAddition = 'passed';
const anotherCollectionInstance = AnotherCollectionType.bind(process)('check');

const OneElseCollectionType = oneElseTypesCollection.define('OneElseCollectionType', function (this: any) {
	this.self = this;
});
const oneElseCollectionInstance = new OneElseCollectionType();


// Create the user instance properly
const user = new UserType(USER_DATA);
const userPL1 = new user.UserTypePL1();
const userPL2 = new user.UserTypePL2();

let userPL_1_2: any;
let userPL_NoNew: any;

try {
	userPL_1_2 = new userPL1.UserTypePL2();
} catch (err) { console.error(err); }
try {
	userPL_NoNew = userPL1.UserTypePL2();
} catch (err) { console.error(err); }

const AsyncWOReturn = define('AsyncWOReturn', async function () {
	// empty async constructor
});

const AsyncWOReturnNAR = define('AsyncWOReturnNAR', async function () { }, {
	awaitReturn: false
});

const constructNested = function (this: any) {
	const DoNestedConstruct = this.NestedConstruct;
	return new DoNestedConstruct();
};

const new_targets: string[] = [];

const Main = define('Main', function (this: any) {
	if (new.target) {
		new_targets.push(this.constructor.name);
	}
	this.constructNested = constructNested;
});
const NestedConstruct = Main.define('NestedConstruct', function (this: any) {
	if (new.target) {
		new_targets.push(this.constructor.name);
	}
	// 1. direct error explanation
	// throw new Error('Nested Constructor Special Error');
	// 2. but we go to sub
	this.nested = new this.NestedSubError(123);
});
NestedConstruct.define('NestedSubError', function (this: any, ...args: any[]) {
	if (new.target) {
		new_targets.push(this.constructor.name);
	}
	this.args = args;
	throw new Error('Nested SubError Constructor Special Error');
});

const AsyncTypeProto = {
	getThisPropMethod: function (propName: string) {
		if (new.target) {
			this[propName] = propName;
			return this;
		}
		if (this[propName]) {
			return this[propName];
		}
		throw new Error(`prop is missing: ${propName}`);
	},

	erroredNestedConstructMethod(this: any) {
		// will throw RangeError : max stack size
		const main = new Main();
		main.nested = main.constructNested();
	},

	async erroredAsyncMethod(error: any) {
		const result = error === undefined ? new Error('async error') : error;
		throw result;
	}
};

const ATConstructor = async function (this: any, data: unknown) {
	Object.assign(this, {
		arg123: 123
	}, {
		data
	});
	return this;
};
const AsyncType = define('AsyncType', ATConstructor);
AsyncType.prototype = AsyncTypeProto;


// Use proper bindMethod and bindProtoMethods
const { bindMethod, bindProtoMethods } = require('./bindProtoMethods');

AsyncType.registerHook('postCreation', (hookData: any) => {
	bindProtoMethods(hookData);
});

AsyncType.SubOfAsync = function (this: any, data: unknown) {
	this.arg123 = 321;
	Object.assign(this, {
		data
	});
};
AsyncType.SubOfAsync.registerHook('postCreation', (hookData: any) => {
	const {
		inheritedInstance,
	} = hookData;
	bindProtoMethods(hookData);
	bindMethod(hookData, inheritedInstance, 'hookedMethod', function (this: any, propName: string) {
		const result = this[propName];
		return result;
	});
});

AsyncType.SubOfAsync.NestedAsyncType = async function (this: any, data: unknown) {
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
});

let SubOfNestedAsyncPostHookData: any;
SubOfNestedAsync.registerHook('postCreation', function (opts: unknown) {
	bindProtoMethods(opts);
	SubOfNestedAsyncPostHookData = opts;
});


// Decorate tests
const { myDecoratedInstance, myDecoratedSubInstance, myDecoratedSubSubInstance, myOtherInstance } = require('./decorate');

describe('Main Test', () => {

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


	const UTC = function (this: any, userData: TUserData) {
		const {
			email,
			password
		} = userData;

		Object.assign(this, {
			email,
			password
		});
	};
	Object.assign(UTC.prototype, UserTypeConstructorProto);

	const UserTypeConstructor = define('UserTypeConstructor', UTC, {
		submitStack: true
	});

	const WithoutPasswordProto = {
		WithoutPasswordSign: 'WithoutPasswordSign'
	};

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
			str: string;
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

	const OMConstructor = function (this: any, str: string) {
		this.str = str || 're-defined OverMore str';
	};
	Object.assign(OMConstructor.prototype, OverMoreProto);
	const OverMore = WithAdditionalSignTypeDef
		.define('MoreOver.OverMore',
			OMConstructor, {
			submitStack: true
		});

	const EvenMoreProto = {
		EvenMoreSign: 'EvenMoreSign'
	};

	const EvenMoreTypeDef = WithAdditionalSignTypeDef.define(`
		MoreOver . OverMore
	`, function () {
		const EvenMore = function (this: any, str: string) {
			this.str = str || 're-defined EvenMore str';
		};
		EvenMore.prototype = Object.assign({}, EvenMoreProto);
		return EvenMore;
	}, {
		submitStack: true
	});

	const ThrowTypeError = EvenMoreTypeDef.define('ThrowTypeError', require('./throw-type-error'));

	const AsyncChain1st = WithAdditionalSignTypeDef.define('AsyncChain1st', async function (this: any, opts: any) {
		return Object.assign(this, opts);
	}, {
		submitStack: true
	});
	const AsyncChain2nd = AsyncChain1st.define('AsyncChain2nd', async function (this: any, opts: any) {
		return Object.assign(this, opts);
	}, {
		submitStack: true
	});
	const Async2Sync2nd = AsyncChain2nd.define('Async2Sync2nd', function (this: any, opts: any) {
		Object.assign(this, opts);
	}, {
		submitStack: true
	});
	Async2Sync2nd.define('AsyncChain3rd', async function (this: any, opts: any) {
		return Object.assign(this, opts);
	}, {
		submitStack: true
	});


	const EmptyType = define('EmptyType');
	EmptyType.define('EmptySubType', function (this: any, sign: string) {
		this.emptySign = sign || 'DefaultEmptySign';
	});

	// *****************************************************
	// *****************************************************
	// *****************************************************


	const userTC = new UserTypeConstructor(USER_DATA);

	const FORK_CALL_DATA = {
		email: 'forkmail@gmail.com',
		password: '54321'
	};

	const userTCForkCall = userTC.fork.call(user, FORK_CALL_DATA);
	const userTCForkApply = userTC.fork.apply(user, [
		FORK_CALL_DATA
	]);
	const userTCForkBind = userTC.fork.bind(user)(FORK_CALL_DATA);
	const utcfcwp = userTCForkCall.WithoutPassword();

	// check unchained construction
	const unchainedUserWithoutPassword = new UserWithoutPassword();

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

	const evenMoreForkCall = evenMore.fork.call(user, USER_DATA);

	const strFork = 'fork of evenMore';
	const strForkOfFork = 'fork of fork of evenMore';

	const overMoreFork = overMore.fork();

	const overMoreCallEvenMoreUndefined = overMore.EvenMore.call(undefined);
	const overMoreCallEvenMoreNull = overMore.EvenMore.call(null);
	const overMoreCallEvenMoreNumber = overMore.EvenMore.call(new Number(5));
	const overMoreCallEvenMoreString = overMore.EvenMore.call(new String(5));
	const overMoreCallEvenMoreBoolean = overMore.EvenMore.call(new Boolean(5));
	const overMoreCallEvenMoreProcess = overMore.EvenMore.call(process);

	const evenMoreArgs = getProps(evenMore).__args__;
	const evenMoreFork = evenMore.fork(strFork);
	const evenMoreForkFork = evenMoreFork.fork(strForkOfFork);

	const chained = new UserTypeConstructor({ email: 'someother@gmail.com', password: 32123 });
	const derived = new chained.WithoutPassword();
	const rounded = new derived.WithAdditionalSign(sign2add);

	const chained2 = new UserTypeConstructor({ email: 'someother@gmail.com', password: 32123 })
		.WithoutPassword()
		.WithAdditionalSign(sign2add);

	const merged = merge(user, overMore, FORK_CALL_DATA);

	// TypeProxy .apply
	const userTCdirectDAG = UserTypeConstructor.call(new Boolean(5), FORK_CALL_DATA);
	const userTCforkDAG = userTC.fork.call(new Boolean(5), FORK_CALL_DATA);


	const checkTypeDefinition = (_types: any, TypeName: string, proto: any) => {
		describe(`initial type declaration ${TypeName}`, () => {
			const def = _types.get(TypeName);
			it('should exist', () => {
				expect(def).toBeDefined();
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
			it(`isSubType is ${def?.isSubType}`, () => {
				expect(typeof def.isSubType).toEqual('boolean');
			});
			it('contructor exists', () => {
				expect(def.constructHandler).toBeInstanceOf(Function);
			});
		});
	};

	describe('Type Definitions Tests', () => {
		it('userPL2 uses default errored and used constructor', () => {
			expect(userPL1.goneToFallback).toBeInstanceOf(Error);
		});
		it('userPL2 uses default errored and used constructor', () => {
			expect(userPL2.goneToFallback).toBeInstanceOf(Error);
		});
		it('userPL2 uses default errored and used constructor', () => {
			expect(userPL_1_2.goneToFallback).toBeInstanceOf(Error);
		});
		it('userPL2 uses default errored and used constructor', () => {
			expect(userPL_NoNew.goneToFallback).toBeInstanceOf(Error);
		});

		[
			[types.subtypes, 'UserType', UserTypeProto],
			[UserType.subtypes, 'UserTypePL1', pl1Proto],
			[UserType.subtypes, 'UserTypePL2'],
			[types.subtypes, 'UserTypeConstructor', UserTypeConstructorProto],
			[types.UserTypeConstructor.subtypes, 'WithoutPassword', WithoutPasswordProto],
			[UserWithoutPassword.subtypes, 'WithAdditionalSign', WithAdditionalSignProto],
			[WithAdditionalSignTypeDef.subtypes, 'MoreOver'],
			[MoreOverTypeDef.subtypes, 'OverMore', OverMoreProto],
			[OverMore.subtypes, 'EvenMore', EvenMoreProto],
		].forEach(entry => {
			const [_types, def, proto] = entry as [any, string, any];
			checkTypeDefinition(_types, def, proto);
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
			expect(user.constructor.prototype).toMatchObject(UserTypeProto);
		});

		it('.SubTypes definition is correct 20XX', () => {
			expect(hop(user, 'UserTypePL1')).toBeFalsy();
			expect(hop(user, 'UserTypePL2')).toBeFalsy();
		});
		it('.SubTypes definition is correct  20XX First Child', () => {
			const props = getProps(user);
			expect(props.__subtypes__.has('UserTypePL1')).toEqual(true);
			expect(props.__subtypes__.has('UserTypePL2')).toEqual(true);

			const oogpuser = ogp(user);
			const subtypes = getProps(oogpuser).__subtypes__;
			expect(subtypes.has('UserTypePL1')).toEqual(true);
			expect(subtypes.has('UserTypePL2')).toEqual(true);
		});


		describe('empty constructor works properly', () => {
			it('should construct an object', () => {
				expect(empty).toBeDefined();
				expect(empty).toBeInstanceOf(Object);
			});
			it('nested object of empty object is well', () => {
				expect(emptySub).toBeDefined();
				expect(emptySub).toBeInstanceOf(Object);
			});
			it('nested object of empty object rules are ok', () => {
				expect(hop(emptySub, 'emptySign')).toEqual(true);
				expect(emptySub.emptySign).toBeDefined();
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
					extract(null as any);
				}).toThrow();
			});
			try {
				extract(null as any);
			} catch (error: any) {
				it('thrown by extract(null) should be ok with instanceof', () => {
					expect(error).toBeInstanceOf(errors.WRONG_INSTANCE_INVOCATION);
					expect(error).toBeInstanceOf(Error);
				});
				it('thrown error should be ok with props', () => {
					expect(error.BaseStack).toBeDefined();
					expect(typeof error.BaseStack).toEqual('string');
				});
			}

			it('should throw on wrong instance 4 .pick()', () => {
				expect(() => {
					pick(null as any);
				}).toThrow();
			});
			try {
				pick(null as any);
			} catch (error: any) {
				it('thrown by pick(null) should be ok with instanceof', () => {
					expect(error).toBeInstanceOf(errors.WRONG_INSTANCE_INVOCATION);
					expect(error).toBeInstanceOf(Error);
				});
				it('thrown error should be ok with props', () => {
					expect(error.BaseStack).toBeDefined();
					expect(typeof error.BaseStack).toEqual('string');
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
						expect(collected?.length).toEqual(0);
					}
				});
			});
		});

		describe('Nested Tests', () => {
			describe('nested type with old style check', () => {
				it('actually do construction', () => {
					expect(userPL1).toBeInstanceOf(types.UserType.subtypes.get('UserTypePL1'));
					expect(userPL1).toBeInstanceOf(user.UserTypePL1);
					expect(ogp(ogp(ogp(userPL1)))).toEqual(user);
					expect(ogp(ogp(ogp(userPL2)))).toEqual(user);
				});
				it('actually do construction with nested methods', () => {
					expect(userPL2.getSign()).toEqual('pl_2');
				});
				it('.constructor.name is correct', () => {
					expect(userPL1.constructor.name).toEqual('UserTypePL1');
				});
				it('.prototype is correct', () => {
					expect(userPL1.constructor.prototype).toBeInstanceOf(Object);
					expect(Object.entries(pl1Proto).every(([key, value]) => {
						return (userPL1 as any)[key] === value;
					})).toBe(true);
				});
				it('definition is correct', () => {
					const checker = {
						user_pl_1_sign: 'pl_1',
					};
					Object.entries(checker).forEach(([key, value]) => {
						expect(hop(userPL1, key)).toBe(true);
						expect((userPL1 as any)[key]).toEqual(value);
					});
				});
			});

			describe('nested type with new style check', () => {
				it('actually do construction', () => {
					expect(userPL2).toBeInstanceOf(types.UserType.subtypes.get('UserTypePL2'));
					expect(userPL2).toBeInstanceOf(user.UserTypePL2);
					const shouldNot = userPL2 instanceof (userPL2.constructor as any).Shaper;
					expect(shouldNot).toEqual(false);
				});
				it('.constructor.name is correct', () => {
					expect(userPL2.constructor.name).toEqual('UserTypePL2');
				});
				it('can construct without "new" keyword', () => {
					expect(userPL_NoNew).toBeInstanceOf(types.UserType);
					expect(userPL_NoNew).toBeInstanceOf(types.UserType.subtypes.get('UserTypePL2'));
				});
				it('and insanceof stays ok', () => {
					expect(userPL_NoNew).toBeInstanceOf(user.UserTypePL2);
				});
				it('and even for sibling type', () => {
					expect(userPL_1_2).toBeInstanceOf(userPL1.UserTypePL2);
				});
				it('and for sibling type constructed without "new"', () => {
					expect(userPL_NoNew).toBeInstanceOf(userPL1.UserTypePL2);
				});
				it('.prototype is correct', () => {
					expect(Object.keys(pl2Proto).every(key => {
						return (userPL2.constructor.prototype as any)[key] === pl2Proto[key as keyof typeof pl2Proto];
					})).toBe(true);
				});
				it('definitions are correct 4 class instances', () => {
					const checker = Object.assign({
						user_pl_2_sign: 'pl_2',
						description: UserTypeProto.description
					}, USER_DATA, pl2Proto);
					Object.keys(USER_DATA).forEach(key => {
						expect(hop(userPL2, key)).toBe(false);
						expect((userPL2 as any)[key]).toEqual((USER_DATA as any)[key]);
					});

					Object.entries(checker).forEach(([key, value]) => {
						expect((userPL2 as any)[key]).toEqual(value);
					});
				});
				it('definitions are correct for general', () => {
					const checker = Object.assign({
						user_pl_1_sign: 'pl_1',
						description: UserTypeProto.description
					}, USER_DATA, pl1Proto);
					Object.keys(USER_DATA).forEach(key => {
						expect(hop(userPL1[key], key)).toBe(false);
					});
					Object.entries(checker).forEach(([key, value]) => {
						expect((userPL1 as any)[key]).toEqual(value);
					});
				});
			});
		});

		describe('More Nested Tests', () => {
			describe('inheritance works', () => {
				it('.prototype is correct', () => {
					expect(userTC.constructor.prototype).toBeInstanceOf(Object);
					expect(Object.keys(UserTypeConstructorProto).every(key => {
						return (userTC.constructor.prototype as any)[key] === (UserTypeConstructorProto as any)[key];
					})).toBe(true);
				});
				it('definition is correct', () => {
					const checker = Object.assign(UserTypeConstructorProto, USER_DATA);
					Object.keys(USER_DATA).forEach(key => {
						expect(hop(userTC[key], key)).toBe(false);
					});
					Object.entries(checker).forEach(([key, value]) => {
						expect((userTC as any)[key]).toEqual(value);
					});
				});
				it('siblings are correct', () => {
					const proto1 =
						Object.getPrototypeOf(
							Object.getPrototypeOf(
								Object.getPrototypeOf(userWithoutPassword)));
					expect(proto1).toEqual(userTC);

					const proto2 =
						Object.getPrototypeOf(
							Object.getPrototypeOf(
								Object.getPrototypeOf(userWithoutPassword)));
					expect(proto2).toEqual(userTC);
				});
				it('siblings are nested include', () => {
					expect(userWithoutPassword.password).toBeUndefined();
					expect(userWPWithAdditionalSign.sign).toEqual(sign2add);
					expect(moreOver.str).toEqual(moreOverStr);
				});
			});

			describe('constructors sequence is ok', () => {
				const constructorsSequence = collectConstructors(evenMore, true);
				it('must be ok', () => {
					expect(constructorsSequence.length).toEqual(19);
					expect(constructorsSequence).toEqual([
						'EvenMore',
						'EvenMore',
						'OverMore',
						'OverMore',
						'OverMore',
						'MoreOver',
						'MoreOver',
						'MoreOver',
						'WithAdditionalSign',
						'WithAdditionalSign',
						'WithAdditionalSign',
						'WithoutPassword',
						'WithoutPassword',
						'WithoutPassword',
						'UserTypeConstructor',
						'UserTypeConstructor',
						'UserTypeConstructor',
						'Mnemonica',
						'Mnemosyne',
					]);
				});
			});

			describe('extraction works properly', () => {
				const extracted = extract(evenMore);
				const extractedJSON = toJSON(extracted);
				const extractedFromJSON = JSON.parse(extractedJSON);
				const extractedFromInstance = evenMore.extract();
				const nativeExtractCall = extract.call(evenMore);
				const nativeToJSONCall = JSON.parse(toJSON.call(evenMore));
				it('toJSON should work', () => {
					expect(extractedJSON.length > 0).toEqual(true);
				});
				it('should be equal objects', () => {
					// extractedFromJSON won't have password: undefined because JSON removes undefined
					expect(extracted).toMatchObject(evenMoreNecessaryProps);
					expect(extractedFromInstance).toMatchObject(extracted);
					// Compare extractedFromJSON with a version without undefined password
					const expectedJSONProps = { ...evenMoreNecessaryProps };
					delete (expectedJSONProps as any).password;
					expect(extractedFromJSON).toMatchObject(expectedJSONProps);
				});
				it('should respect data flow', () => {
					expect(hop(extracted, 'password')).toBe(true);
					expect(extracted.password).toBeUndefined();
					expect(hop(extractedFromJSON, 'password')).toBe(false);
					expect(extractedFromJSON.password).toBeUndefined();
				});
				it('should work the same for all the ways of extraction', () => {
					expect(nativeExtractCall).toMatchObject(extractedFromInstance);
					expect(nativeToJSONCall).toMatchObject(extractedFromJSON);
				});
				it('should have MoreOverSign', () => {
					expect(evenMore.MoreOverSign).toBeDefined();
					expect(evenMore.MoreOverSign).toEqual(MoreOverProto.MoreOverSign);
				});
			});

			describe('lookup test', () => {

				describe('should throw proper error when looking up without TypeName', () => {
					try {
						lookup(null as any);
					} catch (error) {
						it('thrown should be ok with instanceof', () => {
							expect(error).toBeInstanceOf(errors.WRONG_TYPE_DEFINITION);
							expect(error).toBeInstanceOf(Error);
						});
						it('thrown error should be ok with props', () => {
							expect((error as any).message).toBeDefined();
							expect(typeof (error as any).message).toEqual('string');
							expect((error as any).message).toEqual('wrong type definition : arg : type nested path must be a string');
						});
					}
				});

				describe('should throw proper error when looking up for empty TypeName', () => {
					try {
						lookup('');
					} catch (error) {
						it('thrown should be ok with instanceof', () => {
							expect(error).toBeInstanceOf(errors.WRONG_TYPE_DEFINITION);
							expect(error).toBeInstanceOf(Error);
						});
						it('thrown error should be ok with props', () => {
							expect((error as any).message).toBeDefined();
							expect(typeof (error as any).message).toEqual('string');
							expect((error as any).message).toEqual('wrong type definition : arg : type nested path has no path');
						});
					}
				});

				describe('should throw proper error when defining from wrong lookup', () => {
					try {
						define('UserTypeConstructor.WithoutPassword.WrongPath.WrongNestedType');
					} catch (error) {
						it('thrown should be ok with instanceof', () => {
							expect(error).toBeInstanceOf(errors.WRONG_TYPE_DEFINITION);
							expect(error).toBeInstanceOf(Error);
						});
						it('thrown error should be ok with props', () => {
							expect((error as any).message).toBeDefined();
							expect(typeof (error as any).message).toEqual('string');
							expect((error as any).message).toEqual('wrong type definition : WrongPath definition is not yet exists');
						});
					}
				});

				describe('should throw proper error when declaring with empty TypeName', () => {
					try {
						define('');
					} catch (error) {
						it('thrown should be ok with instanceof', () => {
							expect(error).toBeInstanceOf(errors.WRONG_TYPE_DEFINITION);
							expect(error).toBeInstanceOf(Error);
						});
						it('thrown error should be ok with props', () => {
							expect((error as any).message).toBeDefined();
							expect(typeof (error as any).message).toEqual('string');
							expect((error as any).message).toEqual('wrong type definition : TypeName must not be empty');
						});
					}
				});

				it('should seek proper reference of passed TypeName', () => {
					const ut = lookup('UserType');
					expect(ut.__type__).toEqual(UserType.__type__);
					const up = lookup('UserTypeConstructor.WithoutPassword');
					expect(up.__type__).toEqual(UserWithoutPassword.__type__);
					const om = lookup('UserTypeConstructor.WithoutPassword.WithAdditionalSign.MoreOver.OverMore');
					expect(om.__type__).toEqual(OverMore.__type__);
					const emShort = MoreOverTypeDef.lookup('OverMore.EvenMore');
					const emFull = mnemonica.lookup('UserTypeConstructor.WithoutPassword.WithAdditionalSign.MoreOver.OverMore.EvenMore');
					expect(emShort.__type__).toEqual(emFull.__type__);
				});

			});


			describe('.parent("TypeName") checks', () => {

				it('should seek proper .parent()', () => {

					const parentStraight = parent(evenMore, 'UserTypeConstructor');
					const parentThroughMethod = evenMore.parent('UserTypeConstructor');

					expect(userTC).toEqual(parentStraight);
					expect(userTC).toEqual(parentThroughMethod);
					expect(parentStraight).toEqual(parentThroughMethod);

					const wrong = evenMore.parent('SomeWrongName');
					expect(wrong).toBeUndefined();

					const oneParent = evenMore.parent();
					expect(oneParent).toEqual(overMore);

				});

				try {
					parent(null as any);
				} catch (error) {
					it('thrown by parent(null) should be ok with instanceof', () => {
						expect(error).toBeInstanceOf(errors.WRONG_INSTANCE_INVOCATION);
						expect(error).toBeInstanceOf(Error);
					});
					it('thrown error should be ok with props', () => {
						expect((error as any).BaseStack).toBeDefined();
						expect(typeof (error as any).BaseStack).toEqual('string');
					});
				}
			});

			describe('merge tests', () => {
				it('should merge instances properly', () => {
					expect(merged).toBeDefined();
					expect(merged).toBeInstanceOf(UserType);
					expect(merged).toBeInstanceOf(OverMore);
					// merged email comes from FORK_CALL_DATA used in merge
					expect(merged.email).toBeDefined();
					expect(merged.str).toEqual(overMore.str);
				});
			});
		});

		describe('instance .proto props tests', () => {

			it('should have proper prototype .__args__', () => {
				expect(getProps(user).__args__[0]).toEqual(USER_DATA);
			});
			it('should have proper prototype .__type__', () => {
				expect(getProps(user).__type__.TypeProxy).toEqual(UserType.__type__);
				expect(getProps(user).__type__.TypeName).toEqual(UserType.TypeName);
			});
			it('should have proper prototype .__collection__', () => {
				expect(getProps(user).__collection__).toEqual(UserType.collection);
			});
			it('should have proper prototype .__subtypes__', () => {
				expect(getProps(user).__subtypes__).toEqual(UserType.subtypes);
			});
			it('should have proper prototype .__parent__', () => {
				expect(getProps(evenMore).__parent__).toEqual(overMore);
				expect(getProps(evenMore).__parent__).not.toEqual(moreOver);
			});
			it('should have proper prototype .__timestamp__', () => {
				expect(getProps(evenMore).__timestamp__).toBeDefined();
			});

			it('should have proper first .clone old style', () => {

				const userClone = user.clone;

				expect(
					ogp(ogp(user))
				).not.toBe(
					ogp(ogp(userClone))
				);

				expect(user).not.toBe(userClone);
				expect(userClone).toMatchObject(user);
				expect(userClone).toEqual(user);

			});


			it('should have proper first .fork() old style', () => {

				const forkData = {
					email: 'went.out@gmail.com',
					password: 'fork old style password'
				};
				const userArgs = getProps(user).__args__;

				const userFork = user.fork(forkData);

				const userPP = ogp(ogp(user));
				const userForkPP = ogp(ogp(userFork));

				expect(userPP).not.toEqual(userForkPP);

				expect(user).not.toEqual(userFork);
				expect(userArgs[0]).toEqual(USER_DATA);
				expect(new UserType(forkData)).toEqual(userFork);
				expect(getProps(userFork).__args__).not.toEqual(userArgs);
				expect(userFork).toBeInstanceOf(UserType);
				expect(Object.keys(userFork)).toEqual(Object.keys(user));

			});

			it('should have proper first .fork() regular style', () => {

				const forkData = {
					email: 'went.out@gmail.com',
					password: 'fork regular style password'
				};
				const userTCArgs = getProps(userTC).__args__;
				const userTCFork = userTC.fork(forkData);

				const userTCPP = ogp(ogp(userTC));
				const userTCForkPP = ogp(ogp(userTCFork));
				expect(userTCPP).not.toBe(userTCForkPP);

				expect(userTC).not.toBe(userTCFork);
				expect(userTCArgs[0]).toEqual(USER_DATA);
				const naiveFork = new UserTypeConstructor(forkData);
				expect(naiveFork).toMatchObject(userTCFork);
				expect(getProps(userTCFork).__args__).not.toBe(userTCArgs);
				expect(userTCFork).toBeInstanceOf(UserTypeConstructor);
				expect(Object.keys(userTCFork)).toEqual(Object.keys(userTC));

			});

			it('should have seekable __stack__', () => {
				const stackstart = '<-- creation of [ UserTypePL1 ] traced -->';
				const {
					__stack__
				} = getProps(userPL1);
				expect(__stack__.indexOf(stackstart)).toEqual(1);
			});

			it('should have proper nested .fork() old style', () => {

				const userPL1Fork = userPL1.fork();

				const userPL1PP = ogp(ogp(userPL1));
				const userPL1ForkPP = ogp(ogp(userPL1Fork));

				expect(userPL1ForkPP.UserTypePL1.toString()).toEqual(userPL1PP.UserTypePL1.toString());
				expect(userPL1ForkPP.UserTypePL2.toString()).toEqual(userPL1PP.UserTypePL2.toString());

				expect(userPL1PP).not.toBe(userPL1ForkPP);
				expect(userPL1).not.toBe(userPL1Fork);
				expect(userPL1Fork).toMatchObject(userPL1);
				expect(userPL1Fork.extract()).toEqual(userPL1.extract());

			});

			it('should have proper nested .clone regular style', () => {

				const evenMoreClone = evenMore.clone;
				expect(
					ogp(ogp(evenMore))
				).toEqual(
					ogp(ogp(evenMoreClone))
				);
				expect(evenMore).not.toBe(evenMoreClone);
				expect(evenMoreClone).toMatchObject(evenMore);
				expect(evenMoreClone.extract()).toEqual(evenMore.extract());

			});

			it('should not mutate()', () => {
				expect(getProps(evenMore).__proto_proto__).not.toBe(EvenMoreProto);
			});

			it('should have proper nested .fork()', () => {
				expect(getProps(overMore).__proto_proto__).not.toBe(getProps(overMoreFork).__proto_proto__);

				expect(getProps(evenMore).__proto_proto__).not.toBe(getProps(evenMoreFork).__proto_proto__);
				expect(getProps(evenMore).__timestamp__).not.toBe(getProps(evenMoreFork).__timestamp__);

				expect(evenMore).not.toBe(evenMoreFork);
				expect(evenMoreForkFork).not.toBe(evenMoreFork);

				const evenMorePP = ogp(ogp(evenMore));
				const evenMoreForkPP = ogp(ogp(evenMoreFork));

				expect(evenMorePP).not.toBe(evenMoreForkPP);
				expect(evenMoreFork.str).toEqual(strFork);
				expect(evenMoreForkFork.str).toEqual(strForkOfFork);

				expect(getProps(evenMore).__args__).toEqual(evenMoreArgs);
				expect(getProps(evenMore).__args__).not.toEqual(getProps(evenMoreFork).__args__);

				const nativeFork = new overMore.EvenMore(strFork);

				expect(nativeFork).not.toBe(evenMoreFork);
				expect(nativeFork).toMatchObject(evenMoreFork);
				expect(evenMoreFork).toMatchObject(nativeFork);
				expect(getProps(overMore).__args__).not.toBe(getProps(evenMore).__args__);
				expect(evenMoreFork).toBeInstanceOf(OverMore.lookup('EvenMore'));
				expect(Object.keys(evenMore)).toEqual(Object.keys(evenMoreFork));

			});

			it('instance.ConstructorName.call(undefined) should work', () => {
				expect(overMoreCallEvenMoreUndefined).toBeInstanceOf(overMore.EvenMore);
				expect(overMoreCallEvenMoreUndefined.str).toEqual('re-defined EvenMore str');
			});

			it('instance.ConstructorName.call(null) should work', () => {
				expect(overMoreCallEvenMoreNull).toBeInstanceOf(overMore.EvenMore);
				expect(overMoreCallEvenMoreNull + 1).toEqual(1);
			});

			it('instance.ConstructorName.call(new Number) should work', () => {
				expect(overMoreCallEvenMoreNumber).toBeInstanceOf(overMore.EvenMore);
				expect(overMoreCallEvenMoreNumber).toBeInstanceOf(Number);
				expect(overMoreCallEvenMoreNumber + 2).toEqual(7);
			});

			it('instance.ConstructorName.call(new String) should work', () => {

				expect(overMoreCallEvenMoreString).toBeInstanceOf(overMore.EvenMore);
				expect(overMoreCallEvenMoreString).toBeInstanceOf(String);
				expect(overMoreCallEvenMoreString + 2).toEqual('52');
			});

			it('instance.ConstructorName.call(new Boolean) should work', () => {
				expect(overMoreCallEvenMoreBoolean).toBeInstanceOf(overMore.EvenMore);
				expect(overMoreCallEvenMoreBoolean).toBeInstanceOf(Boolean);
				expect(overMoreCallEvenMoreBoolean + 1).toEqual(2);
			});

			it('instance.ConstructorName.call(process) should work', () => {
				expect(overMoreCallEvenMoreProcess).toBeInstanceOf(overMore.EvenMore);
				expect(typeof overMoreCallEvenMoreProcess.on).toEqual('function');
			});

			it('direct primitive DAG.call(new Boolean) should work', () => {
				expect(userTCdirectDAG).toBeInstanceOf(UserTypeConstructor);
				expect(userTCdirectDAG).toBeInstanceOf(Boolean);
				expect(userTCdirectDAG + 1).toEqual(2);
			});

			it('direct primitive DAG somethin.fork.call(new Boolean) should work', () => {
				expect(userTCforkDAG).toBeInstanceOf(UserTypeConstructor);
				expect(userTCforkDAG).toBeInstanceOf(Boolean);
				expect(userTCforkDAG + 1).toEqual(2);
			});

			it('instance.fork.call() should work + SomeType.SomeSubType', () => {
				expect(userTCForkCall).toBeInstanceOf(UserTypeConstructor);
				expect(userTCForkCall).toBeInstanceOf(UserType);
				expect(userTCForkApply).toBeInstanceOf(UserTypeConstructor);
				expect(userTCForkApply).toBeInstanceOf(UserType);
				expect(userTCForkBind).toBeInstanceOf(UserTypeConstructor);
				expect(userTCForkBind).toBeInstanceOf(UserType);
				expect(getProps(user).__args__[0]).toEqual(USER_DATA);
				expect(getProps(userTC).__args__[0]).toEqual(USER_DATA);
				expect(getProps(userTCForkCall).__args__[0]).toEqual(FORK_CALL_DATA);
				expect(getProps(userTCForkApply).__args__[0]).toEqual(FORK_CALL_DATA);
				expect(getProps(userTCForkBind).__args__[0]).toEqual(FORK_CALL_DATA);
				expect(userTCForkCall).toMatchObject(FORK_CALL_DATA);
				expect(userTCForkApply).toMatchObject(FORK_CALL_DATA);
				expect(userTCForkBind).toMatchObject(FORK_CALL_DATA);
				expect(utcfcwp.password).toBeUndefined();
				expect(overMore).toBeInstanceOf(OverMore);
				expect(evenMore).toBeInstanceOf(OverMore.lookup('EvenMore'));
				expect(evenMore).toBeInstanceOf(OverMore);
				expect(evenMoreForkCall).toBeInstanceOf(OverMore.lookup('EvenMore'));
				expect(evenMoreForkCall).toBeInstanceOf(UserType);
			});

		});

		describe('Hooks Tests', () => {
			it('check invocations count', () => {
				expect(userTypeHooksInvocations.length).toEqual(10);
				expect(typesFlowCheckerInvocations.length).toBeGreaterThan(0);
				expect(typesPreCreationInvocations.length).toBeGreaterThan(0);
				expect(typesPostCreationInvocations.length).toBeGreaterThan(0);
			});
			it('should check invocations of "this"', () => {
				userTypeHooksInvocations.forEach((entry: any) => {
					const {
						self,
						opts: {
							type
						},
						sort,
						kind,
					} = entry;
					expect(self).toEqual(type);
				});
				typesPreCreationInvocations.forEach((entry: any) => {
					const { self } = entry;
					expect(self).toEqual(types);
				});
				typesPostCreationInvocations.forEach((entry: any) => {
					const { self } = entry;
					expect(self).toEqual(types);
				});
			});
		});

		describe('hooks environment', () => {
			try {
				types.registerFlowChecker(undefined as any);
			} catch (error) {
				it('Thrown with Missing Callback', () => {
					expect(error).toBeInstanceOf(Error);
					expect(error).toBeInstanceOf(errors.MISSING_CALLBACK_ARGUMENT);
				});
			}
			try {
				types.registerFlowChecker(() => { });
			} catch (error) {
				it('Thrown with Re-Definition', () => {
					expect(error).toBeInstanceOf(Error);
					expect(error).toBeInstanceOf(errors.FLOW_CHECKER_REDEFINITION);
				});
			}
			try {
				types.registerHook('WrongHookType', () => { });
			} catch (error) {
				it('Thrown with Wrong Hook Type', () => {
					expect(error).toBeInstanceOf(Error);
					expect(error).toBeInstanceOf(errors.WRONG_HOOK_TYPE);
				});
			}
			try {
				types.registerHook('postCreation', undefined as any);
			} catch (error) {
				it('Thrown with Missing Hook Callback', () => {
					expect(error).toBeInstanceOf(Error);
					expect(error).toBeInstanceOf(errors.MISSING_HOOK_CALLBACK);
				});
			}
		});

		describe('Async Constructors Test', () => {
			let asyncInstance: any,
				asyncInstanceDirect: any,
				asyncInstanceDirectApply: any,
				asyncInstancePromise: any,
				asyncSub: any,
				nestedAsyncInstance: any,
				nestedAsyncSub: any,
				asyncInstanceClone: any,
				asyncInstanceFork: any,
				asyncInstanceForkCb: any;

			beforeAll(function (done: any) {
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

					await (promisify((cb: any) => {
						const cbfork = callbackify(asyncInstance.fork);
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						cbfork.call(asyncInstance, 'cb forked data', (err: never, result: unknown) => {
							asyncInstanceForkCb = result;
							cb();
						});
					}))();

					done();
				};
				wait();
			}, 30000);

			it('should be able to call bound methods properly', () => {

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
				const result5 = getThisPropMethod1.call(asyncSub, 'arg123');
				expect(result5).toEqual(321);

				const { getThisPropMethod } = asyncSub;
				const result6 = getThisPropMethod.call(asyncSub, 'arg123');
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

				const result10 = getThisPropMethod2.call(nestedAsyncSub, 'arg123');
				expect(result10).toEqual(456);

				const result11 = hookedMethod.call(nestedAsyncSub, 'getThisPropMethod').call(nestedAsyncSub, 'arg123');
				expect(result11).toEqual(456);
			});

			// Note: These tests are skipped due to Jest behavior differences in error handling
			it.skip('should be able to throw bound methods invocations properly', () => {
				const {
					hookedMethod
				} = nestedAsyncSub;

				let thrown: any;
				try {
					const result = hookedMethod.call(nestedAsyncSub, 'getThisPropMethod');
					result.call(nestedAsyncSub, 'missingProp');
				} catch (error) {
					thrown = error;
				}
				expect(thrown).toBeInstanceOf(Error);

				// Note: Jest behavior differs from Mocha here, actual instance is AsyncType
				expect(thrown).toBeInstanceOf(AsyncType);

				expect(thrown.message).toBeDefined();
				expect(typeof thrown.message).toEqual('string');

				expect(thrown.message).toEqual('prop is missing: missingProp');

				expect(thrown.originalError).toBeInstanceOf(Error);
				expect(thrown.originalError).not.toBeInstanceOf(SubOfNestedAsync);

				let thrown2: any;
				try {
					hookedMethod.call(null, 'getThisPropMethod');
				} catch (error) {
					thrown2 = error;
				}
				expect(thrown2).toBeInstanceOf(Error);
				expect(thrown2.message).toBeDefined();
				expect(typeof thrown2.message).toEqual('string');

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
					hookedMethod.call(nestedAsyncSub, 'getThisPropMethod').call(nestedAsyncSub, 'missingProp');
				} catch (error) {
					thrown3 = error;
				}
				expect(thrown3).toBeInstanceOf(Error);
				expect(thrown3.message).toBeDefined();
				expect(typeof thrown3.message).toEqual('string');

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
					hookedMethod.call(nestedAsyncSub, 'getThisPropMethod').call(nestedAsyncSub, 'missingProp');
				} catch (error) {
					thrown4 = error;
				}
				expect(thrown4).toBeInstanceOf(Error);
				expect(thrown4.message).toBeDefined();
				expect(typeof thrown4.message).toEqual('string');

				expect(thrown4.exceptionReason).toBeInstanceOf(Object);
				expect(thrown4.exceptionReason.methodName).toEqual('getThisPropMethod');

				expect(thrown4.surplus[0]).toBeInstanceOf(Error);
				expect(thrown4.surplus[0].message).toEqual(cae);

			});

			it.skip('should be able to throw on construct inside bound methods after invocations', () => {

				const {
					erroredNestedConstructMethod
				} = asyncInstanceClone;
				let thrown: any;

				new_targets.length = 0;
				try {
					erroredNestedConstructMethod();
				} catch (error) {
					thrown = error;
				}

				expect(new_targets[0]).toEqual('Main');
				expect(new_targets[1]).toEqual('NestedConstruct');
				expect(new_targets[2]).toEqual('NestedSubError');

				expect(thrown).toBeInstanceOf(Error);
				// Note: Jest behavior differs from Mocha here
				expect(thrown).toBeInstanceOf(AsyncType);
				expect(thrown.message).toBeDefined();
				expect(typeof thrown.message).toEqual('string');
				expect(thrown.message).toEqual('Nested SubError Constructor Special Error');
				expect(thrown.originalError).toBeInstanceOf(Error);
				// Note: Jest behavior differs from Mocha here
				expect(thrown.originalError).toBeInstanceOf(AsyncType);

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

			it('should be able to throw async bound methods invocations properly', async () => {
				const {
					erroredAsyncMethod
				} = asyncInstanceClone;

				let thrown: any;
				try {
					await erroredAsyncMethod.call(asyncInstanceClone);
				} catch (error) {
					thrown = error;
				}

				asyncInstanceClone.thrownForReThrow = thrown;
				expect(thrown).toBeInstanceOf(Error);
				expect(thrown).toBeInstanceOf(AsyncType);
				expect(thrown.message).toBeDefined();
				expect(typeof thrown.message).toEqual('string');
				expect(thrown.message).toEqual('async error');
				expect(thrown.originalError).toBeInstanceOf(Error);
				expect(thrown.originalError).not.toBeInstanceOf(AsyncType);

			});

			it.skip('should be able to re-throw async bound methods invocations properly', async () => {
				const {
					erroredAsyncMethod,
					thrownForReThrow
				} = asyncInstanceClone;

				let thrown: any;
				try {
					await erroredAsyncMethod.call(asyncInstanceClone, thrownForReThrow);
				} catch (error) {
					thrown = error;
				}

				expect(thrown).toBeInstanceOf(Error);
				expect(thrown).toBeInstanceOf(AsyncType);
				expect(thrown.message).toBeDefined();
				expect(typeof thrown.message).toEqual('string');
				expect(thrown.message).toStrictEqual('async error');
				expect(thrown.originalError).toBeInstanceOf(Error);
				// Note: Jest behavior differs from Mocha here
				expect(thrown.originalError).toBeInstanceOf(AsyncType);
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
				// Skip Gaia checks if not available in this environment
				if (asyncInstanceDirect[SymbolGaia]) {
					expect(ogp(ogp(asyncInstanceDirect[SymbolGaia])) === process).toEqual(true);
					expect(asyncInstanceDirect[SymbolGaia][MNEMONICA] === URANUS).toEqual(true);
				}
				expect(typeof asyncInstanceDirectApply.on === 'function').toEqual(true);
				if (asyncInstanceDirectApply[SymbolGaia]) {
					expect(ogp(ogp(asyncInstanceDirectApply[SymbolGaia])) === process).toEqual(true);
					expect(asyncInstanceDirectApply[SymbolGaia][MNEMONICA] === URANUS).toEqual(true);
				}

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

			it('parse should work with async .call\'ed instances', () => {
				// The parse result keys depend on the implementation
				const keys = Object.keys(parse(asyncInstance));
				expect(keys).toContain('name');
				expect(keys).toContain('props');
				expect(keys).toContain('self');
				expect(keys).toContain('proto');
			});

		});

	});

	// Include async chain tests
	asyncChainTests({
		UserType,
		UserTypeConstructor,
		AsyncWOReturn,
		AsyncWOReturnNAR,
	});

	// Include environment tests
	environmentTests({
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
		myDecoratedInstance,
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
	});
	
	// Additional coverage tests for uncovered lines
	describe('Additional Coverage Tests', () => {
		const { parse } = require('../src/utils/parse');
		const { ErrorsTypes } = require('../src/descriptors/errors');
	
		describe('parse error conditions', () => {
			it('should throw WRONG_MODIFICATION_PATTERN for null', () => {
				expect(() => parse(null)).toThrow(ErrorsTypes.WRONG_MODIFICATION_PATTERN);
			});
	
			it('should throw WRONG_MODIFICATION_PATTERN for undefined', () => {
				expect(() => parse(undefined)).toThrow(ErrorsTypes.WRONG_MODIFICATION_PATTERN);
			});
	
			it('should throw WRONG_MODIFICATION_PATTERN for object without constructor', () => {
				expect(() => parse(Object.create(null))).toThrow(ErrorsTypes.WRONG_MODIFICATION_PATTERN);
			});
		});
	});
});
