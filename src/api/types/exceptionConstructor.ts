'use strict';

import { constants } from '../../constants';
const { odp } = constants;

import { ErrorsTypes } from '../../descriptors/errors';
const {
	WRONG_ARGUMENTS_USED,
	WRONG_INSTANCE_INVOCATION
} = ErrorsTypes;

import { cleanupStack, getStack } from '../errors';

import { utils } from '../../utils';
const {
	parse
} = utils;

import TypesUtils from './utils';
const {
	makeFakeModificatorType
} = TypesUtils;

import { makeInstanceModificator } from './InstanceCreator';

const checkThrowArgs = ( instance: any, target: any, error: Error, args: any[] ) => {

	let wrongThrow;

	/* unreacheble, cus instance binded inside of Mnemosyne
	if (instance !== Object(instance)) {
		wrongThrow = new WRONG_ARGUMENTS_USED('"this" must be an object');
	}
	if (instance.constructor[SymbolConstructorName] !== instance.constructor.name) {
		wrongThrow = new WRONG_ARGUMENTS_USED('"this" must be an object');
	}
	*/

	if ( !target ) {
		throw new WRONG_INSTANCE_INVOCATION( 'exception should be made with new keyword' );
	}

	if ( !( error instanceof Error ) ) {
		wrongThrow = new WRONG_ARGUMENTS_USED( 'error must be instanceof Error' );
	}

	if ( !( wrongThrow instanceof Error ) ) {
		return;
	}

	odp( wrongThrow, 'instance', {
		get () {
			return instance;
		}
	} );

	odp( wrongThrow, 'error', {
		get () {
			return error;
		}
	} );

	odp( wrongThrow, 'args', {
		get () {
			return args;
		}
	} );

	throw wrongThrow;

};

const exceptionConsctructHandler = function ( this: any, opts: { [ index: string ]: any } ) {

	const {
		instance,
		TypeName,
		typeStack,
		args
	} = opts;


	const exception = this;

	odp( exception, 'args', {
		get () {
			return args;
		}
	} );

	odp( exception, 'instance', {
		get () {
			return instance;
		}
	} );

	odp( exception, 'extract', {
		get () {
			return () => {
				return instance.extract();
			};
		}
	} );

	odp( exception, 'parse', {
		get () {
			return () => {
				return parse( instance );
			};
		}
	} );

	// real error stack
	const errorStack = exception.stack.split( '\n' );

	const stack: string[] = [];

	const title = `\n<-- lifecycle of [ ${TypeName} ] traced -->`;

	getStack.call( exception, title, [], prepareException );

	stack.push( ...exception.stack );

	stack.push( '<-- with the following error -->' );

	errorStack.forEach( ( line: string ) => {
		if ( !stack.includes( line ) ) {
			stack.push( line );
		}
	} );

	stack.push( '\n<-- of constructor definitions stack -->' );
	stack.push( ...typeStack );

	exception.stack = cleanupStack( stack ).join( '\n' );

	return exception;


};

const prepareException = function ( this: any, target: any, error: Error, ...args: any[] ) {

	const instance = this;

	checkThrowArgs( instance, target, error, args );

	const {
		__type__,
		__creator__
	} = instance;


	const {
		stack: typeStack,
		TypeName
	} = __type__;

	/* short way, makes hooks calls, will not use

	const type = Object.create(__type__);
	type.config.blockErrors = false;

	let errored = new InstanceCreator(type, error, args);
	*/

	const ExceptionCreator = Object.create( __creator__ );
	ExceptionCreator.config = Object.assign( {}, __creator__.config );
	ExceptionCreator.config.blockErrors = false;

	ExceptionCreator.existentInstance = error;
	ExceptionCreator.ModificatorType = makeFakeModificatorType( TypeName, function (this:any) {
		return exceptionConsctructHandler.call( this, {
			instance,
			TypeName,
			typeStack,
			args
		} );
	} );
	ExceptionCreator.InstanceModificator = makeInstanceModificator( ExceptionCreator );

	return new ExceptionCreator.InstanceModificator();
};

export default prepareException;
