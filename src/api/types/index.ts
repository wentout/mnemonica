'use strict';

import { ConstructorFunction, TypeDescriptorInstance } from '../../types';

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

import compileNewModificatorFunctionBody from './compileNewModificatorFunctionBody';

import TypesUtils from '../utils';
const {
	getTypeChecker,
	CreationHandler,
	getTypeSplitPath,
	checkTypeName,
	isClass,
} = TypesUtils;

import { getStack } from '../errors';

const TypeDescriptor = function (
	this: any,
	defineOrigin: CallableFunction,
	types: any,
	TypeName: string,
	constructHandler: CallableFunction,
	proto: { [ index: string ]: unknown },
	config: { [ index: string ]: unknown },
) {

	// here "types" refers to subtypes of type or collection object {}

	const parentType = types[ SymbolParentType ] || null;

	const isSubType = parentType ? true : false;

	const collection = isSubType ? parentType.collection : types[ MNEMOSYNE ];

	if ( types.has( TypeName ) ) {
		throw new ALREADY_DECLARED;
	}

	// const subtypes = descriptors.createTypesCollection();
	const subtypes = new Map();

	const title = `${TYPE_TITLE_PREFIX}${TypeName}`;

	config = Object.assign( {}, collection[ SymbolConfig ], config );

	const type = Object.assign( this, {

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

		hooks : Object.create( null )

	} );

	getStack.call( this, `Definition of [ ${TypeName} ] made at:`, [], defineOrigin );

	odp( subtypes, SymbolParentType, {
		get () {
			return type;
		}
	} );

	types.set( TypeName, new TypeProxy( type ) );

	return types.get( TypeName );

} as ConstructorFunction<TypeDescriptorInstance>;

Object.assign( TypeDescriptor.prototype, hooksApi );

TypeDescriptor.prototype.define = function ( ...args: any[] ) {
	return define.call( define, this.subtypes, ...args );
};

TypeDescriptor.prototype.lookup = function ( ...args: any[] ) {
	return lookup.call( this.subtypes, ...args );
};

odp( TypeDescriptor.prototype, Symbol.hasInstance, {
	get () {
		return getTypeChecker( this.TypeName );
	}
} );

const defineUsingType = function ( this: any, subtypes: any, constructHandlerGetter: CallableFunction, config: any ) {
	// we need this to extract TypeName
	const type = constructHandlerGetter();

	if ( typeof type !== 'function' ) {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}

	const TypeName = type.name;

	if ( !TypeName ) {
		throw new TYPENAME_MUST_BE_A_STRING;
	}

	const asClass = isClass( type );

	const makeConstructHandler = () => {
		const constructHandler = constructHandlerGetter();
		// constructHandler[SymbolConstructorName] = TypeName;
		odp( constructHandler, SymbolConstructorName, {
			get () {
				return TypeName;
			}
		} );
		const protoDesc: any = Object
			.getOwnPropertyDescriptor( constructHandler, 'prototype' );
		if ( protoDesc.writable ) {
			constructHandler.prototype = {};
		}
		return constructHandler;
	};

	if ( typeof config === 'object' ) {
		config = Object.assign( {}, config );
	} else {
		config = {};
	}

	config.asClass = asClass;

	return new TypeDescriptor(
		this,
		subtypes,
		TypeName,
		makeConstructHandler,
		type.prototype,
		config
	);
};

const defineUsingFunction = function (
	this: any,
	subtypes: any,
	TypeName: string,
	constructHandler = function () { },
	config: any = {}
) {

	if ( typeof constructHandler !== 'function' ) {
		throw new HANDLER_MUST_BE_A_FUNCTION;
	}

	const asClass = isClass( constructHandler );
	const modificatorBody = compileNewModificatorFunctionBody( TypeName, asClass );

	const makeConstructHandler = modificatorBody(
		constructHandler,
		CreationHandler,
		SymbolConstructorName
	);

	if ( config instanceof Function ) {
		config = {
			ModificationConstructor : config
		};
	}

	if ( typeof config !== 'object' ) {
		config = {};
	}


	config.asClass = asClass;

	const proto = hop( constructHandler, 'prototype' ) &&
		( constructHandler.prototype instanceof Object ) ?
		Object.assign( {}, constructHandler.prototype ) :
		{};

	return new TypeDescriptor(
		this,
		subtypes,
		TypeName,
		makeConstructHandler,
		// proto prop for TypeDescriptor
		proto,
		config
	);

};


export const define: any = function ( this: any, subtypes: any, TypeOrTypeName: string | any, constructHandlerOrConfig: any, config: object ) {

	if ( typeof TypeOrTypeName === 'function' ) {
		if ( TypeOrTypeName.name ) {
			return define.call( this, subtypes, TypeOrTypeName.name, TypeOrTypeName, constructHandlerOrConfig || TypeOrTypeName.prototype, config );
		} else {
			return defineUsingType.call( this, subtypes, TypeOrTypeName, constructHandlerOrConfig );
		}
	}

	if ( typeof TypeOrTypeName === 'string' ) {

		checkTypeName( TypeOrTypeName );

		const split = getTypeSplitPath( TypeOrTypeName );

		const Type = lookup.call( subtypes, split[ 0 ] );

		if ( !Type ) {

			if ( split.length === 1 ) {
				return defineUsingFunction.call( this, subtypes, TypeOrTypeName, constructHandlerOrConfig, config );
			}

			throw new WRONG_TYPE_DEFINITION( `${split[ 0 ]} definition is not yet exists` );
		}

		const TypeName = split.slice( 1 ).join( '.' );

		if ( split.length > 1 ) {
			return define.call( this, Type.subtypes, TypeName, constructHandlerOrConfig, config );
		}

		// so, here we go with
		// defineUsingType.call
		// from the next step
		return define.call( this, Type.subtypes, constructHandlerOrConfig, config );

	}

	throw new WRONG_TYPE_DEFINITION( 'definition is not provided' );

};

export const lookup: any = function ( this: any, TypeNestedPath: string ) {

	if ( typeof TypeNestedPath !== 'string' ) {
		throw new WRONG_TYPE_DEFINITION( 'arg : type nested path must be a string' );
	}

	if ( !TypeNestedPath.length ) {
		throw new WRONG_TYPE_DEFINITION( 'arg : type nested path has no path' );
	}

	const split = getTypeSplitPath( TypeNestedPath );

	const [ name ] = split;
	const type = this.get( name );
	if ( split.length === 1 ) {
		return type;
	}

	const NextNestedPath = split.slice( 1 ).join( '.' );
	return lookup.call( type.subtypes, NextNestedPath );

};



