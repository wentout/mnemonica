import { define, IDEF } from '..';

debugger;

// eslint-disable-next-line @typescript-eslint/ban-types
// function defined  <T> (cstr: IDEF<T>, s: ClassDecoratorContext<typeof cstr>) {
function defined <T extends { new (): unknown }> (cstr: T, s: ClassDecoratorContext<T>) {
	debugger;
	const TypeDef = define(s.name as unknown as string, cstr);
	Object.setPrototypeOf(cstr.prototype, new TypeDef);
}

@defined
class MyClass {
	z: number;
	constructor () {
		debugger;
		this.z = 123;
	}
}

const myInstance = new MyClass;
console.log(myInstance.z);
const myInstance1 = new MyClass;
console.log(myInstance1.z);
debugger;
