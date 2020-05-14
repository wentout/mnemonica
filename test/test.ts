'use strict';

import { define, ConstructorFunction } from '..';

type SomeTypeInstance<T extends object> = {
	z?: number;
	SomeSubType: ConstructorFunction<T>
}
type SubtypeInstance<T extends object> = {
	a?: string;
	FinalType: ConstructorFunction<T>
}
type FinalInstance = {
	b?: string;
}

const SomeType = define( 'SomeType', function () {
	this.z = 123;
	this.q = 543;
	// return this;
} as ConstructorFunction<SomeTypeInstance<SubtypeInstance<FinalInstance>>> );

const SomeSubType = SomeType.define( 'SomeSubType', function () {
	this.a = '123';
	this.q = 543;
	// return this;
} as ConstructorFunction<SubtypeInstance<FinalInstance>> );

const test = new SomeType();
test.z = '543';
test.s = 543;

const deep = new test.SomeSubType();
deep.a = 'asdf';
deep.m = 'asdf';

SomeSubType.define( 'FinalType', function () {
	this.b = 'nested';
} as ConstructorFunction<FinalInstance> );

const nested = new deep.FinalType();
nested.b = 'test';
nested.z = 'no way';


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
