'use strict';

import { constants } from '../../constants';
import { ErrorsTypes } from '../../descriptors/errors';
import { collectConstructors } from '../../utils/collectConstructors';

const {
	odp,
	SymbolConstructorName,
	MNEMONICA,
	MNEMOSYNE,
} = constants;

const { WRONG_TYPE_DEFINITION, } = ErrorsTypes;

import {
	_getProps, Props
} from '../types/Props';
import type {
	InstanceConstructor,
	MnemonicaConstructor,
	TypeClass
} from '../../types';

import compileNewModificatorFunctionBody, { isClass } from '../types/compileNewModificatorFunctionBody';

// CreationHandler - handles constructor return values
// Moved to api/types/index.ts as per refactoring plan
export const CreationHandler = function (
	this: object & { constructor: InstanceConstructor },
	constructionAnswer: unknown
) {
	return constructionAnswer;
};

const checkProto = (proto: unknown) => {
	if (!(proto instanceof Object)) {
		throw new WRONG_TYPE_DEFINITION('expect prototype to be an object');
	}
};

const getTypeChecker = (TypeName: string) => {
	const seeker: unknown = (instance: object & { [SymbolConstructorName]?: string }) => {

		if (typeof instance !== 'object' || instance === null) {
			return false;
		}


		if (!instance.constructor) {
			return false;
		}

		const prototype = Reflect.getPrototypeOf(instance);
		if (prototype === null) {
			return false;
		}

		if (prototype.constructor && prototype.constructor.name === 'Promise') {
			// if ( instance instanceof Promise ) {

			const checkResult = instance[ SymbolConstructorName ] === TypeName;
			return checkResult;
		}

		const constructors = collectConstructors(instance) as Record<string, new () => unknown>;

		const constructorResult = constructors[ TypeName ] || false;
		return constructorResult;

	};
	return seeker;
};

const typeCheckerCache = new Map<string, unknown>();

// getTypeChecker builds a fresh closure per call, and instanceof
// checks run per access — so the closures are cached per TypeName
const getCachedTypeChecker = (TypeName: string) => {
	let checker = typeCheckerCache.get(TypeName);
	if (!checker) {
		checker = getTypeChecker(TypeName);
		typeCheckerCache.set(TypeName, checker);
	}
	return checker;
};

const getTypeSplitPath = (path: string) => {
	const split = path
		// beautifull names
		.replace(
			/\n|\t| /g,
			''
		)
		.replace(
			/\[(\w+)\]/g,
			'.$1'
		)
		.replace(
			/^\./,
			''
		)
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
			.reduce(
				(arr: string[], line: string) => {
					if (line.length) {
						arr.push(line);
					}
					return arr;
				},
				[]
			);

		proto = proto.parent();

		const protoProps = _getProps(proto) as Props;

		if (proto && protoProps && protoProps.__type__) {

			if (protoProps.__type__.isSubType) {
				stack.push(...pstack.slice(
					0,
					1
				));
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
	TypeName: string;
	__type__: {
		subtypes: Map<string, parentSub>
	}
	__parent__: parentSub
}

const findSubTypeFromParent = (instance: parentSub | object | undefined, subType: string): TypeClass | null => {
	let subtype: TypeClass | null = null;

	if (!instance) {
		return null;
	}

	const props = _getProps(instance) as Props;

	if (props) {
		const _subtype = props.__type__.subtypes.get(subType);
		if (_subtype !== undefined) {
			subtype = _subtype;
		} else {
			subtype = findSubTypeFromParent(
				props.__parent__,
				subType
			);
		}
	}

	return subtype;
};

// isClass lives beside the construct-handler shapes it narrows, in
// compileNewModificatorFunctionBody.ts (the compiler picks the class
// branch with it); re-exported here as part of TypesUtils

const makeErrorModificatorType = (
	TypeName: string,
	ErrorModificator = function () { }
): MnemonicaConstructor => {

	const modificatorBody = compileNewModificatorFunctionBody(TypeName);

	// CreationHandler is now defined locally in api/types/index.ts
	const modificatorType = modificatorBody(
		ErrorModificator,
		CreationHandler,
		SymbolConstructorName
	);

	const result = modificatorType();
	const constructorResult = result as MnemonicaConstructor;
	return constructorResult;

};


// a null or primitive-wrapper parent reflects its primitive to the instance
// built over it: coercion (+inst, `${inst}`) through Symbol.toPrimitive, and
// explicit inst.valueOf() / inst.toString() — the wrapper's own prototype
// methods throw when `this` is the instance rather than the wrapper, and an
// Object.create(null) parent has none at all
const reflectPrimitive = (thisArg: object, primitive: null | string | number | boolean) => {
	odp(
		thisArg,
		Symbol.toPrimitive,
		{
			get () {
				const result = () => {
					return primitive;
				};
				return result;
			}
		}
	);
	odp(
		thisArg,
		'valueOf',
		{
			get () {
				const result = () => {
					return primitive;
				};
				return result;
			}
		}
	);
	odp(
		thisArg,
		'toString',
		{
			get () {
				const result = () => {
					const stringResult = String( primitive );
					return stringResult;
				};
				return result;
			}
		}
	);
};

const reflectPrimitiveWrappers = (_thisArg: unknown) => {
	let thisArg: object = _thisArg as object;

	if (_thisArg === null) {
		thisArg = Object.create(null);
		reflectPrimitive(
			thisArg,
			null
		);
	}

	if (
		_thisArg instanceof Number ||
		_thisArg instanceof Boolean ||
		_thisArg instanceof String
	) {
		// read once, before the wrapper gets its own valueOf below;
		// a wrapper's primitive never changes
		const primitive = (_thisArg as String | Number | Boolean).valueOf();
		reflectPrimitive(
			thisArg,
			primitive
		);
	}

	return thisArg;
};

const TypesUtils = {
	isClass,
	checkProto,
	getTypeChecker,
	getCachedTypeChecker,
	getTypeSplitPath,
	getExistentAsyncStack,
	checkTypeName,
	findSubTypeFromParent,
	makeErrorModificatorType,
	reflectPrimitiveWrappers,
};

export default TypesUtils;
