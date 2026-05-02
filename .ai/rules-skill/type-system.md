---
name: mnemonica-type-system
description: |
  Mnemonica's type system patterns: Proto<P,T> merge, _Internal_TC_ vs TypeConstructor,
  type vs interface rule, and generic constraints. Use when adding or modifying
  TypeScript definitions in mnemonica, when defining new types with define(),
  or when the user asks about type merging, type constructors, kind systems,
  TypeRegistry, or generic type patterns in mnemonica.
metadata:
  tags: [mnemonica, typescript, generics, type-system, kind-system]
---

# Mnemonica Type System

## Type vs Interface Rule

Mnemonica enforces a strict separation:

- **`type`** for instance data (structures, shapes, POJOs)
- **`interface`** only for behavior contracts (constructors, methods, callables)

```typescript
// ✅ CORRECT - Instance data uses TYPE
type UserData = { name: string; age: number; };

// ❌ WRONG - Instance is NOT an interface!
interface UserData { name: string; age: number; }

// ✅ CORRECT - Constructor/Prototype contract uses INTERFACE
interface MnemonicaInstance {
    extract(): Record<string, unknown>;
    parent(): object | undefined;
    fork(...forkArgs: unknown[]): object;
}
```

Rule of thumb:
- **Interface** = Black-box contract (constructors, callables, `implements`)
- **Type** = Runtime data structure/shape (instances, POJOs)

## Proto<P, T> — Parent-Child Merge

When a subtype is defined from a parent instance, child properties take precedence.
`Exclude<keyof P, keyof T>` removes overlapping keys from P, so `Pick<P, ...>` only
brings in parent properties that don't clash with child.

```typescript
// Result: child T gets all its own props, plus parent's non-overlapping props
export type Proto<P extends object, T extends object> = T & Pick<P, Exclude<keyof P, keyof T>>;
```

## _Internal_TC_ vs TypeConstructor

### _Internal_TC_ — Internal Type Constructor

"Type" here is used in the Computer Science sense — an interface/contract describing
what a constructor must satisfy (both `new`-able and callable).

```typescript
export interface _Internal_TC_<ConstructorInstance extends object> {
    new(...args: unknown[]): ConstructorInstance;
    (this: ConstructorInstance, ...args: unknown[]): ConstructorInstance;
    readonly prototype: ConstructorInstance & {
        readonly constructor: _Internal_TC_<ConstructorInstance>
    };
}
```

TC = Type Constructor; "Internal" means this is the library's own constructor shape,
distinct from the user-facing TypeConstructor below.

### TypeConstructor — External Type Constructor

In Scala's kind system, a "Type Constructor" is a kind (a type of types):
not a value, but a mold describing how concrete types are formed. Here,
`TypeConstructor<Instance>` is the mold `define()` stamps at invocation time
from (prototype, arguments, config). The resulting constructor is simultaneously:

- a runtime value (callable, `new`-able, with `.prototype`)
- a node in the type Trie (carries `.subtypes`, participates in `instanceof`)
- a behavioral contract (the prototype chain provides `.extract()`, `.fork()`, etc.)

Augmented by tactica-generated TypeRegistry to become user-specific types.

```typescript
export interface TypeConstructor<ConstructorInstance extends object> {
    new(...args: unknown[]): ConstructorInstance;
    readonly prototype: ConstructorInstance & {
        readonly constructor: TypeConstructor<ConstructorInstance>
    };
}
```

## Before/After: Prototype Assignment vs define()

**Before** (breaks `instanceof`, corrupts chains)
```typescript
function UserType(data) {
    Object.assign(this, data);
}
UserType.prototype = { role: 'user' };
const user = new UserType({ name: 'John' });
```

**After** (explicit inheritance graph, prototype-safe)
```typescript
const UserType = define('UserType', function (this: UserType, data: UserData) {
    Object.assign(this, data);
});
const user = new UserType({ name: 'John' });
const AdminType = UserType.define('AdminType', function (this: AdminType) {
    this.role = 'admin';
});
```
