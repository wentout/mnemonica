'use strict';
exports.__esModule = true;
var __1 = require("..");
var SomeType = __1.define('SomeType', function () {
    this.one = 'SomeType';
    // this.q = 123;
});
var SomeSubType = SomeType.define('SomeSubType', function () {
    this.two = 'SomeSubType';
    // this.q = 123;
});
SomeSubType.define('FinalType', function () {
    this.three = 'FinalType';
    // this.q = 123;
});
var first = new SomeType();
first.one = 'one';
// first.x = 543;
var second = new first.SomeSubType();
// second.one = 'one must';
second.two = 'two';
// second.y = 'no way';
var final = new second.FinalType();
// final.one = 'must one';
// final.two = 'must two';
final.three = 'three';
// final.z = 'no way';
// tslint:disable-next-line: no-console
console.log(first, second, final);
