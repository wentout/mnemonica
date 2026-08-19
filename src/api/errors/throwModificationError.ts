'use strict';

import type {
	MnemonicaError, ErrorProps, InstanceCreatorContext 
} from '../../types';

import { constants } from '../../constants';
const {
	odp,
	MNEMONICA,
} = constants;


import { ErrorsTypes } from '../../descriptors/errors';
const { BASE_MNEMONICA_ERROR } = ErrorsTypes;

import {
	cleanupStack, getStack 
} from './';

import TypesUtils from '../utils';
const { makeErrorModificatorType } = TypesUtils;

import {
	getProps, setProps 
} from '../types/Props';

import { makeInstanceModificator } from '../types/InstanceModificator';

export const throwModificationError = function ( this: InstanceCreatorContext, error: MnemonicaError ) {

	// InstanceCreator
	 
	const self = this;

	const {
		TypeName,
		type: { stack: typeStack },
		args
	} = self as InstanceCreatorContext & {
		type: { stack: string[] }
	};

	// if ( error[ SymbolConstructorName ] ) {
	// 	debugger;
	// }

	// error data (exceptionReason, reasons, surplus, args, originalError,
	// instance) is never defined on error objects — it lives in the external
	// props storage (WeakMap), read it via getProps(error).
	// NOTE: the public getProps is required here (not _getProps) because the
	// error data sits in the additions slot of the record — _getProps returns
	// the raw record only and would miss it.
	const errorProps = getProps( error ) as unknown as ErrorProps | undefined;

	const exceptionReason = (
		errorProps !== undefined &&
		errorProps.exceptionReason !== undefined
	) ?
		errorProps.exceptionReason :
		error;

	if ( errorProps !== undefined && errorProps.exceptionReason !== undefined ) {

		(errorProps.reasons as unknown[]).push( errorProps.exceptionReason );
		(errorProps.surplus as unknown[]).push( error );

		throw error;

	}

	// reasons/surplus may hold non-Error reason objects (bound method
	// failures push { methodName, ... } shaped reasons), hence unknown[]
	const reasons: unknown[] = [ exceptionReason ];
	const surplus: unknown[] = [];

	self.ModificatorType = makeErrorModificatorType( TypeName );

	self.InstanceModificator = makeInstanceModificator( self );

	// let erroredInstance = new self.InstanceModificator();
	const erroredInstance = new self.InstanceModificator();

	// the first portion of error data: stored against the failed
	// construction layer props, so getProps(erroredInstance) exposes it
	setProps(
		erroredInstance,
		{
			exceptionReason,
			reasons,
			surplus
		} 
	);

	let errorProto: object | null = Reflect.getPrototypeOf( erroredInstance );
	let isMnemonicaInstance = false;
	while ( errorProto ) {
		const testToProto = Reflect.getPrototypeOf( errorProto );
		if (testToProto === null) {
			break;
		}
		// if (testToProto === Object.prototype) {
		// 	break;
		// }
		if (
			testToProto !== null &&
			Object.hasOwnProperty.call(
				testToProto,
				'constructor'
			) &&
			testToProto.constructor.name === MNEMONICA
		) {
			isMnemonicaInstance = true;
			break;
		}
		errorProto = testToProto;
	}

	// Reflect.setPrototypeOf( errorProto, error);
	const result = Reflect.setPrototypeOf(
 errorProto as object,
 error
	);
	// let result = Reflect.setPrototypeOf( errorProto, error);
	// if (result === false) {
	// 	Object.setPrototypeOf(errorProto, error);
	// 	// unreachable
	// 	result = true;
	// }
	// console.log(result);

	const stack: string[] = [];

	if ( error instanceof BASE_MNEMONICA_ERROR ) {

		stack.push( error.stack as string );

	} else {

		const title = `\n<-- creation of [ ${TypeName} ] traced -->`;

		if ( self.inheritedInstance instanceof Promise ) {

			// async construction failure: this runs from makeAwaiter's .catch,
			// long after the `new` call site has unwound — a fresh capture here
			// would hold only rejection-processing frames. runAsyncHandling
			// captured the creation stack at new-time instead; use it.
			stack.push( ...(self.stack as string[]) );

		} else {

			getStack.call(
				erroredInstance,
				title,
				[],
				throwModificationError 
			);

			stack.push( ...(erroredInstance as { stack: string[] }).stack );

		}

		const errorStack = (error.stack as string ).split( '\n' );

		stack.push( '<-- with the following error -->' );

		errorStack.forEach( ( line: string ) => {
			if ( !stack.includes( line ) ) {
				stack.push( line );
			}
		} );

		stack.push( '\n<-- of constructor definitions stack -->' );
		stack.push( ...typeStack );

	}

	const erroredInstanceStack = cleanupStack( stack ).join( '\n' );

	// starting from Node.js v22 we should define this property through odp
	// that was unnecessary for v20, though seems new v8 optimized compiler
	// is gathering value from deep chain and while comparing it with 
	// assignment operator, then it will not create this property 
	// so we need direct property declaration here ...
	odp(
		erroredInstance,
		'stack',
		{
			get () {
				return erroredInstanceStack;
			}
		} 
	);

	self.inheritedInstance = erroredInstance;

	if (result) {
		if (isMnemonicaInstance) {

			// if hooks had some interception: start
			const results = self.invokePostHooks();
			const {
				type,
				collection,
			} = results;
			if ( type.has( true ) || collection.has( true ) ) {
				return;
			}
		}

		// }

		// if hooks had some interception: stop

		// the rest of error data, available only when the error is thrown
		setProps(
			erroredInstance,
			{
				args,
				originalError : error,
				instance      : erroredInstance
			} 
		);

		// no bound .extract()/.parse() here: since v1.0.6 instances expose no
		// methods, so errors follow — call utils.extract(...) / utils.parse(...)
		// on the thrown error (or on utils.parent(error) for the pre-failure
		// layer, which the old bound .extract() used to return)
	}

	throw erroredInstance;

};
