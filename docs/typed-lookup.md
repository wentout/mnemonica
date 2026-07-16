# Type-safe lookup with or without `@mnemonica/tactica`

`mnemonica` exposes two different type-system paths for the same runtime API.

- **Builder mode** — chain `.define()` on a collection object. No augmentation, no Tactica.
- **Augmented mode** — use free `define()` / `lookup()` or `@decorate()`, and let Tactica (or a hand-written file) populate the global `TypeRegistry`.

At runtime the two modes are identical. The only difference is where TypeScript looks up the types.

| Approach | Needs `TypeRegistry` augmentation | Works with `@decorate()` | Instance subtypes typed | Best for |
|---|---|---|---|---|
| Builder mode (`mnemonica.define(...)` or `createTypesCollection()`) | **No** | No | Yes, via `lookup()` | Projects that do not use Tactica |
| Augmented mode (`import { define, lookup } from 'mnemonica'`) | Yes (Tactica or hand-written) | Yes | Yes, via `TypeRegistry` | Projects using Tactica |

> **Rule of thumb:** if you are not using Tactica, import `mnemonica` or `createTypesCollection()` and chain `.define()` on that object. Do not use the free `define()` / `lookup()` exports if you want typed lookups without augmentation.

---

## Builder mode (no Tactica)

Import the module object or create a custom collection, then chain `.define()` calls. The returned object carries a local type registry.

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

### Relative lookup on a constructor

A constructor's own `lookup()` is relative to its type path. These two are equivalent:

```typescript
const AdminA = App.lookup('User.Admin');
const AdminB = App.lookup('User').lookup('Admin');
```

You can also look up a root constructor and call `.define()` on it directly:

```typescript
const User = App.lookup('User');

User.define('Guest', function (this: GuestShape, data: { token: string }) {
	this.token = data.token;
});
```

### Do not mix free `lookup()` with the builder

The imported `lookup()` function resolves against the **global** `TypeRegistry`, not against a builder object's local registry.

```typescript
import { lookup } from 'mnemonica';

const UserA = App.lookup('User');          // typed from the builder registry
const UserB = lookup('User');              // TypeClass | undefined unless TypeRegistry is augmented
```

### Constructing subtypes

Subtypes must be created from a parent instance. Do not call `new` on a constructor returned by `lookup()` for a subtype.

```typescript
// OK
const user = new User({ name: 'Ada' });
const admin = new user.Admin({ role: 'root' });

// WRONG at runtime
const Admin = App.lookup('Admin');
const admin2 = new Admin({ role: 'root' }); // fails: no parent instance
```

Direct `new` on a constructor returned by `.define()` works for **root types** only. For subtypes the parent instance is required. With `strictChain: true` (the default) the parent must be the immediate type; with `strictChain: false` ancestor instances further up the chain are also accepted.

---

## Augmented mode (with Tactica)

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

### With `@decorate()`

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

> **Note:** `@decorate()` still relies on `TypeRegistry` augmentation. The builder API does not cover decorators because decorators cannot carry a local registry across independent class declarations.

---

## Advanced: hand-written `TypeRegistry` augmentation

If you are not using Tactica but still want free `lookup()` / `@decorate()` typed, you can write the augmentation yourself.

```typescript
import type { TypeConstructor } from 'mnemonica';

declare module 'mnemonica' {
	interface TypeRegistry {
		'User': TypeConstructor<UserShape>;
		'User.Admin': TypeConstructor<AdminShape>;
	}
}
```

Once augmented, `lookup('User')` and `lookup('User.Admin')` resolve against `TypeRegistry` instead of falling back to `TypeClass | undefined`.

---

## Which type system wins when both are present?

Adding Tactica to a project that already uses the builder API does **not** replace the builder's local type system. The two systems are orthogonal and apply to different APIs.

| Call you write | Type system used | Why |
|---|---|---|
| `const App = mnemonica.define(...)` | Builder registry | The returned object carries its own type map. |
| `App.lookup('User')` | Builder registry | `lookup()` is a method on the builder object. |
| `new user.Admin(...)` | Builder registry | Subtypes are resolved from the instance's inferred chain type. |
| `define('User', ...)` free import | `TypeRegistry` augmentation | The free export has no local registry, so it relies on the global interface. |
| `lookup('User')` free import | `TypeRegistry` augmentation | Same as above. |

So if you keep using `mnemonica.define(...)` after installing Tactica, **the builder types stay in control**. Tactica only becomes relevant when you switch to the free `define` / `lookup` imports or use `@decorate()`.

At runtime the results are identical. At compile time, TypeScript picks whichever type system matches the exact identifier you used. If the two systems disagree on the same path, the mismatch will surface only on the API that resolves against `TypeRegistry`.

---

## Why two type systems exist

It feels like there should be one type system. In an ideal world, every `define()` call would add its type to the same registry, and `lookup()` would always be typed. TypeScript does not allow that.

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

Function bodies, return types, and generic parameters cannot produce declarations. That is why Tactica generates them: it is a build-time tool that pretends to be a programmer who wrote all the augmentation blocks by hand.

### What the builder mode can and cannot do

The builder mode solves the problem locally by carrying the registry in the returned object:

```typescript
const App = mnemonica.define('User', ...).define('Admin', ...);
// App's type is roughly { lookup: { User: ..., Admin: ... } }
```

This works because the function's return type can be computed from the generic parameters. The registry is local, not global.

But the builder mode cannot handle everything:

- **Free `define()` calls** — a standalone `define('User', ...)` has no object to carry the registry.
- **`@decorate()` classes** — decorators are independent declarations. They cannot chain on a shared object.
- **Cross-file type references** — the builder registry is tied to the variable where the chain was built.

### What the augmented mode can and cannot do

The augmented mode uses the global `TypeRegistry` interface. It can handle:

- Free `define()` and `lookup()` anywhere in the project.
- `@decorate()` classes.
- Cross-file references because the interface is globally visible.

But it requires external tooling (Tactica) or hand-written augmentation. Without that, the interface is empty and free `lookup()` falls back to `TypeClass | undefined`.

### Why not unify them?

The two systems are a consequence of TypeScript's design, not mnemonica's. You cannot have one system that covers all three cases:

1. Chained builder calls.
2. Free function calls.
3. Decorated classes.

To cover all three, mnemonica exposes:

- The builder API for case 1.
- The augmented API for cases 2 and 3.

The runtime is the same. The difference is only in how TypeScript discovers the types.

---

## Summary

- **No Tactica?** Use `mnemonica.define(...)` or `createTypesCollection()`, and use `.lookup()` on that object.
- **Using Tactica?** Use `import { define, lookup } from 'mnemonica'` or `@decorate()`, and let Tactica generate `TypeRegistry`.
- **Mixing is fine at runtime**, but the type systems are separate. If you use the builder API, do not expect the free `lookup()` function to be typed by it.
