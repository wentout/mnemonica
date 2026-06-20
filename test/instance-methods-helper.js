'use strict';

// This helper adds the legacy instance methods directly to a constructor's
// prototype. Use it *before* passing the constructor to `define()`.
// Starting from v1.0.6 mnemonica no longer auto-injects these methods.
// Users who still want them can copy this pattern and apply it to their own
// root-level constructors, or use the clean utils.* API instead.

const { utils } = require('..');
const { extract, pick, parent, clone, fork, exception, sibling } = utils;

const hop = (o, p) => Object.prototype.hasOwnProperty.call(o, p);

const withInstanceMethods = (Constructor) => {
	const proto = Constructor.prototype;
	if (hop(proto, 'extract')) {
		return Constructor;
	}

	Object.defineProperty(proto, 'extract', {
		get () {
			const instance = this;
			const result = function () {
				const extractResult = extract(instance);
				return extractResult;
			};
			return result;
		}
	});

	Object.defineProperty(proto, 'pick', {
		get () {
			const instance = this;
			const result = function (...keys) {
				const pickResult = pick(instance, ...keys);
				return pickResult;
			};
			return result;
		}
	});

	Object.defineProperty(proto, 'parent', {
		get () {
			const instance = this;
			const result = function (path) {
				const parentResult = parent(instance, path);
				return parentResult;
			};
			return result;
		}
	});

	Object.defineProperty(proto, 'clone', {
		get () {
			const result = clone(this);
			return result;
		}
	});

	Object.defineProperty(proto, 'fork', {
		get () {
			const result = fork(this);
			return result;
		}
	});

	Object.defineProperty(proto, 'exception', {
		get () {
			const instance = this;
			const result = function (error, ...args) {
				let exceptionResult;
				if (new.target) {
					exceptionResult = new exception(instance, error, ...args);
				} else {
					exceptionResult = exception(instance, error, ...args);
				}
				return exceptionResult;
			};
			return result;
		}
	});

	Object.defineProperty(proto, 'sibling', {
		get () {
			const result = sibling(this);
			return result;
		}
	});

	return Constructor;
};

module.exports = { withInstanceMethods };
