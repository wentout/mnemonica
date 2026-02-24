'use strict';

import type { MnemonicaError } from '../../types';

import { constants } from '../../constants';
const {
	odp,
	MNEMONICA,
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
	parse,
	parent,
	extract
} = utils;

import { makeInstanceModificator } from '../types/InstanceModificator';

// Instance creator context type
type InstanceCreatorContext = {
	TypeName: string;
	type: { stack: string };
	args: unknown[];
	ModificatorType: CallableFunction;
	InstanceModificator: new (...args: unknown[]) => { stack: string[] };
	inheritedInstance?: unknown;
	invokePostHooks(): { type: Set<unknown>; collection: Set<unknown> };
	[key: string]: unknown;
};

export const throwModificationError = function ( this: InstanceCreatorContext, error: MnemonicaError ) {

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

		(error.reasons as Error[]).push( error.exceptionReason );
		(error.surplus as Error[]).push( error );

		throw error;

	}

	odp( error, 'exceptionReason', {
		get () {
			return exceptionReason;
		},
		enumerable : true
	} );

	const reasons: Error[] = [ exceptionReason ];

	odp( error, 'reasons', {
		get () {
			return reasons;
		},
		enumerable : true
	} );
	const surplus: Error[] = [];
	odp( error, 'surplus', {
		get () {
			return surplus;
		},
		enumerable : true
	} );

	self.ModificatorType = makeFakeModificatorType( TypeName );

	self.InstanceModificator = makeInstanceModificator( self as unknown as Record<string, unknown> ) as InstanceCreatorContext['InstanceModificator'];

	// let erroredInstance = new self.InstanceModificator();
	const erroredInstance = new self.InstanceModificator();

	let errorProto: object | null = Reflect.getPrototypeOf( erroredInstance );
	let isMnemonicaInstance = false;
	while ( errorProto ) {
		const testToProto = Reflect.getPrototypeOf( errorProto );
		// if (testToProto === null) {
		// 	break;
		// }
		// if (testToProto === Object.prototype) {
		// 	break;
		// }
		if (
			testToProto !== null && testToProto.constructor.name === MNEMONICA &&
			Object.hasOwnProperty.call(testToProto, 'constructor')
		) {
			isMnemonicaInstance = true;
			break;
		}
		errorProto = testToProto;
	}

	// Reflect.setPrototypeOf( errorProto, error);
	const result = Reflect.setPrototypeOf( errorProto as object, error);
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

		getStack.call( erroredInstance, title, [], throwModificationError );

		stack.push( ...erroredInstance.stack );

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
	odp( erroredInstance, 'stack', {
		get () {
			return erroredInstanceStack;
		}
	} );

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
					const _parent = parent(erroredInstance);
					return extract(_parent);
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
	}

	throw erroredInstance;

};
