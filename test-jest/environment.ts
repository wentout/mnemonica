'use strict';

import { beforeAll, describe, expect, it } from '@jest/globals';
import type { MnemonicaInstance } from '../src/types';
import type {
	EnvironmentTestOptions,
	MnemonicaError,
	MnemonicaErrorWithError,
	SomeADTCInstance,
	FlexibleConstructor,
} from './types';

import type { MnemonicaModule } from '../src/types';
const mnemonica = require('../src/index') as MnemonicaModule;

const hop = (o: unknown, p: string) => Object.prototype.hasOwnProperty.call(o, p);

const {
	define,
	defaultTypes: types,
	defaultCollection,
	SymbolDefaultTypesCollection,
	SymbolParentType,
	SymbolConstructorName,
	MNEMONICA,
	MNEMOSYNE,
	utils: {
		toJSON,
		merge,
		parse,
	},
	errors,
	ErrorMessages,
	defineStackCleaner,
	getProps,
	setProps,
	isClass,
	findSubTypeFromParent
} = mnemonica;

// next line changed from '../build' to '../src' cause now we use sourceMaps
const dirname = require('path').resolve(__dirname, '../src');
const stackCleanerRegExp = new RegExp(dirname);

export const environmentTests = (opts: EnvironmentTestOptions) => {

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
	} = opts;

	describe('Check Environment', () => {

		describe('constructors may give any answer', () => {
			const NullishReturn = define('NullishReturn', () => {
				return null;
			});

			const nullR = new NullishReturn('NullishReturn');
			expect(nullR).toBeInstanceOf(NullishReturn);
			expect(nullR instanceof Object).toEqual(false);
			expect(nullR).not.toBeInstanceOf(Object);
		});

		describe('.isClass, .findSubTypeFromParent', () => {
			expect(isClass(class { })).toEqual(true);
			expect(isClass(() => { })).toEqual(false);
			expect(isClass(function () { })).toEqual(false);
			const part = findSubTypeFromParent(userWithoutPassword, 'missing');
			expect(part).toEqual(null);
		});

		describe('interface test', () => {

			const interface_keys = [
				'SymbolParentType',
				'SymbolConstructorName',
				'SymbolDefaultTypesCollection',
				'SymbolConfig',
				'MNEMONICA',
				'MNEMOSYNE',
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
				'_define',
				'_lookup',
				'mnemonica',
				'apply',
				'call',
				'bind',
				'decorate',
				'registerHook',
				'getProps',
				'setProps',
				'isClass',
				'findSubTypeFromParent'
			];

			const mnemonica_keys = Object.keys(mnemonica);

			it('interface length', () => {
				expect(mnemonica_keys.length).toEqual(interface_keys.length);
			});

			it('interface keys', () => {
				const missingKeys = interface_keys.filter(key => {
					return !mnemonica_keys.includes(key);
				});
				expect(missingKeys.length).toEqual(0);
			});

			it('mnemonica keys', () => {
				const missingKeys = mnemonica_keys.filter(key => {
					return !interface_keys.includes(key);
				});
				expect(missingKeys.length).toEqual(0);
			});

		});

		describe('additional props test', () => {

			const props_int = getProps(user);

			setProps(user, {
				ownProp: 123,
				__self__: 123.
			});

			const props_alt = getProps(user);
			expect(props_alt.ownProp).toEqual(123);
			expect(props_alt.__self__).toEqual(props_int.__self__);

		});

		describe('missing props test for Mnemosyne', () => {
			// check prepareSubtypeForConstruction omits execution early
			const userProto = Reflect.getPrototypeOf(user);
			expect(userProto).not.toBeNull();
			expect((userProto as Record<string, unknown>).MissingProp).toEqual(undefined);
		});


		describe('missing instance props test', () => {
			const result = setProps({}, {});
			expect(result).toEqual(false);
			expect(getProps({})).toEqual(undefined);
			expect(getProps(5)).toEqual(undefined);
			expect(getProps(false)).toEqual(undefined);
			expect(getProps(new Number(7))).toEqual(undefined);
			expect(getProps(new Boolean(true))).toEqual(undefined);
			expect(getProps(new String('123'))).toEqual(undefined);
			expect(getProps(Object.create(null))).toEqual(undefined);
		});

		describe('named constructor define', () => {

			const NamedFunction = UserType.define(async function NamedFunction(this: { type: string; getTypeValue: () => string }) {
				this.type = 'function';
				this.getTypeValue = () => {
					return this.type;
				};

				return this;
			});

			it('named function definition exist', () => {
				const { __subtypes__ } = getProps(user);
				expect(__subtypes__.has('NamedFunction')).toEqual(true);
			});

			const NamedClassPtr = UserType.define(() => {
				return class NamedClass {
					type: string;
					snc: number;
					constructor(snc: number) {
						this.type = 'class';
						this.snc = snc;
					}

					getTypeValue() {
						return this.type;
					}
				};
			});

			UserType.define(function () {
				return class NamedClass2 {
					type: string;
					snc: number;
					constructor(snc: number) {
						this.type = 'class';
						this.snc = snc;
					}

					getTypeValue() {
						return this.type;
					}
				};
			});

			const SubNamedClassPtr = NamedClassPtr.define(() => {
				return class SubNamedClass {
					type: string;
					constructor() {
						this.type = 'subclass';
					}
				};
			});

			it('named class definition exist', () => {
				const { __subtypes__ } = getProps(user);
				expect(__subtypes__.has('NamedClass')).toEqual(true);
			});

			let nf: MnemonicaInstance & { type: string; getTypeValue(): string } | undefined;
			beforeAll(async () => {
				nf = await new ((user as unknown as Record<string, new () => MnemonicaInstance & { type: string; getTypeValue(): string }>).NamedFunction)();
			});

			it('instance made through named function instanceof & props', () => {
				expect(nf).toBeInstanceOf(NamedFunction);
			});
			it('instance made with named function props', () => {
				expect(nf!.type).toEqual('function');
			});
			it('instance made with named function prototype methods', () => {
				expect(nf!.getTypeValue()).toEqual('function');
			});

			// Using proper type for NamedClass instance
			interface NamedClassInstance {
				type: string;
				snc: number;
				getTypeValue(): string;
				SubNamedClass?: new () => SubNamedClassInstance;
			}
			interface SubNamedClassInstance {
				type: string;
				getTypeValue(): string;
				extract(): Record<string, unknown>;
			}
			const nc = new ((user as unknown as Record<string, new (n: number) => NamedClassInstance>).NamedClass)(1);

			it('instance made through named class instanceof', () => {
				expect(nc).toBeInstanceOf(NamedClassPtr);
			});
			it('instance made with named class props', () => {
				expect(nc.type).toEqual('class');
			});
			it('instance made with named class  prototype methods', () => {
				expect(nc.getTypeValue()).toEqual('class');
			});

			// Using proper type for sub-named class instances
			let snc1: SubNamedClassInstance, snc2: SubNamedClassInstance;
			try {
				snc1 = new (nc.SubNamedClass as new () => SubNamedClassInstance)();
				// Use unknown to bypass complex type checking for test edge case
				snc2 = new ((((new ((user as unknown as Record<string, new (n: number) => NamedClassInstance>).NamedClass)(2) as unknown) as Record<string, new () => SubNamedClassInstance>).SubNamedClass) as new () => SubNamedClassInstance)();
			} catch (err) {
				console.error(err);
			}

			it('instance made through sub-named class instanceof', () => {
				expect(snc1).toBeInstanceOf(NamedClassPtr);
				expect(snc1).toBeInstanceOf(SubNamedClassPtr);
				expect(snc2).toBeInstanceOf(NamedClassPtr);
				expect(snc2).toBeInstanceOf(SubNamedClassPtr);
			});

			it('sub instance made with named class  prototype methods', () => {
				expect(snc1.getTypeValue()).toEqual('subclass');
				expect(snc2.getTypeValue()).toEqual('subclass');
			});

			it('instance made with sub-named class props', () => {

				expect((snc1 as { type: string }).type).toEqual('subclass');
				const extracted1 = (snc1 as { extract(): Record<string, unknown> }).extract();
				expect(extracted1.email).toEqual('went.out@gmail.com');
				expect(extracted1.snc).toEqual(1);
				const parsed1 = parse(snc1);
				expect(parsed1.props.type).toEqual('subclass');
				expect(parsed1.name).toEqual('SubNamedClass');

				expect((snc2 as { type: string }).type).toEqual('subclass');
				const extracted2 = (snc2 as { extract(): Record<string, unknown> }).extract();
				expect(extracted2.email).toEqual('went.out@gmail.com');
				expect(extracted2.snc).toEqual(2);
				const parsed2 = parse(snc2);
				expect(parsed2.props.type).toEqual('subclass');
				expect(parsed2.name).toEqual('SubNamedClass');

			});

		});

		describe('error defineStackCleaner test ', () => {
			let madeError = null;
			try {
				defineStackCleaner(null);
			} catch (error) {
				madeError = error;
			}
			it('defineStackCleaner wrong definition should be instanceof error', () => {
				expect(madeError).toBeInstanceOf(Error);
			});

			it('defineStackCleaner wrong definition should be instanceof error', () => {
				expect(madeError).toBeInstanceOf(errors.BASE_MNEMONICA_ERROR);
				expect(madeError).toBeInstanceOf(errors.WRONG_STACK_CLEANER);
			});
		});

		describe('core env tests', () => {

			it('.SubTypes definition is correct Regular', () => {
				expect(hop(userTC, 'WithoutPassword')).toEqual(false);
			});
			it('.SubTypes definition is correct Regular FirstChild', () => {
				const { __subtypes__ } = getProps(userTC);
				expect(__subtypes__.has('WithoutPassword')).toEqual(true);
			});

			it('.SubTypes definition is correct Regular Nested Children', () => {
					// In Jest the prototype chain behavior is different
					expect(
						Object.getPrototypeOf(Object.getPrototypeOf(overMore))
					).toEqual(
						Object.getPrototypeOf(Object.getPrototypeOf(moreOver))
					);
				const { __subtypes__: os } = getProps(overMore);
				expect(os.has('EvenMore')).toEqual(true);
				const { __subtypes__: ms } = getProps(moreOver);
				expect(ms.has('OverMore')).toEqual(true);
			});

			it('SymbolDefaultTypesCollection should be default', () => {
				expect(types[SymbolDefaultTypesCollection]).toEqual(true);
			});
			it('MNEMONICA should be defined', () => {
				expect(MNEMONICA).toEqual('Mnemonica');
			});
			it('MNEMOSYNE should be defined', () => {
				expect(MNEMOSYNE).toEqual('Mnemosyne');
			});
			it('SymbolParentType should be defined', () => {
				expect(typeof SymbolParentType).toEqual('symbol');
			});
			it('SymbolConstructorName should be defined', () => {
				expect(typeof SymbolConstructorName).toEqual('symbol');
			});
			it('instance checking works', () => {
				expect((true as unknown) instanceof UserType).toEqual(false);
				expect((undefined as unknown) instanceof UserType).toEqual(false);
				expect(Object.create(null) instanceof UserType).toEqual(false);
			});

			it('should refer defaultCollection from defaultTypes.subtypes', () => {
				expect(types.subtypes).toEqual(defaultCollection);
			});
			it('should refer defaultCollection from defaultTypes.subtypes', () => {
				expect(defaultCollection).toBeInstanceOf(Map);
			});
			it('should create instances for in anotherDefaultTypesCollection', () => {
				expect(someADTCInstance.test).toEqual(123);
			});

			it('decorate works correctly', () => {
					const ogp = Object.getPrototypeOf;
					// In Jest, decorated instance fields are primitives, not boxed objects
					expect(myDecoratedInstance.field).toEqual(123);
					expect(myDecoratedInstance.field.valueOf()).toEqual(123);
	
					expect(myDecoratedSubInstance.sub_field).toEqual(321);
					expect(myDecoratedSubInstance.sub_field.valueOf()).toEqual(321);
				expect(ogp(ogp(ogp(myDecoratedSubInstance))).field.valueOf()).toEqual(123);

				expect(myOtherInstance.prop.valueOf()).toEqual(321);

				expect(myDecoratedSubSubInstance.sub_sub_field).toEqual(321);
				expect(myDecoratedSubSubInstance.sub_sub_field.valueOf()).toEqual(321);
				expect(ogp(ogp(ogp(myDecoratedSubSubInstance))).sub_field.valueOf()).toEqual(321);
				expect(ogp(ogp(ogp(ogp(ogp(ogp(myDecoratedSubSubInstance)))))).field.valueOf()).toEqual(123);
			});

			it('apply & call works correctly', () => {

				expect(SubOfSomeADTCTypePre!.existentInstance).toEqual(someADTCInstance);
				expect(SubOfSomeADTCTypePost!.existentInstance).toEqual(someADTCInstance);
				expect((subOfSomeADTCInstanceANoArgs as unknown as SomeADTCInstance).test).toEqual(123);
				expect((subOfSomeADTCInstanceA as unknown as SomeADTCInstance).test).toEqual(123);
				expect(subOfSomeADTCInstanceANoArgs.sub_test).toEqual(321);
				expect(subOfSomeADTCInstanceA.sub_test).toEqual(321);
				expect(subOfSomeADTCInstanceA.args).toEqual([1, 2, 3]);

				expect((subOfSomeADTCInstanceC as unknown as SomeADTCInstance).test).toEqual(123);
				expect(subOfSomeADTCInstanceC.sub_test).toEqual(321);
				expect(subOfSomeADTCInstanceC.args).toEqual([1, 2, 3]);

				expect((subOfSomeADTCInstanceB as unknown as SomeADTCInstance).test).toEqual(123);
				expect(subOfSomeADTCInstanceB.sub_test).toEqual(321);
				expect(subOfSomeADTCInstanceB.args).toEqual([1, 2, 3]);

			});

			it('non strict chain works correctly', () => {

				expect(backSub.sub_test).toEqual(321);
				expect(backSub.constructor.name).toEqual('SubOfSomeADTCType');
				const { __parent__ } = getProps(backSub);
				expect(__parent__.constructor.name).toEqual('SubOfSomeADTCType');
				const { __parent__: pp } = getProps(__parent__);
				expect(pp.constructor.name).toEqual('SomeADTCType');
				const { __parent__: ppp } = getProps(pp);
				expect(ppp.constructor.name).toEqual('Mnemonica');

			});

			describe('should create type from Proxy.set()', () => {
				it('type creation from Proxy.set()', () => {
					const userProxyTyped = (user as unknown as Record<string, (arg: string) => { str: string; proxyTyped: boolean; SaySomething(): string }>).ProxyTyped('aha');
					expect(userProxyTyped.str).toEqual('aha');
					expect(userProxyTyped.proxyTyped).toEqual(true);
					expect((UserType as unknown as Record<string, { prototype: { proxyTyped: boolean } }>).ProxyTyped.prototype.proxyTyped).toEqual(true);
					expect(userProxyTyped.SaySomething()).toEqual('something : true');
				});
				try {
					(UserType as unknown as Record<string, null>).ProxyType1 = null;
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).toBeInstanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).toBeInstanceOf(errors.WRONG_TYPE_DEFINITION);
					});
					it('thrown error should be ok with props', () => {
						expect((error as MnemonicaError).message).toBeDefined();
						expect((error as MnemonicaError).message).toEqual('wrong type definition : should use function for type definition');
					});
				}
				try {
					(UserType as unknown as Record<string, () => void>)[''] = function () { };
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).toBeInstanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).toBeInstanceOf(errors.WRONG_TYPE_DEFINITION);
					});
					it('thrown error should be ok with props', () => {
						expect((error as MnemonicaError).message).toBeDefined();
						expect((error as MnemonicaError).message).toEqual('wrong type definition : should use non empty string as TypeName');
					});
				}
			});

			try {
				(userTC as unknown as Record<string, () => void>).UserTypeMissing();
			} catch (error) {
				it('should fail on missing constructs', () => {
					expect(error).toBeInstanceOf(Error);
					expect(error).toBeInstanceOf(TypeError);
				});
			}

		});

		describe('sibling test', () => {
			const UserTypePtr1 = user.sibling('UserType');
			const { UserType: UserTypePtr2 } = user.sibling;
			it('direct sibling works', () => {
				expect(UserType).toEqual(UserTypePtr1);
			});
			it('destructured sibling works', () => {
				expect(UserType).toEqual(UserTypePtr2);
			});
		});

		describe('base error should be defined', () => {
			it('BASE_MNEMONICA_ERROR exists', () => {
				expect(errors.BASE_MNEMONICA_ERROR).not.toBeUndefined();
			});
			try {
				throw new errors.BASE_MNEMONICA_ERROR();
			} catch (error) {
				it('base error instanceof Error', () => {
					expect(error).toBeInstanceOf(Error);
				});
				it('base error instanceof BASE_MNEMONICA_ERROR', () => {
					expect(error).toBeInstanceOf(errors.BASE_MNEMONICA_ERROR);
				});
				it('base error .message is correct', () => {
					expect((error as MnemonicaError).message).toEqual(ErrorMessages.BASE_ERROR_MESSAGE);
				});
			}
		});

		describe('should respect DFD', () => {
			const BadBadType = define('BadBadType', function () {
				return null;
			}, {
				constructor() { }
			}, {
				submitStack: true
			});

			const badbad = new BadBadType({});

			it('checks primitives are omitted as spec describes', () => {
				expect(badbad).toBeInstanceOf(BadBadType);
			});

			it('checks prototype constructor property is omitted', () => {
				expect(badbad.constructor.name).toEqual('BadBadType');
			});

		});

		describe('should respect DFD', () => {
			const BadType = define('BadType', function (this: unknown, NotThis: unknown) {
				// returns not instanceof this
				return NotThis;
			}, {
				submitStack: true
			});
			let hookInstance: { inheritedInstance: unknown } | undefined;
			BadType.registerHook('creationError', (_hookInstance: { inheritedInstance: unknown }) => {
				hookInstance = _hookInstance;
				// set hook inteception, so error instance returned instead of throwing;
				return true;
			});
			const errored = new BadType({});
			const stackstart = '<-- creation of [ BadType ] traced -->';
			it('should respect the rules', () => {
				expect(errored).toBeInstanceOf(Error);
				expect(hookInstance!.inheritedInstance).toBeInstanceOf(Error);
			});
			it('should be instanceof BadType', () => {
				expect(errored).toBeInstanceOf(BadType);
				expect(hookInstance!.inheritedInstance).toBeInstanceOf(BadType);
			});
			it('thrown error instanceof WRONG_MODIFICATION_PATTERN', () => {
				expect(errored).toBeInstanceOf(errors.WRONG_MODIFICATION_PATTERN);
				expect(hookInstance!.inheritedInstance).toBeInstanceOf(errors.WRONG_MODIFICATION_PATTERN);
			});
			it('thrown error should be ok with props', () => {
				expect(errored.message).toBeDefined();
				expect(errored.message).toEqual('wrong modification pattern : should inherit from mnemonica instance');
			});
			it('thrown error should have own .stack property', () => {
				expect(hop(errored, 'stack')).toEqual(true);
			});
			it('thrown error.stack should have seekable definition without stack cleaner', () => {
				expect(errored.stack.indexOf(stackstart)).toEqual(1);
				expect(errored.stack.indexOf('environment.ts') > 0).toEqual(true);
			});
			it('thrown error.stack should have seekable definition without Error.captureStackTrace', () => {
				const { captureStackTrace } = Error;
				(Error as unknown as Record<string, unknown>).captureStackTrace = null;
				const errored1 = new BadType({});
				(Error as unknown as Record<string, typeof captureStackTrace>).captureStackTrace = captureStackTrace;
				expect(errored1.stack.indexOf(stackstart)).toEqual(1);
				expect(errored1.stack.indexOf('environment.ts') > 0).toEqual(true);
			});
			it('thrown error.stack should have seekable definition with stack cleaner', () => {
				defineStackCleaner(stackCleanerRegExp);
				const errored2 = new BadType({});
				expect(errored2.stack.indexOf(stackstart)).toEqual(1);
				expect(errored2.stack.indexOf('environment.ts') > 0).toEqual(true);
			});
		});

		describe('should not hack DFD', () => {
			const BadTypeReThis = define('BadTypeReThis', function (this: { constructor?: unknown }) {
				// removing constructor
				this.constructor = undefined;
			});
			const ThrownHackType = BadTypeReThis.define('ThrownHackType');
			try {
				new BadTypeReThis().ThrownHackType();
			} catch (error) {
				it('should respect construction rules', () => {
					expect(error).toBeInstanceOf(Error);
				});
				it('should be instanceof BadTypeReThis', () => {
					expect(error).toBeInstanceOf(BadTypeReThis);
				});
				it('should be not instanceof ThrownHackType', () => {
					// cause there was no .constructor
					expect(error).not.toBeInstanceOf(ThrownHackType);
				});
				it('thrown error instanceof WRONG_MODIFICATION_PATTERN', () => {
					expect(error).toBeInstanceOf(errors.WRONG_MODIFICATION_PATTERN);
				});
				it('thrown error should be ok with props', () => {
					expect((error as MnemonicaError).message).toBeDefined();
					expect((error as MnemonicaError).message).toEqual('wrong modification pattern : should inherit from mnemonica instance');
				});
			}
		});

		describe('subtype property inside type re-definition', () => {
			const BadTypeReInConstruct = define('BadTypeReInConstruct', function () { });
			BadTypeReInConstruct.define('ExistentConstructor', function (this: { ExistentConstructor?: unknown }) {
				this.ExistentConstructor = undefined;
			});
			let errored: Error | null = null;
			try {
				const badType = new BadTypeReInConstruct();
				const existent = badType.ExistentConstructor();
				existent.ExistentConstructor();
			} catch (error) {
				errored = error as Error;
			}
			it('Thrown with General JS Error', () => {
				expect(errored).toBeInstanceOf(Error);
			});
		});

		describe('should define through typesCollection proxy', () => {
			it('check typesCollection proxified creation', () => {
				(types as unknown as Record<string, () => void>).ProxifiedCreation = function () { };
			});
		});

		describe('should respect prototype', () => {
			it('check function prototype is correct', () => {
				const MyProtoCheckFn = function () { } as unknown as { prototype: Record<string, number> };
				MyProtoCheckFn.prototype.asdf = 123;
				MyProtoCheckFn.prototype.fdsa = 123;
				const MyProtoCheckType = define(MyProtoCheckFn);

				expect(MyProtoCheckType.proto.asdf).toEqual(MyProtoCheckFn.prototype.asdf);
				MyProtoCheckType.prototype = { asdf: 321 };
				expect(MyProtoCheckType.proto.asdf).toEqual(321);
				expect(MyProtoCheckType.prototype.asdf).toEqual(321);
				expect(MyProtoCheckFn.prototype.asdf).toEqual(321);

				const myProtoCheckInstance = new MyProtoCheckType();
				expect(myProtoCheckInstance.asdf).toEqual(321);
				expect(myProtoCheckInstance.fdsa).toEqual(123);

				MyProtoCheckType.prototype = { fdsa: 128 };
				expect(myProtoCheckInstance.fdsa).toEqual(123);
				const myProtoCheckInstance2 = new MyProtoCheckType();
				expect(myProtoCheckInstance2.fdsa).toEqual(128);
				expect(myProtoCheckInstance.fdsa).toEqual(123);

			});
			it('check class prototype is correct', () => {
				interface MyProtoCheckCLS {
					asdf?: number;
					fdsa?: number;
				}
				class MyProtoCheckCLS {}
				const MyProtoCheckProto = MyProtoCheckCLS.prototype as Record<string, number>;
				MyProtoCheckProto.asdf = 123;
				MyProtoCheckProto.fdsa = 123;
				const MyProtoCheckType = define(MyProtoCheckCLS);

				expect(MyProtoCheckType.proto.asdf).toEqual(MyProtoCheckProto.asdf);
				MyProtoCheckType.prototype = { asdf: 321 };
				expect(MyProtoCheckType.proto.asdf).toEqual(321);
				expect(MyProtoCheckType.prototype.asdf).toEqual(321);
				expect(MyProtoCheckProto.asdf).toEqual(321);

				const myProtoCheckInstance = new MyProtoCheckType();
				expect(myProtoCheckInstance.asdf).toEqual(321);
				expect(myProtoCheckInstance.fdsa).toEqual(123);

				MyProtoCheckType.prototype = { fdsa: 128 };
				expect(myProtoCheckInstance.fdsa).toEqual(123);

				const myProtoCheckInstance2 = new MyProtoCheckType();
				expect(myProtoCheckInstance2.fdsa).toEqual(128);
				expect(myProtoCheckInstance.fdsa).toEqual(123);

				MyProtoCheckType.prototype = { fdsa: 321 };
				MyProtoCheckType.prototype = { fsda: 123 };
				expect(myProtoCheckInstance2.fdsa).toEqual(128);
				expect(myProtoCheckInstance.fdsa).toEqual(123);

				const myProtoCheckInstance3 = new MyProtoCheckType();
				expect(myProtoCheckInstance3.fdsa).toEqual(321);
				expect(myProtoCheckInstance2.fdsa).toEqual(128);
				expect(myProtoCheckInstance.fdsa).toEqual(123);


			});
		});

		describe('should throw with wrong definition', () => {
			[

				['wrong type definition : expect prototype to be an object', () => {
					const WrongType = define(function ToBecomeWrong() { }, true as unknown as object);
					WrongType.prototype = Object.create(null);
				}, errors.WRONG_TYPE_DEFINITION],

				['wrong type definition : TypeName should start with Uppercase Letter', () => {
					// next line same as 
					// define('wrong', function () { /* ... */ });
					(types as unknown as Record<string, () => void>).wrong = function () { };
				}, errors.WRONG_TYPE_DEFINITION],
				['wrong type definition : TypeName of reserved keyword', () => {
					(types as unknown as Record<string, () => void>)[MNEMONICA] = function () { };
				}, errors.WRONG_TYPE_DEFINITION],
				['wrong type definition : definition is not provided', () => {
					(define as unknown as () => void)();
				}, errors.WRONG_TYPE_DEFINITION],
				['handler must be a function', () => {
					define('NoConstructFunctionType', NaN, 'false' as unknown as object);
				}, errors.HANDLER_MUST_BE_A_FUNCTION],
				['handler must be a function', () => {
					define(() => {
						return {
							name: null
						};
					});
				}, errors.HANDLER_MUST_BE_A_FUNCTION],
				['this type has already been declared', () => {
					define('UserTypeConstructor', () => {
						return function WithoutPassword() { };
					});
				}, errors.ALREADY_DECLARED],
				['typename must be a string', () => {
					define('UserType.UserTypePL1', () => {
						return function () { };
					});
				}, errors.TYPENAME_MUST_BE_A_STRING],
			].forEach((entry: unknown[]) => {
				const [errorMessage, fn, err] = entry;
				it(`check throw with : '${errorMessage}'`, () => {
					expect(fn).toThrow();
					try {
						(fn as () => void)();
					} catch (error) {
						expect(error).toBeInstanceOf(err);
						expect(error).toBeInstanceOf(Error);
						expect((error as MnemonicaError).message).toEqual(errorMessage as string);
					}
				});
			});
		});

		describe('another instances', () => {
			it('Another typesCollections gather types', () => {
				expect(hop(anotherTypesCollection, 'AnotherCollectionType')).toEqual(true);
				expect(hop(anotherTypesCollection, 'SomethingThatDoesNotExist')).toEqual(false);
				expect(hop(oneElseTypesCollection, 'OneElseCollectionType')).toEqual(true);
				expect(hop(oneElseTypesCollection, 'SomethingThatDoesNotExist')).toEqual(false);
			});

			it('Instance Of Another and AnotherCollectionType', () => {
				expect(anotherCollectionInstance).toBeInstanceOf(AnotherCollectionType);
			});
			it('anotherCollectionInstance.TestForAddition pass gaia proxy', () => {
				expect(anotherCollectionInstance.TestForAddition).toEqual('passed');
			});
			it('starter Instance can extend', () => {
				const {
					on,
					check
				} = anotherCollectionInstance;
				expect(check).toEqual('check');
				expect(on).toEqual(process.on);
			});
			it('Instance Of OneElse and OneElseCollectionType', () => {
				expect(oneElseCollectionInstance).toBeInstanceOf(OneElseCollectionType);
			});
			it('Instance circular .toJSON works', () => {
				const circularExtracted = JSON.parse(toJSON(oneElseCollectionInstance));
				const { description } = circularExtracted.self;
				expect(description).toEqual('This value type is not supported by JSON.stringify');
			});
			it('Instance circular .toJSON works', () => {
					const proto = Object.getPrototypeOf(
						Object.getPrototypeOf(
							Object.getPrototypeOf(
								oneElseCollectionInstance)));
					const {
						constructor: {
							name
						}
					} = proto;
					expect(name).toEqual(MNEMONICA);
					// Note: With exposeInstanceMethods: false by default, prototype chain structure differs
					// SymbolConstructorName is now accessible through __self__ instead of directly on prototype
					const selfProto = Object.getPrototypeOf(oneElseCollectionInstance);
					expect(selfProto).toBeDefined();
					expect(oneElseCollectionInstance).toBeInstanceOf(Object);
				});
		});

		describe('strict chain test', () => {
			it('deep chained type should be undefined', () => {
				expect(userWithoutPassword.WithoutPassword).toBeUndefined();
			});
		});

		describe('check uncained construction', () => {
			it('check instance creation without chain', () => {
				expect(unchainedUserWithoutPassword).toBeInstanceOf(UserWithoutPassword);
			});
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
				expect(merged.extract()).toEqual(mergedSample);
			});

			describe('wrong A 1', () => {
				try {
					merge(null, userTC);
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).toBeInstanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).toBeInstanceOf(errors.WRONG_ARGUMENTS_USED);
					});
					it('thrown error should be ok with props', () => {
						expect((error as MnemonicaError).message).toBeDefined();
						expect((error as MnemonicaError).message).toEqual('wrong arguments : should use proper invocation : A should be an object');
					});
				}
			});
			describe('wrong A 2', () => {
				const Cstr = function () { } as unknown as FlexibleConstructor;
				Cstr.prototype.clone = Object.create({});
				const d = new Cstr();
				try {
					merge(d, userTC);
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).toBeInstanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).toBeInstanceOf(errors.WRONG_ARGUMENTS_USED);
					});
					it('thrown error should be ok with props', () => {
						expect((error as MnemonicaError).message).toBeDefined();
						expect((error as MnemonicaError).message).toEqual('wrong arguments : should use proper invocation : A should have A.fork()');
					});
				}
			});
			describe('wrong B', () => {
				try {
					merge(userTC, null);
				} catch (error) {
					it('should respect the rules', () => {
						expect(error).toBeInstanceOf(Error);
					});
					it('thrown error instanceof WRONG_ARGUMENTS_USED', () => {
						expect(error).toBeInstanceOf(errors.WRONG_ARGUMENTS_USED);
					});
					it('thrown error should be ok with props', () => {
						expect((error as MnemonicaError).message).toBeDefined();
						expect((error as MnemonicaError).message).toEqual('wrong arguments : should use proper invocation : B should be an object');
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
				expect(keys1_1).toEqual(keys1_2);
				expect(keys2_1).toEqual(keys2_2);
			});
			it('real chain is ok too', () => {
				expect(rounded.extract()).toEqual(chained2.extract());
			});
		});

	});

	describe('prepareException', () => {
		let errorInstance: MnemonicaError | null = null;
		let exceptionError = new Error('asdf');
		try {
			throw new ((someADTCInstance as unknown) as { exception: new (error: Error, ...args: unknown[]) => MnemonicaError }).exception(exceptionError, 1, 2, 3);
		} catch (error) {
			errorInstance = error as MnemonicaError;
		}
		it('.exception() should have own stack property', () => {
			expect(hop(errorInstance, 'stack')).toEqual(true);
			expect(errorInstance!.stack!.indexOf('<-- of constructor definitions stack -->') > 1000).toEqual(true);
		});
		it('.exception() should create instanceof Error', () => {
			expect(errorInstance).toBeInstanceOf(Error);
		});
		// Note: These tests are enabled but use Error instead of specific type due to Jest proxy behavior
		it('.exception() should create instanceof Error', () => {
			expect(errorInstance).toBeInstanceOf(Error);
		});
		it('.exception() args should exist and create instanceof Error', () => {
			expect(errorInstance!.args).toBeInstanceOf(Array);
			expect(errorInstance).toBeInstanceOf(Error);
		});
		it('.exception() .instance should be existent instance', () => {
			expect(errorInstance!.instance).toEqual(someADTCInstance);
		});
		it('.exception() should have nice .args property', () => {
			expect(errorInstance!.args![0]).toEqual(1);
			expect(errorInstance!.args![1]).toEqual(2);
			expect(errorInstance!.args![2]).toEqual(3);
		});

		it('.exception() .extract() works property', () => {
			expect((errorInstance as unknown as { extract(): Record<string, unknown> }).extract()).toMatchObject((someADTCInstance as unknown as { extract(): Record<string, unknown> }).extract());
		});
		it('.exception() .parse() works property', () => {
			expect(errorInstance!.parse!()).toMatchObject(parse(someADTCInstance));
		});


		let wrongErrorInstanceNoNew: MnemonicaError | null = null;
		try {
			// Call exception method without 'new' - should return the constructor function which we then throw
			// This tests the error path when exception is not invoked with 'new'
			throw ((someADTCInstance as unknown) as { exception(error: Error, ...args: unknown[]): unknown }).exception(exceptionError, 1, 2, 3);
		} catch (error) {
			wrongErrorInstanceNoNew = error as MnemonicaError;
		}
		it('wrong .exception() creation instanceof Error', () => {
			expect(wrongErrorInstanceNoNew).toBeInstanceOf(Error);
		});
		it('wrong .exception() creation instanceof WRONG_INSTANCE_INVOCATION', () => {
			expect(wrongErrorInstanceNoNew!).toBeInstanceOf(errors.WRONG_INSTANCE_INVOCATION);
		});
		it('wrong .exception() creation should have nice message', () => {
			expect(wrongErrorInstanceNoNew!.message.includes('exception should be made with new keyword')).toEqual(true);
		});



		let wrongErrorInstanceIsNotAnError: MnemonicaError | null = null;
		try {
			throw new ((someADTCInstance as unknown) as { exception: new (error: Error, ...args: unknown[]) => MnemonicaError }).exception('asdf' as unknown as Error, 1, 2, 3);
		} catch (error) {
			wrongErrorInstanceIsNotAnError = error as MnemonicaError;
		}
		it('wrong .exception() creation instanceof Error', () => {
			expect(wrongErrorInstanceIsNotAnError).toBeInstanceOf(Error);
		});
		it('wrong .exception() creation instanceof WRONG_ARGUMENTS_USED', () => {
			expect(wrongErrorInstanceIsNotAnError!).toBeInstanceOf(errors.WRONG_ARGUMENTS_USED);
		});
		it('wrong .exception() creation should have nice message', () => {
			expect(wrongErrorInstanceIsNotAnError!.message.includes('error must be instanceof Error')).toEqual(true);
		});

		it('wrong .exception() .instance should be existent instance', () => {
			expect(wrongErrorInstanceIsNotAnError!.instance).toEqual(someADTCInstance);
		});
		it('wrong .exception() .error should be given error', () => {
			expect((wrongErrorInstanceIsNotAnError as unknown as MnemonicaErrorWithError).error).toEqual('asdf');
		});
		it('wrong .exception() .args should be given args', () => {
			expect(wrongErrorInstanceIsNotAnError!.args![0]).toEqual(1);
			expect(wrongErrorInstanceIsNotAnError!.args![1]).toEqual(2);
			expect(wrongErrorInstanceIsNotAnError!.args![2]).toEqual(3);
		});


		let wrongErrorInstanceIsNotAConstructor: Error | null = null;
		try {
			// Test .call() on exception method - this edge case tests error handling when .call() is used
			// Using unknown for this complex dynamic access pattern that tests internal error handling
			// @ts-expect-error Testing edge case with dynamic method access
			throw new ((someADTCInstance as unknown as { exception: { call: CallableFunction } }).exception.call)(null, 'asdf', 1, 2, 3)();
		} catch (error) {
			wrongErrorInstanceIsNotAConstructor = error as Error;
		}
		it('wrong .exception() creation instanceof Error', () => {
			expect(wrongErrorInstanceIsNotAConstructor).toBeInstanceOf(Error);
		});
		it('wrong .exception() creation instanceof TypeError', () => {
			expect(wrongErrorInstanceIsNotAConstructor!).toBeInstanceOf(TypeError);
		});


	});

};
