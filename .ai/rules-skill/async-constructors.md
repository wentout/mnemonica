---
name: mnemonica-async-constructors
description: |
  Async constructor patterns in mnemonica: awaitReturn, super() return-value
  propagation, native async class wrapping, async subtype chains, and the
  parent.AsyncChild() invocation pattern. Use when the user asks about async
  constructors, Promise return from new, await new Constructor(), async subtype
  chains, or mixing native async classes with mnemonica.
metadata:
  tags: [mnemonica, async, constructors, promises, super, await, classes]
---

# Async Constructors

## Basic Async define()

```typescript
const AsyncType = define('AsyncType', async function (data) {
	await someAsyncOperation();
	return Object.assign(this, { data });
});

const instance = await new AsyncType('tada');
```

## awaitReturn Config

When `awaitReturn: true` (default), `await new Constructor()` must return a value.
If the constructor returns `undefined`, an error is thrown.

```typescript
const AsyncType = define('AsyncType', async function () {
	return this; // MUST return a value
}, { awaitReturn: true });

const AsyncTypeNoReturn = define('AsyncTypeNoReturn', async function () {
	// No return needed
}, { awaitReturn: false });
```

## The super() Return-Value Pattern

`super()` returns whatever the parent constructor returns — including Promises.
This is standard JavaScript, and mnemonica's class wrapper preserves it:

```typescript
class MyAsyncClass {
	field = undefined;
	constructor() {
		const self = this;
		return new Promise((resolve) => {
			setTimeout(() => {
				self.field = 123;
				resolve(self);
			}, 100);
		});
	}
}

class MySubAsyncClass extends MyAsyncClass {
	constructor() {
		const promise = super();        // ← catches parent's Promise
		return new Promise(async (resolve) => {
			const item = await promise; // ← await it
			console.log(item.field);    // 123
			resolve(item);              // ← resolve with parent's instance
		});
	}
}
```

mnemonica detects class constructors via `isClass()` and uses `class extends`
wrapping (`compileNewModificatorFunctionBody.ts`), so `super()` propagates the
Promise into the async pipeline.

## Wrapping Native Async Classes

You can pass a native async class directly to `define()`:

```typescript
const First = define('First', MyAsyncClass);
const Second = First.define('Second', MySubAsyncClass);

const first = await new First();
const second = await new first.Second(); // ← correct: invoke as method
```

**Important:** `await new Second()` directly would fail `strictChain` because
there is no parent instance. Always invoke async subtypes as methods on the
parent instance.

## The Prototype Chain Takeover

When mnemonica wraps your native class, it rewrites the prototype chain to
follow mnemonica's Trie, not the native class hierarchy:

```typescript
const second = await new first.Second();

console.log(second instanceof Second);         // true
console.log(second instanceof First);          // true
console.log(second instanceof MyAsyncClass);   // true
console.log(second instanceof MySubAsyncClass); // false ← native subclass lost
```

The native class is the construction vehicle; mnemonica owns the inheritance.
The async behavior (field propagation, Promise resolution) still works correctly.

## Correct Async Subtype Invocation

In mnemonica, async subtypes are invoked as **methods on the parent instance**:

```typescript
const AsyncParent = define('AsyncParent', async function () {
	await sleep(50);
	this.parentValue = 'parent';
	return this;
});

const AsyncChild = AsyncParent.define('AsyncChild', async function () {
	await sleep(50);
	this.childValue = 'child';
	return this;
});

// ✓ Correct: invoke subtype as method on parent instance
const parent = await new AsyncParent();
const child = await parent.AsyncChild();

console.log(child.parentValue); // 'parent'
console.log(child.childValue);  // 'child'

// ✗ Wrong: standalone new fails strictChain
const child = await new AsyncChild(); // ERROR
```

## Async Chains with Single Await

```typescript
const result = await new UserTypeConstructor({
		email: 'async@gmail.com',
		password: 32123
	})
	.WithoutPassword()
	.WithAdditionalSign('async sign')
	.AsyncChain1st({ async1st: '1st' })
	.AsyncChain2nd({ async2nd: '2nd' })
	.Async2Sync2nd({ sync: 'is' })
	.AsyncChain3rd({ async: '3rd' });
```

Each async subtype returns a Promise that resolves to the next instance. The
single `await` unwraps the entire sequence.

## makeAwaiter

`InstanceCreator.makeAwaiter()` wraps the construction result in a Promise,
validates the instance type on resolution, and attaches subtype factories:

```typescript
// After await, instance has .SubType(), .AnotherType(), etc.
const instance = await new AsyncType();
const chained = await instance.SubType().AnotherType();
```

## addThen

`addThen()` allows sequential async subtype creation by chaining Promises:

```typescript
const instance = await new AsyncType();
const chained = await instance.SubType().AnotherType(); // sequential awaits
```

## Error Handling in Async Constructors

When an async constructor throws, mnemonica creates an error instance that
inherits from the type being constructed:

```typescript
const AsyncErroredType = define('AsyncErroredType', async function () {
	await sleep(100);
	const b = {};
	b.c.async = null; // TypeError
});

try {
	await new AsyncErroredType();
} catch (error) {
	console.log(error instanceof Error);            // true
	console.log(error instanceof TypeError);        // true
	console.log(error instanceof AsyncErroredType); // true
}
```

## Summary

| Pattern | Works? | Notes |
|---------|--------|-------|
| `define('Name', async function () { ... })` | ✅ | Standard async constructor |
| `define('Name', MyAsyncClass)` | ✅ | Native async class wrapped via `class extends` |
| `await new AsyncType()` | ✅ | Returns resolved instance (with `awaitReturn: true`) |
| `await parent.AsyncSubType()` | ✅ | Correct subtype invocation pattern |
| `await new AsyncSubType()` | ❌ | Fails `strictChain` — no parent instance |
| Native `instanceof` through chain | ⚠️ | Follows mnemonica's graph, not native class hierarchy |
| `super()` returning Promise | ✅ | Standard JS; mnemonica's wrapper preserves it |
