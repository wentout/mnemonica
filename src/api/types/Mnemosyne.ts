'use strict';

import {
	_Internal_TC_,
	TypeDef
} from '../../types';

interface SubtypeEntry {
	TypeName: string;
}
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

import {
	_getProps, Props
} from './Props';

const getDefaultPrototype = () => {
	const result = Object.create(null);
	return result;
};

// const InstanceRoots = new WeakMap;

const MnemonicaProtoProps = {

	extract () {
		const result = function (this: object) {
			const extractResult = extract(this);
			return extractResult;
		};
		return result;
	},

	pick () {
		const result = function (this: object, ...args: (string | string[])[]) {
			const pickResult = pick(
				this,
				...args
			);
			return pickResult;
		};
		return result;
	},

	parent () {
		const result = function (this: object, constructorLookupPath: string) {
			const parentResult = parent(
				this,
				constructorLookupPath
			);
			return parentResult;
		};
		return result;
	},

	clone (this: { fork: () => object }) {
		const result = this.fork();
		return result;
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

		const result = function (this: object, ...forkArgs: unknown[]) {

			let forked;
			const Constructor = isSubType ?
				existentInstance :
				collection;

			const args = forkArgs.length ? forkArgs : __args__;


			if (this === __self__) {

				// @ts-expect-error  this is definitely a constructor
				forked = new (Constructor[ TypeName ])(...args);
			} else {
				// fork.call ? let's do it !
				forked = new InstanceCreator(
					type,
					reflectPrimitiveWrappers(this),
					args
				);
			}

			return forked;

		};
		return result;
	},

	[ SymbolConstructorName ] () {
		return MNEMONICA;
	},

	exception () {

		const self = this;
		const result = function (error: Error, ...args: unknown[]) {
			const target = new.target;
			const exceptionResult = exceptionConstructor.call(
				self,
				target,
				error,
				...args
			);
			return exceptionResult;
		};
		return result;
	},

	sibling () {

		const siblings = (SiblingTypeName: string) => {

			const props = _getProps(this) as Props;
			const { __collection__: collection, } = props;
			const sibling: unknown = collection[ SiblingTypeName ];
			return sibling;
		};

		const result = new Proxy(
			siblings,
			{
				get (_, prop: string) {
					const proxyResult = siblings(prop);
					return proxyResult;
				},
				apply (_, __, args,) {
					const proxyResult = siblings(args[ 0 ]);
					return proxyResult;
				}
			}
		);
		return result;
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
	.reduce(
		(obj, key) => {
			obj[ key ] = true;
			return obj;
		},
		Object.create(null)
	);

// tslint:disable-next-line: only-arrow-functions
const makeSubTypeProxy = function (subtype: SubtypeEntry, inheritedInstance: unknown) {

	const SubTypeProxy = function (this: unknown, ..._args: unknown[]) {
		if (new.target) {
			const instanceResult = new InstanceCreator(
				subtype as TypeDef,
				inheritedInstance as object,
				_args
			);
			return instanceResult;
		}
		const thisArg = this === undefined ? inheritedInstance : this;
		const existentInstance = reflectPrimitiveWrappers(thisArg);
		const instance = new InstanceCreator(
			subtype as TypeDef,
			existentInstance as object,
			_args
		);
		return instance;
	};

	const typeChecker = getTypeChecker(subtype.TypeName);
	Object.defineProperty(SubTypeProxy, Symbol.hasInstance, {
		get () {
			return typeChecker;
		} 
	});

	return SubTypeProxy;
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
			config: { strictChain },
			subtypes
		},
	} = props;


	const subtype = subtypes.has(subtypeName) ?
		subtypes.get(subtypeName) :
		strictChain ?
			undefined :
			findSubTypeFromParent(
				inheritedInstance as object,
				subtypeName
			);

	const result = subtype ? makeSubTypeProxy(
		subtype,
		inheritedInstance
	) : undefined;
	return result;
};

const mnemosyneProxyHandlerGet = (target: object, prop: string, receiver: unknown) => {

	// Node.js 22 Reflect.get Behaviour Changed here
	// cause something gone wrong with prop assignment
	// so now if we need .stack, we should avoid receiver here
	// nave not yet checked other staticProps,
	// just fixed this below
	// while using conditional for staticProps
	const result = Reflect.get(
		target,
		prop,
		receiver
	);

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

	const subtype = prepareSubtypeForConstruction(
		prop,
		receiver
	);
	const subTypeResult = subtype || result;
	return subTypeResult;
};

export const Mnemosyne = function (this: object, mnemonica: object, exposeInstanceMethods: boolean) {

	const instance = this;

	// because we must instantiate new chain for root
	// therefore we create this constructor internally
	// so it can not be augmented externally during instance creation
	const Mnemonica = function (this: object) {
		odp(
			this,
			SymbolConstructorName,
			{
				get () {
					return MNEMONICA;
				}
			}
		);
	} as _Internal_TC_<typeof MnemonicaProtoProps>;

	// this throws an error
	Object.setPrototypeOf(
		Mnemonica.prototype,
		mnemonica
	);
	// while this just returns false, silently ... unfortunately
	// Reflect.setPrototypeOf(Mnemonica.prototype, mnemonica);

	// Only add MnemonicaProtoProps methods if exposeInstanceMethods is true
	if (exposeInstanceMethods) {
		Object.entries(MnemonicaProtoProps).forEach(([ name, method ]: [string, unknown]) => {
			odp(
				Mnemonica.prototype,
				name,
				{
					get () {

						// @ts-expect-error there is a proxy and next line is callable
						const methodResult = method.call(this);
						return methodResult;
					}
				}
			);
		});

		Object.getOwnPropertySymbols(MnemonicaProtoProps).forEach((symbol: symbol) => {
			odp(
				Mnemonica.prototype,
				symbol,
				{
					get () {
						const symbolMethod = Reflect.get(
							MnemonicaProtoProps,
							symbol
						);
						const symbolResult = symbolMethod.call(this);
						return symbolResult;
					}
				}
			);
		});
	}

	// instance of self Constructor type
	odp(
		Mnemonica.prototype,
		Symbol.hasInstance,
		{
			get () {
				const result = getTypeChecker(this.constructor.name);
				return result;
			}
		}
	);

	const proto = new Mnemonica();
	Reflect.setPrototypeOf(
		instance,
		proto
	);

	// InstanceRoots.set(instance, proto);

} as _Internal_TC_<object>;

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
	const mnemosyne = new Mnemosyne(
		uranus,
		exposeInstanceMethods
	);
	const mnemosyneProxy = new Proxy(
		mnemosyne,
		{
			get : mnemosyneProxyHandlerGet
		}
	);

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
