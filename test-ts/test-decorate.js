"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
debugger;
// eslint-disable-next-line @typescript-eslint/ban-types
// function defined  <T> (cstr: IDEF<T>, s: ClassDecoratorContext<typeof cstr>) {
function defined(cstr, s) {
    debugger;
    const TypeDef = (0, __1.define)(s.name, cstr);
    Object.setPrototypeOf(cstr.prototype, new TypeDef);
}
let MyClass = class MyClass {
    constructor() {
        debugger;
        this.z = 123;
    }
};
MyClass = __decorate([
    defined
], MyClass);
const myInstance = new MyClass;
console.log(myInstance.z);
const myInstance1 = new MyClass;
console.log(myInstance1.z);
debugger;
