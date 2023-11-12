import { decorate, apply }from '..';


debugger;
@decorate(undefined, {}, { strictChain : false })
class MyDecoratedClass {
	field: number;
	constructor () {
		this.field = 123;
	}
}

debugger;
@decorate(MyDecoratedClass)
class MyDecoratedSubClass {
	sub_field: number;
	constructor () {
		this.sub_field = 321;
	}
}

export const myDecoratedInstance = new MyDecoratedClass;
export const myDecoratedSubInstance = apply(myDecoratedInstance, MyDecoratedSubClass);
