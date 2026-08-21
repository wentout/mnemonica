---
name: mnemonica-define-patterns
description: |
  Patterns for defining types and subtypes with mnemonica's define() function.
  Use when the user asks about define(), creating types, subtype inheritance,
  strictChain, blockErrors, awaitReturn, or type configuration options.
metadata:
  tags: [mnemonica, define, types, subtypes, inheritance]
---

# Define Patterns

## The define() Function

`define(TypeName, constructHandler, config?)` creates a constructor with prototype
chain inheritance. The constructor has additional methods: `.define()`, `.lazy()`,
`.decorate()`, `.lookup()`, `.registerHook()`.

```typescript
const MyType = define('MyType', function (this: MyType, data: Data) {
	Object.assign(this, data);
});

const SubType = MyType.define('SubType', function (this: SubType, extra: string) {
	this.extra = extra;
});
```

## Functional vs Class-Based — Both Are Equally Supported

`define()` (functional) and `@decorate()` (class-based) are runtime equivalents. Choose based on the style of the surrounding codebase — never assume one is preferred over the other.

| | Functional (`define`) | Class-based (`@decorate`) |
|---|---|---|
| Define a type | `define('User', function(data) { ... })` | `@decorate() class User { constructor(data) { ... } }` |
| Define a subtype | `User.define('Admin', function() { ... })` | `@decorate(User) class Admin { ... }` |
| Create instance | `new User(data)` | `new User(data)` |
| Create subtype | `new user.Admin()` | `new user.Admin()` |
| Config options | third arg: `define('T', fn, config)` | first/second arg: `@decorate(Parent, config)` |

When working in a codebase that uses one style: **stay consistent with that style** rather than mixing.

## The `decorate` Shape

`decorate` exists at two levels, and both are **getters**, not plain methods:

- **Collection level** — a getter on `TypesCollection.prototype` (`src/descriptors/types/index.ts:229`), so `defaultTypes.decorate(config)` and `createTypesCollection().decorate(config)` return a fresh decorator bound to that collection.
- **Type level** — a getter on `TypeDescriptor.prototype` (`src/api/types/index.ts:275`) that binds the current descriptor at access time.

Because binding happens at access time, both call forms work:

```typescript
@Type.decorate({ strictChain: false })   // method-style access
class Admin { /* ... */ }

const { decorate } = Type;               // destructured — still bound
@decorate()
class Moderator { /* ... */ }
```

For usage patterns (options, subtype decoration, typing limits), see
[`docs/decorate.md`](../docs/decorate.md).

## Calling Conventions

### 1. Modern (explicit name)
```typescript
define('UserType', function (this: UserType, data: UserData) {
	Object.assign(this, data);
});
```

### 2. Legacy (name from constructor)
```typescript
define(function UserType(this: UserType, data: UserData) {
	Object.assign(this, data);
});
```

### 3. Nested (dot-path)
```typescript
define('Parent.Child', function (this: Child, data: Data) {
	Object.assign(this, data);
});
```

## Lazy definitions

Use `.lazy()` when the constructor must be resolved through a getter — for
example, to break a circular dependency or to defer constructor selection until
definition time. `.define()` no longer accepts an anonymous function as its
first argument; that form has moved to `.lazy()`.

### Unnamed (name from returned constructor)
```typescript
const LazyType = define('RootType', function () {})
	.lazy(() => function LazySubType(this: LazySubType, data: LazyData) {
		Object.assign(this, data);
	});
```

### Named (explicit type name)
```typescript
const NamedLazy = RootType.lazy('NamedLazy', () => function (data: NamedData) {
	Object.assign(this, data);
});
```

### Free-function form
```typescript
import { lazy } from 'mnemonica';

const LazyRoot = lazy('LazyRoot', () => class LazyRoot {
	field: string;
	constructor(field: string) {
		this.field = field;
	}
});
```

The getter is called once at definition time (to resolve the name, class mode,
and prototype) and then again on every construction — keep it free of side
effects that must not run at `define()` time. The returned constructor is
registered exactly like a constructor passed directly to `define()`, and the
resulting type supports `.define()`, `.lazy()`, `.lookup()`, and subtype
chaining.

## Export root constructors only when needed; never export subtypes

Subtypes live on the parent constructor and on parent instances. Exporting a subtype splits the Trie and usually loses the parent part of the chain.

```typescript
// WRONG
export const Admin = User.define('Admin', function (this: Admin, data: AdminData) {
	Object.assign(this, data);
});

// RIGHT
User.define('Admin', function (this: Admin, data: AdminData) {
	Object.assign(this, data);
});
```

Root constructors **may** be exported when tactica has generated standalone instance types that include the sub-constructor chain, so consumers can do `new user.Admin(...)`. Even then, `lookup('User')` is the safer default.

## Config Options

| Option | Default | Description |
|--------|---------|-------------|
| `strictChain` | `true` | Enforce subtype creation only from direct parent |
| `blockErrors` | `true` | Block construction if error exists in prototype chain |
| `submitStack` | `false` | Collect stack trace as `__stack__` property |
| `awaitReturn` | `true` | `await new Constructor()` must return a value |
| `asClass` | auto-detected | Force class mode detection |

## Instance Method Opt-In

Starting from v1.0.6, `extract()`, `pick()`, `parent()`, `fork()`, `exception()`,
`sibling()`, and `clone()` are **not** auto-injected on instances. Use the standalone
`utils` export, or attach the methods to the constructor's prototype before calling
`define()`.

## Before/After: strictChain

**Before** (strictChain: false — allows broken chains)
```typescript
const RootType = define('RootType', function () {});
const ChildType = RootType.define('ChildType', function () {}, { strictChain: false });

// This would succeed even if made from wrong parent
const wrong = new SomeOtherType();
const child = new ChildType.call(wrong); // chain corruption possible
```

**After** (strictChain: true — default, enforced)
```typescript
const RootType = define('RootType', function () {});
const ChildType = RootType.define('ChildType', function () {});

const root = new RootType();
const child = new root.ChildType(); // inherits correctly from root instance
```
