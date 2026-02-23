'use strict';

const { decorate, apply } = require('../src/index');

// Simple decorated classes for testing
@decorate({ blockErrors: true })
class MyDecoratedClass {
	field: number;
	constructor() {
		this.field = 123;
	}
}

@decorate(MyDecoratedClass, { strictChain: false })
class MyDecoratedSubClass {
	sub_field: number;
	constructor() {
		this.sub_field = 321;
	}
}

const myDecoratedInstance = new MyDecoratedClass();
const myDecoratedInstance2 = new MyDecoratedClass();
const myDecoratedSubInstance = apply(myDecoratedInstance, MyDecoratedSubClass);

// MyDecoratedSubSubClass extending from a function constructor
interface MyFnType {
	sub_sub_field: number;
}

const MyFn = function (this: MyFnType): void {
	this.sub_sub_field = 123;
};

@decorate(MyDecoratedSubClass)
class MyDecoratedSubSubClass extends (MyFn as unknown as new () => { sub_sub_field: number }) {
	sub_sub_field: number;
	constructor() {
		super();
		this.sub_sub_field = 321;
	}
}

const myDecoratedSubSubInstance = apply(myDecoratedSubInstance, MyDecoratedSubSubClass);

// Other decorated class
@decorate()
class MyOtherDecoratedClass {
	field: number;
	prop!: number;
	constructor() {
		this.field = 123;
	}
}

const myOtherDecoratedInstance = new MyOtherDecoratedClass();

// Define a nested type
interface TypeWithDefine {
	define: (name: string, fn: (this: { prop: number }) => void) => new () => { prop: number };
}

const MyOtherFn = (MyOtherDecoratedClass as unknown as TypeWithDefine).define('MyOtherFn', function (this: { prop: number }) {
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
