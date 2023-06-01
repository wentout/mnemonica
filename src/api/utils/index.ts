'use strict';

import { constants } from '../../constants';
import { ErrorsTypes } from '../../descriptors/errors';
import { utils } from '../../utils';

const {
	odp,
	SymbolConstructorName,
	MNEMONICA,
	MNEMOSYNE,
	GAIA,
	URANUS
} = constants;

const {
	WRONG_TYPE_DEFINITION,
} = ErrorsTypes;

const {
	collectConstructors
} = utils;


const CreationHandler = function ( this: any, constructionAnswer: any ) {
	// standard says :
	// if constructor returns something
	// then this is a toy
	// we have to play with
	// respectively
	// so we will not follow the rule
	// if (constructionAnswer instanceof types[TypeName]) {
	// and instead follow the line below
	if ( constructionAnswer instanceof Object ) {
		return constructionAnswer;
	}
	return this;
};

import compileNewModificatorFunctionBody from '../types/compileNewModificatorFunctionBody';

import oldMC from '../types/createInstanceModificator200XthWay';
import newMC from '../types/createInstanceModificator';

const getModificationConstructor = ( useOldStyle: boolean ) => {
	return ( useOldStyle ? oldMC : newMC )();
};

const checkProto = ( proto: any ) => {
	if ( !( proto instanceof Object ) ) {
		throw new WRONG_TYPE_DEFINITION( 'expect prototype to be an object' );
	}
};

const getTypeChecker = ( TypeName: string ) => {
	const seeker: any = ( instance: object ) => {

		if ( typeof instance !== 'object' ) {
			return false;
		}

		if ( !instance!.constructor ) {
			return false;
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if ( Reflect.getPrototypeOf( instance ).constructor.name === 'Promise' ) {
			// if ( instance instanceof Promise ) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return instance[ SymbolConstructorName ] === TypeName;
		}

		const constructors: any = collectConstructors( instance );
		return constructors[ TypeName ] || false;

	};
	return seeker;
};

const getTypeSplitPath = ( path: string ) => {
	const split = path
		// beautifull names
		.replace( /\n|\t| /g, '' )
		.replace( /\[(\w+)\]/g, '.$1' )
		.replace( /^\./, '' )
		.split( /\.|\/|:/ );
	return split;
};

const getExistentAsyncStack = ( existentInstance: any ) => {

	const stack = [];
	let proto = existentInstance;

	while ( proto ) {

		if ( !proto.__stack__ ) {
			break;
		}

		const pstack = proto
			.__stack__
			.split( '\n' )
			.reduce( ( arr: string[], line: string ) => {
				if ( line.length ) {
					arr.push( line );
				}
				return arr;
			}, [] );

		proto = proto.parent();

		if ( proto && proto.__type__ ) {

			if ( proto.__type__.isSubType ) {
				stack.push( ...pstack.slice( 0, 1 ) );
			} else {
				stack.push( ...pstack );
			}

		} else {
			stack.push( ...pstack );
			break;
		}
	}

	return stack;

};

const forbiddenNames = [ MNEMONICA, MNEMOSYNE, GAIA, URANUS ];

const checkTypeName = ( name: string ) => {

	if ( !name.length ) {
		throw new WRONG_TYPE_DEFINITION( 'TypeName must not be empty' );
	}

	if ( name[ 0 ] !== name[ 0 ].toUpperCase() ) {
		throw new WRONG_TYPE_DEFINITION( 'TypeName should start with Uppercase Letter' );
	}

	if ( forbiddenNames.includes( name ) ) {
		throw new WRONG_TYPE_DEFINITION( 'TypeName of reserved keyword' );
	}

};

const findParentSubType: any = ( instance: any, prop: string ) => {
	let subtype = null;

	// if (!instance.__subtypes__) {

	// if ( !instance.__type__ ) {

	// 	// mocha + chai makes .inspect 4 Shaper class
	// 	// or .showDiff if something wrong with constructor
	// 	// debugger;
	// 	return null;
	// }

	if ( instance.__type__.subtypes.has( prop ) ) {
		subtype = instance.__type__.subtypes.get( prop );
		return subtype;
	}
	return findParentSubType( instance.__parent__, prop );
};

// const isClass = ( functionPointer: CallableFunction ) => {
// 	const value = Function.prototype.toString.call( functionPointer );
// 	return /^\s*class\s+/.test( value.trim() );
// };

// accordingly to the gist from here:
// https://gist.github.com/wentout/ea3afe9c822a6b6ef32f9e4f3e98b1ba
const isClass = ( fn: CallableFunction ) => {
	// not necessary to check fn for typeof
	// because of other checks made before
	// if (typeof fn !== 'function') {
	// 	return false;
	// }
	if ( typeof fn.prototype !== 'object' ) {
		return false;
	}
	if ( fn.prototype.constructor !== fn ) {
		return false;
	}
	return Reflect.getOwnPropertyDescriptor( fn, 'prototype' )!.writable === false;
};

import { TypeModificator } from '../../types';

const makeFakeModificatorType = (
	TypeName: string,
	fakeModificator = function () { } as TypeModificator<object>
) => {

	const modificatorBody = compileNewModificatorFunctionBody( TypeName );

	const modificatorType = modificatorBody(
		fakeModificator,
		CreationHandler,
		SymbolConstructorName
	);

	return modificatorType();

};

const reflectPrimitiveWrappers = ( _thisArg: any ) => {
	let thisArg = _thisArg;

	if ( _thisArg === null ) {
		thisArg = Object.create( null );
		odp( thisArg, Symbol.toPrimitive, {
			get () {
				return () => {
					return _thisArg;
				};
			}
		} );
	}

	if (
		_thisArg instanceof Number ||
		_thisArg instanceof Boolean ||
		_thisArg instanceof String
	) {
		odp( thisArg, Symbol.toPrimitive, {
			get () {
				return () => {
					return _thisArg.valueOf();
				};
			}
		} );
	}

	return thisArg;
};

const TypesUtils = {
	isClass,
	CreationHandler,
	getModificationConstructor,
	checkProto,
	getTypeChecker,
	getTypeSplitPath,
	getExistentAsyncStack,
	checkTypeName,
	findParentSubType,
	makeFakeModificatorType,
	reflectPrimitiveWrappers
};

export default TypesUtils;
