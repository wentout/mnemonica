'use strict';

import { define } from '..';

const SomeType = define( 'SomeType', function (this: {one:string, q: number}) {
	this.one = 'SomeType';
	this.q = 123;
} );

const SomeSubType = SomeType.define( 'SomeSubType', function ( this: {
	one: undefined,
	two: string,
	q: number
} ) {
	this.one = undefined;
	this.two = 'SomeSubType';
	this.q = 123;
} );

const first = new SomeType();
const x = first.one;
first.one = 123;	// hinting is correct !
first.q = 'one';	// hinting is correct !
first.x = 543;		// hinting is correct !

SomeSubType.define( 'FinalType', function (this: {one:string, q: number, three: string}) {
	this.one = 'final one';
	this.three = 'FinalType';
	this.q = 123;
} );

const second = new first.SomeSubType();
const y = second.one;
second.two = 'two';
second.y = 'no way';

const final = new second.FinalType();
final.one = 'must one';
final.two = 'must two';
final.z = 'no way';

const z = final.one;

// tslint:disable-next-line: no-console
console.log('\nNo Typings: \n');

// tslint:disable-next-line: no-console
console.log( 'first: ', first );
// tslint:disable-next-line: no-console
console.log( 'second: ', second );
// tslint:disable-next-line: no-console
console.log( 'final: ', final );
// tslint:disable-next-line: no-console
console.log( '{ x, y, z }: ', { x, y, z } );

