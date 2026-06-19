---
name: mnemonica-instance-methods
description: |
  Instance methods and properties in mnemonica: extract, pick, parent, fork,
  clone, sibling, exception, getProps, and the internal __self__ reference.
  Starting from v1.0.6 these convenience methods are no longer auto-injected;
  use the standalone utils.* API or attach them to a constructor prototype before
  calling define().
metadata:
  tags: [mnemonica, instances, methods, introspection, prototype]
---

# Instance Methods

For the type-level details of the corresponding standalone utilities
(`utils.extract`, `utils.pick`, `utils.parent`, `utils.fork`, `utils.clone`,
`utils.sibling`, `utils.exception`), see [`docs/UTILS.md`](../../docs/UTILS.md).

## Standalone Utilities (Default)

Starting from v1.0.6 the convenience methods are **not** exposed on instances by
default. Import them from the `utils` export:

```typescript
import { utils } from 'mnemonica';

utils.extract(instance);
utils.pick(instance, 'name', 'age');
utils.parent(instance, 'UserType');
utils.fork(instance)(newArgs);
utils.clone(instance);
utils.sibling(instance);
utils.exception(instance, new Error('oops'));
```

All utilities infer their type parameter from the instance argument.

## Legacy Instance-Method Style (Opt-In)

To restore the old `instance.extract()` style for a root constructor, attach the
methods to its prototype **before** passing it to `define()`. See
`test/instance-methods-helper.js` for the full reference pattern.

```typescript
import { define, utils } from 'mnemonica';

function UserType(data) {
  Object.assign(this, data);
}

Object.defineProperty(UserType.prototype, 'extract', {
  get() { return () => utils.extract(this); }
});

const User = define('User', UserType);
const user = new User({ name: 'Ada' });
user.extract(); // works
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
