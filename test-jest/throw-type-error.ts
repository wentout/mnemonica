'use strict';

// This module intentionally throws a TypeError for testing purposes
module.exports = function (this: { args: unknown[] }, ...args: unknown[]) {
	this.args = args;
	// Intentionally create a structure that will cause TypeError
	// Using unknown first, then casting to allow the runtime error
	const a = { b: 1 } as unknown as Record<string, Record<string, Record<string, number>>>;
	a.b.c.unable2set = 2;
};
