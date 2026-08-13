'use strict';

import { constants } from '../../constants';
const { odp } = constants;

import { ErrorsTypes } from '../../descriptors/errors';
const {
	WRONG_ARGUMENTS_USED,
	WRONG_INSTANCE_INVOCATION
} = ErrorsTypes;

import {
	cleanupStack, getStack 
} from '../errors';

import TypesUtils from '../utils';

const { makeErrorModificatorType } = TypesUtils;

import { makeInstanceModificator } from '../types/InstanceModificator';

import {
	_getProps, getProps, setProps, Props 
} from '../types/Props';

import type { ErrorProps } from '../../types';

const checkThrowArgs = ( instance: unknown, target: unknown, error: Error, args: unknown[] ) => {

	let wrongThrow;

	/* unreacheble, cus instance bound inside of Mnemosyne
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

	// usage-error data also goes to the external props storage,
	// nothing is defined on the thrown error object itself
	setProps(
		wrongThrow,
		{
			instance,
			error,
			args
		} 
	);

	throw wrongThrow;

};

const exceptionConsctructHandler = function ( this: Error, opts: { [ index: string ]: unknown } ) {

	const {
		instance,
		TypeName,
		typeStack,
		args,
		error
	} = opts as {
		instance: object;
		TypeName: string;
		typeStack: string[];
		args: unknown[];
		error: Error;
	};


	 
	const exception = this;

	// if the wrapped error already carries error data (packaged by a previous
	// processing round), the exception inherits it — the same way the
	// prototype chain used to expose it before props moved off the objects
	const wrappedErrorProps = getProps( error ) as unknown as ErrorProps | undefined;
	const inheritedProps: ErrorProps = {};
	if ( wrappedErrorProps !== undefined ) {
		if ( wrappedErrorProps.exceptionReason !== undefined ) {
			inheritedProps.exceptionReason = wrappedErrorProps.exceptionReason;
		}
		if ( wrappedErrorProps.reasons !== undefined ) {
			inheritedProps.reasons = wrappedErrorProps.reasons;
		}
		if ( wrappedErrorProps.surplus !== undefined ) {
			inheritedProps.surplus = wrappedErrorProps.surplus;
		}
	}

	// exception data lives in the external props storage (WeakMap):
	// read it via getProps(exception) — .args / .originalError / .instance
	setProps(
		exception,
		Object.assign(
			{
				args,
				originalError : error,
				instance
			},
			inheritedProps
		) 
	);

	// no bound .extract()/.parse() here: since v1.0.6 instances expose no
	// methods, so errors follow — call utils.extract(...) / utils.parse(...)
	// on getProps(exception).instance instead

	// real error stack
	const errorStack = exception.stack!.split( '\n' );

	const stack: string[] = [];

	const title = `\n<-- lifecycle of [ ${TypeName} ] traced -->`;

	getStack.call(
		exception,
		title,
		[],
		prepareException 
	);

	 
	stack.push( ...(exception.stack as unknown as string[]) );

	stack.push( '<-- with the following error -->' );

	errorStack.forEach( ( line: string ) => {
		if ( !stack.includes( line ) ) {
			stack.push( line );
		}
	} );

	stack.push( '\n<-- of constructor definitions stack -->' );
	stack.push( ...typeStack );

	const exceptionStack = cleanupStack( stack ).join( '\n' );

	odp(
		exception,
		'stack',
		{
			get () {
				return exceptionStack;
			}
		}
	);

	return exception;


};

const prepareException = function ( this: object, target: unknown, error: Error, ...args: unknown[] ) {

	 
	const instance = this;

	checkThrowArgs(
		instance,
		target,
		error,
		args 
	);

	const props = _getProps(instance) as Props;

	const {
		__type__,
		__creator__
	} = props;


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
	ExceptionCreator.config = Object.assign(
		{},
		__creator__.config 
	);
	ExceptionCreator.config.blockErrors = false;

	ExceptionCreator.existentInstance = error;
	 
	ExceptionCreator.ModificatorType = makeErrorModificatorType(
		TypeName,
		function (this: Error) {
			const handlerResult = exceptionConsctructHandler.call(
				this,
				{
					instance,
					TypeName,
					typeStack,
					args,
					error
				} 
			);
			return handlerResult;
		} 
	);

	ExceptionCreator.InstanceModificator = makeInstanceModificator( ExceptionCreator );

	const result = new ExceptionCreator.InstanceModificator();
	return result;
};

export default prepareException;
