'use strict';

/*
we are checking VS Code IntelliSense here
so it requires constant restart of
Intelli Scense Cache via Ctrl+Shift+P
and choosing one of commands below:
+ TypeScript: Restart TS server
+ Developer: Reload Window
---
and, unfortunately sometimes
it requires to complete VS Code restart
as this may happen, shit happens
*/

import { define, apply, bind, call, lookupTyped, TypeConstructor } from '..';

import type { ProtoFlat } from '..';

declare module '..' {
	
	type SomeTypeInstance = InstanceType<typeof SomeType> & {
		SomeSubType: TypeConstructor<SomeSubTypeInstance>;
	}

	type SomeSubTypeInstance = ProtoFlat<SomeTypeInstance, InstanceType<typeof SomeSubType>> & {
		FinalType: TypeConstructor<FinalTypeInstance>;
	}

	type FinalTypeInstance = ProtoFlat<SomeSubTypeInstance, InstanceType<typeof FinalType>> & {}

	interface TypeRegistry {
		SomeType: new (gather: string, check: number) => SomeTypeInstance;
	}
}

const SomeType = define('SomeType', function (this: {
	one: string,
	check: number,
	q: number,
	first: number
}, gather: string, check: number) {
	this.one = gather;
	this.check = check;
	this.q = 123;
}, { exposeInstanceMethods: false });
SomeType.registerHook('preCreation', () => { console.log('SomeType'); });

const SomeSubType = SomeType.define('SomeSubType', function (this: {
	one: undefined,
	two: string,
	q: number,
	first: undefined,
	second: number,
	fn: () => object
}) {
	this.one = undefined;
	this.two = 'SomeSubType';
	this.q = 123;
});

const ST = lookupTyped('SomeType');

const first = new ST('SomeArg', 555);

SomeSubType.registerHook('preCreation', () => { console.log('SomeSubType'); });

const x = first.one;
first.one = 123;	// hinting is correct !
first.q = 'one';	// hinting is correct !
first.l = '111';	// hinting is correct !
first.x = 543;		// hinting is NOT VERY correct !

const FinalType = SomeSubType.define('FinalType', class {
	one: string;
	q: number;
	three: string;
	second: undefined;
	third: number = 333;
	constructor() {
		this.one = 'final one';
		this.three = 'FinalType';
		this.q = 123;
	}
});

const second = new first.SomeSubType();

const y = second.one;
second.two = 'two';
second.check = '123';	// hinting is correct !
second.first = 321;		// hinting is correct ! because it is undefined here
second.y = 'no way';	// hinting is correct !
second.k = 'no way';	// hinting is correct !

// type FinalTypeInstance = InstanceType<typeof FinalType>;
// const final = new second.FinalType() as FinalTypeInstance;
const final = new second.FinalType();



// const final = new FinalType();
final.one = 'must one';
final.two = 'must two';
final.three = 'must two';
final.third = 321;
final.first = 321;					// hinting is correct ! because it is undefined here
final.second = 321;					// hinting is correct ! because it is undefined here
final.check = 'there is mumber';	// hinting is correct !
final.z = 'no way';					// hinting is correct !

final.fn = () => { return {} }

const z = final.one;

// tslint:disable-next-line: no-console
console.log('\nNo Typings: \n');

// tslint:disable-next-line: no-console
console.log('first: ', first);
// tslint:disable-next-line: no-console
console.log('second: ', second);
// tslint:disable-next-line: no-console
console.log('final: ', final);
// tslint:disable-next-line: no-console
console.log('{ x, y, z }: ', { x, y, z });


const aSub = apply(first, SomeSubType);
console.log(aSub);
const bSub = bind(first, SomeSubType)();
console.log(bSub);
const cSub = call(first, SomeSubType);
console.log(cSub);


