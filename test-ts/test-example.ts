import { define, apply } from '..';

const FirstType = define( 'SomeType', function (this: {
	first: 'FirstType',
}) {
	this.first = 'FirstType';
});

const FirstTypeO = define( 'SomeType', function (this: {
	first: 'FirstType',
}) {
	this.first = 'FirstType';
}, {
	exposeInstanceMethods: false
});

const SecondType = FirstType.define( 'SecondType', function ( this: {
	first: undefined,
	second: string,
}) {
	this.first = undefined;
	this.second = 'SecondType';
});

const first = new FirstType();
const firstO = new FirstTypeO();

type TSecondInstance = InstanceType<typeof SecondType>;

const second = new first.SecondType() as unknown as TSecondInstance;

const second2 = apply(first, SecondType);

// Type tests for exposeInstanceMethods
// first should have MnemonicaInstance methods (extract, pick, etc.) and subtypes
first.extract();
first.pick('first');
first.SecondType;

// firstO should NOT have MnemonicaInstance methods exposed in types
// @ts-expect-error - extract should not be available when exposeInstanceMethods is false
firstO.extract();
// @ts-expect-error - pick should not be available when exposeInstanceMethods is false
firstO.pick('first');
// @ts-expect-error - subtypes should not be available when exposeInstanceMethods is false
firstO.SecondType;

// Both should have the user-defined property 'first'
const f1: 'FirstType' = first.first;
const f2: 'FirstType' = firstO.first;

// { first: undefined, second: "SecondType" }
console.log(first, firstO, second, second2, f1, f2);
