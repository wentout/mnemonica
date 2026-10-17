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
	DefineNewableOrCallable,
	DefineNewable,
	LazyDef,
} from '../../types';

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
	WRONG_MODIFICATION_PATTERN,
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
	OPTIONS_ERROR,
} = ErrorsTypes;

// invokeHook
// registerHook
// registerFlowChecker
import * as hooksApi from '../hooks';
import { TypeProxy } from './TypeProxy';

import compileNewModificatorFunctionBody, {
	classifyConstructHandler,
	isCallableCandidate,
	ConstructHandler
} from './compileNewModificatorFunctionBody';

import {
	setLazyDefinition,
	LazyDefinitionCell,
} from './lazyDefinition';

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

// Lazy type facades.
// A lazy type is a regular define whose handler is the empty shim; the real
// constructor is gathered from the callback once per construction (see
// lazyDefinition.ts). The type's proto / config / constructHandler read the
// gather cell, so the same type object serves every construction without
// ever calling the callback at define time.
const installLazyDefinition = function (
	type: TypeDescriptorInstance,
	TypeName: string,
	shimConstructHandler: MnemonicaConstructorFactory,
	shimProto: { [index: string]: unknown },
	mergedConfig: { [index: string]: unknown },
	getter: LazyDef<object>
) {

	// outside any construction the cell holds the define-time fallback:
	// no handler, the shim's empty prototype, asClass off, no failure
	const cell: LazyDefinitionCell = {
		handler : undefined,
		asClass : false,
		proto   : shimProto,
		failed  : false,
		error   : undefined
	};

	// back to the define-time state: no handler retained, the shim's empty
	// prototype, asClass off, no error
	const reset = function () {
		cell.handler = undefined;
		cell.asClass = false;
		cell.proto = shimProto;
		cell.failed = false;
		cell.error = undefined;
	};

	// the single callback call per construction — invoked ONLY by
	// gatherLazyDefinition at the construction entries
	const gather = function () {
		reset();
		try {
			const gathered = getter();
			if (!isCallableCandidate(gathered)) {
				throw new HANDLER_MUST_BE_A_FUNCTION;
			}
			// the shape checks are what make it a ConstructHandler
			classifyConstructHandler(
				TypeName,
				gathered
			);
			const handler = gathered;
			cell.handler = handler;
			cell.asClass = isClass(handler);
			// same fallback as the direct path: an own NON-OBJECT prototype
			// (prototype = 123) is replaced by the default
			cell.proto = (
				hop(
					handler,
					'prototype'
				) &&
				(typeof handler.prototype === 'object')
			) ? handler.prototype : getDefaultPrototype();
		} catch (error) {
			// passthrough, exactly like runBuild's catch: whatever the
			// callback threw reaches throwModificationError as-is (a thrown
			// non-Error breaks the prototype splice there the same way it
			// does for a constructor body). The flag is separate from the
			// value: a callback may throw undefined
			cell.failed = true;
			cell.error = error;
		}
	};

	// keyed by the type descriptor here; TypeProxy registers its proxy
	// against the same definition when it wraps this type
	setLazyDefinition(
		type,
		{
			cell,
			// the merged config value at define time — the callback must
			// not run when the construction will be blocked
			blockErrors : mergedConfig.blockErrors !== false,
			gather,
			reset
		}
	);

	// zero-arg factory, the same contract as a direct type's
	// constructHandler: builds the wrapper from the gathered handler,
	// rebuilt on every construction (the callback may return a new function
	// each time); before the gather — and after a failed one — it builds
	// the shim's wrapper, which the error path then replaces
	const lazyConstructHandler = function () {
		if (cell.handler === undefined) {
			const shimResult = shimConstructHandler();
			return shimResult;
		}
		const { handler } = cell;
		const modificatorBody = compileNewModificatorFunctionBody(
			TypeName,
			cell.asClass
		);
		const wrappedBody = modificatorBody(
			handler,
			CreationHandler,
			SymbolConstructorName
		);
		const handlerResult = wrappedBody();
		return handlerResult;
	};

	odp(
		type,
		'constructHandler', {
			get () {
				return lazyConstructHandler;
			},
			enumerable   : true,
			configurable : true
		}
	);

	odp(
		type,
		'proto', {
			get () {
				const result = cell.proto;
				return result;
			},
			enumerable   : true,
			configurable : true
		}
	);

	// a fresh copy per read: asClass is per-construction and must never
	// leak into the shared merged config
	odp(
		type,
		'config', {
			get () {
				const result = Object.assign(
					{},
					mergedConfig,
					{ asClass : cell.asClass }
				);
				return result;
			},
			enumerable   : true,
			configurable : true
		}
	);

};

const typeDescriptorCreator = function (
	this: TypeDescriptorInstance,
	defineOrigin: TypeAbsorber,
	types: TypesMap,
	TypeName: string,
	constructHandler: MnemonicaConstructorFactory,
	proto: { [index: string]: unknown },
	config: { [index: string]: unknown },
	lazyGetter?: LazyDef<object>,
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

	// 'name' is a COLLECTION option only: a user passing it here meant to
	// name the collection, not the type — say so readably
	if ( config !== undefined && typeof config === 'object' && 'name' in config ) {
		const nameError = '\"name\" is a collection option ' +
			'(createTypesCollection({ name })) — it cannot be set on a type';
		throw new OPTIONS_ERROR( nameError );
	}
	config = Object.assign(
		{},
		(collection as Record<symbol, unknown>)[ SymbolConfig ],
		config
	);
	// never inherited into the type's config either
	Reflect.deleteProperty( config, 'name' );

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

	// lazy types: proto / config / constructHandler become facades over the
	// per-construction gather cell — see installLazyDefinition above and
	// lazyDefinition.ts
	if (lazyGetter !== undefined) {
		installLazyDefinition(
			type,
			TypeName,
			constructHandler,
			proto,
			config,
			lazyGetter
		);
	}

	odp(
		subtypes,
		SymbolParentType, {
			get () {
				return type;
			}
		}
	);

	// const ancestor = isSubType ? Object.create(null) : proto;
	// a lazy root's ancestor is not known at define time either: TypeProxy
	// installs a facade over the gather cell when it receives undefined for
	// a non-subtype here
	const ancestor = (isSubType || lazyGetter !== undefined) ? undefined : proto;
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

};

// the creator is only ever invoked with `new` (the createFrom* call sites
// below); a function expression carries no construct signature, so it is
// named once as the constructor interface it is used through — the
// prototype contract is attached immediately below
const TypeDescriptor = typeDescriptorCreator as _Internal_TC_<TypeDescriptorInstance>;

Object.assign(
	TypeDescriptor.prototype,
	hooksApi
);

TypeDescriptor.prototype.define = function (
	this: TypeDescriptorInstance,
	TypeOrTypeName: string | DefineNewableOrCallable,
	constructHandlerOrConfig?: DefineNewableOrCallable | object,
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
	TypeName: string,
	getter?: LazyDef<object>,
	config?: object
) {
	const result = lazy.call(
		this,
		this.subtypes as TypesMap,
		TypeName,
		getter,
		config
	);
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
	// CollectionDef.lookup is the runtime contract (CollectionLookup), so a
	// plain string path yields TypeClass | undefined with no cast
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
				const decorator = function (cstr: DefineNewable) {
					const { name } = cstr;
					// define() returns the registered constructor itself —
					// the full TypeClass is a richer honest type than any cast
					const defineResult = self.define(
						name,
						cstr,
						options
					);
					return defineResult;
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
	config?: constructorOptions,
	lazyGetter?: LazyDef<object>
) {
	// for a lazy type the handler stays the empty shim: the real constructor
	// is gathered from the callback once per construction (see
	// installLazyDefinition above and lazyDefinition.ts)
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

	// reject the unsupported handler shapes (generators, sync arrows,
	// shorthand methods, bound functions) BEFORE the type is created, so
	// a rejected define leaves nothing registered. Skipped when the name
	// is taken: the TypeDescriptor below throws the canonical
	// ALREADY_DECLARED, which wins over the shape error
	if ( !target.has( name ) ) {
		classifyConstructHandler(
			name,
			handler
		);
	}

	const result = new TypeDescriptor(
		defineOrigin,
		target,
		name,
		makeConstructHandler,
		proto,
		config,
		lazyGetter
		// new TypeDescriptor() returns the TypeProxy it registers in the
		// subtypes map — a Proxy materializing the TypeClass surface
		// dynamically — so the public constructor contract is named here
	) as unknown as TypeClass;
	return result;
};

// .lazy() is a regular define whose handler is the empty shim; the real
// constructor is gathered from the callback once per construction — see
// installLazyDefinition above and lazyDefinition.ts. NOTHING is derived
// from the callback here: it is never called at define time, so forward
// references and circular imports work — the callback's target only has to
// exist by the first `new`
const createFromLazyDefinition = function (
	defineOrigin: TypeAbsorber,
	target: TypesMap,
	name: string,
	getter: LazyDef<object>,
	config: constructorOptions
) {

	const result = createFromDirectHandler(
		defineOrigin,
		target,
		name,
		undefined,
		config,
		getter
	);
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
	TypeOrTypeName: string | DefineNewableOrCallable,
	constructHandlerOrConfig?: DefineNewableOrCallable | object,
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
	TypeName: string,
	getter?: LazyDef<object>,
	config?: object
): TypeClass {

	// the unnamed lazy(() => Constructor) form is dropped: the callback is
	// never called at define time, so there is nothing to derive the name
	// from — the name must come in explicitly
	if (typeof TypeName !== 'string') {
		throw new TYPENAME_MUST_BE_A_STRING;
	}

	if (typeof getter !== 'function') {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}

	// the callback runs per construction and must deliver the constructor
	// synchronously: an async or generator callback would produce a
	// Promise / iterator instead
	const callbackKind = getter.constructor.name;
	if (
		callbackKind === 'AsyncFunction' ||
		callbackKind === 'GeneratorFunction' ||
		callbackKind === 'AsyncGeneratorFunction'
	) {
		const msg = `${TypeName}: lazy callback must be a sync function ` +
			'(async and generator callbacks are not supported)';
		throw new WRONG_MODIFICATION_PATTERN( msg );
	}

	if (!config || (typeof config !== 'object' && typeof config !== 'function')) {
		config = {};
	}

	// the same dotted-path resolution as define's string branch:
	// lazy('Parent.Child', ...) lands under Parent, and a taken name fails
	// with the descriptor's ALREADY_DECLARED, exactly like define
	checkTypeName(TypeName);

	const { target, name } = resolveDefinitionContext(
		subtypes,
		TypeName
	);

	const lazyResult = createFromLazyDefinition(
		this as TypeAbsorber,
		target,
		name,
		getter,
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
	// a type's subtypes map IS the runtime TypesMap (SymbolParentType and
	// MNEMOSYNE are installed at definition time), so the single cast only
	// names that view
	const result = lookup.call(
		type.subtypes as TypesMap,
		NextNestedPath
	);
	return result;

};



