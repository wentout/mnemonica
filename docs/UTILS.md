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

### `InstanceResult<N>`

The public instance surface. It renders in hover tooltips as a plain field
object literal — instance methods are not part of the type at all (they live
in `utils`), and the inline mapped type is used instead of a `Flatten` alias
so hover shows the actual fields first:

```typescript
export type InstanceResult<
    N extends object,
> = { [K in keyof N]: N[K] };
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
| `utils.parent(instance, path?)` | `object \| null` (no path); `object \| undefined` (path: searched, not found) | Structural only; nominal path typing needs `TypeRegistry`. |
| `utils.sibling(instance)` | `SiblingAccessor` | Look up sibling constructors by string name or property access. |
| `utils.merge(A, B, ...args)` | `InstanceResult<Merge<B, A>>` | `A` wins; `B` fills non-overlapping keys. |
| `utils.parse(instance)` | `Parsed<T>` | One-level prototype-chain snapshot. |
| `utils.deepParse(instance)` | `Parsed<T>[]` | Ordered parse() levels from the instance (index 0) to its root. |
| `utils.lineage(instances, options?)` | `LineageGraph` | The lethe lineage export — the cross-language graph format. |
| `utils.toJSON(instance)` | `string` | Generic so the instance type is captured at the call site. |
| `utils.collectConstructors(instance, asSequence?)` | `string[]` when `asSequence: true`, otherwise a `{ [name]: true }` lookup object | Prototype-chain constructor names, up to `Mnemonica`. |
| `new utils.exception(instance, error, ...args)` | `Error` | **Must be called with `new`.** Error instance of the instance's type; data via `getProps()`. |

The complete `utils` collection is: `extract`, `pick`, `parent`, `sibling`,
`exception`, `fork`, `clone`, `toJSON`, `parse`, `deepParse`, `lineage`,
`merge`, `collectConstructors`.

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

`parse` returns a one-level snapshot of the instance's prototype chain.
`parse(null)` is the one non-object input it accepts: the empty shape
(`EmptyParsed` — empty `props`/`joint`, `self: null`, `parent: undefined`),
"nothing was given". `undefined` and every other non-object throw
`WRONG_MODIFICATION_PATTERN`, same as `utils.parent(null)`.

- `name` — constructor name of the immediate prototype.
- `props` — `Extracted<T>` from the instance itself.
- `self` — the original instance reference (`T`).
- `proto` — `Object.getPrototypeOf(instance)`.
- `joint` — enumerable properties copied from `proto`.
- `parent` — the parent INSTANCE: the same object `utils.parent(instance)`
  returns (the `__parent__` of the construction props), not a prototype
  layer. `null` for a root instance — a root's `__parent__` points at
  mnemonica's internal root sentinel, which `parse` reports as no parent,
  and no parent is `null` (the end of the chain).
  Not recursively parsed — walking the whole lineage level by level is
  `utils.deepParse`'s job (below).

```typescript
const parsed = utils.parse(user);
const name: string = parsed.name;
const propsName: string | undefined = parsed.props.name;
const self: typeof user = parsed.self;
const parent: object | undefined = parsed.parent;
```

---

## `utils.deepParse(instance)` in detail

The lineage walker: from the instance to its root through the REAL parent
instances — `parse().parent` hops directly from instance to instance, so
the per-type prototype layers never appear. Returns the ordered list of
parsed levels: index 0 is the instance itself, the last level is its root
(`parent: null`).

```typescript
const levels = utils.deepParse(embed);
// [Parsed<Embed>, Parsed<Chunk>, Parsed<Doc>] — leaf first, root last
levels[0].self === embed;             // true
levels[1].self === utils.parent(embed); // true — the real parent instance
```

A `strictChain: false` lineage may repeat a type name at several levels —
each occurrence is its own level. `utils.fork()` produces a sibling: the
forked instance's chain has the same shape, and its parent level IS the
same instance the forked-from chain shares.

---

## `utils.lineage(instances, options?)` in detail

The lineage export — the lethe format, the contract that crosses process
and language boundaries (`@mnemonica/lethe`). What survives when live
instances are forgotten: which types were declared, who built what from
whom, which data belonged to which level.

```typescript
const graph = utils.lineage([chunk1, chunk2]);
// { version: "1", heads: [id, id], nodes: { [id]: { type, own, parent } } }
```

- `heads` — the exported instances' ids, in argument order.
- `nodes` — every reachable instance, deduplicated at any depth, keyed by
  id. Each node carries `type: { collection, path }` (where the type was
  declared — names collide), `own` (the fields this level set itself), and
  `parent` (the parent's id, `null` at the root).
- A field holding another mnemonica instance exports as `{ $ref: id }` and
  the referenced instance joins `nodes` with its own chain. Values JSON
  cannot carry (functions, symbols, NaN, infinities, cycles) export as
  tagged placeholders `{ $mnemonica: "unsupported", kind: … }` — never an
  error.
- Instance ids are implementation-specific — a per-realm random prefix
  plus a counter, held in a WeakMap (nothing retained). They are stable
  within one realm and never compared across processes or languages; the
  cross-language comparison maps them 1:1 in first-encounter order (see
  the lethe testdata README).
- `options.args` includes construction args as `node.args`;
  `options.props: ['__timestamp__', …]` opts metadata into `node.props`.
- A collection's name for `type.collection` comes from its config
  (`createTypesCollection({ name: 'fixture' })`) and belongs to the
  COLLECTION only — `define(..., { name })` is rejected (`"name" is a
  collection option`). The first collection (the default one) exports as
  `'defaultTypes'`; every later unnamed collection gets an automatic
  unique name — `collection_1`, `collection_2`, … in creation order.

---

## `utils.exception(instance, error, ...args)` in detail

`exception` wraps a caught `Error` in an error instance of the instance's own
type, with a stack traced through the type's construction. It **must be called
with `new`** — without it, mnemonica throws `WRONG_INSTANCE_INVOCATION`
(`'exception should be made with new keyword'`). It is also available as an
instance method:

```typescript
try {
	throw new utils.exception(user, new Error('boom'), 1, 2, 3);
	// equivalent: throw new user.exception(new Error('boom'), 1, 2, 3);
} catch (exception) {
	exception instanceof Error; // true
	// and instanceof the type of `user`
	exception.stack;            // own stack, traced through the constructor definitions
}
```

The error object itself carries nothing but the standard `Error` properties.
The exception data lives in the external props storage — read it with
`getProps()`:

```typescript
const props = getProps(exception);
props.args;          // [1, 2, 3] — extra arguments passed after the error
props.originalError; // the wrapped Error
props.instance;      // the instance the exception was made from
```

When the wrapped error was itself an exception, `exceptionReason`, `reasons`,
and `surplus` are inherited into the new exception's props. Since instances
expose no methods, introspect with `utils.extract(props.instance)` /
`utils.parse(props.instance)`.

---

## `defineStackCleaner(regexp)`

A **top-level export**, not part of `utils`. Registers a `RegExp` that strips
matching lines from every stack mnemonica produces (exception stacks,
modification errors, constructor definition traces). A stack line survives
only when no registered cleaner matches it; if cleaning would remove every
line, the original stack is kept.

```typescript
import { defineStackCleaner } from 'mnemonica';

// hide your framework's internals from mnemonica error stacks
defineStackCleaner(/node_modules\/my-framework/);
```

Passing anything that is not a `RegExp` throws `WRONG_STACK_CLEANER`.

---

## `apply` / `call` / `bind`

Three **top-level exports** that construct a subtype on an existing parent
instance — the programmatic form of `new instance.SubType(...)`:

```typescript
import { apply, call, bind } from 'mnemonica';

const admin1 = apply(user, Admin, [{ role: 'root' }]); // args as an array
const admin2 = call(user, Admin, { role: 'root' });    // args spread
const makeAdmin = bind(user, Admin);                   // (...args) => instance
const admin3 = makeAdmin({ role: 'root' });
```

- `apply(entity, Ctor, args?)` — `args` defaults to `[]`.
- `call(entity, Ctor, ...args)` — same construction, variadic arguments.
- `bind(entity, Ctor)` — returns a `(...args) => instance` closure.

All three return `InstanceResult<Merge<E, T>>`: the parent instance's fields
merged with the new type's fields, with the new type winning on conflicts.

The same construction rules as `new instance.SubType()` apply: `Ctor` must be
defined on the entity's type chain (with `strictChain: true` — the default —
the entity must be an instance of the immediate parent type). If it is not,
mnemonica throws `WRONG_MODIFICATION_PATTERN`
(`[ TypeName ] is not defined as a Type Constructor on used instance`).

---

## Limitations

- `utils.parent(instance, 'TypeName')` cannot return a specific nominal parent
  type without a user-augmented `TypeRegistry`. This is the same limitation as
  `lookup()`: TypeScript cannot retroactively learn the type graph created
  by `define()` calls. See [`./typed-lookup.md`](./typed-lookup.md).
- `utils.parse()` returns `parent` as `object | null` — the parent instance,
  `null` for a root (see `utils.parent` above); deep recursive parsing is
  `utils.deepParse`.
- `utils.toJSON()` always returns `string` — always VALID JSON: the fields
  are collected into a plain object and serialized ONCE, so keys are escaped
  by the serializer itself and an empty field set is `'{}'`.
  `null`/`undefined` fields are omitted; a field value JSON cannot represent
  (a circular structure, a function) is replaced by the description object
  `{ description, stack, message }`. The generic parameter only preserves
  the instance type at the call site for consistency with the other utilities.
