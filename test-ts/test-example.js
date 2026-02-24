"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var FirstType = (0, __1.define)('SomeType', function () {
    this.first = 'FirstType';
});
var SecondType = FirstType.define('SecondType', function () {
    this.first = undefined;
    this.second = 'SecondType';
});
var first = new FirstType();
var second = new first.SecondType();
// { first: undefined, second: "SecondType" }
console.log(second);
