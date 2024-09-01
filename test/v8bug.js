'use strict';


// though Error.prototype.stack is non standard
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack

const myErrorObject = new Error('my error');
myErrorObject.prop = 123;
const hop = (o, p) => Object.prototype.hasOwnProperty.call(o, p);

// nodejs v20 & v22 it works properly
console.log(hop(myErrorObject, 'stack'));
// and for Firefox this property above just does not exists at all
// hop(Object.getPrototypeOf(myErrorObject), 'stack');


const myIntermediateObject = {};

Object.setPrototypeOf(myIntermediateObject, myErrorObject);

console.log(myIntermediateObject instanceof Error);

myIntermediateObject.stack = myErrorObject.stack;
// it doesn't matter which value you assign there,
// for example uncomment the next line
// myIntermediateObject.stack = 'myErrorObject.stack';
myIntermediateObject.prop = 123;

// this works properly for node.js v20, but not for v22
console.log(':', hop(myIntermediateObject, 'stack'));
console.log(':', hop(myIntermediateObject, 'prop'));

const myCorrectedObject = {};
Object.setPrototypeOf(myCorrectedObject, myErrorObject);
console.log(myCorrectedObject instanceof Error);

Object.defineProperty(myCorrectedObject, 'stack', {
	get () {
		return myErrorObject.stack;
	}
});

// nodejs v20 & v22 it works properly
console.log(hop(myCorrectedObject, 'stack'));



// so for objects with Error in prototoype chain
// it optimizes .stack property

// general behaviour works correctly for both
const base = {
	stack : 'str',
	prop  : 123
};

const sup = {};

Object.setPrototypeOf(sup, base);

sup.stack = 'str';
sup.prop = 123;
console.log(hop(sup, 'stack'));
console.log(hop(sup, 'prop'));
