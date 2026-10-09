'use strict';

import type {
	StackBoundary,
	MnemonicaErrorConstructor
} from '../../types';

import { constants } from '../../constants';

const {
	odp,
	SymbolConstructorName,
	MNEMONICA,
	ErrorMessages,
} = constants;

const { BASE_ERROR_MESSAGE } = ErrorMessages;

export const stackCleaners: RegExp[] = [];

export interface StackableInstance {
	stack?: string | string[];
}

export const cleanupStack = ( stack: string[] ) => {
	const cleaned: string[] = stack.reduce(
		( arr: string[], line: string ) => {
			// a line survives only when NO registered cleaner matches it;
			// the previous logic pushed the line once per non-matching
			// cleaner, duplicating lines and leaking matched ones
			// as soon as two cleaners were registered
			const keep = stackCleaners.every( cleanerRegExp => {
				const noMatch = !cleanerRegExp.test( line );
				return noMatch;
			} );
			if ( keep ) {
				arr.push( line );
			}
			return arr;
		},
		[] 
	);
	const result = cleaned.length ? cleaned : stack;
	return result;
};

export const getStack = function (
	this: StackableInstance,
	title: string,
	stackAddition: string[],
	tillFunction?: StackBoundary
	// always returns the assembled frame array (captured lines, cleaned,
	// with the title and additions pushed), whichever capture branch ran —
	// the stack property assignments above narrow this.stack to string[]
	// on every path reaching the return
): string[] {

	if ( Error.captureStackTrace ) {
		Error.captureStackTrace(
			this,
			tillFunction || getStack
		);
	} else {
		this.stack = ( new Error() ).stack;
	}

	this.stack = (this.stack as string).split( '\n' ).slice( 1 );
	this.stack = cleanupStack( this.stack );

	this.stack.unshift( title );
	if ( Array.isArray( stackAddition ) && stackAddition.length ) {
		this.stack.push( ...stackAddition );
	}
	this.stack.push( '\n' );

	return this.stack;

};

export class BASE_MNEMONICA_ERROR extends Error {

	constructor ( message = BASE_ERROR_MESSAGE, additionalStack?: string[] ) {

		super( message );
		const BaseStack: string = this.stack as string;
		odp(
			this,
			'BaseStack',
			{
				get () {
					return BaseStack;
				}
			} 
		);

		const stack = cleanupStack( BaseStack.split( '\n' ) );

		if ( additionalStack ) {
			stack.unshift( ...additionalStack );
		}

		this.stack = stack.join( '\n' );

	}

	static get [ SymbolConstructorName ] () {
		const result = new String( `base of : ${MNEMONICA} : errors` );
		return result;
	}

}

Object.defineProperty(
	BASE_MNEMONICA_ERROR.prototype.constructor,
	'name',
	{
		get () {
			const result = new String( 'BASE_MNEMONICA_ERROR' );
			return result;
		}
	} 
);


export const constructError = ( name: string, message: string ): MnemonicaErrorConstructor => {
	const NamedErrorConstructor = class extends BASE_MNEMONICA_ERROR {
		constructor ( addition?: string, stack?: string[] ) {
			const saying = addition ? `${message} : ${addition}` : `${message}`;
			super(
				saying,
				stack 
			);
		}
	};

	// the class's prototype.constructor IS the class, so the name getter is
	// defined on the class itself (same effect as BASE_MNEMONICA_ERROR's above)
	Object.defineProperty(
		NamedErrorConstructor,
		'name',
		{
			get () {
				const result = new String( name );
				return result;
			}
		}
	);
	return NamedErrorConstructor;
};
