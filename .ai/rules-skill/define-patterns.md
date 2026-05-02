---
name: mnemonica-define-patterns
description: |
  Patterns for defining types and subtypes with mnemonica's define() function.
  Use when the user asks about define(), creating types, subtype inheritance,
  strictChain, blockErrors, exposeInstanceMethods, or type configuration options.
metadata:
  tags: [mnemonica, define, types, subtypes, inheritance]
---

# Define Patterns

## The define() Function

`define(TypeName, constructHandler, config?)` creates a constructor with prototype
chain inheritance. The constructor has additional methods: `.define()`, `.lookup()`,
`.registerHook()`.

```typescript
const MyType = define('MyType', function (this: MyType, data: Data) {
	Object.assign(this, data);
});

const SubType = MyType.define('SubType', function (this: SubType, extra: string) {
	this.extra = extra;
});
```

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

## Config Options

| Option | Default | Description |
|--------|---------|-------------|
| `strictChain` | `true` | Enforce subtype creation only from direct parent |
| `blockErrors` | `true` | Block construction if error exists in prototype chain |
| `submitStack` | `false` | Collect stack trace as `__stack__` property |
| `awaitReturn` | `true` | `await new Constructor()` must return a value |
| `exposeInstanceMethods` | `true` | Expose `extract()`, `fork()`, etc. on instance |
| `asClass` | auto-detected | Force class mode detection |

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
