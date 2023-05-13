'use strict';

import { constants } from '../../constants';
const {
	odp,
	SymbolReplaceGaia,
	// SymbolConstructorName
} = constants;

import { ErrorsTypes } from '../../descriptors/errors';
const {
	BASE_MNEMONICA_ERROR
} = ErrorsTypes;

import { cleanupStack, getStack } from './';

import TypesUtils from '../utils';
const {
	makeFakeModificatorType
} = TypesUtils;

import { utils } from '../../utils';
const {
	parse
} = utils;

import { makeInstanceModificator } from '../types/InstanceModificator';

export const throwModificationError = function ( this: any, error: any ) {

	// InstanceCreator
	const self = this;

	const {
		TypeName,
		type: {
			stack: typeStack
		},
		args
	} = self;

	// if ( error[ SymbolConstructorName ] ) {
	// 	debugger;
	// }

	const exceptionReason = error.exceptionReason || error;

	if ( error.exceptionReason !== undefined ) {

		error.reasons.push( error.exceptionReason );
		error.surplus.push( error );

		throw error;

	}

	odp( error, 'exceptionReason', {
		get () {
			return exceptionReason;
		},
		enumerable : true
	} );

	const reasons: any[ typeof exceptionReason ] = [ exceptionReason ];

	odp( error, 'reasons', {
		get () {
			return reasons;
		},
		enumerable : true
	} );
	const surplus: any[ typeof exceptionReason ] = [];
	odp( error, 'surplus', {
		get () {
			return surplus;
		},
		enumerable : true
	} );

	self.ModificatorType = makeFakeModificatorType( TypeName );

	self.InstanceModificator = makeInstanceModificator( self );

	const erroredInstance = new self.InstanceModificator();

	erroredInstance[ SymbolReplaceGaia ]( error );

	const stack: string[] = [];

	if ( error instanceof BASE_MNEMONICA_ERROR ) {

		stack.push( error.stack );

	} else {

		const title = `\n<-- creation of [ ${TypeName} ] traced -->`;

		getStack.call( erroredInstance, title, [], throwModificationError );

		stack.push( ...erroredInstance.stack );

		const errorStack = error.stack.split( '\n' );

		stack.push( '<-- with the following error -->' );

		errorStack.forEach( ( line: string ) => {
			if ( !stack.includes( line ) ) {
				stack.push( line );
			}
		} );

		stack.push( '\n<-- of constructor definitions stack -->' );
		stack.push( ...typeStack );

	}

	erroredInstance.stack = cleanupStack( stack ).join( '\n' );

	self.inheritedInstance = erroredInstance;

	// if hooks had some interception: start
	const results = self.invokePostHooks();
	const {
		type,
		collection,
		namespace
	} = results;

	if ( type.has( true ) || collection.has( true ) || namespace.has( true ) ) {
		return;
	}
	// if hooks had some interception: stop

	odp( erroredInstance, 'args', {
		get () {
			return args;
		}
	} );

	odp( erroredInstance, 'originalError', {
		get () {
			return error;
		}
	} );

	odp( erroredInstance, 'instance', {
		get () {
			return erroredInstance;
		}
	} );

	odp( erroredInstance, 'extract', {
		get () {
			return () => {
				return erroredInstance.__self__.extract();
			};
		}
	} );

	odp( erroredInstance, 'parse', {
		get () {
			return () => {
				return parse( erroredInstance );
			};
		}
	} );

	throw erroredInstance;

};
