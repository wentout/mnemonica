'use strict';

import { constants } from '../../constants';
import { ErrorsTypes } from '../../descriptors/errors';
import { utils } from '../../utils';

const {
	odp,
	SymbolConstructorName,
	MNEMONICA,
	MNEMOSYNE,
} = constants;

const {
	WRONG_TYPE_DEFINITION,
} = ErrorsTypes;

const {
	collectConstructors
} = utils;

import { _getProps, Props } from '../types/Props';

const CreationHandler = function (this: object & { constructor: NewableFunction }, constructionAnswer: unknown) {
	// standard says :
	// if constructor returns something
	// then this is a toy
	// we have to play with
	// respectively
	// so we will not follow the rule
	// if (constructionAnswer instanceof types[TypeName]) {
	// and instead follow the line below

	// but if it is not an instace of Object ... so ...
	// if ( constructionAnswer instanceof Object )
	// if (constructionAnswer instanceof this.constructor)
	// will fall the on post processing
	return constructionAnswer;

	// TODO: this check was not covered with tests
	// if (this instanceof Promise) {
	// 	return this;
	// }
};

import compileNewModificatorFunctionBody from '../types/compileNewModificatorFunctionBody';

const checkProto = (proto: unknown) => {
	if (!(proto instanceof Object)) {
		throw new WRONG_TYPE_DEFINITION('expect prototype to be an object');
	}
};

const getTypeChecker = (TypeName: string) => {
	const seeker: unknown = (instance: object) => {

		if (typeof instance !== 'object') {
			return false;
		}

		 
		if (!instance!.constructor) {
			return false;
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (Reflect.getPrototypeOf(instance).constructor.name === 'Promise') {
			// if ( instance instanceof Promise ) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return instance[ SymbolConstructorName ] === TypeName;
		}

		const constructors: {
			string: new () => unknown
		} = collectConstructors(instance);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return constructors[ TypeName ] || false;

	};
	return seeker;
};

const getTypeSplitPath = (path: string) => {
	const split = path
		// beautifull names
		.replace(/\n|\t| /g, '')
		.replace(/\[(\w+)\]/g, '.$1')
		.replace(/^\./, '')
		.split(/\.|\/|:/);
	return split;
};

export type asyncStack = {
	__stack__?: string
	__type__: {
		isSubType: boolean
	}
	parent: () => asyncStack
}

const getExistentAsyncStack = (existentInstance: asyncStack): unknown => {

	const stack = [];
	let proto = existentInstance;

	while (proto) {

		const props = _getProps(proto) as Props;

		if (!props.__stack__) {
			break;
		}

		const pstack = props
			.__stack__
			.split('\n')
			.reduce((arr: string[], line: string) => {
				if (line.length) {
					arr.push(line);
				}
				return arr;
			}, []);

		proto = proto.parent();

		const protoProps = _getProps(proto) as Props;

		if (proto && protoProps && protoProps.__type__) {

			if (protoProps.__type__.isSubType) {
				stack.push(...pstack.slice(0, 1));
			} else {
				stack.push(...pstack);
			}

		} else {
			stack.push(...pstack);
			break;
		}
	}

	return stack;

};

const forbiddenNames = [ MNEMONICA, MNEMOSYNE ];

const checkTypeName = (name: string) => {

	if (!name.length) {
		throw new WRONG_TYPE_DEFINITION('TypeName must not be empty');
	}

	if (name[ 0 ] !== name[ 0 ].toUpperCase()) {
		throw new WRONG_TYPE_DEFINITION('TypeName should start with Uppercase Letter');
	}

	if (forbiddenNames.includes(name)) {
		throw new WRONG_TYPE_DEFINITION('TypeName of reserved keyword');
	}

};

export type parentSub = {
	__type__: {
		subtypes: Map<string, parentSub>
	}
	__parent__: parentSub
}

const findSubTypeFromParent = (instance: parentSub | object | undefined, subType: string): parentSub | null => {
	let subtype = null;

	if (!instance) {
		return null;
	}

	const props = _getProps(instance) as Props;

	if (props) {
		if(props.__type__.subtypes.has(subType)) {
			const _subtype = props.__type__.subtypes.get(subType);
			subtype = _subtype;
		} else {
			subtype = findSubTypeFromParent(props.__parent__, subType);
		}
	}
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return subtype;
};

// const isClass = ( functionPointer: CallableFunction ) => {
// 	const value = Function.prototype.toString.call( functionPointer );
// 	return /^\s*class\s+/.test( value.trim() );
// };

// accordingly to the gist from here:
// https://gist.github.com/wentout/ea3afe9c822a6b6ef32f9e4f3e98b1ba
const isClass = (fn: CallableFunction) => {
	
	const str = String(fn);
	return str.indexOf('class ') === 0;

	/*

	// not necessary to check fn for typeof
	// because of other checks made before
	// if (typeof fn !== 'function') {
	// 	return false;
	// }

	// seemingly
	// class prototype is always object
	if (!(fn.prototype instanceof Object)) {
		return false;
	}
	// but only if not augmented

	// class prototype.constructor cannot be re-defined (usually)
	// but for functions user may re-assign it easily
	// just assigning the way .prototype = {}
	// and they 99.9% do this, cause nobody cares
	// but we are checking if this is class, so it works ...
	if (fn.prototype.constructor !== fn) {
		return false;
	}

	// and the most unknown thing is that,
	// cause for functions it it writeable )))
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return Reflect.getOwnPropertyDescriptor(fn, 'prototype')!.writable === false;

	*/
};

const makeFakeModificatorType = (
	TypeName: string,
	fakeModificator = function () { }
) => {

	const modificatorBody = compileNewModificatorFunctionBody(TypeName);

	const modificatorType: any = modificatorBody(
		fakeModificator,
		CreationHandler,
		SymbolConstructorName
	);

	return modificatorType();

};


// TODO: .valueOf(), .toString() ???
const reflectPrimitiveWrappers = (_thisArg: unknown) => {
	let thisArg: object = _thisArg as object;

	if (_thisArg === null) {
		thisArg = Object.create(null);
		odp(thisArg, Symbol.toPrimitive, {
			get () {
				return () => {
					return _thisArg;
				};
			}
		});
	}

	if (
		_thisArg instanceof Number ||
		_thisArg instanceof Boolean ||
		_thisArg instanceof String
	) {
		odp(thisArg, Symbol.toPrimitive, {
			get () {
				return () => {
					return (_thisArg as String | Number | Boolean).valueOf();
				};
			}
		});
	}

	return thisArg;
};

const TypesUtils = {
	isClass,
	CreationHandler,
	checkProto,
	getTypeChecker,
	getTypeSplitPath,
	getExistentAsyncStack,
	checkTypeName,
	findSubTypeFromParent,
	makeFakeModificatorType,
	reflectPrimitiveWrappers,
};

export default TypesUtils;
