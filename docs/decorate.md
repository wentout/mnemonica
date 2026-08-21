# `@decorate()` — class-based type definitions

`@decorate()` registers a class as a mnemonica type. At runtime it is exactly
equivalent to `define()` — the same constructor is registered, the same
prototype chain is built. It exists for codebases that prefer class syntax.

**This is not the default path.** `@decorate()` requires `TypeRegistry`
augmentation — [`@mnemonica/tactica`](https://www.npmjs.com/package/@mnemonica/tactica)
or a hand-written file — to be typed. If you are not using Tactica, use
[builder mode](./typed-lookup.md) instead.

---

## Why it needs Tactica

TypeScript never applies a class decorator's return type to the class binding's
declared type. Whatever `@decorate()` returns, the name you declared stays
plain `typeof YourClass` for every consumer — the enriched constructor type is
discarded at the decoration site. There is no channel for a local,
value-carried registry (which is what builder mode relies on), so the only way
to recover the types is the global `TypeRegistry` interface — and something
has to populate it. That something is Tactica: it scans your `@decorate()` and
`define()` calls and generates the augmentation for you.

For the full explanation of the type-system paths, see
[`docs/typed-lookup.md`](./typed-lookup.md).

## Setup

```bash
npm install mnemonica @mnemonica/tactica
npx tactica   # scans define()/decorate() calls, generates .tactica/
```

Enable decorators in `tsconfig.json`:

```json
{
	"compilerOptions": {
		"experimentalDecorators": true
	}
}
```

Import the generated augmentation once (e.g. in your entry file):

```typescript
import './.tactica/registry';
```

## Basic usage

```typescript
import { decorate, lookup } from 'mnemonica';

@decorate()
class UserType {
	name: string;
	email: string;
	constructor (data: { name: string; email: string }) {
		Object.assign(this, data);
	}
}

const user = new UserType({ name: 'John', email: 'john@example.com' });
```

## Subtypes: `@decorate(Parent)`

```typescript
@decorate(UserType)
class AdminType {
	role: string = 'admin';
}

// Subtypes are still constructed from a parent INSTANCE — same rule as define()
const admin = new user.AdminType();

admin.name; // 'John' (inherited)
admin.role; // 'admin' (own property)
```

## With configuration

```typescript
@decorate({ strictChain: false, blockErrors: true })
class ConfiguredClass {
	field: number = 123;
}

@decorate(UserType, { strictChain: false })
class ConfiguredChildClass {
	field: number = 123;
}
```

## Typed retrieval

Because the class binding itself stays untyped (see above), retrieve the typed
constructor through `lookup()` once Tactica has augmented the registry:

```typescript
const AdminCtor = lookup('UserType.AdminType');
```

**Advanced note:** after a class is decorated with `@decorate()`, it can be
used as a decorator for nested types (may require `@ts-ignore` due to
TypeScript limitations with callable class types).

## Combining with TypeØmatica

`@decorate()` composes with [`typeomatica`](https://www.npmjs.com/package/typeomatica)'s
`@Strict()` runtime type enforcement. Decorator order matters — `@Strict`
must be applied first (bottom position). See
[`docs/typeomatica.md`](./typeomatica.md) for the combined patterns.

## When not to use `@decorate()`

- **No Tactica in the project?** Use builder mode — typed with zero tooling.
- **Only a few types?** Builder mode plus the one-line `RegistryOf` bridge
  covers free `lookup()` too — see [`docs/typed-lookup.md`](./typed-lookup.md).
- **Class-heavy codebase already on Tactica?** Then `@decorate()` is the
  natural fit — that is what it is for.
