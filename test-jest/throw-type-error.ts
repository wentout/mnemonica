'use strict';

// This module intentionally throws a TypeError for testing purposes
module.exports = function (this: { args: unknown[] }, ...args: unknown[]) {
	this.args = args;
	// Intentionally create a structure that will cause TypeError
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const a = { b: 1 } as any;
	a.b.c.unable2set = 2;
};
