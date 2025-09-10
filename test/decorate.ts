import { decorate, apply, ConstructorFunction } from '..';

@decorate( undefined, { strictChain : false } )
class MyDecoratedClass {
	field: number;
	constructor () {
		this.field = 123;
	}
}

@decorate( MyDecoratedClass )
class MyDecoratedSubClass {
	sub_field: number;
	constructor () {
		this.sub_field = 321;
	}
}

export const myDecoratedInstance = new MyDecoratedClass;
export const myDecoratedSubInstance = apply( myDecoratedInstance, MyDecoratedSubClass );

const MyFn = function () {
	this.sub_sub_field = 123;
} as ConstructorFunction<{sub_sub_field: number}>;

@decorate( MyDecoratedSubClass )
class MyDecoratedSubSubClass extends MyFn {
	sub_sub_field: number;
	constructor () {
		super();
		this.sub_sub_field = 321;
	}
}

export const myDecoratedSubSubInstance = apply( myDecoratedSubInstance, MyDecoratedSubSubClass );

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const MyOtherFn = MyDecoratedClass.define('MyOtherFn', function () {
	this.prop = 321;
});

export const myOtherInstance = apply( myDecoratedInstance, MyOtherFn );
