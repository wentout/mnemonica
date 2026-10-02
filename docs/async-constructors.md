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

The `unchain` option (default: `false`) requires `await new Constructor()` to resolve to its instance. With `unchain: true`, a non-object resolution (`undefined`, a primitive, `null`) drops the chain — that value is the result.

---

## The `return this` rule

An async constructor must resolve to the instance it was given as `this`.
Fields assigned to `this` are invisible to the chain unless the constructor
returns it — `return this`, or a Promise resolving to it (promises resolve to
their final depth by the ECMAScript standard).

When the resolution breaks the rule, the error names the cause and the fix:

```
// resolved to undefined / a primitive / null (with unchain: false):
wrong modification pattern : async constructor AsyncType must `return this` (it resolved to undefined)

// resolved to a different object:
wrong modification pattern : async constructor AsyncType must resolve to its own instance (`return this`), got Object
```

With `unchain: true` the first case is not an error at all — the non-object
value IS the result (see Configuration below). `null` is a legitimate value
either way: `undefined` says "no construction after this", `null` says "the
chain ends here, but an object is possible".

> **Write async constructors as `async function`.** Only that form supports
> the `this`-substitution dance. Arrow functions never see the instance
> (their `this` is lexical); the shape rules below reject the sync forms at
> define time, and the `no-arrow-this` ESLint plugin is the early guard.
> The same rules apply to `lazy` getters — on the getter's result, at
> definition time AND on every construction (the getter may return a new
> function each time, so the check cannot be cached). That per-construction
> check is what makes `lazy` slower than a direct `define()`; keep getters
> pure — they run eagerly at definition time and again per construction.

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

## Why Async Constructors Don't Double-Initialize: `_setSelf`

When a constructor returns a Promise, the initial result of `new Constructor()` is that Promise. mnemonica's async pipeline waits for it to resolve, then must run validation and lifecycle hooks. But it must not run them again if the resolved instance is ever re-examined.

`_setSelf(instance)` solves this by adding a `__self__` getter to the instance's internal props that returns the instance itself. `makeAwaiter` retrieves those props through the same prototype-chain walk `getProps` uses (down to the instance's memory layer) and checks:

```js
if (props.__self__ !== self.inheritedInstance) {
  self.postProcessing(type);
}
```

If `__self__` is missing or does not match the resolved instance, post-processing has not run yet, so mnemonica runs it. If it matches, post-processing has already happened and is skipped.

This is how mnemonica handles a problem that has been open in TC39 for years: the constructor can return a Promise, and the library finalizes the instance only after the Promise resolves, using `__self__` as a completion marker.

---

## Async Chains with Single Await

mnemonica's most powerful async feature is chainable awaits:

```js
const { utils } = require('mnemonica');

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

console.log(utils.extract(result));
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

## Configuration: `unchain`

| Option | Default | Behavior |
|--------|---------|----------|
| `unchain` | `false` (default) | `await new AsyncType()` must resolve to the instance |
| `unchain` | `true` | a non-object resolution drops the chain — the value itself is the result |

```js
const AsyncType = define('AsyncType', async function () {
	await sleep(100);
	this.done = true;
	// no return: resolves to undefined
}, { unchain: true });

const result = await new AsyncType();
// result is undefined — the chain is dropped, no error
```

Use `unchain: true` when a data-flow chain is meant to end in a plain value — step back and re-construct from `.parent` if an object is needed.

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

The error's composite stack keeps its three sections for async failures too. The `<-- creation of [ X ] traced -->` section is captured **at `new` time**: by the moment a rejection is wrapped, the call site has unwound from the call stack, so an error-time capture could only show rejection-processing frames. This new-time capture happens for every async construction — no `submitStack` opt-in needed — so the creation section always names the file and line that called `new`.

---

## Summary

| Pattern | Works? | Notes |
|---------|--------|-------|
| `define('Name', async function () { ... })` | ✅ | Standard async constructor — must `return this` |
| `define('Name', MyAsyncClass)` | ✅ | Native async class wrapped via `class extends` |
| `await new AsyncType()` | ✅ | Returns resolved instance (with `unchain: false`, the default) |
| `await new AsyncType()` with `unchain: true` | ✅ | A non-object resolution drops the chain — the value is the result |
| `await parent.AsyncSubType()` | ✅ | Correct subtype invocation pattern |
| `await new AsyncSubType()` | ❌ | Fails `strictChain` — no parent instance |
| Native `instanceof` through chain | ⚠️ | Follows mnemonica's graph, not native class hierarchy |
| `super()` returning Promise | ✅ | Standard JS; mnemonica's wrapper preserves it |
| `define('Name', () => { ... })` — arrow, method, bound fn | ❌ | Define-time error: must be a regular function or a class |
| `define('Name', function* () { ... })` — generators | ❌ | Define-time error: not supported as a constructor |
| `lazy(getter)` returning any of the rejected forms | ❌ | Same errors, at define time AND at every construction |
| Generators CONSUMING constructions (`yield new X()`) | ✅ | The yielded value is the instance; async generators even resolve un-awaited construction promises |

---

## Detection limits — why mnemonica does not support all function machinery

mnemonica classifies construct handlers with two cheap runtime facts only —
`constructor.name` and own `prototype` — and no `fn.toString()` (overhead,
and fragile under transpilers). That buys:

| Detection | Reliability |
|-----------|-------------|
| class vs function (`isClass`) | Partial — syntax-based, unaware of transpiled/polyfilled output |
| async vs sync (`constructor.name === 'AsyncFunction'`) | ✅ any async form (function, arrow, method) |
| `async function` vs `async () =>` | ❌ indistinguishable — accepted: async arrows take the async path; write `async function`, use the `no-arrow-this` ESLint plugin |
| sync arrow / method / bound function (no own `prototype`) | ✅ rejected at define time — the three forms are indistinguishable, all rejected with one readable error |
| generators / async generators | ✅ rejected at define time as constructor handlers; as CONSUMERS (`yield new X()`, `for await`) they fully work |
| async getters/setters | ❌ not distinguished — a getter returning an async function looks like a value |
| transpiled / polyfilled code | Partial — downleveling can rename constructors and erase generator identities (demonstrated: ts-jest at ES6 target turns `async function*` into a plain function); the runtime signals degrade gracefully to the readable errors above |

---

> **Key takeaway:** Async constructors in mnemonica work because mnemonica treats the constructor's return value — Promise or not — as the instance seed. The `class extends` wrapper ensures `super()` propagates the Promise, and mnemonica's async pipeline resolves it into a properly chained instance. Use `parent.AsyncChild()` for subtypes, not standalone `new AsyncChild()`. Write async constructors as `async function` and `return this`.
