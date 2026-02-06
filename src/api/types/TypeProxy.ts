
'use strict';

import { constructorOptions, ConstructorFunction } from '../../types';

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

import { /* _getProps, Props, */ TypeDef } from './Props';

export const TypeProxy = function (__type__: any, Uranus: unknown) {
	Object.assign(this, {
		__type__,
		Uranus
	});
	const typeProxy = new Proxy(InstanceCreator, this);
	return typeProxy;
} as ConstructorFunction<any>;

TypeProxy.prototype.get = function (target: any, prop: keyof TypeDef) {

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

TypeProxy.prototype.set = function (__: any, name: string, value: any) {

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
	parentType: unknown,
	config?: constructorOptions,
	...args: unknown[]
) => {
	// const decorator = function <T extends { new (): unknown }>(cstr: T, s?: ClassDecoratorContext<T>): T {
	const decorator = function <T extends { new (): unknown }>(cstr: T): T {
		// const name = typeof s === 'object' ? s.name : cstr.constructor.name;
		const { name } = cstr;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return parentType.define(name, cstr, config, ...args) as unknown as T;
	};
	return decorator;
};

// replace instance prototype
const primaryTypeApply = function (
	this: InstanceType<typeof TypeProxy>,
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
TypeProxy.prototype.construct = function (__: unknown, args: unknown[]) {

	// new.target id equal with target here

	const {
		__type__: type,
		Uranus
	} = this;

	// so this is a direct Sub-Type invocation
	// having no existentInstance created earlier
	// then we should rely on that somehow
	const uranus = type.isSubType ? getDefaultPrototype() : Uranus;

	// "this" argument may be passed for tracking why something happened
	// but uncomment it there in createMnemosyne if needed
	// const mnemosyneProxy = createMnemosyne(uranus, this);
	const mnemosyneProxy = createMnemosyne(uranus);
	const instance = new InstanceCreator(type, mnemosyneProxy, args);

	// const instance = new InstanceCreator(type, null, args);
	return instance;

};
