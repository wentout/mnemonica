---
name: mnemonica-instance-methods
description: |
  Instance methods and properties in mnemonica: extract, pick, parent, fork,
  clone, getProps, and the internal __self__ reference. Use when the user asks
  about instance introspection, prototype chain traversal, forking instances,
  or the internal props system.
metadata:
  tags: [mnemonica, instances, methods, introspection, prototype]
---

# Instance Methods

For the type-level details of the corresponding standalone utilities
(`utils.extract`, `utils.pick`, `utils.parent`, `utils.fork`, `utils.clone`,
`utils.sibling`), see [`docs/UTILS.md`](../../docs/UTILS.md).

## Available Methods

| Method | Description |
|--------|-------------|
| `extract()` | Returns all enumerable user properties as a plain object (`Extracted<T>`) |
| `pick(...keys)` | Returns selected properties; literal keys are typed (`Pick<T, K>`) |
| `parent()` | Returns the parent instance in the prototype chain |
| `parent(path)` | Looks up parent by constructor name (structural `object \| undefined`) |
| `fork(...args)` | Creates a new instance with same or different args; returns `this` |
| `clone` | Alias for `fork()` with no arguments; preserves full instance type |
| `exception(error, ...args)` | Creates an error with context |
| `sibling(name)` | Finds a sibling type by name (`TypeClass \| undefined`) |

All methods are generic where it matters:

- `instance.extract()` returns `Extracted<T>` — a data-only view with
  `MnemonicaInstance` method names filtered out.
- `instance.pick('name', 'age')` returns a typed subset; loose `string[]` keys
  fall back to `Record<string, unknown>`.
- `instance.fork()` and `instance.clone` return `this`, so the full
  `{ fields } & MnemonicaInstance<{ fields }>` type is preserved.

```typescript
const user = new UserType();
const extracted = user.extract(); // Extracted<UserTypeInstance>
const picked    = user.pick('name', 'age'); // { name: string; age: number; }
const cloned    = user.clone;               // full UserTypeInstance
const forked    = user.fork();              // full UserTypeInstance
```

## Internal Props System

Instance metadata is stored externally via `WeakMap` against the prototype object,
not the instance itself. This keeps instance enumeration clean — internal props
never show up in `for...in`, `Object.keys()`, or `JSON.stringify()`.

```typescript
const props = getProps(instance);
// props contains: __type__, __parent__, __args__, __collection__, __subtypes__,
//                 __proto_proto__, __creator__, __timestamp__, __self__
```

## The __self__ Reference

`__self__` is a circular reference: it points back to the instance itself.
This is set during `postProcessing()` via `_setSelf()`.

```typescript
// After construction, props.__self__ === instance
const props = getProps(instance);
props.__self__ === instance; // true
```

## getProps / setProps

```typescript
import { getProps, setProps } from 'mnemonica';

// Read all internal props
const props = getProps(instance);

// Add custom non-enumerable props
setProps(instance, { customMeta: 'value' });
```
