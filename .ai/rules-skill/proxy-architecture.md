---
name: mnemonica-proxy-architecture
description: |
  The Proxy-based construction pipeline: TypeProxy, InstanceCreator, Mnemosyne,
  and createInstanceModificator. Use when the user asks about how mnemonica
  creates instances, the prototype chain, TypeProxy, InstanceCreator, or the
  internal construction mechanism.
metadata:
  tags: [mnemonica, proxy, architecture, construction, prototype]
---

# Proxy-Based Architecture

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

## Key Components

### TypeProxy
Wraps type constructors. Handles property access, `.define()`, `.lookup()`,
and subtype resolution.

### InstanceCreator
Orchestrates the full instance construction lifecycle:
1. **Setup** — extract type, config, prepare ModificationConstructor
2. **Stack** — collect creation stack if `submitStack` or chained
3. **blockErrors** — if parent is Error, optionally block construction
4. **Pre-hooks** — invoke `preCreation` hooks on collection and type
5. **Build** — `makeInstanceModificator()` wires prototype chain
6. **Construct** — `new InstanceModificator(...args)` runs user constructor
7. **Async** — if result is Promise, attach awaiter and subtype factories
8. **Post-proc** — validate inheritance, set `__self__`, invoke `postCreation` hooks

### Mnemosyne
Handles instance method access via Proxy. Provides:
- `extract()` — get all enumerable properties
- `pick(...keys)` — select specific properties
- `parent()` — traverse prototype chain
- `fork(...args)` — create new instance with same or different args
- `clone` — alias for fork()

### createInstanceModificator (ModificationConstructor)
The default ModificationConstructor that wires the prototype chain by creating
a Mnemosyne object inheriting from the parent instance, attaching internal props,
and linking `ModificatorType.prototype` to it.
