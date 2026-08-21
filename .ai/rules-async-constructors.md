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

---

## Symbol.hasInstance — Nominal Typing by Name

Mnemonica replaces standard JS `instanceof` with **nominal typing** checked by `getTypeChecker` (`src/api/utils/index.ts`):

```ts
const getTypeChecker = (TypeName: string) => {
	return (instance: object) => {
		if (Reflect.getPrototypeOf(instance).constructor.name === 'Promise') {
			return instance[SymbolConstructorName] === TypeName;
		}
		const constructors = collectConstructors(instance);
		return constructors[TypeName] || false;
	};
};
```

`collectConstructors` (`src/utils/collectConstructors.ts`) walks the prototype chain upward, collecting `constructor.name` values into a lookup object like `{ AsyncInitParent: true, AsyncInitChild: true, Mnemonica: true, Object: true }`. It stops at `Mnemonica`.

Three places define `Symbol.hasInstance`:

1. **`TypeDescriptor.prototype`** (`src/api/types/index.ts`) — for `instanceof TypeName` where `TypeName` is what `define()` returned
2. **`Mnemosyne.prototype`** (`src/api/types/Mnemosyne.ts`) — for `instanceof` checks on the instance itself
3. **`makeSubTypeProxy`** (`src/api/types/Mnemosyne.ts`) — for subtype access like `parent.SubType()`

### Impact on Pre-existing Class Hierarchies

When passing a pre-existing class hierarchy (`class Extended extends Base`) to `define()`:

- **Top-level** `define('PreExt', Extended)`: `PreExt.prototype === Extended.prototype`. Both `instanceof PreExt` and `instanceof Extended` work.
- **Sub-type** `Root.define('Sub', Extended)`: mnemonica's subtype wiring inserts the parent type (`Root`) into the instance chain **before** `Extended.prototype`. Standard JS `instanceof Extended` returns **false**, but mnemonica's `instanceof Sub` and `instanceof Root` still work because `collectConstructors` finds their names.

---

## Test Suite

`test_async/index.js` is a historical record — **not part of the published
package** — but it still runs via `npm run test:async_init`, and the scenarios
it covered are preserved in the historical appendix at the end of this file.

### Acronyms

- **WOReturn** = **W**ith**O**ut **Return** — Promise resolves to `undefined` instead of `this`
- **NAR** = **N**o **A**wait **R**eturn** — `awaitReturn: false` disables the guard

### Coverage Items

1. **WOReturn guard for classes** — async class constructor returning Promise without `this` throws `WRONG_MODIFICATION_PATTERN`
2. **NAR bypass** — `awaitReturn: false` allows the same without throwing
3. **Field inheritance through mnemonica chain** — parent/child fields preserved across async constructors
4. **Pre-existing class hierarchy at top-level** — `define('Type', ExtendedClass)` preserves fields and `instanceof` against original classes
5. **Pre-existing class hierarchy as sub-type** — sub instance gets root fields + class hierarchy fields, but standard JS `instanceof` against original classes is broken (mnemonica `instanceof` still works)

### Relevant Source Files

- `src/api/types/compileNewModificatorFunctionBody.ts` — wrapper class creation
- `src/api/utils/index.ts` — `getTypeChecker`
- `src/utils/collectConstructors.ts` — prototype chain walker
- `src/api/types/Mnemosyne.ts` — `Symbol.hasInstance` on instances and sub-type proxy
- `src/api/types/index.ts` — `Symbol.hasInstance` on `TypeDescriptor.prototype`
- `src/api/types/InstanceCreator.ts` — async routing via `makeAwaiter`

### Historical appendix: the `test_async` scenarios

> **Historical record.** The examples below document what the unshipped
> `test_async` suite covered. They are kept for reference, not as living
> documentation of current behavior.

Async class constructors that resolve `this` keep fields and chain identity:

```js
const AsyncInitParent = define('AsyncInitParent', class {
	parentField = 'parent-field';
	constructor () {
		return new Promise((resolve) => {
			setTimeout(() => resolve(this), 10);
		});
	}
});

const AsyncInitChild = AsyncInitParent.define('AsyncInitChild', class {
	childField = 'child-field';
	constructor () {
		return new Promise((resolve) => {
			setTimeout(() => resolve(this), 10);
		});
	}
});

const parent = await new AsyncInitParent();
const child = await parent.AsyncInitChild();
child.parentField; // 'parent-field' — inherited through the async chain
child.childField;  // 'child-field'
```

An async constructor that resolves `undefined` throws by default;
`awaitReturn: false` disables the guard:

```js
const AsyncInitWOReturn = define('AsyncInitWOReturn', class {
	constructor () {
		return new Promise((resolve) => {
			setTimeout(() => resolve(), 10); // resolves undefined → throws
		});
	}
});

define('AsyncInitWOReturnNAR', class {
	constructor () {
		return new Promise((resolve) => {
			setTimeout(() => resolve(), 10);
		});
	}
}, { awaitReturn: false }); // resolves undefined → no throw
```

A pre-existing class hierarchy can serve as the construct handler, at the
top level or as a subtype:

```js
class AsyncInitBaseClass {
	baseField = 'base-field';
}

class AsyncInitExtendedClass extends AsyncInitBaseClass {
	extField = 'ext-field';
	constructor () {
		super();
		return new Promise((resolve) => {
			setTimeout(() => resolve(this), 10);
		});
	}
}

// top level: instanceof works against BOTH the mnemonica type
// and the original classes
const AsyncInitPreExtended = define('AsyncInitPreExtended', AsyncInitExtendedClass);

// as a subtype of a root type (AsyncInitRooted, defined as above):
// fields are inherited and mnemonica instanceof works, but plain JS
// instanceof against the original classes is broken
const AsyncInitRootedSub = AsyncInitRooted.define('AsyncInitRootedSub', AsyncInitExtendedClass);
```

### Related

- [TC39 proposal-async-init issue #3](https://github.com/tc39/proposal-async-init/issues/3) — language-level discussion of the same problem
