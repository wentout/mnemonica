'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var SomeType = (0, __1.define)('SomeType', function (gather, check) {
    this.one = gather;
    this.check = check;
    this.q = 123;
}, {
    l: 12345
});
SomeType.registerHook('preCreation', function () { console.log('SomeType'); });
var SomeSubType = SomeType.define('SomeSubType', function () {
    this.one = undefined;
    this.two = 'SomeSubType';
    this.q = 123;
}, {
    k: 123
});
var first = new SomeType('SomeArg');
SomeSubType.registerHook('preCreation', function () { console.log('SomeSubType'); });
var x = first.one;
first.one = 123; // hinting is correct !
first.q = 'one'; // hinting is correct !
first.l = '111'; // hinting is correct !
first.x = 543; // hinting is NOT VERY correct !
var FinalType = SomeSubType.define('FinalType', /** @class */ (function () {
    function class_1() {
        this.one = 'final one';
        this.three = 'FinalType';
        this.q = 123;
    }
    return class_1;
}()));
var second = new first.SomeSubType();
var y = second.one;
second.check = 123; // hinting is correct !
second.two = 'two';
second.y = 'no way'; // hinting is correct !
second.k = 'no way'; // hinting is correct !
var final = new second.FinalType();
// const final = new FinalType();
final.one = 'must one';
final.two = 'must two';
final.three = 'must two';
final.check = 'there is mumber'; // hinting is correct !
final.z = 'no way'; // hinting is correct !
var z = final.one;
// tslint:disable-next-line: no-console
console.log('\nNo Typings: \n');
// tslint:disable-next-line: no-console
console.log('first: ', first);
// tslint:disable-next-line: no-console
console.log('second: ', second);
// tslint:disable-next-line: no-console
console.log('final: ', final);
// tslint:disable-next-line: no-console
console.log('{ x, y, z }: ', { x: x, y: y, z: z });
var aSub = (0, __1.apply)(first, SomeSubType);
console.log(aSub);
var bSub = (0, __1.bind)(first, SomeSubType)();
console.log(bSub);
var cSub = (0, __1.call)(first, SomeSubType);
console.log(cSub);
