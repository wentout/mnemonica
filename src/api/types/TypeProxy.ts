/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import { ConstructorFunction } from '../../types';


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
const { createMnemosyne } = mnemosynes;

import { InstanceCreator } from './InstanceCreator';

export const TypeProxy = function ( __type__: any, Uranus: unknown ) {
	Object.assign( this, {
		__type__,
		Uranus
	} );
	const typeProxy = new Proxy( InstanceCreator, this );
	return typeProxy;
} as ConstructorFunction<any>;

TypeProxy.prototype.get = function ( target: any, prop: string ) {

	const {
		__type__: type
	} = this;

	// prototype of proxy
	// const instance = Reflect.getPrototypeOf(receiver);

	if ( prop === 'prototype' ) {
		return type.proto;
	}

	const propDeclaration = type[ prop ];
	if ( propDeclaration ) {
		return propDeclaration;
	}

	// used for existent props with value
	// undefined || null || false
	if ( hop( type, prop ) ) {
		return propDeclaration;
	}

	// SomeType.SomeSubType
	if ( type.subtypes.has( prop ) ) {
		return type.subtypes.get( prop );
	}

	return Reflect.get( target, prop );

};

TypeProxy.prototype.set = function ( __: any, name: string, value: any ) {

	const {
		__type__: type
	} = this;

	// is about setting a prototype to Type
	if ( name === 'prototype' ) {
		checkProto( value );
		type.proto = value;
		return true;
	}

	if ( typeof name !== 'string' || !name.length ) {
		throw new WRONG_TYPE_DEFINITION( 'should use non empty string as TypeName' );
	}

	if ( typeof value !== 'function' ) {
		throw new WRONG_TYPE_DEFINITION( 'should use function for type definition' );
	}

	const TypeName = name;
	const Constructor = value;

	type.define( TypeName, Constructor );
	return true;

};


TypeProxy.prototype.apply = function ( __: unknown, Uranus: unknown, args: unknown[] ) {
	const type = this.__type__;
	let instance = null;
	if ( Uranus ) {
		const InstanceCreatorProxy = new TypeProxy( type, Uranus );
		instance = new InstanceCreatorProxy( ...args );
	} else {
		instance = this.construct( null, args );
	}
	return instance;
};




TypeProxy.prototype.construct = function ( __: unknown, args: unknown[] ) {

	// new.target id equal with target here
	
	const {
		__type__: type,
		Uranus
	} = this;

	const mnemosyneProxy = createMnemosyne(Uranus);

	const instance = new InstanceCreator( type, mnemosyneProxy, args );
	return instance;

};
