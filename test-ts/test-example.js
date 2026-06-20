import { define, apply, utils } from '..';
const FirstType = define('SomeType', function () {
    this.first = 'FirstType';
});
const SecondType = FirstType.define('SecondType', function () {
    this.first = undefined;
    this.second = 'SecondType';
});
const first = new FirstType();
const second = new first.SecondType();
const second2 = apply(first, SecondType);
// Starting from v1.0.6 instance methods are no longer auto-injected.
// Use the standalone utils.* API instead.
utils.extract(first);
utils.pick(first, 'first');
first.SecondType;
// @ts-expect-error - extract is not available as an instance method by default
first.extract();
// @ts-expect-error - pick is not available as an instance method by default
first.pick('first');
// Both should have the user-defined property 'first'
const f1 = first.first;
// { first: undefined, second: "SecondType" }
console.log(first, second, second2, f1);
