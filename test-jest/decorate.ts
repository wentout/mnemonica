'use strict';

const { decorate, apply } = require('../src/index');

// Simple decorated classes for testing
@decorate({ blockErrors: true })
class MyDecoratedClass {
	field: any;
	constructor() {
		this.field = 123;
	}
}

@decorate(MyDecoratedClass, { strictChain: false })
class MyDecoratedSubClass {
	sub_field: any;
	constructor() {
		this.sub_field = 321;
	}
}

const myDecoratedInstance = new MyDecoratedClass();
const myDecoratedInstance2 = new MyDecoratedClass();
const myDecoratedSubInstance = apply(myDecoratedInstance, MyDecoratedSubClass);

// MyDecoratedSubSubClass extending from a function constructor
const MyFn = function (this: any) {
	this.sub_sub_field = 123;
} as any;

@decorate(MyDecoratedSubClass)
class MyDecoratedSubSubClass extends MyFn {
	sub_sub_field: any;
	constructor() {
		super();
		this.sub_sub_field = 321;
	}
}

const myDecoratedSubSubInstance = apply(myDecoratedSubInstance, MyDecoratedSubSubClass);

// Other decorated class
@decorate()
class MyOtherDecoratedClass {
	field: any;
	prop: any;
	constructor() {
		this.field = 123;
	}
}

const myOtherDecoratedInstance = new MyOtherDecoratedClass();

// Define a nested type
const MyOtherFn = MyOtherDecoratedClass.define('MyOtherFn', function (this: any) {
	this.prop = 321;
});

const myOtherInstance = apply(myOtherDecoratedInstance, MyOtherFn);

export {
	myDecoratedInstance,
	myDecoratedInstance2,
	myDecoratedSubInstance,
	myDecoratedSubSubInstance,
	myOtherInstance
};
