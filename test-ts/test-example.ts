import { define } from '..';

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

type TSecondInstance = 
		InstanceType<typeof SecondType>;

const second = new first.SecondType() as TSecondInstance;

// { first: undefined, second: "SecondType" }
console.log(second);


