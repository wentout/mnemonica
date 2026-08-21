# Prototype Chain Architecture

## Why this document exists

mnemonica instances do not have a normal JavaScript prototype chain. Between every parent instance and child instance there are two intermediate objects. If you are changing construction, props storage, `instanceof`, or subtype lookup, you need to know what those objects are and why they exist.

## High-level shape

For a chain `user → admin → superadmin` the instance-level chain is:

```
superadmin
  └── SuperAdminType.prototype
        └── SuperAdminMemory
              └── admin
                    └── AdminType.prototype
                          └── AdminMemory
                                └── user
                                      └── UserType.prototype
                                            └── UserMemory
                                                  └── root Mnemosyne Proxy
                                                        └── Mnemonica instance
                                                              └── Mnemonica.prototype
                                                                    └── ancestor
```

`SuperAdminMemory`, `AdminMemory`, and `UserMemory` are the **memory layers**. Only `UserMemory`’s parent is the real `Mnemosyne` constructor result wrapped in a Proxy. The deeper memory layers are plain objects that play the same role.

## The three levels contributed by each type

Every mnemonica type adds three levels to the chain:

1. **Instance object** — the object returned by `new parent.ChildType(...)`. Holds only the own properties assigned by the user constructor.
2. **`ModificatorType.prototype`** — the user-prototype layer. Holds methods and getters captured at `define()` time. It gets a fresh `constructor` property pointing to the per-construction `ModificatorType` function.
3. **Memory layer** — a plain object whose `[[Prototype]]` is the parent instance. It is the `WeakMap` key for internal props and has a `constructor` getter returning `ModificatorType`.

## Construction Pipeline (8 Stages)

```
define(TypeName, ctor)  →  new TypeDescriptor()  →  new TypeProxy()
                                              │
                                              ▼
                                   new InstanceCreator(type, parent, args)
                                              │
                                              ▼
                                   makeInstanceModificator(self)
                                              │
                                              ▼
                                   ModificationConstructor.call(parent, ModificatorType, proto, _addProps)
                                              │
                                              ▼
                                   user constructor runs (new ModificatorType(...args))
                                              │
                                              ▼
                                   postProcessing() → invokePostHooks()
```

## Files and functions involved

- `src/api/types/compileNewModificatorFunctionBody.ts` builds the `ModificatorType`, the actual function or class used for `new`. For function constructors it preserves `new.target`; for class constructors it generates a class that extends the user class so `super(...)` works.
- `src/api/types/createInstanceModificator.ts` is the default `ModificationConstructor`. It creates the memory layer, wires `_addProps`, copies the captured user prototype onto `ModificatorType.prototype`, and rewires `ModificatorType.prototype` to inherit from the memory layer.
- `src/api/types/Props.ts` implements `_addProps` and `getProps`. Internal props are stored in a module-level `WeakMap` keyed by the memory-layer object.
- `src/api/types/Mnemosyne.ts` builds the root memory proxy. Only the root type goes through `createMnemosyne`; all deeper memory layers are plain objects produced by `createInstanceModificator`.
- `src/api/types/InstanceCreator.ts` orchestrates the pipeline and passes `existentInstance` (the parent instance) into the `ModificationConstructor`.
- `src/api/types/TypeProxy.ts` is the constructor-like object returned by `define()`. Its `construct` trap creates the root Mnemosyne proxy and then invokes `InstanceCreator`.

## Hooks in the pipeline

Hooks are stored per-type and per-collection (`type.hooks.preCreation` etc.); each firing invokes the collection's list first, then the type's, and collects results into `{ type, collection }` `Set`s. Three firing points, all inside `InstanceCreator`:

- **`preCreation`** — fired by `invokePreHooks` before `runBuild`, i.e. *before the memory layer exists*. A throw here aborts construction raw: there is no instance yet to wrap the error into.
- **`postCreation`** — fired by `invokePostHooks` at the end of `postProcessing`, after the user constructor has run, validation has passed, and `__self__` is set.
- **`creationError`** — the same `invokePostHooks` code path, selected instead of `postCreation` whenever `inheritedInstance instanceof Error`. It fires on the errored instance (see below); a hook returning `true` suppresses the throw and the errored instance becomes the construction result.

The per-target flow checker lives in `flowCheckers`, a `WeakMap<Hookable, () => unknown>` (`src/api/hooks/flowCheckers.ts:11`) — keyed by the hookable object, so checkers never leak into enumeration.

## The error path

When the user constructor throws and `blockErrors` is on (the default), `runBuild` catches the error and `throwModificationError` (`src/api/errors/throwModificationError.ts`) takes over:

1. Build an **errored instance** — `makeErrorModificatorType(TypeName)` plus a normal `makeInstanceModificator` pass, so the thrown object is a real instance of the type that failed.
2. Splice the original error into the errored instance's prototype chain (`Reflect.setPrototypeOf`). This is why a thrown mnemonica error answers `true` to both `instanceof ErroredType` and `instanceof TypeError`.
3. Store the error data in props, never on the error object: `exceptionReason`, `reasons`, `surplus` first, then `args`, `originalError`, `instance` once the error is actually thrown. Read them with `getProps(error)`.
4. Merge and clean the stack (creation stack + original error stack + type-definition stack, through `cleanupStack`).
5. Fire `creationError` hooks; if none suppresses, `throw erroredInstance`.

If an errored instance arrives as the *parent* and `blockErrors` is on, the circuit breaker (`runBlockErrorsCheck`) builds the same kind of errored instance and throws it before pre-hooks even run. With `blockErrors: false` the original error propagates raw — that path exists for mnemonica's own exception construction.

## Capturing the user prototype

At `define()` time the `TypeDescriptor` stores `proto` — a snapshot of the user constructor’s `.prototype`. During construction that snapshot is copied onto the fresh `ModificatorType.prototype`. The user constructor’s original `.prototype` is restored after construction, so it is never part of the instance chain.

This is why the same constructor function can be reused across multiple type definitions without bleeding prototype state.

## Internal props storage

`_addProps` receives the memory-layer object and stores a `value` object in the module `WeakMap` keyed by that object. The stored object contains getters for:

- `__type__`
- `__parent__`
- `__args__`
- `__timestamp__`
- `__creator__`
- `__collection__`
- `__subtypes__`
- `__proto_proto__`
- `__stack__`

`getProps(instance)` first checks for a record keyed by the object itself (see the error-props note below), then walks the prototype chain from the instance until it finds the first object with a `WeakMap` entry. For instances that is always the instance's own memory layer. `parent(instance)` reads `__parent__` from that props object; it is the `existentInstance` passed to `InstanceCreator`.

## Why the memory layer is the `WeakMap` key

**Why not key props on `ModificatorType.prototype`?** It would save one hop in the walk, but that object is user-facing: it receives the captured user-prototype descriptors during construction and is reachable via `instance.constructor.prototype`. The memory layer is created fresh per construction, is never handed out as a value, and its only own property (`constructor`) is a non-configurable getter. Keying the props by an object identity that userland cannot forge or pollute keeps the metadata lookup deterministic no matter what user code does to instances or prototypes.

**This is not a security boundary.** JavaScript within a realm offers none: a determined user with `Reflect` can reach the memory layer (`Reflect.getPrototypeOf(instance.constructor.prototype)`) and even change its prototype. The design goal is determinism under *accidental* interference — the `WeakMap` entry is keyed by identity rather than by any name or property another library could collide with, and the `constructor` getter cannot be redefined. (This was historically nicknamed "MITM resistance": forgery and pollution of the metadata lookup are structurally deflected; deliberate reflection is not. Security tooling would rightly not count this as a defense.)

**Do not re-add keying by instance or creator.** Props were historically keyed by the `InstanceCreator` context, then by the instance itself. Both writes were proven unread (sentinel experiment: both suites green with garbage stored in the entry) and removed. For instances the memory layer is the only props key; `setProps` additions are keyed by the props object itself.

**Error props use a second key-space.** Error instances carry their data (`args`, `originalError`, `instance`, `exceptionReason`, `reasons`, `surplus`) in a record keyed by the error object itself, stored in a *separate* `WeakMap` (`__object_props__` in `Props.ts`) that `_getProps` consults before the chain walk. The two key-spaces must never share one map: memory layer objects are themselves keys in `__props__`, so a shared map would make `_getProps(memoryLayer)` return the layer's own record when the caller meant to reach the parent layer's one (this exact regression once silently bypassed the `prepareSubtypeForConstruction` early-exit and cost a coverage branch). `setProps` on an object with no chain record (plain objects, `Error` objects) creates such an object-keyed record on demand; on primitives it returns `false`.

**The `_getProps` guard.** The chain walk stops with `undefined` as soon as the next level’s `constructor` differs from the original object’s; the memory layer’s own getter keeps constructors aligned across its level, so the walk survives it. Consequence: `getProps(Object.create(instance))` resolves to the parent instance’s props — derived objects share the nearest ancestor’s memory layer.

## `_setSelf` and async construction

`_setSelf(instance)` is called at the end of successful construction. It adds one more getter to the props object:

```js
__self__: () => instance
```

This is what solves the async-constructor problem: the props object is already reachable from the instance through the prototype-chain walk, so the `__self__` getter can serve as a completion marker.

When a constructor returns a Promise, the initial value of `new Constructor()` is that Promise. `makeAwaiter` waits for resolution, then checks:

```js
if (props.__self__ !== self.inheritedInstance) {
  self.postProcessing(type);
}
```

If `__self__` is missing or does not match the resolved instance, post-processing has not run yet, so it runs validation and hooks. If it matches, post-processing has already happened and is skipped. The constructor can therefore return a Promise, and mnemonica finalizes the instance only after the Promise resolves — without double-initializing or losing the construction context.

## Subtype lookup

Only the root has a Proxy. When you access `admin.SomeSubType`, the property lookup walks:

```
admin → AdminType.prototype → AdminMemory → user → UserType.prototype → UserMemory → root Mnemosyne Proxy
```

The Proxy’s `get` trap calls `prepareSubtypeForConstruction(prop, receiver)`. It uses `_getProps` to find the memory layer of `receiver` by walking from `Reflect.getPrototypeOf(receiver)`, reads `__subtypes__`, and returns a `SubTypeProxy` that closes over the subtype `TypeDef` and the parent instance.

This means the root Proxy serves the entire branch below it.

## Why the root Proxy is kept

The root Proxy exists so that **subtypes defined after an instance is created are still visible on that instance**.

If subtype constructors were attached to the memory layer at construction time, an instance would only know about the subtypes that existed when it was built. Any `ParentType.define('NewSubType', ...)` call afterward would not appear on existing instances.

The Proxy avoids that by doing a live lookup in the type’s `__subtypes__` Map on every property access. Instances do not carry a snapshot of the Trie; they delegate to the current type graph. That decouples instance lifetime from type-graph evolution and is the main reason a Proxy is necessary. The other Proxy-based mechanisms in the codebase could be replaced with simpler constructs, but this live lookup is hard to achieve without a Proxy.

## Classes vs functions

The final chain shape is identical for class and function definitions. The difference is only in how `ModificatorType` runs the user constructor:

- **Function:** the wrapper temporarily swaps `ConstructHandler.prototype`, calls `new ConstructHandler(...)`, then restores it.
- **Class:** the generated class `extends ConstructHandler`, calls `super(...)`, then runs the post-construction handler.

In both cases the resulting prototype chain is rewired to `instance → ModificatorType.prototype → memoryLayer → parent`.

## Common mistakes

- **Assuming internal props are own properties of the instance.** They are stored in a `WeakMap` keyed by the memory layer.
- **Assuming `instance.constructor` is the user’s original function.** It points to the per-construction `ModificatorType`, which delegates behavior to the user handler.
- **Thinking the `Mnemosyne` constructor is used for every instance.** It is used once for the root; subtype memory layers are plain objects.
- **Expecting the user constructor’s `.prototype` to be in the chain.** It is snapshotted and restored; only copies of its descriptors end up on `ModificatorType.prototype`.
