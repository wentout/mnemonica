'use strict';

// Re-adds the legacy instance methods to a constructor's prototype.
// Use this *before* passing the constructor to `define()`.
// Starting from v1.0.6 mnemonica no longer auto-injects these methods.

import { utils } from '../src/index';

const hop = (o: object, p: string | symbol) => Object.prototype.hasOwnProperty.call(o, p);

export const withInstanceMethods = <T extends new (...args: unknown[]) => object>(
	constructor: T
): T => {
	const proto = constructor.prototype as object;
	if (hop(proto, 'extract')) {
		return constructor;
	}

	const { extract, pick, parent, clone, fork, exception, sibling } = utils;

	Object.defineProperty(proto, 'extract', {
		get () {
			const instance = this;
			return function () {
				return extract(instance);
			};
		}
	});

	Object.defineProperty(proto, 'pick', {
		get () {
			const instance = this;
			return function (...keys: unknown[]) {
				return pick(instance, ...keys as (string | string[])[]);
			};
		}
	});

	Object.defineProperty(proto, 'parent', {
		get () {
			const instance = this;
			return function (path?: string) {
				return parent(instance, path);
			};
		}
	});

	Object.defineProperty(proto, 'clone', {
		get () {
			return clone(this);
		}
	});

	Object.defineProperty(proto, 'fork', {
		get () {
			return fork(this);
		}
	});

	Object.defineProperty(proto, 'exception', {
		get () {
			const instance = this;
			return function (error: Error, ...args: unknown[]) {
				if (new.target) {
					return new (exception as unknown as new (
						instance: object,
						error: Error,
						...args: unknown[]
					) => Error)(instance, error, ...args);
				}
				return exception(instance, error, ...args);
			};
		}
	});

	Object.defineProperty(proto, 'sibling', {
		get () {
			return sibling(this);
		}
	});

	return constructor;
};
