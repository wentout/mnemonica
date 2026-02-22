'use strict';

module.exports = function (...args: any[]) {
	(this as any).args = args;
	const a = {
		b: 1
	};
	(a as any).b.c.unable2set = 2;
};
