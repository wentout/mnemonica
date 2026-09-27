'use strict';

const { assert, expect } = require('chai');

const {
	define,
	errors,
	getProps,
} = require('..');

// Async ARROW handlers and the surrounding forms — the observed behavior of
// every form: the arrow's return becomes the resolution (the instance never
// reaches the arrow), so objects throw the inherit error, null/undefined the
// no-return error; unchain:true turns an arrow into a value-ender. The
// SYNC forms (arrows, shorthand methods, bound functions) are rejected at
// define time with the readable shape error; generators likewise.
// Async forms stay on the async path (async arrows/methods are
// indistinguishable without toString(), accepted by design).

// parent type with class field + async constructor returning this
const AsyncInitParent = define('AsyncInitParent', class {
	parentField = 'parent-field';
	constructor() {
		return new Promise((resolve) => {
			setTimeout(() => resolve(this), 10);
		});
	}
});

const AsyncInitChild = AsyncInitParent.define('AsyncInitChild', class {
	childField = 'child-field';
	constructor() {
		return new Promise((resolve) => {
			setTimeout(() => resolve(this), 10);
		});
	}
});

// WOReturn = WithOut Return (Promise resolves to undefined instead of this)
const AsyncInitWOReturn = define('AsyncInitWOReturn', class {
	constructor() {
		return new Promise((resolve) => {
			setTimeout(() => resolve(), 10);
		});
	}
});

// NAR = No Await Return (unchain: true drops the guard)
const AsyncInitWOReturnNAR = define('AsyncInitWOReturnNAR', class {
	constructor() {
		return new Promise((resolve) => {
			setTimeout(() => resolve(), 10);
		});
	}
}, {
	unchain: true
});

// plain JS class hierarchy used as handler for define()
class AsyncInitBaseClass {
	baseField = 'base-field';
}

class AsyncInitExtendedClass extends AsyncInitBaseClass {
	extField = 'ext-field';
	constructor() {
		super();
		return new Promise((resolve) => {
			setTimeout(() => resolve(this), 10);
		});
	}
}

const AsyncInitPreExtended = define('AsyncInitPreExtended', AsyncInitExtendedClass);

// root type with own field, then defines a subtype using pre-existing class hierarchy
const AsyncInitRooted = define('AsyncInitRooted', class {
	rootField = 'root-field';
	constructor() {
		return new Promise((resolve) => {
			setTimeout(() => resolve(this), 10);
		});
	}
});

const AsyncInitRootedSub = AsyncInitRooted.define('AsyncInitRootedSub', AsyncInitExtendedClass);

describe('async class constructor tests', () => {

	describe('async class construct should return something', () => {

		let thrown;
		before(async function () {
			try {
				await new AsyncInitWOReturn();
			} catch (error) {
				thrown = error;
			}
		});

		it('should throw without return statement for class', () => {
			expect(thrown).instanceOf(Error);
			expect(thrown).instanceOf(AsyncInitWOReturn);
			expect(thrown).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
			expect(thrown.message).exist.and.is.a('string');
			assert.equal(thrown.message, 'wrong modification pattern : async constructor AsyncInitWOReturn must `return this` (it resolved to undefined)');
		});

	});

	describe('async class construct should NOT return something', () => {
		let thrown;
		before(async function () {
			try {
				thrown = await new AsyncInitWOReturnNAR();
			} catch (error) {
				thrown = error;
			}
		});

		it('should NOT throw without return statement for class', () => {
			assert.equal(thrown, undefined);
		});
	});

	describe('async class construct fields and inheritance', () => {

		var asyncInitParentInstance;
		var asyncInitChildInstance;

		before(async function () {
			asyncInitParentInstance = await new AsyncInitParent();
			asyncInitChildInstance = await asyncInitParentInstance.AsyncInitChild();
		});

		it('parent instance should have class field', () => {
			expect(asyncInitParentInstance.parentField).equal('parent-field');
		});

		it('child instance should have parent class field', () => {
			expect(asyncInitChildInstance.parentField).equal('parent-field');
		});

		it('child instance should have child class field', () => {
			expect(asyncInitChildInstance.childField).equal('child-field');
		});

		it('child instance should be instanceof AsyncInitParent', () => {
			expect(asyncInitChildInstance).instanceOf(AsyncInitParent);
		});

		it('child instance should be instanceof AsyncInitChild', () => {
			expect(asyncInitChildInstance).instanceOf(AsyncInitChild);
		});

		it('parent instance should not be instanceof AsyncInitChild', () => {
			expect(asyncInitParentInstance).not.instanceOf(AsyncInitChild);
		});

	});

	describe('pre-existing class hierarchy passed to define()', () => {

		var asyncInitPreExtInstance;

		before(async function () {
			asyncInitPreExtInstance = await new AsyncInitPreExtended();
		});

		it('instance should have base class field', () => {
			expect(asyncInitPreExtInstance.baseField).equal('base-field');
		});

		it('instance should have extended class field', () => {
			expect(asyncInitPreExtInstance.extField).equal('ext-field');
		});

		it('instance should be instanceof mnemonica type', () => {
			expect(asyncInitPreExtInstance).instanceOf(AsyncInitPreExtended);
		});

		it('instance should be instanceof original extended class', () => {
			expect(asyncInitPreExtInstance).instanceOf(AsyncInitExtendedClass);
		});

		it('instance should be instanceof original base class', () => {
			expect(asyncInitPreExtInstance).instanceOf(AsyncInitBaseClass);
		});

	});

	describe('root type defines subtype with pre-existing class hierarchy', () => {

		var asyncInitRootInstance;
		var asyncInitRootedSubInstance;

		before(async function () {
			asyncInitRootInstance = await new AsyncInitRooted();
			asyncInitRootedSubInstance = await asyncInitRootInstance.AsyncInitRootedSub();
		});

		it('sub instance should have root field', () => {
			expect(asyncInitRootedSubInstance.rootField).equal('root-field');
		});

		it('sub instance should have base class field', () => {
			expect(asyncInitRootedSubInstance.baseField).equal('base-field');
		});

		it('sub instance should have extended class field', () => {
			expect(asyncInitRootedSubInstance.extField).equal('ext-field');
		});

		it('sub instance should be instanceof root type', () => {
			expect(asyncInitRootedSubInstance).instanceOf(AsyncInitRooted);
		});

		it('sub instance should be instanceof sub type', () => {
			expect(asyncInitRootedSubInstance).instanceOf(AsyncInitRooted);
			expect(asyncInitRootedSubInstance).instanceOf(AsyncInitRootedSub);
		});

		it('root instance should not be instanceof sub type', () => {
			expect(asyncInitRootInstance).instanceOf(AsyncInitRooted);
			expect(asyncInitRootInstance).not.instanceOf(AsyncInitRootedSub);
		});

	});

	// pins for the async-arrow observations and the define-time sync-form
	// rejections (the describe bodies carry the per-case detail)
	describe('arrow, method and bound-function handlers (pre-C0 pins)', () => {

		const AsyncArrowRoot = define('AsyncArrowRoot', async () => {
			return { madeBy: 'arrow' };
		});

		const AsyncArrowNull = define('AsyncArrowNull', async () => {
			return null;
		});

		const AsyncArrowSub = AsyncArrowRoot.define('AsyncArrowSub', async () => {
			return { sub: true };
		});

		const AsyncArrowDotted = define('AsyncArrowDotted', async () => {
			return { dotted: true };
		});

		const AsyncArrowUnchained = define('AsyncArrowUnchained', async () => {
			return 42;
		}, {
			unchain: true
		});

		const AsyncArrowUnchainedObject = define('AsyncArrowUnchainedObject', async () => {
			return { plain: true };
		}, {
			unchain: true
		});

		describe('async arrow as root handler', () => {

			let thrown;
			before(async function () {
				try {
					await new AsyncArrowRoot();
				} catch (error) {
					thrown = error;
				}
			});

			it('should throw the inherit error — the arrow return becomes the resolution', () => {
				expect(thrown).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(thrown.message, 'wrong modification pattern : async constructor AsyncArrowRoot must resolve to its own instance (`return this`), got Object');
			});

		});

		describe('async arrow resolving to null', () => {

			let thrown;
			before(async function () {
				try {
					await new AsyncArrowNull();
				} catch (error) {
					thrown = error;
				}
			});

			it('should throw the readable no-return error (never the internal TypeError)', () => {
				expect(thrown).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(thrown.message, 'wrong modification pattern : async constructor AsyncArrowNull must `return this` (it resolved to null)');
			});

		});

		describe('async arrow as subtype and via dotted path', () => {

			let subThrown;
			let dottedThrown;
			before(async function () {
				try {
					await new AsyncArrowSub();
				} catch (error) {
					subThrown = error;
				}
				try {
					await new AsyncArrowDotted();
				} catch (error) {
					dottedThrown = error;
				}
			});

			it('sub define should throw the inherit error', () => {
				expect(subThrown).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(subThrown.message, 'wrong modification pattern : async constructor AsyncArrowSub must resolve to its own instance (`return this`), got Object');
			});

			it('dotted define should throw the inherit error', () => {
				expect(dottedThrown).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(dottedThrown.message, 'wrong modification pattern : async constructor AsyncArrowDotted must resolve to its own instance (`return this`), got Object');
			});

		});

		describe('async arrow with unchain:true', () => {

			let resolved;
			let objectThrown;
			before(async function () {
				resolved = await new AsyncArrowUnchained();
				try {
					await new AsyncArrowUnchainedObject();
				} catch (error) {
					objectThrown = error;
				}
			});

			it('a non-object resolution drops the chain — the value is the result', () => {
				assert.strictEqual(resolved, 42);
			});

			it('an object resolution still throws (unchain covers non-objects only)', () => {
				expect(objectThrown).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(objectThrown.message, 'wrong modification pattern : async constructor AsyncArrowUnchainedObject must resolve to its own instance (`return this`), got Object');
			});

		});

		describe('sync arrow as root handler (C0: define-time readable error)', () => {

			let defineError;
			before(function () {
				try {
					define('SyncArrowRootC0', () => {
						return { sync: true };
					});
				} catch (error) {
					defineError = error;
				}
			});

			it('should throw the readable arrow error at define time', () => {
				expect(defineError).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(defineError.message, 'wrong modification pattern : SyncArrowRootC0: constructor must be a regular function or a class (arrow functions, methods and bound functions are not supported)');
			});

		});

		describe('generator handlers (C0: define-time readable error)', () => {

			let syncGenError;
			let asyncGenError;
			before(function () {
				try {
					define('SyncGenType', function* () {
						yield 1;
					});
				} catch (error) {
					syncGenError = error;
				}
				try {
					define('AsyncGenType', async function* () {
						yield 1;
					});
				} catch (error) {
					asyncGenError = error;
				}
			});

			it('sync generator should throw the not-supported error at define time', () => {
				expect(syncGenError).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(syncGenError.message, 'wrong modification pattern : SyncGenType: generator functions are not supported as a constructor');
			});

			it('async generator should throw the not-supported error at define time', () => {
				expect(asyncGenError).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(asyncGenError.message, 'wrong modification pattern : AsyncGenType: generator functions are not supported as a constructor');
			});

		});

		describe('shorthand method handlers (C0: sync caught by the arrow rule)', () => {

			const methodHandlers = {
				syncMethod() {
					this.fromSyncMethod = 'sync-method-field';
					return this;
				},
				async asyncMethod() {
					this.fromAsyncMethod = 'async-method-field';
					return this;
				}
			};

			let syncMethodDefineError;
			let asyncMethodInstance;
			before(async function () {
				try {
					define('SyncMethodTypeC0', methodHandlers.syncMethod);
				} catch (error) {
					syncMethodDefineError = error;
				}
				// async methods stay on the async path (undetectable without
				// toString(), accepted by design) — fields still land
				const AsyncMethodTypeC0 = define('AsyncMethodTypeC0', methodHandlers.asyncMethod);
				asyncMethodInstance = await new AsyncMethodTypeC0();
			});

			it('sync method should hit the define-time arrow error (indistinguishable from an arrow)', () => {
				expect(syncMethodDefineError).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(syncMethodDefineError.message, 'wrong modification pattern : SyncMethodTypeC0: constructor must be a regular function or a class (arrow functions, methods and bound functions are not supported)');
			});

			it('async method should still work — the async path receives the instance as this', () => {
				expect(asyncMethodInstance.fromAsyncMethod).equal('async-method-field');
			});

		});

		describe('bound function handlers (C0: sync caught, async stays)', () => {

			const bindTarget = { boundTarget: true };
			const syncFn = function () {
				this.fromBoundSync = 'bound-sync-field';
				return this;
			};
			const asyncFn = async function () {
				this.fromBoundAsync = 'bound-async-field';
				return this;
			};

			let syncBoundDefineError;
			let asyncBoundThrown;
			before(async function () {
				try {
					define('SyncBoundTypeC0', syncFn.bind(bindTarget));
				} catch (error) {
					syncBoundDefineError = error;
				}
				const AsyncBoundTypeC0 = define('AsyncBoundTypeC0', asyncFn.bind(bindTarget));
				try {
					await new AsyncBoundTypeC0();
				} catch (error) {
					asyncBoundThrown = error;
				}
			});

			it('sync bound should hit the define-time arrow error', () => {
				expect(syncBoundDefineError).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(syncBoundDefineError.message, 'wrong modification pattern : SyncBoundTypeC0: constructor must be a regular function or a class (arrow functions, methods and bound functions are not supported)');
			});

			it('async bound should still construct-throw (the bind target is not the instance)', () => {
				expect(asyncBoundThrown).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
				assert.equal(asyncBoundThrown.message, 'wrong modification pattern : async constructor AsyncBoundTypeC0 must resolve to its own instance (`return this`), got Object');
			});

		});

		describe('arrow lexical this lands on the surrounding this (CJS)', () => {

			const marker = 'arrow-field-landed';

			// the arrow never sees the instance: its this is the LEXICAL
			// this — at a CJS module top level that is module.exports; here
			// we call the defining function with a known zone to pin it
			const zone = { zoneMarker: true };
			const defineInZone = function () {
				return define('ArrowThisLand', async () => {
					this.arrowLanded = marker;
					return { recorded: true };
				});
			};

			before(async function () {
				const ArrowThisLand = defineInZone.call(zone);
				try {
					await new ArrowThisLand();
				} catch (error) {
					// expected: the returned object is not the instance
				}
			});

			it('the field assignment should have reached the lexical this', () => {
				expect(zone.arrowLanded).equal(marker);
			});

		});

	});

});
