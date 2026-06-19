# Mnemonica utilities

The `utils` export provides standalone versions of the instance introspection
and manipulation methods. Every utility that accepts an instance infers its
type parameter from that instance, so ordinary code needs no explicit `<T>`
casts.

```typescript
import { utils } from 'mnemonica';

const extracted = utils.extract(user); // Extracted<typeof user>
const picked    = utils.pick(user, 'name', 'age');
const cloned    = utils.clone(user);   // typeof user
```

---

## Core helper types

These types live in `src/types/index.ts` and define how the utilities present
their results.

### `Extracted<T>`

A plain-object view of an instance's enumerable string-keyed user properties.
`MnemonicaInstance` method names (`extract`, `pick`, `parent`, `clone`, `fork`,
`exception`, `sibling`) are filtered out. Optionality is preserved from the
source type.

```typescript
export type Extracted<T extends object> = {
    [K in keyof T as K extends string ? (K extends MnemonicaInstanceMethodKeys ? never : K) : never]: T[K];
} & {};
```

### `MnemonicaInstanceMethodKeys`

The set of prototype method names that must disappear from data-only views:

```typescript
export type MnemonicaInstanceMethodKeys =
    'extract' | 'pick' | 'parent' | 'clone' | 'fork' | 'exception' | 'sibling';
```

### `Merge<E, T>`

Merges two instance shapes into a flat field object. `T` wins on conflicts;
`E` contributes only keys that `T` does not define. Method names are filtered
out. Used by `apply` / `call` / `bind` and by `utils.merge`.

```typescript
export type Merge<E extends object, T extends object> = {
    [K in keyof T | keyof E as K extends MnemonicaInstanceMethodKeys ? never : K]:
        K extends keyof T ? T[K] : E[K & keyof E];
};
```

### `InstanceResult<N, Config>`

The public instance surface. It renders in hover tooltips as a plain field
object literal first, then `& MnemonicaInstance<{ ... }>` once:

```typescript
export type InstanceResult<
    N extends object,
    Config extends constructorOptions,
> = IsHidingMethods<Config> extends true
    ? { [K in keyof N]: N[K] }
    : { [K in keyof N]: N[K] } & MnemonicaInstance<{ [K in keyof N]: N[K] }>;
```

### `Parsed<T>`

The shape returned by `utils.parse(instance)` — a one-level snapshot of the
instance's prototype chain:

```typescript
export type Parsed<T extends object> = {
    name: string;
    props: Extracted<T>;
    self: T;
    proto: object;
    joint: Record<string, unknown>;
    parent: object | undefined;
};
```

### `SiblingAccessor`

A callable/proxy object returned by `utils.sibling(instance)`:

```typescript
export interface SiblingAccessor {
    (SiblingTypeName: string): TypeClass | undefined;
    [key: string]: TypeClass | undefined;
}
```

---

## Utility reference

| Utility | Inferred return type | Notes |
|---|---|---|
| `utils.extract(instance)` | `Extracted<T>` | Data-only view; methods filtered. |
| `utils.pick(instance, 'a', 'b')` | `{ a: T['a'], b: T['b'] } & {}` | Literal keys → typed subset. Dynamic `string[]` → `Record<string, unknown>`. |
| `utils.clone(instance)` | `T` | Same instance type. |
| `utils.fork(instance)` | `(this: object, ...args: unknown[]) => T` | Returns a fork constructor. |
| `utils.parent(instance, path?)` | `object \| undefined` | Structural only; nominal path typing needs `TypeRegistry`. |
| `utils.sibling(instance)` | `SiblingAccessor` | Look up sibling constructors by string name or property access. |
| `utils.merge(A, B, ...args)` | `InstanceResult<Merge<B, A>, constructorOptions>` | `A` wins; `B` fills non-overlapping keys; methods shown once. |
| `utils.parse(instance)` | `Parsed<T>` | One-level prototype-chain snapshot. |
| `utils.toJSON(instance)` | `string` | Generic so the instance type is captured at the call site. |
| `utils.collectConstructors(instance, flat?)` | `(CallableFunction \| string)[]` | Introspection helper. |

---

## `utils.merge(A, B, ...args)` in detail

`merge(a, b)` is implemented as `fork(a).call(b, ...args)`. The result is a **new
instance of `a`’s type** whose parent/existent instance is `b`. That means:

- `a` provides the primary fields.
- `b` contributes only the fields `a` does not define.
- The result is a flat field object (`A` wins) with no auto-injected instance
  methods.

The type `InstanceResult<Merge<B, A>>` expresses this: a flat field object
(`A` wins).

```typescript
const UserType = define('User', function (this: { name: string; age: number }) {
    this.name = 'Alice';
    this.age = 30;
});

const RoleType = define('Role', function (this: { role: string }) {
    this.role = 'admin';
});

const user = new UserType();
const role = new RoleType();

// hover: { name: string; age: number; role: string; }
const merged = utils.merge(user, role);
merged.name;      // string
merged.role;      // string
utils.extract(merged); // OK
```

---

## `utils.parse(instance)` in detail

`parse` returns a one-level snapshot of the instance's prototype chain:

- `name` — constructor name of the immediate prototype.
- `props` — `Extracted<T>` from the instance itself.
- `self` — the original instance reference (`T`).
- `proto` — `Object.getPrototypeOf(instance)`.
- `joint` — enumerable properties copied from `proto`.
- `parent` — `Object.getPrototypeOf(proto)` (the next link up; currently not
  recursively parsed).

```typescript
const parsed = utils.parse(user);
const name: string = parsed.name;
const propsName: string | undefined = parsed.props.name;
const self: typeof user = parsed.self;
const parent: object | undefined = parsed.parent;
```

---

## Limitations

- `utils.parent(instance, 'TypeName')` cannot return a specific nominal parent
  type without a user-augmented `TypeRegistry`. This is the same limitation as
  `lookupTyped()`: TypeScript cannot retroactively learn the type graph created
  by `define()` calls. See [`./typed-lookup.md`](./typed-lookup.md).
- `utils.parse()` returns `parent` as `object | undefined` because deep recursive
  parsing is not implemented at runtime.
- `utils.toJSON()` always returns `string`; the generic parameter only preserves
  the instance type at the call site for consistency with the other utilities.
