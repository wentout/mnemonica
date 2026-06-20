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
                                                                    └── uranus
```

`SuperAdminMemory`, `AdminMemory`, and `UserMemory` are the **memory layers**. Only `UserMemory`’s parent is the real `Mnemosyne` constructor result wrapped in a Proxy. The deeper memory layers are plain objects that play the same role.

## The three levels contributed by each type

Every mnemonica type adds three levels to the chain:

1. **Instance object** — the object returned by `new parent.ChildType(...)`. Holds only the own properties assigned by the user constructor.
2. **`ModificatorType.prototype`** — the user-prototype layer. Holds methods and getters captured at `define()` time. It gets a fresh `constructor` property pointing to the per-construction `ModificatorType` function.
3. **Memory layer** — a plain object whose `[[Prototype]]` is the parent instance. It is the `WeakMap` key for internal props and has a `constructor` getter returning `ModificatorType`.

## Files and functions involved

- `src/api/types/compileNewModificatorFunctionBody.ts` builds the `ModificatorType`, the actual function or class used for `new`. For function constructors it preserves `new.target`; for class constructors it generates a class that extends the user class so `super(...)` works.
- `src/api/types/createInstanceModificator.ts` is the default `ModificationConstructor`. It creates the memory layer, wires `_addProps`, copies the captured user prototype onto `ModificatorType.prototype`, and rewires `ModificatorType.prototype` to inherit from the memory layer.
- `src/api/types/Props.ts` implements `_addProps` and `getProps`. Internal props are stored in a module-level `WeakMap` keyed by the memory-layer object.
- `src/api/types/Mnemosyne.ts` builds the root memory proxy. Only the root type goes through `createMnemosyne`; all deeper memory layers are plain objects produced by `createInstanceModificator`.
- `src/api/types/InstanceCreator.ts` orchestrates the pipeline and passes `existentInstance` (the parent instance) into the `ModificationConstructor`.
- `src/api/types/TypeProxy.ts` is the constructor-like object returned by `define()`. Its `construct` trap creates the root Mnemosyne proxy and then invokes `InstanceCreator`.

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

`getProps(instance)` walks the prototype chain from the instance until it finds the first object with a `WeakMap` entry. That is always the instance’s own memory layer. `parent(instance)` reads `__parent__` from that props object; it is the `existentInstance` passed to `InstanceCreator`.

## Subtype lookup

Only the root has a Proxy. When you access `admin.SomeSubType`, the property lookup walks:

```
admin → AdminType.prototype → AdminMemory → user → UserType.prototype → UserMemory → root Mnemosyne Proxy
```

The Proxy’s `get` trap calls `prepareSubtypeForConstruction(prop, receiver)`. It uses `_getProps` to find the memory layer of `receiver` by walking from `Reflect.getPrototypeOf(receiver)`, reads `__subtypes__`, and returns a `SubTypeProxy` that closes over the subtype `TypeDef` and the parent instance.

This means the root Proxy serves the entire branch below it.

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
