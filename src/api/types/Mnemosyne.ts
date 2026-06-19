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

import { InstanceCreator } from './InstanceCreator';

import {
	_getProps, Props
} from './Props';

const getDefaultPrototype = () => {
	const result = Object.create(null);
	return result;
};

// const InstanceRoots = new WeakMap;

// Names that used to be auto-injected instance methods. They must still be
// treated as static/reserved names so the Mnemosyne proxy does not try to
// construct a subtype when one of them is accessed.
const mnemonicaInstanceMethodNames = [
	'extract',
	'pick',
	'parent',
	'clone',
	'fork',
	'exception',
	'sibling',
];

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
	.concat(mnemonicaInstanceMethodNames)
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
		value : typeChecker
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

export const Mnemosyne = function (this: object, mnemonica: object) {

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
	} as _Internal_TC_<object>;

	// this throws an error
	Object.setPrototypeOf(
		Mnemonica.prototype,
		mnemonica
	);
	// while this just returns false, silently ... unfortunately
	// Reflect.setPrototypeOf(Mnemonica.prototype, mnemonica);

	odp(
		Mnemonica.prototype,
		SymbolConstructorName,
		{
			get () {
				return MNEMONICA;
			}
		}
	);

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

const createMnemosyne = function (Uranus: unknown) {
	// const createMnemosyne = function (Uranus: unknown, typeProxy: unknown) {
	// 	if (typeof Uranus === 'undefined') {
	// 		const { __type__: type, Uranus: _uranus } = typeProxy;
	// 		console.log(type, _uranus);
	// 		// eslint-disable-next-line no-debugger
	// 		debugger;
	// 		throw new Error('createMnemosyne Uranus is not defined for typeProxy.');
	// 	}

	const uranus = reflectPrimitiveWrappers(Uranus);
	const mnemosyne = new Mnemosyne(uranus);
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
