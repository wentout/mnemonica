// npx tsc --sourceMap ./test/decorate.ts

// fails on loading sourcemap ↓↓↓
// npx tsc --target es6 --moduleResolution NodeNext --module NodeNext --sourceMap --inlineSources ./test/decorate.ts

// works ↓↓↓
// npx tsc --target es6 --moduleResolution NodeNext --module NodeNext --sourceMap ./test/decorate.ts

import { decorate, apply, TypeConstructor } from '..';
import { BaseClass, Strict } from 'typeomatica';

// debugger;

const deep = { deep : true };
class Base {
	base_field = 555;
}
class Some extends Base {
	field = 333;
}
Object.setPrototypeOf(Base.prototype, new BaseClass(deep));
const some = new Some;
console.log(some);
// @ts-expect-error - 'deep' property is added by typeomatica's BaseClass but not in TypeScript types
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
// @ts-expect-error - 'deep' property is added by typeomatica's BaseClass but not in TypeScript types
console.log('somes.deep', somes.deep);

// debugger;

class BaseE extends BaseClass {
	base_field = 555;
}
class SomeE extends BaseE {
	field = 333;
}
const esome = new SomeE;
console.log(esome);

// debugger;
@decorate({ blockErrors : true })
// <-- with the following error -->
// TypeError: Cannot read properties of undefined (reading 'value')
@Strict()
class MyDecoratedClass {
	// class MyDecoratedClass extends BaseClass {
	field: number;
	constructor () {
		// // debugger;
		// super();
		// // debugger;
		this.field = 123;
	}
}

// debugger;
const immediateInstance = new MyDecoratedClass;
console.log(immediateInstance);

@decorate(MyDecoratedClass, { strictChain : false })
class MyDecoratedSubClass {
	sub_field: number;
	constructor () {
		this.sub_field = 321;
	}
}

// debugger;

export const myDecoratedInstance = new MyDecoratedClass;
export const myDecoratedInstanceSecondary = new MyDecoratedClass;

export const myDecoratedSubInstance = apply(myDecoratedInstance, MyDecoratedSubClass);

// debugger;

const MyFn = function () {
	this.sub_sub_field = 123;
} as TypeConstructor<{ sub_sub_field: number }>;



// TODO: this can not be done on a sub-class
// check if parent class is not decorated
// check if this is invocation for extended class
// throw an error if yes
// Object.setPrototypeOf(MyFn.prototype, new BaseClass);
@decorate(MyDecoratedSubClass)
// @ts-expect-error TODO: investigate
class MyDecoratedSubSubClass extends MyFn {
	sub_sub_field_cls: number;
	constructor () {
		super();
		this.sub_sub_field = 321;
		this.sub_sub_field_cls = 321;
	}
}

/*
	const myDecoratedSubSubInstance: {
		sub_sub_field_cls: number;
		sub_sub_field: number;
		field: number;
		sub_field: number;
	}
*/
export const myDecoratedSubSubInstance = apply(myDecoratedSubInstance, MyDecoratedSubSubClass);

// debugger;

@decorate()
class MyOtherDecoratedClass extends BaseClass {
	field: number;
	constructor () {
		super();
		this.field = 123;
	}
}

// debugger;

const myOtherDecoratedInstance = new MyOtherDecoratedClass();

// debugger;


// @ts-expect-error - define() returns TypeClass but TypeScript infers different type
const MyOtherFn = MyOtherDecoratedClass.define('MyOtherFn', function (this: { prop: number }) {
	this.prop = 321;
});

// debugger;

export const myOtherInstance = apply(myOtherDecoratedInstance, MyOtherFn);

// debugger;


class ExtendTestingBase {
	field = 333;
}

@decorate()
class ExtendTestingExt extends ExtendTestingBase {
	field = 111;
}

export const exTest = new ExtendTestingExt;

// debugger;

@decorate()
class ExtendTestingSupBase {
	field = 333;
}

class ExtendTestingSupExt extends ExtendTestingSupBase {
	field = 111;
}

export const exSupTest = new ExtendTestingSupExt;


// --- decorate tests ---

@decorate()
class MidDecoratorBase {
	field = 333;
};

// debugger;
// Note: TypeScript's decorator type checking has limitations with callable class types.
// The @ts-expect-error is needed because TypeScript doesn't recognize DecoratedClass as callable
// even though the type definition correctly includes the call signature. This is a known
// TypeScript limitation with expressing both constructable and callable signatures on classes.
// @ts-expect-error - TypeScript limitation: class types with call signatures aren't recognized as callable in decorator context
@MidDecoratorBase()
class MidDecoratorExt {
	field = 111;
	ext = 321;
	constructor () {
		console.log('im here: ', this.field);
	}
}

// @ts-expect-error - TypeScript limitation: class types with call signatures aren't recognized as callable in decorator context
@MidDecoratorBase()
class MidAddDecoratorAddExt {
	field = 111;
	addition = 321;
	constructor () {
		console.log('im here: ', this.field);
	}
}

// @ts-expect-error - TypeScript limitation: class types with call signatures aren't recognized as callable in decorator context
@MidAddDecoratorAddExt({ test : true })
class MidAddDecoratorAddExtSub {
	field = 111;
	ext = 321;
	constructor () {
		console.log('im here: ', this.field);
	}
}


// debugger;
export const midDecoratorBase = new MidDecoratorBase;

// debugger;
export const midDecoratorExt = apply(midDecoratorBase, MidDecoratorExt);

// debugger;
export const midAddDecoratorBaseExt = apply(midDecoratorBase, MidAddDecoratorAddExt);

try {
	console.log('\n\nthis error ↓↓↓ must happen\n');
	apply(midDecoratorBase, MidAddDecoratorAddExtSub);
} catch (error) {
	// wow
	// this is either TS transpilation based
	// or some prototype pollution 
	// though, if it will be pollution,
	/// then all the tests will become broken
	// and this is not what happens
	// debugger;
	console.error(error);
	console.log('\nthis error ↑↑↑ must been happened\n\n-------\n\n\n');
}

// debugger;
export const midAddDecoratorSubExt = apply(midAddDecoratorBaseExt, MidAddDecoratorAddExtSub);
// debugger;







// TODO: something very strange below, seems this wasn't me who wrote this

// Coverage test: manually call decorator with explicit undefined to test ?? operator
const decoratorWithConfig = decorate(MidDecoratorBase, { blockErrors : true });
// Cast to any to bypass type mismatch between definition (ClassDecoratorContext) and implementation (constructorOptions)
const ManualDecoratedClass = (decoratorWithConfig as any)(
	function ManualDecoratedClass (this: { manual_field: number }) {
		this.manual_field = 777;
	},
	// Explicitly pass undefined to test ?? operator
	undefined
);

export const manualDecoratedInstance = apply(midDecoratorBase, ManualDecoratedClass);

// debugger;
