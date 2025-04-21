'use strict';

import { ConstructorFunction } from '../../types';
import { constants } from '../../constants';
const {
	odp,
	SymbolConstructorName,
	SymbolGaia,
	SymbolReplaceUranus,

	MNEMONICA,
	GAIA,
	URANUS

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


const TypesRoots = new WeakMap;



const Gaia = function (Uranus: any) {

	const gaiaProto = Uranus ? Uranus : this;

	const GaiaConstructor = function () { } as ConstructorFunction<object>;
	Reflect.setPrototypeOf(GaiaConstructor.prototype, Object.create(gaiaProto));

	const gaia = new GaiaConstructor;

	odp(gaia, MNEMONICA, {
		get () {
			return !Uranus ? GAIA : URANUS;
		}
	});

	return gaia;
} as ConstructorFunction<object>;


const MnemonicaProtoProps = {

	extract () {
		return function (this: any) {
			return extract(this);
		};
	},

	pick () {
		return function (this: any, ...args: any[]) {
			return pick(this, ...args);
		};
	},

	parent () {
		return function (this: any, constructorLookupPath: string) {
			return parent(this, constructorLookupPath);
		};
	},

	clone (this: any) {
		return this.fork();
	},

	fork (this: any) {

		const {
			__type__: type,
			__collection__: collection,
			__parent__: existentInstance,
			__args__,
			__self__
		} = this;

		const {
			isSubType,
			TypeName
		} = type;

		// 'function', cause might be called with 'new'
		// eslint-disable-next-line no-shadow, @typescript-eslint/no-explicit-any
		return function (this: any, ...forkArgs: any[]) {

			let forked;
			const Constructor = isSubType ?
				existentInstance :
				collection;

			const args = forkArgs.length ? forkArgs : __args__;


			if (this === __self__) {
				forked = new (Constructor[ TypeName ])(...args);
			} else {
				// fork.call ? let's do it !
				forked = new InstanceCreator(type, reflectPrimitiveWrappers(this), args);
			}

			return forked;

		};
	},

	[ SymbolReplaceUranus ] () {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return function (this: any, uranus: any) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			Reflect.setPrototypeOf(Reflect.getPrototypeOf(this[ SymbolGaia ]), uranus);
		};
	},

	[ SymbolConstructorName ] () {
		return MNEMONICA;
	},

	exception () {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		return function (error: Error, ...args: any[]) {
			const target = new.target;
			return exceptionConstructor.call(self, target, error, ...args);
		};
	},

	sibling () {
		// eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-explicit-any
		const self: any = this;
		const siblings = (SiblingTypeName: string) => {
			const {
				__collection__: collection,
			} = self;
			const sibling: any = collection[ SiblingTypeName ];
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

const MnemosynePrototypeKeys = Object.keys(MnemonicaProtoProps);

const MnemonicaInstanceProps = [
	'__proto_proto__',

	'__type__',
	'__self__',

	'__args__',

	'__parent__',
	'__subtypes__',

	'__stack__',

	'__collection__',
	'__timestamp__',

	'__creator__'

].concat(MnemosynePrototypeKeys);

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
	.concat(MnemonicaInstanceProps)
	.concat(Object.getOwnPropertyNames(Object.prototype))
	.concat(Object.getOwnPropertyNames(Function.prototype))
	.reduce((obj, key) => {
		obj[ key ] = true;
		return obj;
	}, Object.create(null));

// tslint:disable-next-line: only-arrow-functions
const makeSubTypeProxy = function (subtype: any, inheritedInstance: any) {

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

			// TODO: if we would make new keyword obligatory
			// then we should avoid it here, with throw Error

			let existentInstance = reflectPrimitiveWrappers(thisArg);

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (!existentInstance[ SymbolGaia ]) {
				const mnemosyne = new Mnemosyne(new Gaia(existentInstance));
				existentInstance = new Proxy(mnemosyne, {
					get : mnemosyneProxyHandlerGet
				});
			}
			// else is the ordinary way for all entities

			const entity = new Target(subtype, existentInstance, _args);
			return entity;
		},

	});

	return subtypeProxy;
};


const mnemosyneProxyHandlerGet = (target: any, prop: string, receiver: any) => {

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

	// prototype of proxy
	const instance: any = Reflect.getPrototypeOf(receiver);

	const {
		__type__: {
			config: {
				strictChain
			},
			subtypes
		},
	} = instance;

	const subtype = subtypes.has(prop) ?
		subtypes.get(prop) :
		strictChain ?
			undefined :
			findSubTypeFromParent(instance, prop);

	return subtype ? makeSubTypeProxy(subtype, receiver) : result;
};


const Mnemosyne = function (gaia: any) {

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const instance = this;

	const Mnemonica: any = function (this: any) {
		odp(this, SymbolConstructorName, {
			get () {
				return MNEMONICA;
			}
		});
	};

	const mnemonica = Reflect.getPrototypeOf(gaia);

	Reflect.setPrototypeOf(Mnemonica.prototype, mnemonica);

	Object.entries(MnemonicaProtoProps).forEach(([ name, method ]: [string, any]) => {
		odp(Mnemonica.prototype, name, {
			get (this: any) {
				return method.call(this);
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

	// instance of self Constructor type
	odp(Mnemonica.prototype, Symbol.hasInstance, {
		get () {
			return getTypeChecker(this.constructor.name);
		}
	});

	odp(Mnemonica.prototype, SymbolGaia, {
		get () {
			return gaia;
		}
	});

	const proto = new Mnemonica();

	Reflect.setPrototypeOf(instance, proto);

	TypesRoots.set(instance, proto);

} as ConstructorFunction<typeof MnemonicaProtoProps>;

const createMnemosyne = function (Uranus: unknown) {
	// constructs new Gaia -> new Mnemosyne
	// to build the first instance in chain
	const uranus = reflectPrimitiveWrappers( Uranus );
	const mnemosyne = new Mnemosyne( new Gaia( uranus ) );
	const mnemosyneProxy = new Proxy( mnemosyne, {
		get : mnemosyneProxyHandlerGet
	} );

	return mnemosyneProxy;
};

export default {
	Gaia,
	get createMnemosyne () {
		return createMnemosyne;
	},
	get MnemosynePrototypeKeys () {
		return MnemosynePrototypeKeys;
	},
	get TypesRoots () {
		return TypesRoots;
	}
};
