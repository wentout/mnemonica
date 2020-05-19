'use strict';

import { define, IDEF } from '..';

type TypeDef<T> = new ( ...args: any[] ) => T

type SomeTypeInstance = {
	one?: string;
	q?: any;
	x?: any;
	y?: any;
	z?: any;
	SomeSubType: IDEF<SubTypeInstance>;
}

interface SubTypeInstance extends SomeTypeInstance {
	// one: undefined;
	two?: string;
	FinalType: IDEF<SubTypeInstance>;
}

interface FinalInstance extends SubTypeInstance {
	// one: undefined;
	three?: string;
}

const SomeType = define( 'SomeType', function () {
	this.one = 'SomeType';
	this.q = 123;

} as IDEF<SomeTypeInstance> );

const SomeSubType = SomeType.define( 'SomeSubType', function () {
	this.one = undefined;
	this.two = 'SomeSubType';
	this.q = 123;

} as IDEF<SubTypeInstance> );

SomeSubType.define( 'FinalType', function () {
	this.one = 'final one';
	this.three = 'FinalType';
	this.q = 123;
} as IDEF<FinalInstance> );

const first = new SomeType();
const x = first.one;
first.one = 'one';
first.x = 543;

const second = new first.SomeSubType();
const y = second.one;
second.two = 'two';
second.y = 'no way';

const final = new second.FinalType();
final.one = 'must one';
final.two = 'must two';
final.z = 'no way';

// const z = final.one;
// // tslint:disable-next-line: no-console
// console.log( first, second, final, { x, y, z } );

