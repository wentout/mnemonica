'use strict';

import type {
	constructorOptions, _Internal_TC_, TypeDef, TypeDescriptorDefine 
} from '../../types';

import TypesUtils from '../utils';
const { checkProto, } = TypesUtils;

import { hop } from '../../utils/hop';

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
	Uranus: unknown;
	apply: typeof subTypeApply;
	new (...args: unknown[]): object;
}

export const TypeProxy = function (__type__: TypeProxyType, Uranus: unknown) {
	Object.assign(
		this,
		{
			__type__,
			Uranus
		}
	);
	const typeProxy = new Proxy(
		InstanceCreator,
		this
	);
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
		Object.assign(
			type.proto,
			value
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
	Uranus: unknown,
	args: [constructorOptions, ...unknown[]],
) {
	const type = this.__type__;
	// case of decorator like usage
	if (Uranus === undefined) {
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
		Uranus
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

	const {
		__type__: type,
		Uranus
	} = this;

	// so this is a direct Sub-Type invocation
	// having no existentInstance created earlier
	// then we should rely on that somehow
	const uranus = type.isSubType ? getDefaultPrototype() : Uranus;

	const mnemosyneProxy = createMnemosyne(uranus);
	const instance = new InstanceCreator(
		type,
		mnemosyneProxy,
		args
	);

	return instance;

};
