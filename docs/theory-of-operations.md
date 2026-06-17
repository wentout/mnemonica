# Theory of Operations

## The Full Construction Pipeline

This document traces a single `new instance.SubType(args)` call through every stage of mnemonica's internals, with references to the source files that implement each stage. It exists so that contributors (human and AI) can understand the exact data flow without reverse-engineering the code.

---

## Stage 0: Type Definition (`define()`)

**File:** [`src/api/types/index.ts`](../src/api/types/index.ts)

Before any instance exists, the type must be declared. `define('TypeName', ctor, config?)` performs:

1. **Resolve definition context** — determines whether this is a root type or a nested path (`Parent.SubType`)
2. **Check for duplicates** — throws `ALREADY_DECLARED` if the name exists in the target collection
3. **Compile the constructor body** — `compileNewModificatorFunctionBody.ts` wraps the user's constructor in a function that preserves `new.target` and handles both class and function constructors
4. **Create a `TypeDescriptor`** — stores: name, compiled handler, prototype, config, parent type reference
5. **Register in the `TypesCollection` Proxy** — makes the type findable via `.lookup()` and `.define()`

The result is a `TypeProxy` — a constructor function with additional methods (`.define()`, `.lookup()`, `.registerHook()`).

**Key invariant:** A type is immutable once defined. Its name, handler, and prototype are frozen.

---

## Stage 1: Subtype Access (`instance.SubType`)

**File:** [`src/api/types/Mnemosyne.ts`](../src/api/types/Mnemosyne.ts)

When code reads `instance.SubType`, the `Mnemosyne` proxy's `get` trap fires:

1. Look up `SubType` in the instance's `__subtypes__` Map (stored in the WeakMap)
2. If found, call `prepareSubtypeForConstruction(subtype, instance)`
3. This creates a **subtype proxy** — a function that closes over both the `TypeDef` and the parent `instance`

The subtype proxy is what makes `new instance.SubType()` work. It is not the raw constructor; it is a wrapper that knows which parent instance to use.

**Key invariant:** Every access to `instance.SubType` creates a fresh proxy (this was a deliberate design decision; caching is possible but not implemented to keep the code simple).

---

## Stage 2: Construction Invocation (`new instance.SubType(args)`)

**File:** [`src/api/types/Mnemosyne.ts`](../src/api/types/Mnemosyne.ts)

The subtype proxy's `construct` trap fires:

1. Call `new InstanceCreator(subtype, instance, args)`
2. The `InstanceCreator` is the orchestrator for the full lifecycle

---

## Stage 3: Instance Creator Setup

**File:** [`src/api/types/InstanceCreator.ts`](../src/api/types/InstanceCreator.ts)

`InstanceCreator` is a class (not a proxy) that manages the 8-stage pipeline:

### 3.1 Extract context
- `type` — the `TypeDef` for `SubType`
- `existentInstance` — the parent instance (`instance` in our example)
- `args` — the arguments array
- `config` — from the type definition

### 3.2 Resolve the `ModificatorType`
- For sync constructors: compile the user handler into a new constructor function
- For async constructors: wrap in an async-compatible class pattern

### 3.3 Prepare hooks
- `invokePreHooks()` — calls `preCreation` hooks on the type's collection and the type itself
- If any hook throws, `creationError` hooks fire and construction aborts

---

## Stage 4: Prototype Chain Assembly

**File:** [`src/api/types/createInstanceModificator.ts`](../src/api/types/createInstanceModificator.ts)

This is where the Trie structure is physically built:

1. **Create `Mnemosyne`** — `const Mnemosyne = {}`
2. **Link to parent** — `Reflect.setPrototypeOf(Mnemosyne, existentInstance)`
   - This is the critical step: the new instance's prototype chain will go through the **specific parent instance**
3. **Add internal properties** — `_addProps(Mnemosyne)` attaches getters for `__type__`, `__parent__`, `__args__`, `__timestamp__`, etc.
4. **Create `ModificatorType`** — a new constructor function with `Mnemosyne` as its prototype
5. **Copy user prototype properties** — `Object.getOwnPropertyDescriptors(ModificatorTypePrototype)` are copied onto `ModificatorType.prototype`
6. **Link ModificatorType to Mnemosyne** — `Reflect.setPrototypeOf(ModificatorType.prototype, Mnemosyne)`

The resulting chain:
```
newObj
  ↓ __proto__
ModificatorType.prototype
  ↓ __proto__
Mnemosyne  (has __type__, __parent__, etc.)
  ↓ __proto__
existentInstance  (the specific parent)
  ↓ __proto__
... (rest of chain to root)
```

---

## Stage 5: User Constructor Execution

**File:** [`src/api/types/InstanceCreator.ts`](../src/api/types/InstanceCreator.ts)

The `ModificatorType` is instantiated with `new ModificatorType(...args)`:

1. The compiled constructor body (from Stage 0) runs
2. `this` is the new object whose prototype chain was built in Stage 4
3. The user constructor assigns properties to `this`
4. If the constructor returns a non-primitive, that value is used as the instance

---

## Stage 6: Post-Processing

**File:** [`src/api/types/InstanceCreator.ts`](../src/api/types/InstanceCreator.ts)

After the user constructor:

1. **Set `__self__`** — `_setSelf(instance)` stores a reference to the instance itself in the props
2. **Validation** (if `strictChain: true`):
   - Verify the instance is actually an instance of the expected parent type
   - Verify the parent's constructor name matches the expected parent type name
3. **Invoke `postCreation` hooks**

---

## Stage 7: Return

**File:** [`src/api/types/InstanceCreator.ts`](../src/api/types/InstanceCreator.ts)

The instance is returned. It carries:
- All user-assigned properties (own properties)
- The prototype chain linking back to the root type
- Internal construction context in the WeakMap (not enumerable, not own properties)

---

## The WeakMap Architecture

**File:** [`src/api/types/Props.ts`](../src/api/types/Props.ts)

Internal properties are stored in a `WeakMap` keyed by the **prototype object** (Mnemosyne), not the instance itself:

```typescript
const __props__ = new WeakMap<object, PropsType>();
```

Why the prototype?
- Multiple instances of the same type share the same Mnemosyne prototype
- Storing props on the prototype means all instances of the same construction share the same type metadata
- This saves memory and keeps instance enumeration clean

`getProps(instance)` walks the prototype chain to find the Mnemosyne object, then looks it up in the WeakMap.

---

## Hook Invocation Details

**File:** [`src/api/hooks/invokeHook.ts`](../src/api/hooks/invokeHook.ts)

Hooks are stored per-type and per-collection:

```typescript
type.hooks = {
  preCreation: [fn1, fn2],
  postCreation: [fn3],
  creationError: [fn4]
};
```

When `invokeHook('preCreation', hookData)` fires:
1. Create a `HookInvocation` builder
2. For each registered hook, call it with the builder
3. Collect results in a Set
4. If any hook throws, the error propagates (aborting construction)

The `flowCheckers` Map allows hooks to be conditionally enabled/disabled per invocation.

---

## Error Handling

**File:** [`src/api/errors/throwModificationError.ts`](../src/api/errors/throwModificationError.ts)

If any stage throws:

1. `creationError` hooks fire with the error and partial construction context
2. A `BASE_MNEMONICA_ERROR` is constructed with:
   - Cleaned stack trace (mnemonica internals removed)
   - References to the instance, type, and parent
3. The error is thrown to the caller

If `config.blockErrors` is true (default for most types), errors during construction are caught and re-thrown as mnemonica errors. If false (used internally for exception construction), errors propagate raw.

---

## Summary Table

| Stage | File | What Happens |
|---|---|---|
| 0. Type Definition | `src/api/types/index.ts` | Compile handler, create TypeDescriptor, register in collection |
| 1. Subtype Access | `src/api/types/Mnemosyne.ts` | Resolve `instance.SubType` via proxy get trap |
| 2. Construction Start | `src/api/types/Mnemosyne.ts` | Subtype proxy's construct trap fires |
| 3. Creator Setup | `src/api/types/InstanceCreator.ts` | Extract context, resolve ModificatorType, run pre-hooks |
| 4. Prototype Assembly | `src/api/types/createInstanceModificator.ts` | Build Mnemosyne → link to parent → create ModificatorType |
| 5. User Constructor | `src/api/types/InstanceCreator.ts` | Run compiled handler with `this` bound to new object |
| 6. Post-Processing | `src/api/types/InstanceCreator.ts` | Set __self__, validate, run post-hooks |
| 7. Return | `src/api/types/InstanceCreator.ts` | Return instance with full prototype chain and WeakMap props |

---

## For Contributors

When modifying any of these files, remember:

- **Prototype links are load-bearing.** Changing `Reflect.setPrototypeOf` calls changes the Trie structure.
- **WeakMap keys are prototype objects, not instances.** `_getProps` walks the chain; `_addProps` writes to the Mnemosyne.
- **Hook order matters.** `preCreation` → construction → `postCreation`. Errors in `preCreation` abort before `Object.create`.
- **The `__self__` reference is used by `.fork()` and `.clone()` to detect self-calls.**
