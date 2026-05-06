# Async Constructors in mnemonica

> **What this covers:** How mnemonica handles async constructors, the `super()` return-value pattern, and what happens when you mix native async classes with mnemonica's inheritance system.
>
> **What you should already know:** `define()`, prototype chains, and that `await new Constructor()` works in mnemonica.

---

## The Basics

mnemonica supports async constructors out of the box:

```js
const AsyncType = define('AsyncType', async function (data) {
	await someAsyncOperation();
	return Object.assign(this, { data });
});

const instance = await new AsyncType('tada');
console.log(instance.data); // 'tada'
```

The `awaitReturn` option (default: `true`) ensures `await new Constructor()` returns the resolved instance. If you set `awaitReturn: false`, the raw Promise is returned instead.

---

## The `super()` Return-Value Trap

Most JavaScript developers think `super()` is just for `this` initialization. **It is not.** `super()` returns whatever the parent constructor returns — including Promises.

```js
class MyAsyncClass {
	field = undefined;
	constructor() {
		const self = this;
		return new Promise((resolve) => {
			setTimeout(() => {
				self.field = 123;
				resolve(self);
			}, 1000);
		});
	}
}

class MySubAsyncClass extends MyAsyncClass {
	constructor() {
		const promise = super();        // ← catches parent's Promise
		return new Promise(async (resolve) => {
			const item = await promise; // ← await it
			console.log(item.field);    // 123
			resolve(item);              // ← resolve with the parent's instance
		});
	}
}

const result = await new MySubAsyncClass();
console.log(result.field); // 123
```

This is standard JavaScript behavior, not mnemonica-specific. But it matters because mnemonica's class-wrapper uses the same `class extends` mechanism.

---

## How mnemonica Wraps Async Classes

When you pass a class to `define()`, mnemonica detects it via `isClass()` and uses `getClassConstructor()`:

```typescript
// src/api/types/compileNewModificatorFunctionBody.ts
return class extends ConstructHandler {
	constructor(...args: unknown[]) {
		const answer = super(...args);  // ← catches whatever the class returns
		const result = CreationHandler.call(this, answer);
		return result as object;
	}
};
```

`ConstructHandler` is your class. `CreationHandler` is mnemonica's internal wiring (hook invocation, prototype setup, `strictChain` validation). If your class returns a Promise, `super(...args)` returns that Promise, and mnemonica's async pipeline (`InstanceCreator.ts` Phase 5) handles the rest.

---

## Mixing Native Classes and mnemonica Chains

You can define a native async class, then chain mnemonica subtypes from it:

```js
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
		const promise = super();
		return new Promise(async (resolve) => {
			const item = await promise;
			resolve(item);
		});
	}
}

const First = define('First', MyAsyncClass);
const Second = First.define('Second', MySubAsyncClass);

(async () => {
	const first = await new First();
	console.log(first.field); // 123

	const second = await new first.Second();
	console.log(second.field); // 123
})();
```

This works. But there is a caveat.

---

## The Prototype Chain Takeover

When mnemonica wraps your class, it **rewrites the prototype chain** to follow mnemonica's Trie, not the native class hierarchy:

```js
const second = await new first.Second();

console.log(second instanceof Second);         // true
console.log(second instanceof First);          // true
console.log(second instanceof MyAsyncClass);   // true
console.log(second instanceof MySubAsyncClass); // false ← native subclass lost
```

**Why:** `MySubAsyncClass` calls `super()` which returns a `MyAsyncClass` instance. mnemonica's `CreationHandler` then replaces the prototype with `Second.prototype → First.prototype → MyAsyncClass.prototype`. The native `MySubAsyncClass.prototype` is skipped.

The async construction behavior still works (field propagation, Promise resolution). But `instanceof` follows mnemonica's graph. The native class is the construction vehicle; mnemonica owns the inheritance.

---

## The Correct Way to Chain Async Subtypes

In mnemonica, async subtypes are invoked as **methods on the parent instance**, not via standalone `new`:

```js
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

console.log(child instanceof AsyncParent); // true
console.log(child instanceof AsyncChild);  // true
```

`await new AsyncChild()` directly would fail the `strictChain` check because there is no parent instance to inherit from. The `parent.AsyncChild()` pattern provides the parent, and mnemonica's async pipeline wires the Promise resolution correctly.

---

## Async Chains with Single Await

mnemonica's most powerful async feature is chainable awaits:

```js
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

console.log(result.extract());
// {
//   email: 'async@gmail.com',
//   password: undefined,
//   sign: 'async sign',
//   async1st: '1st',
//   async2nd: '2nd',
//   sync: 'is',
//   async: '3rd',
//   ...
// }
```

Each async subtype returns a Promise that resolves to the next instance in the chain. The single `await` at the start unwraps the entire sequence.

---

## Configuration: `awaitReturn`

| Option | Default | Behavior |
|--------|---------|----------|
| `awaitReturn` | `true` | `await new AsyncType()` returns the resolved instance |
| `awaitReturn` | `false` | `await new AsyncType()` returns the raw Promise |

```js
const AsyncType = define('AsyncType', async function () {
	await sleep(100);
	this.done = true;
	return this;
}, { awaitReturn: false });

const result = await new AsyncType();
// result is a Promise, not the instance
```

Use `awaitReturn: false` only if you need to handle the Promise manually (e.g., for custom `.then()` chains).

---

## Error Handling in Async Constructors

When an async constructor throws, mnemonica creates an error instance that inherits from the type being constructed:

```js
const AsyncErroredType = define('AsyncErroredType', async function () {
	await sleep(100);
	const b = {};
	b.c.async = null; // TypeError
});

(async () => {
	try {
		await new AsyncErroredType();
	} catch (error) {
		console.log(error instanceof Error);              // true
		console.log(error instanceof TypeError);          // true
		console.log(error instanceof AsyncErroredType);   // true
	}
})();
```

This works because mnemonica catches the error and re-creates it as an instance of the target type with the error attached. The `blockErrors` option controls whether construction is blocked when errors exist in the prototype chain.

---

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

---

> **Key takeaway:** Async constructors in mnemonica work because mnemonica treats the constructor's return value — Promise or not — as the instance seed. The `class extends` wrapper ensures `super()` propagates the Promise, and mnemonica's async pipeline resolves it into a properly chained instance. Use `parent.AsyncChild()` for subtypes, not standalone `new AsyncChild()`.
