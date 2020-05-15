'use strict';

import { define, ConstructorFunction } from '..';

type SomeTypeInstance = {
	one?: string;
	SomeSubType: ConstructorFunction<SubTypeInstance>
}
type SubTypeInstance = {
	one: undefined;
	two?: string;
	FinalType: ConstructorFunction<FinalInstance>
}
type FinalInstance = {
	one: undefined;
	three?: string;
}

const SomeType = define( 'SomeType', function () {
	this.one = 'SomeType';
	// this.q = 123;
} as ConstructorFunction<SomeTypeInstance> );

const SomeSubType = SomeType.define( 'SomeSubType', function () {
	// this.one = undefined;
	this.two = 'SomeSubType';
	// this.q = 123;
} as ConstructorFunction<SubTypeInstance> );

SomeSubType.define( 'FinalType', function () {
	this.three = 'FinalType';
	// this.q = 123;
} as ConstructorFunction<FinalInstance> );

const first = new SomeType();
const x = first.one;
first.one = 'one';
// first.x = 543;

const second = new first.SomeSubType();
const y = second.one;
second.two = 'two';
// second.y = 'no way';

const final = new second.FinalType();
// final.one = 'must one';
// final.two = 'must two';
final.three = 'three';
// final.z = 'no way';
const z = final.one;

// tslint:disable-next-line: no-console
console.log( first, second, final, { x, y, z } );




// TODO: interface description
// export const SomeType2 = define( function () {
// 	// tslint:disable-next-line: only-arrow-functions no-empty
// 	return function () {
// 		this.z = 321;
// 	}
// } as ConstructorFactory<SomeTypeInstance> );
// export const test2 = new SomeType2();
// test2.z = '543';
// test2.s = 543;
