'use strict';

import { ConstructorFunction } from '../../types';
import { constants } from '../../constants';
const {
	odp,
	SymbolConstructorName,

	MNEMONICA,

} = constants;

import TypesUtils from '../utils';
const {
	getTypeChecker,
	findSubTypeFromParent,
	reflectPrimitiveWrappers
} = TypesUtils;

import { extract } from '../../utils/extract';
import { parent } from '../../utils/parent';
import { pick } from '../../utils/pick';

import exceptionConstructor from '../errors/exceptionConstructor';

import { InstanceCreator } from './InstanceCreator';

import { _getProps, Props } from './Props';

const getDefaultPrototype = () => {
	return Object.create(null);
};

// const InstanceRoots = new WeakMap;

const MnemonicaProtoProps = {

	extract () {
		return function (this: object) {
			return extract(this);
		};
	},

	pick () {
		return function (this: object, ...args: (string | string[])[]) {
			return pick(this, ...args);
		};
	},

	parent () {
		return function (this: object, constructorLookupPath: string) {
			return parent(this, constructorLookupPath);
		};
	},

	clone (this: { fork: () => object }) {
		return this.fork();
	},

	fork (this: object) {

		const props = _getProps(this) as Props;

		const {
			__type__: type,
			__collection__: collection,
			__parent__: existentInstance,
			__args__,
			__self__,
		} = props;

		const {
			isSubType,
			TypeName
		} = type;

		// 'function', cause might be called with 'new'
		 
		return function (this: object, ...forkArgs: unknown[]) {

			let forked;
			const Constructor = isSubType ?
				existentInstance :
				collection;

			const args = forkArgs.length ? forkArgs : __args__;


			if (this === __self__) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error 
				forked = new (Constructor[ TypeName ])(...args);
			} else {
				// fork.call ? let's do it !
				forked = new InstanceCreator(type, reflectPrimitiveWrappers(this), args);
			}

			return forked;

		};
	},

	[ SymbolConstructorName ] () {
		return MNEMONICA;
	},

	exception () {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		return function (error: Error, ...args: unknown[]) {
			const target = new.target;
			return exceptionConstructor.call(self, target, error, ...args);
		};
	},

	sibling () {
		 
		const siblings = (SiblingTypeName: string) => {

			const props = _getProps(this) as Props;
			const {
				__collection__: collection,
			} = props;
			const sibling: unknown = collection[ SiblingTypeName ];
			return sibling;
		};

		return new Proxy(siblings, {
			get (_, prop: string) {
				return siblings(prop);
			},
			apply (_, __, args,) {
				return siblings(args[ 0 ]);
			}
		});
	}

};

const staticProps = [

	// builtins: functions + Promises
	'constructor',
	'prototype',
	'then',

	// builtins: errors
	'stack',
	'message',
	'domain',

	// builtins: EventEmitter
	'on',
	'once',
	'off',

	// mocha + chai => bug: ./utils.js .findSubTypeFromParent 'inspect'
	'inspect',
	'showDiff',

]
	.concat(Object.keys(MnemonicaProtoProps))
	.concat(Object.getOwnPropertyNames(Object.prototype))
	.concat(Object.getOwnPropertyNames(Function.prototype))
	.reduce((obj, key) => {
		obj[ key ] = true;
		return obj;
	}, Object.create(null));

// tslint:disable-next-line: only-arrow-functions
const makeSubTypeProxy = function (subtype: any, inheritedInstance: unknown) {

	const subtypeProxy = new Proxy(InstanceCreator, {

		get (Target, _prop) {

			if (_prop === Symbol.hasInstance) {
				return getTypeChecker(subtype.TypeName);
			}

			return Reflect.get(Target, _prop);

		},

		construct (Target, _args) {
			return new Target(subtype, inheritedInstance, _args);
		},

		apply (Target, thisArg, _args) {

			if (thisArg === undefined) {
				thisArg = inheritedInstance;
			}

			const existentInstance = reflectPrimitiveWrappers(thisArg);

			const entity = new Target(subtype, existentInstance, _args);
			return entity;
		},

	});

	return subtypeProxy;
};

const prepareSubtypeForConstruction = function (subtypeName: string, inheritedInstance: unknown) {
	// prototype of proxy
	const propInstance = Reflect.getPrototypeOf(inheritedInstance as object) as object;

	const props = _getProps(propInstance) as Props;
	if (!props) {
		return undefined;
	}

	const {
		__type__: {
			config: {
				strictChain
			},
			subtypes
		},
	} = props;


	const subtype = subtypes.has(subtypeName) ?
		subtypes.get(subtypeName) :
		strictChain ?
			undefined :
			findSubTypeFromParent(inheritedInstance as object, subtypeName);

	return subtype ? makeSubTypeProxy(subtype, inheritedInstance) : undefined;
};

const mnemosyneProxyHandlerGet = (target: object, prop: string, receiver: unknown) => {

	// Node.js 22 Reflect.get Behaviour Changed here
	// cause something gone wrong with prop assignment
	// so now if we need .stack, we should avoid receiver here
	// nave not yet checked other staticProps,
	// just fixed this below
	// while using conditional for staticProps
	const result = Reflect.get(target, prop, receiver);

	if (result !== undefined) {
		return result;
	}

	if (typeof prop === 'symbol') {
		return result;
	}

	if (staticProps[ prop ]) {
		/*
		const mayBeResult = Reflect.get(target, prop);
		if (mayBeResult !== undefined) {
			return mayBeResult;
		}
		*/
		return result;
	}

	const subtype = prepareSubtypeForConstruction(prop, receiver);
	return subtype || result;
};

const Mnemosyne = function (this: object, mnemonica: object, exposeInstanceMethods: boolean) {

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const instance = this;

	const Mnemonica = function (this: object) {
		odp(this, SymbolConstructorName, {
			get () {
				return MNEMONICA;
			}
		});
	} as ConstructorFunction<typeof MnemonicaProtoProps>;
	
	// this throws an error
	Object.setPrototypeOf(Mnemonica.prototype, mnemonica);
	// while this just returns false, silently ... unfortunately
	// Reflect.setPrototypeOf(Mnemonica.prototype, mnemonica);

	// Only add MnemonicaProtoProps methods if exposeInstanceMethods is true
	if (exposeInstanceMethods) {
		Object.entries(MnemonicaProtoProps).forEach(([ name, method ]: [string, unknown]) => {
			odp(Mnemonica.prototype, name, {
				get () {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					return (method as CallableFunction).call(this);
				}
			});
		});

		Object.getOwnPropertySymbols(MnemonicaProtoProps).forEach((symbol: symbol) => {
			odp(Mnemonica.prototype, symbol, {
				get () {
					const symbolMethod = Reflect.get(MnemonicaProtoProps, symbol);
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					return symbolMethod.call(this);
				}
			});
		});
	}

	// instance of self Constructor type
	odp(Mnemonica.prototype, Symbol.hasInstance, {
		get () {
			return getTypeChecker(this.constructor.name);
		}
	});

	const proto = new Mnemonica();
	Reflect.setPrototypeOf(instance, proto);

	// InstanceRoots.set(instance, proto);

} as ConstructorFunction<object>;

const createMnemosyne = function (Uranus: unknown, exposeInstanceMethods: boolean) {
// const createMnemosyne = function (Uranus: unknown, typeProxy: unknown) {
// 	if (typeof Uranus === 'undefined') {
// 		const { __type__: type, Uranus: _uranus } = typeProxy;
// 		console.log(type, _uranus);
// 		// eslint-disable-next-line no-debugger
// 		debugger;
// 		throw new Error('createMnemosyne Uranus is not defined for typeProxy.');
// 	}

	const uranus = reflectPrimitiveWrappers(Uranus);
	const mnemosyne = new Mnemosyne(uranus, exposeInstanceMethods);
	const mnemosyneProxy = new Proxy(mnemosyne, {
		get : mnemosyneProxyHandlerGet
	});

	return mnemosyneProxy;
};

export default {
	get createMnemosyne () {
		return createMnemosyne;
	},
	get prepareSubtypeForConstruction () {
		return prepareSubtypeForConstruction;
	},
	get getDefaultPrototype () {
		return getDefaultPrototype;
	},
	// get MnemosynePrototypeKeys () {
	// 	return MnemosynePrototypeKeys;
	// },
	// get InstanceRoots () {
	// 	return InstanceRoots;
	// }
};
