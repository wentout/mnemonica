'use strict';

import { define, apply, bind, call } from '..';

const SomeType = define( 'SomeType', function (this: {
	one: string,
	check: 321,
	q: number
}) {
	this.one = 'SomeType';
	this.check = 321;
	this.q = 123;
}, {
	l : 12345
});

const SomeSubType = SomeType.define( 'SomeSubType', function ( this: {
	one: undefined,
	two: string,
	q: number,
	fn: () => object
}) {
	this.one = undefined;
	this.two = 'SomeSubType';
	this.q = 123;
}, {
	k : 123
});

const first = new SomeType();


const x = first.one;
first.one = 123;	// hinting is correct !
first.q = 'one';	// hinting is correct !
first.l = '111';	// hinting is correct !
first.x = 543;		// hinting is NOT VERY correct !

const FinalType = SomeSubType.define( 'FinalType', class {
	one: string;
	q: number;
	three: string;
	constructor () {
		this.one = 'final one';
		this.three = 'FinalType';
		this.q = 123;
	}
});

type SomeSubTypeInstance = InstanceType<typeof SomeSubType>;
const second = new first.SomeSubType() as SomeSubTypeInstance;
const y = second.one;
second.check = 123;		// hinting is correct !
second.two = 'two';
second.y = 'no way';	// hinting is correct !
second.k = 'no way';	// hinting is correct !

type FinalTypeInstance = InstanceType<typeof FinalType>;
const final = new second.FinalType() as FinalTypeInstance;
// const final = new FinalType();
final.one = 'must one';
final.two = 'must two';
final.three = 'must two';
final.check = 'there is mumber';	// hinting is correct !
final.z = 'no way';					// hinting is correct !

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


const aSub = apply(first, SomeSubType);
console.log(aSub);
const bSub = bind(first, SomeSubType)();
console.log(bSub);
const cSub = call(first, SomeSubType);
console.log(cSub);


