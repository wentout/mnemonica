# Type-safe `lookup()` and `define()` — with or without `@mnemonica/tactica`

`mnemonica` has exactly **one runtime**. Every `define()` call registers into the
same type graph, and every `lookup()` resolves against it, no matter which API
style you use.

TypeScript, however, cannot see a type graph built by runtime calls. There are
**three ways** to hand the registry to the compiler, and they compose:

| Approach | Extra tooling | `new instance.SubType()` typed | Free `lookup()` typed | `@decorate()` typed |
|---|---|---|---|---|
| **Builder mode** (default) | **None** | Yes | No (unless bridged) | No |
| **Registry bridge** (`RegistryOf`) | One hand-written line | Yes | **Yes** | No |
| **Tactica** (codegen) | `npx tactica` build step | Yes | Yes | **Yes** |

> **Rule of thumb:** start with builder mode — zero dependencies, zero codegen,
> types work out of the box. Add the one-line bridge the moment you want free
> `lookup()` typed. Reach for Tactica when you need `@decorate()`, or when a
> large codebase already uses free `define()` calls everywhere.

---

## Every `define()` lands in the same collection

All of these call the **same function** and register into the same runtime
collection (`defaultTypes`, unless you pass another source explicitly):

```typescript
import { mnemonica, define, defaultTypes } from 'mnemonica';

mnemonica.define('User', handler);    // this === mnemonica → defaultTypes
define('User', handler);              // this === undefined → defaultTypes

const { define: define2 } = mnemonica;
define2('User', handler);             // same function, bare call → defaultTypes

defaultTypes.define('User', handler); // the collection itself, directly
```

The routing rule is one line in the source (`src/index.ts`): the free `define`
resolves to `defaultTypes` when called bare or on the `mnemonica` module
object, and to `this` when invoked on a types collection. Runtime behavior
never changes between these call styles — same type graph, same hooks, same
registry entries.

**What differs is purely compile-time.** Builder-style calls thread the
registry through *return types*, so `chain.lookup('User')` is typed without
any augmentation. The *free* `lookup('User')` at module scope, and
`@decorate()`, can only be typed through the global `TypeRegistry` interface —
which is what Tactica (or a hand-written file) populates. That split is the
only reason declaration merging exists in this library.

---

## Builder mode (default)

Import the module object or create a custom collection, then chain `.define()` or `.lazy()` calls. The returned object carries a local type registry.

```typescript
import { mnemonica } from 'mnemonica';

interface UserShape {
	name: string;
}

interface AdminShape extends UserShape {
	role: string;
}

const App = mnemonica
	.define('User', function (this: UserShape, data: { name: string }) {
		this.name = data.name;
	})
	// Names passed to a constructor's `.define()` are relative to that constructor.
	.define('Admin', function (this: AdminShape, data: { role: string }) {
		this.role = data.role;
	});

// `App.lookup('User')` is typed from the builder registry.
const User = App.lookup('User');
const user = new User({ name: 'Ada' });

// Subtypes are constructed from a parent instance.
const admin = new user.Admin({ role: 'root' });
```

### Custom collections

`createTypesCollection()` works the same way and is fully isolated from the default collection.

```typescript
import { createTypesCollection } from 'mnemonica';

const AppCollection = createTypesCollection()
	.define('User', function (this: UserShape, data: { name: string }) {
		this.name = data.name;
	})
	.define('Admin', function (this: AdminShape, data: { role: string }) {
		this.role = data.role;
	});

const User = AppCollection.lookup('User');
const user = new User({ name: 'Ada' });
const admin = new user.Admin({ role: 'root' });
```

### Lookup resolution on a constructor

A constructor's own `lookup()` resolves in two steps: **relative first, then
root fallback**. It searches the type's own subtypes (a relative path), and if
nothing matches it resolves the same string as an absolute path from the
collection root. These are all equivalent:

```typescript
const AdminA = App.lookup('User.Admin');           // absolute, via root fallback
const AdminB = App.lookup('User').lookup('Admin'); // root, then relative
const AdminC = App.lookup('Admin');                // works only if App has a descendant named Admin
```

Relative resolution wins when both could match: if a type has its own subtype
named `Admin`, `lookup('Admin')` returns that subtype, never a different
root-level `Admin`.

You can also look up a root constructor and call `.define()` on it directly:

```typescript
const User = App.lookup('User');

User.define('Guest', function (this: GuestShape, data: { token: string }) {
	this.token = data.token;
});
```

You can also use `.lazy()` when the constructor must be resolved through a
getter (for example, to break a circular dependency):

```typescript
const User = App.lookup('User');

const Guest = User.lazy('Guest', () => function (this: GuestShape, data: { token: string }) {
	this.token = data.token;
});
```

### Constructing subtypes

Subtypes must be created from a parent instance. Do not call `new` on a constructor returned by `lookup()` for a subtype.

```typescript
// OK
const user = new User({ name: 'Ada' });
const admin = new user.Admin({ role: 'root' });

// WRONG at runtime
const Admin = App.lookup('User.Admin');
const admin2 = new Admin({ role: 'root' }); // fails: no parent instance
```

Direct `new` on a constructor returned by `.define()` works for **root types** only. For subtypes the parent instance is required (or use `apply(parentInstance, Ctor, args)`). With `strictChain: true` (the default) the parent must be the immediate type; with `strictChain: false` ancestor instances further up the chain are also accepted.

---

## Multi-file usage: registry threading

**Yes — an exported builder value works across files.** Two reasons:

- **Runtime:** every chain registers into the same collection singleton
  (`defaultTypes`, or the one `createTypesCollection()` you share), so imports
  are irrelevant to what exists at runtime.
- **Compile time:** the registry rides in the *value's type*
  (`IDefinitorInstance<..., Registry, Path>`), and values cross files freely
  through `export` / `import`.

Split the chain through exports:

```typescript
// models/user.ts
import { mnemonica } from 'mnemonica';
export const User = mnemonica.define('User', function (this: UserShape, data: { name: string }) {
	this.name = data.name;
});

// models/admin.ts
import { User } from './user';
export const Admin = User.define('Admin', function (this: AdminShape, data: { role: string }) {
	this.role = data.role;
});
// Admin's type carries the accumulated registry: 'User' + 'User.Admin'

// anywhere.ts
import { Admin } from './models/admin';
const AdminCtor = Admin.lookup('User.Admin'); // typed
```

Rule: thread the chain through exports and keep imports tree-shaped (no
cycles). Each file sees exactly the types registered up to its point in the
chain.

---

## The registry bridge: `RegistryOf`

The builder registry is local to the value that carries it. If you also want
the **free** `lookup()` typed — without importing the builder everywhere — merge
the local registry into the global `TypeRegistry` with one hand-written line:

```typescript
// registry.ts
import type { RegistryOf } from 'mnemonica';
import type { App } from './models';

declare module 'mnemonica' {
	interface TypeRegistry extends RegistryOf<typeof App> {}
}
```

```typescript
// anywhere.ts — import './registry' once (side effect)
import './registry';
import { lookup } from 'mnemonica';

const Admin = lookup('User.Admin'); // fully typed, no Tactica
```

Why prefer this over hand-written augmentation (below): **single source of
truth**. The builder chain is the registry; the interface just re-exports it
into the global slot. Rename or restructure a type in the chain and the bridge
follows automatically — no second file to keep in sync, no codegen step.

Caveats:

- Keep the bridge in its own module (`registry.ts`). If a file both defines
  the chain and uses free `lookup()`, import order decides whether the
  augmentation is visible — a dedicated module avoids the question.
- The bridge cannot type `@decorate()` classes. A class decorator's return
  type never changes the class binding's declared type (TypeScript limitation,
  not mnemonica's), so decorated classes have no local registry to extract —
  that is what Tactica is for.

---

## Explicit source: `lookup(source, path)` and `define(source, name, handler)`

The free `lookup()` resolves against the global `TypeRegistry`. The free
`define()` resolves against the default collection. When you hold a builder
value and want the free-function style anyway, pass it as the first argument —
the registry is then inferred from the source, not from the global interface:

```typescript
import { lookup, define, lazy } from 'mnemonica';

// typed from App's registry, never a silent `TypeClass | undefined`
const Admin = lookup(App, 'User.Admin');

// same semantics as User.define('Guest', ...) — a subtype of User
const Guest = define(User, 'Guest', function (this: GuestShape, data: { token: string }) {
	this.token = data.token;
});

// same semantics as collection.define('NewRoot', ...) — a root type
const NewRoot = define(AppCollection, 'NewRoot', function (this: NewRootShape) { /* ... */ });

// lazy variants infer the registry from the source as well
const LazyGuest = lazy(User, 'Guest', () => function (this: GuestShape, data: { token: string }) {
	this.token = data.token;
});
```

Semantics follow the source object: a **collection** source defines a root
type, a **constructor** source defines a subtype. `lookup(source, path)`
resolves exactly like `source.lookup(path)` — relative first, root fallback.
The same source inference applies to `lazy(source, name?, getter, config?)`.

---

## Augmented mode (Tactica): for `@decorate()` and free-`define` codebases

If you use Tactica, you can write plain free functions and class decorators. Tactica scans your code and generates a `TypeRegistry` augmentation file.

```typescript
import { define, lookup, decorate } from 'mnemonica';

interface UserShape {
	name: string;
}

interface AdminShape extends UserShape {
	role: string;
}

// Tactica will add these to TypeRegistry automatically.
define('User', function (this: UserShape, data: { name: string }) {
	this.name = data.name;
});

define('User.Admin', function (this: AdminShape, data: { role: string }) {
	this.role = data.role;
});

// Now the free lookup is typed.
const Admin = lookup('User.Admin');
const admin = new Admin({ role: 'root' });
```

### What tactica generates

`npx tactica` scans your `define()` calls and writes a `.tactica/` directory:

- `types.ts` — instance types (nested shapes composed with `ProtoFlat<Parent, ...>`)
- `registry.ts` — the `TypeRegistry` augmentation; **this is the critical file**
- `index.ts` — re-exports
- `definitions.json`, `usages.json`, `flow.json` — metadata about your type graph and where types are instantiated

Registry keys are **dot-separated nested paths** — the same strings `lookup()` takes:

```typescript
// .tactica/registry.ts (generated)
declare module 'mnemonica' {
	interface TypeRegistry {
		'User'       : TypeConstructor<UserShape>;
		'User.Admin' : TypeConstructor<AdminShape>;
	}
}
```

`.tactica/` is output, not input. Never edit generated files — change the
`define()` call and re-run tactica.

### tsconfig setup

Declaration merging only works if TypeScript actually sees the generated
files. Put `.tactica/` in `include`:

```json
{
	"compilerOptions": {
		"module": "NodeNext",
		"moduleResolution": "NodeNext",
		"strict": true
	},
	"include": ["src/**/*", ".tactica/**/*"]
}
```

If `.tactica/` is missing from `include`, the augmentation is invisible:
`TypeRegistry` stays empty and free `lookup()` silently falls back to
`TypeClass | undefined`. This is the single most common tactica
misconfiguration.

### With `@decorate()`

> The canonical decorator guide is [`docs/decorate.md`](./decorate.md) —
> setup, examples, and the TypeØmatica integration live there. The short
> version:

```typescript
import { decorate } from 'mnemonica';

@decorate()
class User {
	name: string;
	constructor(data: { name: string }) {
		this.name = data.name;
	}
}

@decorate(User)
class Admin {
	role: string;
	constructor(data: { role: string }) {
		this.role = data.role;
	}
}

const AdminCtor = lookup('User.Admin');
```

> **Note:** `@decorate()` requires `TypeRegistry` augmentation (Tactica or
> hand-written). The builder API and the bridge cannot cover decorators,
> because TypeScript never applies a class decorator's return type to the
> class binding — there is no local registry to carry or extract.

---

## Hand-written `TypeRegistry` augmentation

If you are not using Tactica and the bridge does not fit (for example, types
defined only through free `define()` calls), you can write the augmentation
yourself.

```typescript
import type { TypeConstructor } from 'mnemonica';

declare module 'mnemonica' {
	interface TypeRegistry {
		'User': TypeConstructor<UserShape>;
		'User.Admin': TypeConstructor<AdminShape>;
	}
}
```

Once augmented, `lookup('User')` and `lookup('User.Admin')` resolve against `TypeRegistry` instead of falling back to `TypeClass | undefined`. For builder projects the `RegistryOf` bridge above is the same thing with one line and no duplication.

---

## Which type system wins when both are present?

Adding Tactica (or a bridge) to a project that already uses the builder API does **not** replace the builder's local type system. The systems are orthogonal and apply to different APIs.

| Call you write | Type system used | Why |
|---|---|---|
| `const App = mnemonica.define(...)` | Builder registry | The returned object carries its own type map. |
| `App.lookup('User')` | Builder registry | `lookup()` is a method on the builder object. |
| `lookup(App, 'User')` | Builder registry | The source argument carries the registry. |
| `new user.Admin(...)` | Builder registry | Subtypes are resolved from the instance's inferred chain type. |
| `define('User', ...)` free import | `TypeRegistry` augmentation | The free export has no local registry, so it relies on the global interface. |
| `lookup('User')` free import | `TypeRegistry` augmentation | Same as above — populated by Tactica, hand-written, or the `RegistryOf` bridge. |

So if you keep using `mnemonica.define(...)` after installing Tactica, **the builder types stay in control**. Tactica only becomes relevant when you switch to the free `define` / `lookup` imports or use `@decorate()`.

At runtime the results are identical. At compile time, TypeScript picks whichever type system matches the exact identifier you used. If two sources disagree on the same path, the mismatch surfaces only on the API that resolves against `TypeRegistry`.

---

## Why two typing mechanisms exist

The three paths above are built from **two** underlying mechanisms: a local registry carried in builder values, and the global `TypeRegistry` interface. It feels like there should be one type system. In an ideal world, every `define()` call would add its type to the same registry, and `lookup()` would always be typed. TypeScript does not allow that.

### The hard limitation

TypeScript cannot extend a global interface from inside a function signature. This code is impossible in TypeScript:

```typescript
function define<N extends string, T>(name: N, handler: (this: T) => void) {
    // There is no type-level statement that says:
    // "Add N to the global TypeRegistry interface."
    // The language simply does not have it.
}
```

Interfaces can only be extended by explicit declarations:

```typescript
declare module 'mnemonica' {
    interface TypeRegistry {
        'User': TypeConstructor<UserShape>;
    }
}
```

Function bodies, return types, and generic parameters cannot produce declarations. That is why Tactica generates them: it is a build-time tool that pretends to be a programmer who wrote all the augmentation blocks by hand. The `RegistryOf` bridge is the same declaration, written once, with its contents *computed* from the builder value instead of repeated by hand.

### What the builder mode can and cannot do

The builder mode solves the problem locally by carrying the registry in the returned object:

```typescript
const App = mnemonica.define('User', ...).define('Admin', ...);
// App's type is roughly { lookup: { User: ..., 'User.Admin': ... } }
```

This works because the function's return type can be computed from the generic parameters. The registry is local to the value — but the value can be exported, so the registry travels across files (registry threading), and it can be merged into the global interface (the `RegistryOf` bridge).

What it still cannot handle:

- **`@decorate()` classes** — a class decorator's return type never changes the class binding's declared type, so there is no channel for a local registry at all.

### What the augmented mode can and cannot do

The augmented mode uses the global `TypeRegistry` interface. It can handle:

- Free `define()` and `lookup()` anywhere in the project.
- `@decorate()` classes.
- Cross-file references because the interface is globally visible.

But it requires external tooling (Tactica) or a hand-written declaration (directly, or via the `RegistryOf` bridge). Without that, the interface is empty and free `lookup()` falls back to `TypeClass | undefined`.

### Why not unify them?

The split is a consequence of TypeScript's design, not mnemonica's. You cannot have one mechanism that covers all three cases:

1. Chained builder calls.
2. Free function calls.
3. Decorated classes.

So mnemonica exposes the builder API for case 1, the bridge and two-arg
overloads to connect cases 1 and 2, and the augmented API for cases 2 and 3.
The runtime is the same everywhere; only the way TypeScript discovers the
types differs.

---

## Common mistakes

Every one of these is a symptom of a missing or unused `TypeRegistry`
augmentation. The fix is never a cast.

### "I'll just cast it"

```typescript
// WRONG
const admin = new Admin({ role: 'root' }) as unknown as AdminShape;
```

You are fighting the type system instead of using it. Every cast is a bug
waiting to happen: if the type changes, the cast still compiles and breaks at
runtime. Fix the augmentation instead — bridge, tactica, or hand-written.

### "I'll import the generated types too"

```typescript
// WRONG
import { Admin } from './models/admin';
import type { AdminShape } from '../.tactica/types';
const admin = new Admin({ role: 'root' }) as unknown as AdminShape;
```

This imports the runtime constructor *and* the generated type, then bridges
them with a cast — twice the work and still unsafe. `lookup()` gives you both
in one call.

### "lookup only works inside handlers"

```typescript
// UNNECESSARY
app.get('/test', async () => {
	const Admin = lookup('User.Admin');
	const admin = new Admin({ role: 'root' });
});
```

`lookup()` is a runtime lookup, but it is deterministic. Calling it once at
module level is fine and cheaper:

```typescript
const Admin = lookup('User.Admin');

app.get('/test', async () => {
	const admin = new Admin({ role: 'root' });
});
```

### "I need the direct import for this other API"

```typescript
// WRONG — two references to the same object
import { Admin } from './models/admin';
const TypedAdmin = lookup('User.Admin');

app.decorate('Admin', Admin);            // direct import
const admin = new TypedAdmin({ ... });   // lookup
```

`import { Admin }` and `lookup('User.Admin')` return the **same constructor
object** at runtime. Use the looked-up one for everything.

### "I'll just edit the generated file"

`.tactica/` is output, not input. Hand edits are overwritten on the next run.
If a property is missing from the generated types, the `define()` call is the
source of truth — change it and re-run `npx tactica`. Forgetting to
regenerate after changing `define()` calls shows up as
`Object literal may only specify known properties` on valid code.

---

## Cheat sheet

| I want to... | Do this | Don't do this |
|---|---|---|
| Get a typed constructor (builder mode) | `const T = App.lookup('T')` | `import { T } from './models/T'` + cast |
| Get a typed constructor (augmented mode) | `const T = lookup('T')` | `import { T } from './models/T'` + cast |
| Get a typed constructor from a builder value | `lookup(App, 'T')` | `lookup('T') as any` |
| Create an instance | `new T({ ... })` | `new T({ ... }) as unknown as TShape` |
| Chain to a child type | `new instance.Child({ ... })` | `new (instance as any).Child({ ... })` |
| Type free `lookup()` without tactica | one-line `RegistryOf` bridge | a second registry file kept in sync by hand |
| Reuse one constructor everywhere | `const T = lookup('T')`, then use `T` | direct import for one API, `lookup()` for another |
| Add or rename a type (builder + bridge) | edit the chain — the bridge follows | edit a hand-written augmentation to match |
| Add or rename a type (tactica) | edit `define()` → re-run `npx tactica` | hand-edit `.tactica/` |
| Fix "Property does not exist" | check the augmentation / regenerate | add `as any` or `as unknown as` |

If you find yourself writing `as unknown as` with mnemonica types, you have
taken a wrong turn. Stop. Use `lookup`. Trust the registry.

---

## Summary

- **Default:** builder mode — `mnemonica.define(...)` or `createTypesCollection()`, `.lookup()` on the result. No tooling.
- **Multiple files:** thread the chain through exports; the registry type travels with the value.
- **Want free `lookup()` typed:** add the one-line `RegistryOf` bridge in a `registry.ts`.
- **Mixing styles:** `lookup(source, path)` / `define(source, name, handler)` infer the registry from the source value.
- **Need `@decorate()` typed:** use Tactica — it is the only path, and the reason is a TypeScript limitation, not a missing feature.
