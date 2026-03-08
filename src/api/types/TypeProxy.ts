'use strict';

import type { constructorOptions, ConstructorFunction } from '../../types';

import TypesUtils from '../utils';
const {
	checkProto,
} = TypesUtils;

import { hop } from '../../utils/hop';

import { ErrorsTypes } from '../../descriptors/errors';
const {
	WRONG_TYPE_DEFINITION,
} = ErrorsTypes;

import mnemosynes from './Mnemosyne';
const { createMnemosyne, getDefaultPrototype } = mnemosynes;

import { InstanceCreator } from './InstanceCreator';

// Type for TypeProxy instance
export interface TypeProxyInstance {
	__type__: { [key: string]: unknown; proto: object; subtypes: Map<string, unknown>; define: (n: string, c: CallableFunction, cf?: object, ...fa: unknown[]) => unknown };
	Uranus: unknown;
	get(target: CallableFunction, prop: string): unknown;
	set(target: unknown, name: string, value: unknown): boolean;
	construct(target: unknown, args: unknown[]): object;
	apply: typeof subTypeApply;
	new (...args: unknown[]): object;
}

export const TypeProxy = function (__type__: TypeProxyInstance['__type__'], Uranus: unknown) {
	Object.assign(this, {
		__type__,
		Uranus
	});
	const typeProxy = new Proxy(InstanceCreator, this);
	return typeProxy;
} as ConstructorFunction<TypeProxyInstance>;

TypeProxy.prototype.get = function (target: CallableFunction, prop: string) {

	// const props = _getProps(this) as Props;

	const {
		__type__: type
	} = this;

	// prototype of proxy
	// const instance = Reflect.getPrototypeOf(receiver);

	if (prop === 'prototype') {
		return type.proto;
	}

	const propDeclaration = type[ prop ];
	if (propDeclaration) {
		return propDeclaration;
	}

	// used for existent props with value
	// undefined || null || false
	if (hop(type, prop)) {
		return propDeclaration;
	}

	// SomeType.SomeSubType
	if (type.subtypes.has(prop)) {
		return type.subtypes.get(prop);
	}

	return Reflect.get(target, prop);

};

TypeProxy.prototype.set = function (_target: unknown, name: string, value: unknown) {

	const {
		__type__: type
	} = this;

	// is about setting a prototype to Type
	if (name === 'prototype') {
		checkProto(value);
		Object.assign(type.proto, value);
		return true;
	}

	if (typeof name !== 'string' || !name.length) {
		throw new WRONG_TYPE_DEFINITION('should use non empty string as TypeName');
	}

	if (typeof value !== 'function') {
		throw new WRONG_TYPE_DEFINITION('should use function for type definition');
	}

	const TypeName = name;
	const Constructor = value;

	type.define(TypeName, Constructor);
	return true;

};


// share decorator from primary type
const subTypeApply = (
	parentType: { define: (n: string, c: CallableFunction, cf?: object, ...fa: unknown[]) => unknown },
	cfg?: constructorOptions,
	...fnArgs: unknown[]
) => {
	// const decorator = function <T extends { new (): unknown }>(cstr: T, s?: ClassDecoratorContext<T>): T {
	const decorator = function <T extends { new (): unknown }>(cstr: T): T {
		// const name = typeof s === 'object' ? s.name : cstr.constructor.name;
		const { name } = cstr;
		 
		return parentType.define(name, cstr as unknown as CallableFunction, cfg, ...fnArgs) as unknown as T;
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
		// so instead of
		// instance = this.construct(null, args);
		// we will return decorator
		const decorator = subTypeApply(type, args[ 0 ]);
		return decorator;
	}

	// this is the scenario, when we .call or .apply or .bind
	// our PrimaryType whick is === instance of current TypeProxy
	const InstanceCreatorProxy = new TypeProxy(type, Uranus);
	const instance = new InstanceCreatorProxy(...args);
	return instance;
};

Object.defineProperty(TypeProxy.prototype, 'apply', {
	get () {
		// const type = this.__type__;
		return primaryTypeApply;
		// const answer = !type.isSubType ? primaryTypeApply : 
		// 	(__: unknown, ___: unknown, config?: constructorOptions, ...args: unknown[]) => {
		// 		return subTypeApply(type, config, ...args);
		// 	};
		// return answer;
	}
});


// this always is initial type creation ...
// so no way to invoke this otherwise than direct type call
TypeProxy.prototype.construct = function (_target: unknown, args: unknown[]) {

	// new.target id equal with target here

	const {
		__type__: type,
		Uranus
	} = this;

	// so this is a direct Sub-Type invocation
	// having no existentInstance created earlier
	// then we should rely on that somehow
	const uranus = type.isSubType ? getDefaultPrototype() : Uranus;

	// Get exposeInstanceMethods from type config, defaulting to false
	const config = type.config as { exposeInstanceMethods?: boolean } | undefined;
	const exposeInstanceMethods = config!.exposeInstanceMethods as unknown as boolean;

	// "this" argument may be passed for tracking why something happened
	// but uncomment it there in createMnemosyne if needed
	// const mnemosyneProxy = createMnemosyne(uranus, this);
	const mnemosyneProxy = createMnemosyne(uranus, exposeInstanceMethods);
	const instance = new InstanceCreator(type, mnemosyneProxy, args);

	// const instance = new InstanceCreator(type, null, args);
	return instance;

};
