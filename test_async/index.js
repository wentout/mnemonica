'use strict';

const { assert, expect } = require('chai');

const {
	define,
	errors,
	getProps,
} = require('..');

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

// NAR = No Await Return (awaitReturn: false disables the guard)
const AsyncInitWOReturnNAR = define('AsyncInitWOReturnNAR', class {
	constructor() {
		return new Promise((resolve) => {
			setTimeout(() => resolve(), 10);
		});
	}
}, {
	awaitReturn: false
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

	describe('async class construct should return something', async () => {

		let thrown;
		try {
			await new AsyncInitWOReturn();
		} catch (error) {
			thrown = error;
		}

		it('should throw without return statement for class', () => {
			expect(thrown).instanceOf(Error);
			expect(thrown).instanceOf(AsyncInitWOReturn);
			expect(thrown).instanceOf(errors.WRONG_MODIFICATION_PATTERN);
			expect(thrown.message).exist.and.is.a('string');
			assert.equal(thrown.message, 'wrong modification pattern : should inherit from AsyncInitWOReturn: seems async AsyncInitWOReturn has no return statement');
		});

	});

	describe('async class construct should NOT return something', async () => {
		let thrown;
		try {
			thrown = await new AsyncInitWOReturnNAR();
		} catch (error) {
			thrown = error;
		}

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

});
