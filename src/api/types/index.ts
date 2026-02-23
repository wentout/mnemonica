'use strict';

import {
	ConstructorFunction,
	TypeDescriptorInstance,
	TypeClass,
	constructorOptions
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
	this: TypeDescriptorInstance,
	defineOrigin: CallableFunction,
	types: Map<string, object>,
	TypeName: string,
	constructHandler: CallableFunction,
	proto: { [ index: string ]: unknown },
	config: { [ index: string ]: unknown },
) {

	// here "types" refers to subtypes of type or collection object {}

	const parentType = (types as unknown as Record<symbol, object>)[ SymbolParentType ] || null;

	const isSubType = parentType ? true : false;

	const collection = isSubType
		? (parentType as Record<string, unknown>).collection as object
		: (types as unknown as Record<string | symbol, object>)[ MNEMOSYNE ];

	if ( types.has( TypeName ) ) {
		throw new ALREADY_DECLARED;
	}

	// const subtypes = descriptors.createTypesCollection();
	const subtypes = new Map<string, object>();

	const title = `${TYPE_TITLE_PREFIX}${TypeName}`;

	config = Object.assign( {}, (collection as Record<symbol, unknown>)[ SymbolConfig ], config );

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

	// const Uranus = isSubType ? Object.create(null) : proto;
	const Uranus = isSubType ? undefined : proto;
	types.set( TypeName, new TypeProxy( type, Uranus ) );
	
	// types.set( TypeName, new TypeProxy( type ) );

	return types.get( TypeName );

} as unknown as ConstructorFunction<TypeDescriptorInstance>;

Object.assign( TypeDescriptor.prototype, hooksApi );

TypeDescriptor.prototype.define = function (
	this: TypeDescriptorInstance,
	TypeOrTypeName: string | CallableFunction,
	constructHandlerOrConfig?: CallableFunction | object,
	config?: object
) {
	return define.call( define, this.subtypes as Map<string, object>, TypeOrTypeName, constructHandlerOrConfig, config );
};

TypeDescriptor.prototype.lookup = function (
	this: TypeDescriptorInstance,
	TypeNestedPath: string
) {
	return lookup.call( this.subtypes as Map<string, object>, TypeNestedPath );
};

odp( TypeDescriptor.prototype, Symbol.hasInstance, {
	get () {
		return getTypeChecker( this.TypeName );
	}
} );

/*
here we use function to retreive a contructor
and constructHandlerGetter is that function
*/
const defineUsingType = function (
	this: CallableFunction,
	subtypes: Map<string, object>,
	constructHandlerGetter: () => CallableFunction,
	config: constructorOptions | undefined
) {
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
		
		// this was checking for class / function
		// functions has .writable prototype
		// and classes are has not
		const protoDesc = Object
			.getOwnPropertyDescriptor( constructHandler, 'prototype' ) as PropertyDescriptor | undefined;
		if ( protoDesc && protoDesc.writable ) {
			// constructHandler.prototype = {};
			constructHandler.prototype = getDefaultPrototype();
		}
		
		// TODO:
		// side-way, non correctly working
		// with createInstanceModificator for line
		// Object.defineProperties(ModificatorType.prototype, props);
		// for repeatable instance creations
		// ↓↓↓ ↓↓↓ ↓↓↓
		// else {
		// 	// so let use Object.setPrototypeOf instead
		// 	// Object.setPrototypeOf(Object.getPrototypeOf(constructHandler.prototype), getDefaultPrototype());
		// 	Object.setPrototypeOf(constructHandler.prototype, getDefaultPrototype());
		// }

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


/*
here we directly passing constructHandler
as a constructor for instances creations
*/
const defineUsingFunction = function (
	this: CallableFunction,
	subtypes: Map<string, object>,
	TypeName: string,
	constructHandler: CallableFunction = function () { },
	config: constructorOptions = {}
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

	const proto = (
		hop( constructHandler, 'prototype' ) &&
		// using ↓↓↓ cause for proxy in chain is instanceof fails
		// and also fails for just Object.create(null)
		( typeof constructHandler.prototype === 'object' )
	// ) ? constructHandler.prototype : Object.create(null);
	) ? constructHandler.prototype : getDefaultPrototype();
	
	// let proto = {};
	// if ( hop( constructHandler, 'prototype' ) && ( constructHandler.prototype instanceof Object ) ) {
	// 	proto = Object.assign( {}, constructHandler.prototype );
	// 	Object.setPrototypeOf( proto, constructHandler.prototype );
	// }

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


export const define = function (
	this: CallableFunction,
	subtypes: Map<string, object>,
	TypeOrTypeName: string | CallableFunction,
	constructHandlerOrConfig?: CallableFunction | object,
	config?: object
): TypeClass {

	if ( typeof TypeOrTypeName === 'function' ) {
		// TODO: if ( hop( TypeOrTypeName, 'name' ) ) {
		// TODO: if ( hop( TypeOrTypeName.constructor, 'name' ) ) {
		if ( TypeOrTypeName.name ) {
			return define.call( this, subtypes, TypeOrTypeName.name, TypeOrTypeName, config );
		} else {
			 
			return (defineUsingType as any).call(
				this,
				subtypes,
				TypeOrTypeName,
				constructHandlerOrConfig
			);
		}
	}

	if ( typeof TypeOrTypeName === 'string' ) {

		checkTypeName( TypeOrTypeName );

		const split = getTypeSplitPath( TypeOrTypeName );

		const Type = lookup.call( subtypes, split[ 0 ] );

		if ( !Type ) {

			if ( split.length === 1 ) {
				 
				return (defineUsingFunction as any).call(
					this,
					subtypes,
					TypeOrTypeName,
					constructHandlerOrConfig,
					config
				);
			}

			throw new WRONG_TYPE_DEFINITION( `${split[ 0 ]} definition is not yet exists` );
		}

		const TypeName = split.slice( 1 ).join( '.' );

		if ( split.length > 1 ) {
			return define.call( this, Type.subtypes as Map<string, object>, TypeName, constructHandlerOrConfig, config );
		}

		// so, here we go with
		// defineUsingType.call
		// from the next step
		return define.call(
			this as unknown as CallableFunction,
			Type.subtypes as Map<string, object>,
			constructHandlerOrConfig as CallableFunction,
			config
		);

	}

	throw new WRONG_TYPE_DEFINITION( 'definition is not provided' );

};

export const lookup = function (
	this: Map<string, object>,
	TypeNestedPath: string
): TypeClass | undefined {

	if ( typeof TypeNestedPath !== 'string' ) {
		throw new WRONG_TYPE_DEFINITION( 'arg : type nested path must be a string' );
	}

	if ( !TypeNestedPath.length ) {
		throw new WRONG_TYPE_DEFINITION( 'arg : type nested path has no path' );
	}

	const split = getTypeSplitPath( TypeNestedPath );

	const [ name ] = split;
	const type = this.get( name ) as TypeClass | undefined;
	if ( split.length === 1 ) {
		return type;
	}

	const NextNestedPath = split.slice( 1 ).join( '.' );
	if (!type) {
		return undefined;
	}
	return lookup.call( type.subtypes as Map<string, object>, NextNestedPath );

};



