'use strict';

// Compile-only pin: the documented plain fork call needs no explicit this.

import { define, utils } from '..';

const ForkNoThisType = define('ForkNoThisType', function (
	this: { value: string },
	value: string
) {
	this.value = value;
});

const instance = new ForkNoThisType('original');
const forkFn = utils.fork(instance);
const sameArgs: typeof instance = forkFn();
const newArgs: typeof instance = forkFn('x');

void sameArgs;
void newArgs;
