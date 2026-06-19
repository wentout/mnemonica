import { define, apply, utils } from '..';

const FirstType = define( 'SomeType', function (this: {
	first: 'FirstType',
}) {
	this.first = 'FirstType';
});

const SecondType = FirstType.define( 'SecondType', function ( this: {
	first: undefined,
	second: string,
}) {
	this.first = undefined;
	this.second = 'SecondType';
});

const first = new FirstType();

type TSecondInstance = InstanceType<typeof SecondType>;

const second = new (first as any).SecondType() as TSecondInstance;

const second2 = apply(first, SecondType);

// Starting from v1.0.6 instance methods are no longer auto-injected.
// Use the standalone utils.* API instead.
utils.extract(first);
utils.pick(first, 'first');
(first as any).SecondType;

// @ts-expect-error - extract is not available as an instance method by default
first.extract();
// @ts-expect-error - pick is not available as an instance method by default
first.pick('first');

// Both should have the user-defined property 'first'
const f1: 'FirstType' = first.first;

// { first: undefined, second: "SecondType" }
console.log(first, second, second2, f1);
