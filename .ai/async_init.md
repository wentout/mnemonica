# Async Class Constructor Support in Mnemonica

## Context

JavaScript class constructors cannot be declared `async`. However, a constructor **can return a Promise**. When a base class constructor returns `Promise.resolve(this)`, the subclass `this` becomes the Promise object — class fields initialize on the Promise wrapper, not the real instance. This breaks field inheritance in raw JS.

Mnemonica handles this correctly through its wrapper architecture. See also the [test suite](../test_async/index.js) showing the problem and wrapper fix in practice.

## How Mnemonica Preserves Class Fields

In `src/api/types/compileNewModificatorFunctionBody.ts:54-66`:

```ts
const getClassConstructor = (ConstructHandler, CreationHandler) => {
	return class extends ConstructHandler {
		constructor(...args) {
			const answer = super(...args);  // user class runs, fields init on REAL this
			const result = CreationHandler.call(this, answer);
			return result;
		}
	};
};
```

The **wrapper class** (not the user class) is the subclass in JS's class hierarchy. When `super()` runs the user constructor, fields like `childField = 'value'` initialize on the wrapper's `this`. If the user constructor returns a Promise, `CreationHandler` processes it via `makeAwaiter`, but the fields are already on the correct object.

**Key finding:** Class fields survive async initialization in mnemonica because the wrapper ensures they initialize on the real instance before the Promise is returned.

## `Symbol.hasInstance` — Nominal Typing by Name

Mnemonica replaces standard JS `instanceof` with **nominal typing** checked by `getTypeChecker` (`src/api/utils/index.ts:37`):

```ts
const getTypeChecker = (TypeName: string) => {
	return (instance: object) => {
		// For Promise-returning constructors, check SymbolConstructorName directly
		if (Reflect.getPrototypeOf(instance).constructor.name === 'Promise') {
			return instance[SymbolConstructorName] === TypeName;
		}
		// Normal case: walk prototype chain collecting constructor names
		const constructors = collectConstructors(instance);
		return constructors[TypeName] || false;
	};
};
```

`collectConstructors` (`src/utils/collectConstructors.ts`) walks the prototype chain upward, collecting `constructor.name` values into a lookup object like `{ AsyncInitParent: true, AsyncInitChild: true, Mnemonica: true, Object: true }`. It stops at `Mnemonica`.

Three places define `Symbol.hasInstance`:

1. **`TypeDescriptor.prototype`** (`src/api/types/index.ts:210`) — for `instanceof TypeName` where `TypeName` is what `define()` returned
2. **`Mnemosyne.prototype`** (`src/api/types/Mnemosyne.ts:381`) — for `instanceof` checks on the instance itself
3. **`makeSubTypeProxy`** (`src/api/types/Mnemosyne.ts:205`) — for subtype access like `parent.SubType()`

### Why This Matters for Pre-existing Class Hierarchies

When passing a pre-existing class hierarchy (`class Extended extends Base`) to `define()`:

- **Top-level** `define('PreExt', Extended)`: `PreExt.prototype === Extended.prototype`. The instance chain includes `Extended.prototype` and `Base.prototype`. Both `instanceof PreExt` and `instanceof Extended` work.
- **Sub-type** `Root.define('Sub', Extended)`: `Sub.prototype === Extended.prototype` is still true, BUT mnemonica's subtype wiring inserts the parent type (`Root`) into the instance chain **before** `Extended.prototype`. The original class hierarchy is skipped for standard JS `instanceof`, but mnemonica's name-based `getTypeChecker` still recognizes it because `collectConstructors` sees the names in the chain.

Actually — correction: in the sub-type case, standard JS `instanceof Extended` returns **false** because the prototype chain is wired to `Root`, not `Extended.prototype`. But mnemonica's `instanceof Sub` and `instanceof Root` still work because `collectConstructors` finds their names.

## Test Suite

Tests live in `test_async/index.js` and run via `npm run test:async_init`.

### Acronyms Used

- **WOReturn** = **W**ith**O**ut **Return** — Promise resolves to `undefined` instead of `this`
- **NAR** = **N**o **A**wait **R**eturn** — `awaitReturn: false` disables the guard

### Test Coverage

1. **WOReturn guard for classes** — async class constructor returning Promise without `this` throws `WRONG_MODIFICATION_PATTERN`
2. **NAR bypass** — `awaitReturn: false` allows the same without throwing
3. **Field inheritance through mnemonica chain** — parent/child fields preserved across async constructors
4. **Pre-existing class hierarchy at top-level** — `define('Type', ExtendedClass)` preserves fields and `instanceof` against original classes
5. **Pre-existing class hierarchy as sub-type** — root type defines sub-type using `ExtendedClass`; sub instance gets root fields + class hierarchy fields, but standard JS `instanceof` against original classes is broken (mnemonica `instanceof` still works)

## Relevant Source Files

- `src/api/types/compileNewModificatorFunctionBody.ts` — wrapper class creation
- `src/api/utils/index.ts` — `getTypeChecker`
- `src/utils/collectConstructors.ts` — prototype chain walker
- `src/api/types/Mnemosyne.ts` — `Symbol.hasInstance` on instances and sub-type proxy
- `src/api/types/index.ts` — `Symbol.hasInstance` on `TypeDescriptor.prototype`
- `src/api/types/InstanceCreator.ts` — async routing via `makeAwaiter`

## Related

- [`test_async/index.js`](../test_async/index.js) — test suite covering async initialization scenarios
- [TC39 proposal-async-init issue #3](https://github.com/tc39/proposal-async-init/issues/3) — language-level discussion of the same problem
- [Mnemonica README](../README.md) — project overview and API documentation
