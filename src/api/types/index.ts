'use strict';

/**
 * Construction Pipeline (high-level flow):
 *
 *   define(TypeName, ctor)  →  new TypeDescriptor()  →  new TypeProxy()
 *                                                          │
 *                                                          ▼
 *                                               new InstanceCreator(type, parent, args)
 *                                                          │
 *                                                          ▼
 *                                               makeInstanceModificator(self)
 *                                                          │
 *                                                          ▼
 *                                               ModificationConstructor.call(parent, ModificatorType, proto, _addProps)
 *                                                          │
 *                                                          ▼
 *                                               user constructor runs (new ModificatorType(...args))
 *                                                          │
 *                                                          ▼
 *                                               postProcessing() → invokePostHooks()
 */

import {
	_Internal_TC_,
	TypeDescriptorInstance,
	TypeClass,
	TypeDef,
	CollectionDef,
	constructorOptions,
	TypeAbsorber,
	ModificationConstructorFactory,
	MnemonicaConstructorFactory,
} from '../../types';

// Lazy getter: a function that, when called, returns the actual constructor function.
// Used when define() receives an anonymous function wrapping the real constructor.
export interface LazyTypeGetter extends CallableFunction {
	(): ConstructHandler;
}

import { hop } from '../../utils/hop';

import { constants } from '../../constants';
const {
	odp,
	SymbolParentType,
	SymbolConstructorName,
	SymbolConfig,

	TYPE_TITLE_PREFIX,
	MNEMOSYNE,

} = constants;

import { ErrorsTypes } from '../../descriptors/errors';
// import { descriptors } from '../../descriptors';

import mnemosynes from './Mnemosyne';
const { getDefaultPrototype } = mnemosynes;

const {
	ALREADY_DECLARED,
	WRONG_TYPE_DEFINITION,
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
} = ErrorsTypes;

// invokeHook
// registerHook
// registerFlowChecker
import * as hooksApi from '../hooks';
import { TypeProxy } from './TypeProxy';

import compileNewModificatorFunctionBody, { ConstructHandler } from './compileNewModificatorFunctionBody';

import TypesUtils, { CreationHandler } from '../utils';
const {
	getCachedTypeChecker,
	getTypeSplitPath,
	checkTypeName,
	isClass,
} = TypesUtils;

import {
	getStack,
	StackableInstance,
} from '../errors';

export type TypesMap = Map<string, object> & {
	[SymbolParentType]?: TypeDef;
	[MNEMOSYNE]?: CollectionDef;
};

const TypeDescriptor = function (
	this: TypeDescriptorInstance,
	defineOrigin: TypeAbsorber,
	types: TypesMap,
	TypeName: string,
	constructHandler: MnemonicaConstructorFactory,
	proto: { [index: string]: unknown },
	config: { [index: string]: unknown },
) {

	// here "types" refers to subtypes of type or collection object {}

	const parentType = types[ SymbolParentType ] || null;

	const isSubType = parentType ? true : false;

	const collection = isSubType
		? (parentType as Record<string, unknown>).collection as object
		: types[ MNEMOSYNE ];

	if (types.has(TypeName)) {
		throw new ALREADY_DECLARED(TypeName);
	}

	// const subtypes = descriptors.createTypesCollection();
	const subtypes = new Map<string, object>();

	const title = `${TYPE_TITLE_PREFIX}${TypeName}`;

	config = Object.assign(
		{},
		(collection as Record<symbol, unknown>)[ SymbolConfig ],
		config
	);

	const type = Object.assign(
		this,
		{

			get constructHandler () {
				return constructHandler;
			},


			TypeName,
			proto,

			isSubType,
			subtypes,
			parentType,

			collection,

			title,

			config,

			hooks : Object.create(null)

		}
	);

	getStack.call(
		this as StackableInstance,
		`Definition of [ ${TypeName} ] made at:`,
		[],
		defineOrigin
	);

	odp(
		subtypes,
		SymbolParentType, {
			get () {
				return type;
			}
		}
	);

	// const ancestor = isSubType ? Object.create(null) : proto;
	const ancestor = isSubType ? undefined : proto;
	types.set(
		TypeName,
		new TypeProxy(
			type,
			ancestor
		)
	);

	// types.set( TypeName, new TypeProxy( type ) );

	const result = types.get(TypeName);
	return result;

} as unknown as _Internal_TC_<TypeDescriptorInstance>;

Object.assign(
	TypeDescriptor.prototype,
	hooksApi
);

TypeDescriptor.prototype.define = function (
	this: TypeDescriptorInstance,
	TypeOrTypeName: string | CallableFunction,
	constructHandlerOrConfig?: CallableFunction | object,
	config?: object
) {
	const result = define.call(
		define,
		this.subtypes as TypesMap,
		TypeOrTypeName,
		constructHandlerOrConfig,
		config
	);
	return result;
};

TypeDescriptor.prototype.lazy = function (
	this: TypeDescriptorInstance,
	arg1: string | CallableFunction,
	arg2?: CallableFunction | object,
	arg3?: object
) {
	let name: string | undefined;
	let getter: LazyTypeGetter;
	let config: object | undefined;
	if (typeof arg1 === 'string') {
		name = arg1;
		getter = arg2 as LazyTypeGetter;
		config = arg3;
	} else {
		getter = arg1 as LazyTypeGetter;
		config = arg2 as object;
	}
	let result: TypeClass;
	if (name) {
		result = lazy.call(
			this,
			this.subtypes as TypesMap,
			name,
			getter as LazyTypeGetter,
			config
		);
	} else {
		result = lazy.call(
			this,
			this.subtypes as TypesMap,
			getter as LazyTypeGetter,
			config
		);
	}
	return result;
};

TypeDescriptor.prototype.lookup = function (
	this: TypeDescriptorInstance,
	TypeNestedPath: string
) {
	// relative first: resolve among this type's own subtypes,
	// e.g. AdminType.lookup('SubType') or 'SubType.DeepSubType'
	const relativeResult = lookup.call(
		this.subtypes as TypesMap,
		TypeNestedPath
	);
	if (relativeResult) {
		return relativeResult;
	}
	// root fallback: resolve absolute registry paths from the
	// collection, e.g. AdminType.lookup('UserType.AdminType'),
	// which is what the TypeLookup<Registry> type contract promises
	const collection = this.collection as CollectionDef;
	const rootResult = collection.lookup(TypeNestedPath);
	return rootResult;
};

// prototype-level getter (not a plain method) so that both call
// forms keep working: type.decorate(options) and the destructured
// const { decorate } = type — the getter binds the current
// descriptor at access time, same as the collection-level decorate
odp(
	TypeDescriptor.prototype,
	'decorate', {
		get (this: TypeDescriptorInstance) {
			const self = this;
			const result = function (options?: object) {
				const decorator = function (cstr: CallableFunction) {
					const { name } = cstr;
					const defineResult = self.define(
						name,
						cstr,
						options
					);
					const decoratedResult = defineResult as unknown as CallableFunction;
					return decoratedResult;
				};
				return decorator;
			};
			return result;
		},
		enumerable : true
	}
);

odp(
	TypeDescriptor.prototype,
	Symbol.hasInstance, {
		get (this: TypeDescriptorInstance) {
			const result = getCachedTypeChecker(this.TypeName);
			return result;
		}
	}
);

// ============================================================
// PATH RESOLUTION
// Resolves a dot-separated path to the target types map and
// the final type name. Recurses into parent subtypes for
// nested paths (e.g. 'Parent.Child' → Parent.subtypes + 'Child').
// Returns the parent TypeClass when the head segment resolves
// to an existing type — needed for lazy-getter subtype definition.
// ============================================================

const resolveDefinitionContext = function (
	subtypes: TypesMap,
	path: string
): {
		target: TypesMap;
		name: string;
		parent?: TypeClass;
	} {
	const split = getTypeSplitPath(path);
	const [ head, ...rest ] = split;
	const parent = lookup.call(
		subtypes,
		head
	);

	if (!parent) {
		if (rest.length > 0) {
			throw new WRONG_TYPE_DEFINITION(`parent ${head} definition is not yet exists!`);
		}
		const noParentResult = { target : subtypes, name : head };
		return noParentResult;
	}

	if (rest.length > 0) {
		const nestedResult = resolveDefinitionContext(
			parent.subtypes as TypesMap,
			rest.join('.')
		);
		return nestedResult;
	}

	const resolvedResult = { target : subtypes, name : head, parent };
	return resolvedResult;
};

// ============================================================
// DUPLICATE GUARD
// ============================================================

const checkDuplicate = function (target: TypesMap, name: string): void {
	const existing = lookup.call(
		target,
		name
	);
	if (existing) {
		throw new ALREADY_DECLARED(name);
	}
};

// ============================================================
// CONSTRUCTION STRATEGIES
// Two branches, same return type, no recursion.
// Both receive the resolved context and return TypeDescriptor.
// ============================================================

const createFromDirectHandler = function (
	defineOrigin: TypeAbsorber,
	target: TypesMap,
	name: string,
	handler?: ConstructHandler,
	config?: constructorOptions
) {
	handler = handler || function () { };
	const asClass = isClass(handler);
	const modificatorBody = compileNewModificatorFunctionBody(
		name,
		asClass
	);

	const makeConstructHandler = modificatorBody(
		handler as ConstructHandler,
		CreationHandler,
		SymbolConstructorName
	);

	if (config instanceof Function) {
		config = {
			ModificationConstructor : config as ModificationConstructorFactory
		};
	}

	config!.asClass = asClass;

	const proto = (
		hop(
			handler,
			'prototype'
		) &&
		(typeof handler.prototype === 'object')
	) ? handler.prototype : getDefaultPrototype();

	const result = new TypeDescriptor(
		defineOrigin,
		target,
		name,
		makeConstructHandler,
		proto,
		config
	) as unknown as TypeClass;
	return result;
};

const createFromLazyGetter = function (
	defineOrigin: TypeAbsorber,
	target: TypesMap,
	name: string | undefined,
	getter: LazyTypeGetter,
	config: constructorOptions
) {

	const type = getter();

	if (typeof type !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}

	const TypeName = name || type.name;
	if (!TypeName) {
		throw new TYPENAME_MUST_BE_A_STRING;
	}

	checkDuplicate(
		target,
		TypeName
	);

	const asClass = isClass(type);

	const proto = (
		hop(
			type,
			'prototype'
		) &&
		(typeof type.prototype === 'object')
	) ? type.prototype : getDefaultPrototype();

	const makeConstructHandler = () => {
		const constructHandler = getter();

		odp(
			constructHandler,
			SymbolConstructorName, {
				get () {
					return TypeName;
				}
			}
		);

		const protoDesc = Object
			.getOwnPropertyDescriptor(
				constructHandler,
				'prototype'
			) as PropertyDescriptor | undefined;
		if (protoDesc && protoDesc.writable) {
			constructHandler.prototype = getDefaultPrototype();
		}

		const handlerResult = constructHandler as MnemonicaConstructorFactory;
		return handlerResult;
	};

	config = Object.assign(
		{},
		config
	);

	config.asClass = asClass;

	const result = new TypeDescriptor(
		defineOrigin,
		target,
		TypeName,
		makeConstructHandler,
		proto,
		config
	) as unknown as TypeClass;
	return result;
};

// ============================================================
// MAIN DISPATCHER
// All branches funnel here. Recursion is isolated to path
// resolution (resolveDefinitionContext) and the single case
// of a named function passed as the first argument.
// ============================================================

export const define = function (
	this: unknown,
	subtypes: TypesMap,
	TypeOrTypeName: string | CallableFunction,
	constructHandlerOrConfig?: CallableFunction | object,
	config?: object
): TypeClass {

	if (!config || (typeof config !== 'object' && typeof config !== 'function')) {
		config = {};
	}

	// --- Branch: function passed as first arg ---
	if (typeof TypeOrTypeName === 'function') {
		const fn = TypeOrTypeName;
		if (fn.name) {
			checkDuplicate(
				subtypes,
				fn.name
			);
			const defineResult = define.call(
				this,
				subtypes,
				fn.name,
				fn,
				config
			);
			return defineResult;
		}
		// Anonymous function as first arg is not a valid .define() form.
		// Use .lazy(() => Constructor, config?) for lazy getters instead.
		throw new TYPENAME_MUST_BE_A_STRING;
	}

	// --- Branch: string path passed as first arg ---
	if (typeof TypeOrTypeName !== 'string') {
		throw new WRONG_TYPE_DEFINITION('definition is not provided');
	}
	checkTypeName(TypeOrTypeName);

	let handler: ConstructHandler | undefined;
	if (typeof constructHandlerOrConfig === 'function') {
		handler = constructHandlerOrConfig as ConstructHandler;
	} else if (typeof constructHandlerOrConfig === 'object') {
		config = constructHandlerOrConfig as constructorOptions;
	}

	const {
		target, name, parent
	} = resolveDefinitionContext(
		subtypes,
		TypeOrTypeName
	);

	// Existing type with no handler: error (matches original fallthrough)
	if (parent && !handler) {
		throw new WRONG_TYPE_DEFINITION('definition is not provided');
	}

	const result = createFromDirectHandler(
		this as TypeAbsorber,
		target,
		name,
		handler,
		config as constructorOptions
	);
	return result;
};

export const lazy = function (
	this: unknown,
	subtypes: TypesMap,
	arg1: string | LazyTypeGetter | undefined,
	arg2?: LazyTypeGetter | object,
	arg3?: object
): TypeClass {

	let name: string | undefined;
	let getter: LazyTypeGetter;
	let config: object | undefined;
	if (typeof arg1 === 'string') {
		name = arg1;
		getter = arg2 as LazyTypeGetter;
		config = arg3;
	} else {
		getter = arg1 as LazyTypeGetter;
		config = arg2 as object;
	}

	if (typeof getter !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}

	if (!config || (typeof config !== 'object' && typeof config !== 'function')) {
		config = {};
	}

	const lazyResult = createFromLazyGetter(
		this as TypeAbsorber,
		subtypes,
		name,
		getter as LazyTypeGetter,
		config as constructorOptions
	);
	return lazyResult;
};

export const lookup = function (
	this: TypesMap,
	TypeNestedPath: string
): TypeClass | undefined {

	if (typeof TypeNestedPath !== 'string') {
		throw new WRONG_TYPE_DEFINITION('arg : type nested path must be a string');
	}

	if (!TypeNestedPath.length) {
		throw new WRONG_TYPE_DEFINITION('arg : type nested path has no path');
	}

	const split = getTypeSplitPath(TypeNestedPath);

	const [ name ] = split;
	const type = this.get(name) as TypeClass | undefined;
	if (split.length === 1) {
		return type;
	}

	const NextNestedPath = split.slice(1).join('.');
	if (!type) {
		return undefined;
	}
	const result = lookup.call(
		type.subtypes as unknown as TypesMap,
		NextNestedPath
	);
	return result;

};



