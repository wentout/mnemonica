'use strict';

import type {
	constructorOptions, _Internal_TC_, TypeDef, TypeDescriptorDefine 
} from '../../types';

import TypesUtils from '../utils';
const { checkProto, } = TypesUtils;

import { hop } from '../../utils/hop';

import { constants } from '../../constants';
const { odp } = constants;

import {
	readLazyDefinition,
	gatherLazyDefinition,
	setLazyDefinition
} from './lazyDefinition';

import { ErrorsTypes } from '../../descriptors/errors';
const { WRONG_TYPE_DEFINITION, } = ErrorsTypes;

import mnemosynes from './Mnemosyne';
const { createMnemosyne, getDefaultPrototype } = mnemosynes;

import { InstanceCreator } from './InstanceCreator';

// The runtime object stored in __type__ is a TypeDescriptor instance,
// which has all TypeDef properties plus define/lookup methods.
interface TypeProxyType extends TypeDef {
	define: TypeDescriptorDefine;
	[key: string]: unknown;
}

// Proxy trap handler signatures
interface TypeProxyGetHandler {
	get(target: _Internal_TC_<object>, prop: string): unknown;
}

interface TypeProxySetHandler {
	set(_target: unknown, name: string, value: unknown): boolean;
}

interface TypeProxyConstructHandler {
	construct(_target: unknown, args: unknown[]): object;
}

// Type for TypeProxy instance — data + traps
export interface TypeProxyInstance extends TypeProxyGetHandler, TypeProxySetHandler, TypeProxyConstructHandler {
	__type__: TypeProxyType;
	// the ancestor new instances descend from (root proto or apply-trap entity)
	ancestor: unknown;
	apply: typeof subTypeApply;
	new (...args: unknown[]): object;
}

export const TypeProxy = function (__type__: TypeProxyType, ancestor: unknown) {
	Object.assign(
		this,
		{
			__type__
		}
	);
	// for a lazy ROOT type the ancestor is not fixed at define time: it is
	// the current construction's gathered prototype, so it is a facade over
	// the lazy cell. An explicit ancestor (the .call/.apply/.bind path)
	// keeps winning as a plain value, exactly as for direct types
	const lazy = readLazyDefinition(__type__);
	if (lazy !== undefined && ancestor === undefined && !__type__.isSubType) {
		const { cell } = lazy;
		odp(
			this,
			'ancestor',
			{
				get () {
					const result = cell.proto;
					return result;
				},
				enumerable   : true,
				configurable : true
			}
		);
	} else {
		Object.assign(
			this,
			{
				ancestor
			}
		);
	}
	const typeProxy = new Proxy(
		InstanceCreator,
		this
	);
	if (lazy !== undefined) {
		// the subtype construction entries (makeSubTypeProxy, addThen) hold
		// this proxy, not the descriptor — register it against the same
		// definition so both keys resolve the one cell
		setLazyDefinition(
			typeProxy,
			lazy
		);
	}
	return typeProxy;
} as _Internal_TC_<TypeProxyInstance>;

TypeProxy.prototype.get = function (this: TypeProxyInstance, target: _Internal_TC_<object>, prop: string) {

	const { __type__: type } = this;

	// prototype of proxy
	if (prop === 'prototype') {
		return type.proto;
	}

	const propDeclaration = (type as Record<string, unknown>)[ prop ];
	if (propDeclaration) {
		return propDeclaration;
	}

	// used for existent props with value
	// undefined || null || false
	if (hop(
		type,
		prop
	)) {
		return propDeclaration;
	}

	// SomeType.SomeSubType
	if (type.subtypes.has(prop)) {
		const subtypeResult = type.subtypes.get(prop);
		return subtypeResult;
	}

	const reflectResult = Reflect.get(
		target,
		prop
	);
	return reflectResult;

};

TypeProxy.prototype.set = function (this: TypeProxyInstance, _target: unknown, name: string, value: unknown) {

	const { __type__: type } = this;

	// is about setting a prototype to Type
	if (name === 'prototype') {
		checkProto(value);
		// the FULL-descriptor copy, not Object.assign: an enumerable-only
		// copy silently drops non-enumerable props — assigning a class
		// prototype object lost its methods — and INVOKES getters, freezing
		// them to a value instead of keeping them getters. Object.assign
		// does copy enumerable symbol-keyed props; what it loses is the
		// non-enumerables and the getters
		Object.defineProperties(
			type.proto,
			Object.getOwnPropertyDescriptors( value )
		);
		return true;
	}

	if (typeof name !== 'string' || !name.length) {
		throw new WRONG_TYPE_DEFINITION('should use non empty string as TypeName');
	}

	if (typeof value !== 'function') {
		throw new WRONG_TYPE_DEFINITION('should use function for type definition');
	}

	type.define(
		name,
		value
	);
	return true;

};

// share decorator from primary type
const subTypeApply = (
	parentType: TypeProxyType,
	cfg?: constructorOptions
) => {
	const decorator = function <T extends { new (): unknown }>(cstr: T): T {
		const { name } = cstr;
		const defineResult = parentType.define(
			name,
			cstr,
			cfg
		);
		// decorator contract: define() returns the constructor wrapping cstr
		// (construction still runs through cstr); the class binding is
		// replaced by that constructor, so it is presented as T
		const result = defineResult as unknown as T;
		return result;
	};
	return decorator;
};

// replace instance prototype
const primaryTypeApply = function (
	this: TypeProxyInstance,
	// proxy target
	__: unknown,
	thisArg: unknown,
	args: [constructorOptions, ...unknown[]],
) {
	const type = this.__type__;
	// case of decorator like usage
	if (thisArg === undefined) {
		const decorator = subTypeApply(
			type,
			args[ 0 ]
		);
		return decorator;
	}

	// this is the scenario, when we .call or .apply or .bind
	// our PrimaryType whick is === instance of current TypeProxy
	const InstanceCreatorProxy = new TypeProxy(
		type,
		thisArg
	);
	const instance = new InstanceCreatorProxy(...args);
	return instance;
};

Object.defineProperty(
	TypeProxy.prototype,
	'apply',
	{
		get () {
			return primaryTypeApply;
		}
	}
);

// this always is initial type creation ...
// so no way to invoke this otherwise than direct type call
TypeProxy.prototype.construct = function (this: TypeProxyInstance, _target: unknown, args: unknown[]) {

	// new.target id equal with target here

	const { __type__: type } = this;

	const { ancestor } = this;

	// so this is a direct Sub-Type invocation
	// having no existentInstance created earlier
	// then we should rely on that somehow
	const parentProto = type.isSubType ? getDefaultPrototype() : ancestor;

	// the lazy callback runs exactly ONCE per construction, here at the
	// entry — unless the construction is about to be blocked (an errored
	// parent with blockErrors on): the body path never runs user code for
	// a blocked construction, so the callback must not run either. The
	// pre-gather parentProto is enough for that check: on this path the
	// facade still serves the define-time prototype (never an Error); only
	// an explicit apply-path ancestor can be one
	gatherLazyDefinition(type, parentProto);

	// re-read after the gather: for a lazy root the ancestor facade now
	// serves THIS construction's gathered prototype
	const gatheredParentProto = type.isSubType ? getDefaultPrototype() : this.ancestor;

	const mnemosyneProxy = createMnemosyne(gatheredParentProto);
	const instance = new InstanceCreator(
		type,
		mnemosyneProxy,
		args
	);

	return instance;

};
