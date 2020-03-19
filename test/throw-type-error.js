'use strict';

module.exports = function (...args) {
	this.args = args;
	const a = {
		b : 1
	};
	a.b.c.d = 2;
};
