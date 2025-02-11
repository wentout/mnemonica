/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import { ConstructorFunction } from '../../types';

import { constants } from '../../constants';
const {
	SymbolGaia,
} = constants;

import { hop } from '../../utils/hop';

import { ErrorsTypes } from '../../descriptors/errors';
const {
	WRONG_TYPE_DEFINITION,
} = ErrorsTypes;

import TypesUtils from '../utils';
const {
	checkProto,
	getTypeChecker,
	findParentSubType,
	reflectPrimitiveWrappers,
} = TypesUtils;

import mnemosynes from './Mnemosyne';
const {
	Gaia,
	Mnemosyne,
	MnemosynePrototypeKeys
} = mnemosynes;

import { InstanceCreator } from './InstanceCreator';

export const TypeProxy = function ( __type__: any, Uranus: any ) {
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

// tslint:disable-next-line: only-arrow-functions
const makeSubTypeProxy = function ( subtype: any, inheritedInstance: any ) {

	const subtypeProxy = new Proxy( InstanceCreator, {

		get ( Target, _prop ) {

			if ( _prop === Symbol.hasInstance ) {
				return getTypeChecker( subtype.TypeName );
			}

			return Reflect.get( Target, _prop );

		},

		construct ( Target, _args ) {
			return new Target( subtype, inheritedInstance, _args );
		},

		apply ( Target, thisArg = inheritedInstance, _args ) {

			// if we would make new keyword obligatory
			// then we should avoid it here, with throw Error


			let existentInstance = reflectPrimitiveWrappers( thisArg );

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if ( !existentInstance[ SymbolGaia ] ) {
				const gaia = new Mnemosyne( new Gaia( existentInstance ) );
				existentInstance = new Proxy( gaia, {
					get : gaiaProxyHandlerGet
				} );
			}

			const entity = new Target( subtype, existentInstance, _args );
			return entity;
		},

	} );

	return subtypeProxy;
};


const MnemonicaInstanceProps = [
	'__proto_proto__',

	'__type__',
	'__self__',

	'__args__',

	'__parent__',
	'__subtypes__',

	'__stack__',

	'__collection__',
	'__timestamp__',

	'__creator__'

].concat( MnemosynePrototypeKeys );

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

	// mocha + chai => bug: ./utils.js .findParentSubType 'inspect'
	'inspect',
	'showDiff',

]
	.concat( MnemonicaInstanceProps )
	.concat( Object.getOwnPropertyNames( Object.prototype ) )
	.concat( Object.getOwnPropertyNames( Function.prototype ) )
	.reduce( ( obj, key ) => {
		obj[ key ] = true;
		return obj;
	}, Object.create( null ) );

const gaiaProxyHandlerGet = ( target: any, prop: string, receiver: any ) => {

	// Node.js 22 Reflect.get Behaviour Changed here
	// cause something gone wrong with prop assignment
	// so now if we need .stack, we should avoid receiver here
	// nave not yet checked other staticProps,
	// just fixed this below
	// while using conditional for staticProps
	const result = Reflect.get( target, prop, receiver );

	if ( result !== undefined ) {
		return result;
	}

	if ( typeof prop === 'symbol' ) {
		return result;
	}

	if ( staticProps[ prop ] ) {
		/*
		const mayBeResult = Reflect.get(target, prop);
		if (mayBeResult !== undefined) {
			return mayBeResult;
		}
		*/
		return result;
	}

	// prototype of proxy
	const instance: any = Reflect.getPrototypeOf( receiver );

	const {
		__type__: {
			config: {
				strictChain
			},
			subtypes
		},
	} = instance;

	const subtype = subtypes.has( prop ) ?
		subtypes.get( prop ) :
		strictChain ?
			undefined :
			findParentSubType( instance, prop );

	return subtype ? makeSubTypeProxy( subtype, receiver ) : result;
};

TypeProxy.prototype.construct = function ( __: any, args: any[] ) {

	// new.target id equal with target here

	const {
		__type__: type,
		Uranus
	} = this;

	// constructs new Gaia -> new Mnemosyne
	// 2 build the first instance in chain
	const uranus = reflectPrimitiveWrappers( Uranus );
	const gaia = new Mnemosyne( new Gaia( uranus ) );
	const gaiaProxy = new Proxy( gaia, {
		get : gaiaProxyHandlerGet
	} );

	const instance = new InstanceCreator( type, gaiaProxy, args );
	return instance;

};
