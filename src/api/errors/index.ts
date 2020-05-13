'use strict';

import { constants } from '../../constants';

const {
	SymbolConstructorName,
	MNEMONICA,
	ErrorMessages: {
		BASE_ERROR_MESSAGE,
	},
} = constants;

const stackCleaners: Array<RegExp> = [];

export const defineStackCleaner = ( regexp: RegExp ) => {
	if ( regexp instanceof RegExp ) {
		stackCleaners.push( regexp );
	} else {
		const {
			ErrorsTypes: {
				WRONG_STACK_CLEANER
			}
		} = require( '../../descriptors/errors' );
		throw new WRONG_STACK_CLEANER;
	}
};

export const cleanupStack = ( stack: Array<string> ) => {
	const cleaned: Array<string> = stack.reduce( ( arr: Array<string>, line ) => {
		stackCleaners.forEach( cleanerRegExp => {
			( !cleanerRegExp.test( line ) ) && arr.push( line );
		} );
		return arr;
	}, [] );
	return cleaned.length ? cleaned : stack;
};

export const getStack = function (this:any, title:string, stackAddition:string[], tillFunction?:Function) {
	
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, tillFunction || getStack);
	} else {
		this.stack = (new Error()).stack;
	}
	
	this.stack = this.stack.split('\n').slice(1);
	this.stack = cleanupStack(this.stack);
	
	this.stack.unshift(title);
	stackAddition && this.stack.push(...stackAddition);
	this.stack.push('\n');

	return this.stack;

};

export class BASE_MNEMONICA_ERROR extends Error {

	constructor ( message = BASE_ERROR_MESSAGE, additionalStack: Array<string> ) {

		super( message );
		const BaseStack: any = this.stack;
		Object.defineProperty( this, 'BaseStack', {
			get () {
				return BaseStack;
			}
		} );

		const stack = cleanupStack( BaseStack.split( '\n' ) );

		if ( additionalStack ) {
			stack.unshift( ...additionalStack );
		}

		this.stack = stack.join( '\n' );

	}

	static get [ SymbolConstructorName ] () {
		return `base of : ${MNEMONICA} : errors`;
	}

}

export const constructError = ( name: string, message: string ) => {
	const body = `
		class ${name} extends base {
			constructor (addition, stack) {
				super(addition ?
					\`${message} : $\{addition}\` :
						'${message}',
					stack
				);
			}
		};
		return ${name};
	`;

	const ErrorConstructor = (
		new Function( 'base', body )
	)( BASE_MNEMONICA_ERROR );

	return ErrorConstructor;
};
