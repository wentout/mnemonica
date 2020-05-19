'use strict';
exports.__esModule = true;
var __1 = require('..');
var SomeType = __1.define('SomeType', function () {
	this.one = 'SomeType';
	this.q = 123;
});
var SomeSubType = SomeType.define('SomeSubType', function () {
	this.one = undefined;
	this.two = 'SomeSubType';
	this.q = 123;
});
SomeSubType.define('FinalType', function () {
	this.one = 'final one';
	this.three = 'FinalType';
	this.q = 123;
});
var first = new SomeType();
var x = first.one;
first.one = 'one';
first.x = 543;
var second = new first.SomeSubType();
var y = second.one;
second.two = 'two';
second.y = 'no way';
var final = new second.FinalType();
final.one = 'must one';
final.two = 'must two';
final.z = 'no way';
var z = final.one;
// tslint:disable-next-line: no-console
console.log('first', first);
// tslint:disable-next-line: no-console
console.log('second', second);
// tslint:disable-next-line: no-console
console.log('final', final);
// tslint:disable-next-line: no-console
console.log('{ x, y, z }', { x : x, y : y, z : z });
