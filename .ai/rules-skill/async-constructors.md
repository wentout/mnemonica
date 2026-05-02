---
name: mnemonica-async-constructors
description: |
  Async constructor patterns in mnemonica: awaitReturn, makeAwaiter, chained
  async construction. Use when the user asks about async constructors, Promise
  return from new, await new Constructor(), or async subtype chains.
metadata:
  tags: [mnemonica, async, constructors, promises, await]
---

# Async Constructors

## awaitReturn Config

When `awaitReturn: true` (default), `await new Constructor()` must return a value.
If the constructor returns `undefined`, an error is thrown.

```typescript
const AsyncType = define('AsyncType', async function () {
	return this; // MUST return a value
}, { awaitReturn: true });

const instance = await new AsyncType();
```

## Chained Async Construction

Async instances can have subtype factories attached that return Promises:

```typescript
const ParentType = define('ParentType', async function () {
	return this;
});

const ChildType = ParentType.define('ChildType', async function () {
	return this;
});

const parent = await new ParentType();
const child = await new parent.ChildType(); // chained async
```

## makeAwaiter

`InstanceCreator.makeAwaiter()` wraps the construction result in a Promise,
validates the instance type on resolution, and attaches subtype factories.

## addThen

`addThen()` allows sequential async subtype creation:

```typescript
const instance = await new AsyncType();
const chained = await instance.SubType().AnotherType(); // sequential awaits
```
