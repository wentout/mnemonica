// npx tsc --sourceMap ./test/decorate.ts

// fails on loading sourcemap ↓↓↓
// npx tsc --target es6 --moduleResolution NodeNext --module NodeNext --sourceMap --inlineSources ./test/decorate.ts

// works ↓↓↓
// npx tsc --target es6 --moduleResolution NodeNext --module NodeNext --sourceMap ./test/decorate.ts

import { decorate, apply, ConstructorFunction } from '..';
import { BaseClass, Strict } from 'typeomatica';

// debugger;

const deep = { deep: true };
class Base {
	base_field = 555;
}
class Some extends Base {
	field = 333;
}
Object.setPrototypeOf(Base.prototype, new BaseClass(deep));
const some = new Some;
console.log(some);
// @ts-ignore
console.log('some.deep', some.deep);

@Strict(deep)
class SBase {
	base_field = 555;
}
class SomeS extends SBase {
	field = 333;
}
const somes = new SomeS;
console.log(somes);
// @ts-ignore
console.log('somes.deep', somes.deep);

// debugger;

// @ts-ignore
class BaseE extends BaseClass {
	base_field = 555;
}
// @ts-ignore
class SomeE extends BaseE {
	field = 333;
}
const esome = new SomeE;
console.log(esome);

// debugger;
@decorate({ blockErrors: true })
// <-- with the following error -->
// TypeError: Cannot read properties of undefined (reading 'value')
// @ts-ignore
@Strict()
class MyDecoratedClass {
	// class MyDecoratedClass extends BaseClass {
	field: number;
	constructor() {
		// // debugger;
		// super();
		// // debugger;
		this.field = 123;
	}
}

// debugger;
const immediateInstance = new MyDecoratedClass;
console.log(immediateInstance);

@decorate(MyDecoratedClass, { strictChain: false })
class MyDecoratedSubClass {
	sub_field: number;
	constructor() {
		this.sub_field = 321;
	}
}

// debugger;

export const myDecoratedInstance = new MyDecoratedClass;
export const myDecoratedInstance2 = new MyDecoratedClass;
export const myDecoratedSubInstance = apply(myDecoratedInstance, MyDecoratedSubClass);

// debugger;

const MyFn = function () {
	this.sub_sub_field = 123;
} as ConstructorFunction<{ sub_sub_field: number }>;

// TODO: this can not be done on a sub-class
// check if parent class is not decorated
// check if this is invocation for extended class
// throw an error if yes
// Object.setPrototypeOf(MyFn.prototype, new BaseClass);
@decorate(MyDecoratedSubClass)
class MyDecoratedSubSubClass extends MyFn {
	constructor() {
		super();
		this.sub_sub_field = 321;
	}
}

export const myDecoratedSubSubInstance = apply(myDecoratedSubInstance, MyDecoratedSubSubClass);


// debugger;

@decorate()
// @ts-ignore
class MyOtherDecoratedClass extends BaseClass {
	field: number;
	constructor() {
		super();
		this.field = 123;
	}
}

// debugger;

const myOtherDecoratedInstance = new MyOtherDecoratedClass();

// debugger;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

const MyOtherFn = MyOtherDecoratedClass.define('MyOtherFn', function (this: { prop: number }) {
	this.prop = 321;
});

// debugger;

export const myOtherInstance = apply(myOtherDecoratedInstance, MyOtherFn);

// debugger;


class ExtendTestingBase {
	field = 333
}

@decorate()
class ExtendTestingExt extends ExtendTestingBase {
	field = 111
}

export const exTest = new ExtendTestingExt;

// debugger;

@decorate()
class ExtendTestingSupBase {
	field = 333
}

class ExtendTestingSupExt extends ExtendTestingSupBase {
	field = 111
}

export const exSupTest = new ExtendTestingSupExt;

// debugger;

const MidDecorator = @decorate({ strictChain: false })
class MidDecoratorBase {
	field = 333
}

// @ts-ignore
@MidDecorator()
class MidDecoratorExt{
	field = 111
	constructor() {
		console.log('im here: ', this.field);
	}
}

// @ts-ignore
const MidAddDecorator = @MidDecorator()
class MidAddDecoratorAddExt{
	field = 111
	constructor() {
		console.log('im here: ', this.field);
	}
}

// debugger;
// @ts-ignore
const MidAddDecoratorSub = @MidAddDecorator({ test: true })
class MidAddDecoratorAddExtSub{
	field = 111
	constructor() {
		console.log('im here: ', this.field);
	}
}


// debugger;
export const midDecoratorBase = new MidDecorator;

// debugger;
export const midDecoratorExt = apply(midDecoratorBase, MidDecoratorExt);

// debugger;
export const midAddDecoratorBaseExt = apply(midDecoratorBase, MidAddDecorator);

try {
	debugger;
	apply(midDecoratorBase, MidAddDecoratorSub);
} catch (error) {
	// wow
	// this is either TS transpilation based
	// or some prototype pollution 
	// though, if it will be pollution,
	/// then all the tests will become broken
	// and this is not what happens
	console.error(error);
}

debugger;
export const midAddDecoratorSubExt = apply(midAddDecoratorBaseExt, MidAddDecoratorSub);
debugger;
