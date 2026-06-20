# The mnemonica + tactica Type-Safe Pattern

> **Project-agnostic reference.** This document applies to every project using mnemonica with tactica.
> Read it when you are tempted to write `as unknown as` with mnemonica types.

---

## Table of Contents

1. [The Runtime Reality: mnemonica Is a Trie](#1-the-runtime-reality-mnemonica-is-a-trie)
2. [The TypeScript Gap](#2-the-typescript-gap)
3. [How tactica Bridges the Gap](#3-how-tactica-bridges-the-gap)
4. [Declaration Merging: The TypeScript Mechanism](#4-declaration-merging-the-typescript-mechanism)
5. [tsconfig.json Setup](#5-tsconfigjson-setup)
6. [How lookup Works](#6-how-lookuptyped-works)
7. [Why Direct Import Fails](#7-why-direct-import-fails)
8. [The Epiphany: Zero-Cast Chaining](#8-the-epiphany-zero-cast-chaining)
9. [Common Mistakes](#9-common-mistakes)
10. [Cheat Sheet](#10-cheat-sheet)

---

## 1. The Runtime Reality: mnemonica Is a Trie

At runtime, mnemonica creates a **Trie data structure** of constructors.

```typescript
// You define a type
const RequestData = define('RequestData', function (this: {...}, data) {
	Object.assign(this, data);
});

// You define a child type
const RouteData = RequestData.define('RouteData', function (this: {...}, data) {
	Object.assign(this, data);
});
```

What exists at runtime:

```
RequestData (constructor)
├── RouteData (sub-constructor, accessible as RequestData.RouteData)
│   ├── PageData (sub-constructor)
│   │   ├── RenderData (sub-constructor)
│   │   │   └── ResponseData (sub-constructor)
```

When you call `new RequestData(data)`, mnemonica:
1. Creates an instance with the prototype chain set
2. Attaches every sub-constructor as a property on the instance
3. The instance itself can spawn children: `new requestData.RouteData(data)`

**This is runtime behavior.** It works in JavaScript without any TypeScript involvement.

---

## 2. The TypeScript Gap

TypeScript does **not** know about the Trie structure by default.

When you write:

```typescript
import { RequestData } from './collections/requestTypes.js';
const requestData = new RequestData({ method: 'GET', url: '/' });
```

TypeScript sees `RequestData` as a constructor function returned by `define()`. It knows the return type is `RequestData` (the instance type), but it does **not** know that:
- `RequestData` has a `.RouteData` property
- The instance `requestData` has a `.RouteData` sub-constructor
- `.RouteData` returns an instance with `.PageData`
- And so on through the chain

So when you write:

```typescript
const routeData = new requestData.RouteData({ pagePath: '/' });
```

TypeScript complains: `Property 'RouteData' does not exist on type 'RequestData'`.

This is the gap: **mnemonica knows about the Trie, but TypeScript doesn't.**

---

## 3. How tactica Bridges the Gap

tactica is an AST analyzer. It scans your codebase for `define()` calls and understands:
- The type name (`'RequestData'`)
- The parent type (if any)
- The `this` properties
- The constructor parameters
- The full inheritance chain

It generates two files in `.tactica/`:

### 3.1 `.tactica/types.ts`

Contains the instance types:

```typescript
export type RequestData = {
	method: string;
	url: string;
	query: Record<string, unknown>;
	// ...
};

export type RequestData_RouteData = ProtoFlat<RequestData, {
	pagePath: string;
	isMain: boolean;
	deep: string;
}>;
```

`ProtoFlat<A, B>` merges the properties of parent `A` and child `B`.

### 3.2 `.tactica/registry.ts`

Contains the **TypeRegistry augmentation**:

```typescript
declare module 'mnemonica' {
	interface TypeRegistry {
		'RequestData': new (...args: unknown[]) => RequestData;
		'RequestData_RouteData': new (...args: unknown[]) => RequestData_RouteData;
		'RequestData_RouteData_PageData': new (...args: unknown[]) => RequestData_RouteData_PageData;
		// ... every type in every chain
	}
}
```

**This is the critical file.** It teaches TypeScript about the constructors.

---

## 4. Declaration Merging: The TypeScript Mechanism

To understand why `.tactica/registry.ts` works, you need to understand **TypeScript declaration merging**.

### 4.1 What Is Declaration Merging?

TypeScript allows multiple declarations with the same name to be **merged** into a single definition:

```typescript
// File A.ts
interface Person {
	name: string;
}

// File B.ts
interface Person {
	age: number;
}

// Result: Person has both name and age
const p: Person = { name: 'Alice', age: 30 }; // OK
```

This works for:
- Interfaces (merged member-wise)
- Namespaces (merged member-wise)
- Classes with namespaces
- **Module augmentations** ← this is what tactica uses

### 4.2 Module Augmentation

You can augment an existing module's exports using `declare module`:

```typescript
// Original module
// node_modules/some-lib/index.d.ts
export interface Config {
	timeout: number;
}

// Your augmentation
// src/augmentation.ts
declare module 'some-lib' {
	interface Config {
		retries: number;
	}
}

// Now Config has both timeout and retries
```

### 4.3 How tactica Uses It

mnemonica core defines an empty `TypeRegistry`:

```typescript
// In mnemonica core (src/index.ts)
export interface TypeRegistry {
	// Intentionally empty. Augment via declaration merging.
}
```

tactica generates:

```typescript
// In .tactica/registry.ts
declare module 'mnemonica' {
	interface TypeRegistry {
		'RequestData': TypeConstructor<RequestData>;
	}
}
```

After this augmentation, `TypeRegistry` contains the `'RequestData'` key. Any code that imports from `'mnemonica'` sees the augmented `TypeRegistry`.

### 4.4 Why an Empty `TypeRegistry`?

The base `TypeRegistry` is intentionally empty:

```typescript
export interface TypeRegistry {}
```

Without augmentation, `lookup('Something')` falls back to the broad `TypeClass | undefined` return type. This keeps the library usable without a registry while still allowing full type inference once you augment it.

Once augmented:

```typescript
declare module 'mnemonica' {
	interface TypeRegistry {
		'RequestData': TypeConstructor<RequestData>;
	}
}

const RequestData = lookup('RequestData'); // typed constructor
```

---

## 5. tsconfig.json Setup

For declaration merging to work, the `.tactica/registry.ts` file must be included in your TypeScript compilation.

### 5.1 Required Configuration

```json
{
	"compilerOptions": {
		"module": "NodeNext",
		"moduleResolution": "NodeNext",
		"strict": true,
		"esModuleInterop": true
	},
	"include": [
		"src/**/*",
		".tactica/**/*"
	]
}
```

**Critical points:**

1. **`.tactica` must be in `include`** — Otherwise TypeScript never sees the augmentation.

2. **`strict: true`** — Ensures the type system is fully active.

3. **`moduleResolution: "NodeNext"`** — Required for modern ESM resolution with `.js` extensions.

### 5.2 Why `include` Matters

TypeScript only processes files in the `include` array. If `.tactica/` is not included:

```typescript
import { lookup } from 'mnemonica';
const RequestData = lookup('RequestData');
// RequestData is typed as TypeClass | undefined instead of the concrete constructor
```

Because without the augmentation, `TypeRegistry` is empty and `lookup()` falls back to its unaugmented overload.

---

## 6. How lookup Works

### 6.1 Runtime Behavior

```typescript
// In mnemonica core (src/index.ts)
export function lookup<const K extends keyof TypeRegistry>(
	this: unknown,
	TypeNestedPath: K
): TypeRegistry[K];
export function lookup(
	this: unknown,
	TypeNestedPath: string
): TypeClass | undefined {
	// Runtime delegates to types.lookup()
	const types = checkThis(this) ? defaultTypes : this || defaultTypes;
	return types.lookup(TypeNestedPath);
}
};
```

At runtime, `lookup('RequestData')`:
1. Calls `types.lookup('RequestData')`
2. Searches the default types collection
3. Returns the constructor function

**This is the same constructor as the direct import.** No difference at runtime.

### 6.2 Compile-Time Behavior

At compile time, TypeScript sees:

```typescript
const RequestData = lookup('RequestData');
```

TypeScript infers:
- `K` = `'RequestData'` (literal type, thanks to `const`)
- `keyof TypeRegistry` = all registered type names
- `TypeRegistry['RequestData']` = `new (...args: unknown[]) => RequestData`

So `RequestData` has type `new (...args: unknown[]) => RequestData`.

When you then write:

```typescript
const requestData = new RequestData({ method: 'GET', url: '/' });
```

TypeScript knows `requestData` is of type `RequestData` (the instance type).

### 6.3 The Constructor Has Sub-Constructors

But here's the key: the `.tactica/types.ts` file also defines the instance type to have sub-constructors:

```typescript
// This is part of how ProtoFlat and the generated types work
// The RequestData instance type KNOWS it has .RouteData
```

When TypeScript sees:

```typescript
const routeData = new requestData.RouteData({ pagePath: '/' });
```

It checks the type of `requestData` → `RequestData`.
It checks if `RequestData` has `.RouteData` → Yes, in the generated type.
It checks the constructor signature → `new (...args: unknown[]) => RequestData_RouteData`.

**No cast needed.** TypeScript believes you because the type system was told the truth.

---

## 7. Why Direct Import Fails

Let's trace what happens with direct import vs `lookup`.

### 7.1 Direct Import

```typescript
import { RequestData } from './collections/requestTypes.js';
//          ↑
//          TypeScript sees: typeof RequestData (the constructor)
//          It knows: new (...args: unknown[]) => RequestData
//          It does NOT know: RequestData.RouteData exists

const requestData = new RequestData({ ... });
// TypeScript: requestData is RequestData

const routeData = new requestData.RouteData({ ... });
// TypeScript ERROR: Property 'RouteData' does not exist on type 'RequestData'
```

The direct import returns the constructor, but TypeScript's type for that constructor doesn't include `.RouteData`. The `define()` function's return type is not augmented with sub-constructor information.

### 7.2 lookup

```typescript
import { lookup } from 'mnemonica';

const RequestData = lookup('RequestData');
//          ↑
//          TypeScript sees: TypeRegistry['RequestData']
//          Which is: new (...args: unknown[]) => RequestData
//          PLUS the instance type RequestData knows about .RouteData

const requestData = new RequestData({ ... });
// TypeScript: requestData is RequestData

const routeData = new requestData.RouteData({ ... });
// TypeScript: OK! RouteData is a known property of RequestData instance
```

The difference is not in the runtime object. The difference is in **TypeScript's compile-time knowledge**.

---

## 8. The Epiphany: Zero-Cast Chaining

The complete pattern, end to end:

### Step 1: Define

```typescript
// src/collections/requestTypes.ts
import { define } from 'mnemonica';

export const RequestData = define('RequestData', function (
	this: { method: string; url: string },
	data: { method: string; url: string }
) {
	Object.assign(this, data);
});

export const RouteData = RequestData.define('RouteData', function (
	this: { pagePath: string },
	data: { pagePath: string }
) {
	Object.assign(this, data);
});
```

### Step 2: Generate

```bash
npx tactica --esm --verbose
```

Creates:
- `.tactica/types.ts` — instance types
- `.tactica/registry.ts` — TypeRegistry augmentation

### Step 3: Lookup

```typescript
// src/server.ts or any file
import { lookup } from 'mnemonica';

const RequestData = lookup('RequestData');
```

### Step 4: Chain (Zero Casts)

```typescript
const requestData = new RequestData({ method: 'GET', url: '/' });
const routeData = new requestData.RouteData({ pagePath: '/' });
const pageData = new routeData.PageData({ header: {...}, content: '' });
// ... and so on
```

**Every `.SubType` access is fully typed.** TypeScript knows:
- The constructor signature
- The instance properties
- The next sub-constructor in the chain

---

## 9. Common Mistakes

### 9.1 "I'll just cast it"

```typescript
// ❌ WRONG
const requestData = new RequestData({ ... }) as unknown as RequestDataT;
```

**Why wrong:** You are fighting the type system instead of using it. Every cast is a bug waiting to happen. If the type changes, the cast still compiles but may break at runtime.

**Fix:** Use `lookup`.

### 9.2 "I'll import the generated types too"

```typescript
// ❌ WRONG
import { RequestData } from './collections/requestTypes.js';
import type { RequestData as RequestDataT } from '../../.tactica/types.js';
const requestData = new RequestData({ ... }) as unknown as RequestDataT;
```

**Why wrong:** You are importing both the runtime constructor AND the generated type, then bridging them with a cast. This is twice the work and still unsafe.

**Fix:** Use `lookup` — it gives you both the runtime constructor AND the type in one call.

### 9.3 "lookup only works in route handlers"

```typescript
// ❌ WRONG (unnecessary)
app.get('/test', async () => {
	const RequestData = lookup('RequestData');
	const requestData = new RequestData({ ... });
});
```

**Why wrong:** `lookup` is a runtime lookup, but it's deterministic and cached. Calling it at module level is perfectly fine and more efficient:

```typescript
// ✅ CORRECT
const RequestData = lookup('RequestData');

app.get('/test', async () => {
	const requestData = new RequestData({ ... });
});
```

### 9.4 "I need to import the constructor for decoration"

```typescript
// ❌ WRONG (mixing patterns)
import { RequestData } from './collections/requestTypes.js';
const TypedRequestData = lookup('RequestData');

app.decorate('RequestData', RequestData);  // direct import
const requestData = new TypedRequestData({ ... });  // lookup
```

**Why wrong:** You're maintaining two references to the same object.

**Fix:** Use `lookup` for everything. The returned constructor is the same object:

```typescript
// ✅ CORRECT
const RequestData = lookup('RequestData');

app.decorate('RequestData', RequestData);
const requestData = new RequestData({ ... });
```

### 9.5 Forgetting to regenerate

```typescript
// You add a new property to the define() call
// But forget to run tactica
const RequestData = lookup('RequestData');
const requestData = new RequestData({ newField: 'value' });
// Error: Object literal may only specify known properties
```

**Fix:** Always regenerate after modifying `define()` calls:

```bash
npm run tactica
```

---

## 10. Cheat Sheet

| I want to... | Do this | Don't do this |
|---|---|---|
| Get a typed constructor | `const T = lookup('T')` | `import { T } from './collections/T.js'` |
| Create an instance | `new T({ ... })` | `new T({ ... }) as unknown as TT` |
| Chain to a child type | `new instance.Child({ ... })` | `new (instance as any).Child({ ... })` |
| Decorate Fastify | `app.decorate('T', T)` with `lookup` | Direct import + separate lookup |
| Add a new property | Modify `define()` → run `tactica` | Modify `define()` + manual cast |
| Fix "Property does not exist" | Run `tactica` to regenerate | Add `as any` or `as unknown` |

### Build Commands

```bash
# Regenerate types after modifying define() calls
npm run tactica

# Verify everything compiles
npx tsc --noEmit

# Verify linting
npx eslint src/

# Run tests
npx vitest run
```

---

## Trust

This pattern works because:

1. **mnemonica creates a Trie at runtime** — sub-constructors exist, instances can spawn children
2. **tactica teaches TypeScript about the Trie** — via declaration merging of `TypeRegistry`
3. **lookup retrieves the typed constructor** — compile-time type safety + runtime correctness
4. **The same object is returned either way** — `import { T }` and `lookup('T')` are identical at runtime

**The only difference is TypeScript's knowledge.** Use `lookup` and let TypeScript help you.

If you find yourself writing `as unknown as` with mnemonica types, **you have taken a wrong turn.** Stop. Use `lookup`. Trust the registry.
