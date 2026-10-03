---
name: mnemonica-hooks
description: |
  Lifecycle hooks in mnemonica: preCreation, postCreation, creationError.
  Use when the user asks about hooks, registerHook, lifecycle events, or
  when adding hook-related functionality to mnemonica.
metadata:
  tags: [mnemonica, hooks, lifecycle, events]
---

# Lifecycle Hooks

## Hook Types

| Hook | When Fired | Data |
|------|-----------|------|
| `preCreation` | Before constructor runs | `type`, `TypeName`, `existentInstance`, `args` |
| `postCreation` | After successful construction | plus `inheritedInstance`, `throwModificationError` |
| `creationError` | Construction produced an errored instance | plus `inheritedInstance`, `throwModificationError` |

## Registration Levels

Hooks can be registered at two levels:

### Type-level
```typescript
MyType.registerHook('postCreation', (opts) => {
	console.log(`Created ${opts.type.TypeName}`);
});
```

### Collection-level
```typescript
import { registerHook } from 'mnemonica';
registerHook(MyType, 'preCreation', (opts) => {
	console.log('About to create instance');
});
```

## Hook Execution Order

1. Collection `preCreation`
2. Type `preCreation`
3. Constructor invocation
4. If error: Type `creationError`, then Collection `creationError`
5. If success: Type `postCreation`, then Collection `postCreation`

Pre-hooks run collection → type; post-hooks and error hooks run
type → collection (`invokePostHooks` in `src/api/types/InstanceCreator.ts`
calls the type first) — the collection wraps the type on both sides.

## Typed Hooks (type-level)

A hook registered **on a type** gets its callback's `opts` typed by inference
— no narrowing, no casts in user code. This is compile-time only; the runtime
hookData shapes are unchanged.

- `User.registerHook('postCreation', (opts) => opts.inheritedInstance.name)`
  — `inheritedInstance` is typed as the `User` instance.
- For a subtype, `existentInstance` is typed as the **parent** instance
  (`Admin.registerHook(...)` sees `existentInstance: User`).
- `preCreation` fires before the instance exists: its opts carry no
  `inheritedInstance` and no `creator` — accessing them is a compile error.
- `creationError` carries the errored instance, typed the same as
  postCreation's `inheritedInstance`.

Implementation vocabulary (all in `src/types/index.ts`):

- `typedHookOpts<HT, P, T>` — opts per hookType; `HT extends hooksTypes`
  distributes, so the `'preCreation'` branch omits `inheritedInstance`/`creator`.
- `typedHook<HT, P, T>` — the callback type used by every typed
  `registerHook` signature.
- `IDefinitorInstance<N, R, Registry, Path, Parent>` — the 5th generic
  (`Parent`, default `object`) threads the parent instance type;
  `RegistryHolderBase.define()`/`.lazy()` pass their `Parent` through, and the
  modern define overload stores `RegistryEntry<F, ChildPath, Parent>` so
  lookups of chained subtypes keep the parent typing.
- `RegistryEntry<F, Path, Parent>` — declares the typed `registerHook`;
  preserved through `ReplaceConstructorInstance`'s member preservation, so
  builder-registry lookup results are typed automatically.
- `WithHookRegister<C>` — wraps free `lookup()` results: bare augmented
  entries (tactica-emitted or hand-written `TypeRegistry` constructors) gain
  `registerHook` with the created-instance type recovered from the entry's
  construct/call return; constructors that already carry `registerHook` pass
  through unchanged.
- `HookableConstructor<T>` — the free `registerHook(Type, ...)` parameter.
  Deliberately NOT `DecoratedClass<T>`: inference through its `InstanceType<T>`
  conditional picks a wrong `T` candidate, and a generic `registerHook` member
  resets `T` to its default. `T` must be inferable from plain return/
  contravariant positions only.

**Global handlers stay untyped by design** (decided, ROADMAP "Typed
observability"): collection-wide hooks and `uncaughtException` take
`hooksOpts` with `object` fields — a union of all registered types would break
any 300+ type repo. Narrow there with `instanceof lookup('User')`.

Pins live in `test-ts/typed-hooks.ts` (strict gate, compile-time only;
runtime suites are untouched by this feature).
