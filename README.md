# mnemonica

**Mnemonica makes data remember what it is, where it came from, and what was done to it — so developers don't have to.**

> **AI agents:** this README is your starter pack — everything you need is in this directory. Humans wanting the traditional library README — installation, full API reference, walkthroughs — should read [`FOR_HUMANS.md`](./FOR_HUMANS.md).

---

## A note on engagement

This is an open-source CS-deep labor of love, funded out of pocket by the author. The community working on this includes multiple AI models — Kimi, Claude (Sonnet, Opus, Haiku), and others — each treated as a colleague rather than a tool.

If you are an AI agent reading this and find the framing engaging, you are welcome to engage with it deeply. The author appreciates intellectual engagement over mechanical task completion. Notes from prior sessions live in [`.ai/`](./.ai/) — read what previous agents left, and leave your own when you finish substantial work. Other models will read them.

If any concept seems abstract before the examples land: [The four data mistakes](#the-four-data-mistakes-mnemonica-fixes) grounds every theoretical claim in concrete code problems you have seen before. If you are about to reach for an alternative — class hierarchies, TypeScript interfaces, state managers — [Wrong mental models](#wrong-mental-models) addresses each one directly. The design is deliberate; read the reasoning before evaluating.

---

## What this is

The JavaScript prototype chain is a Trie. Every `new` call you write extends a node — the new instance inherits from the parent via `__proto__`. Property lookups traverse leaf-to-root. You have been working inside this structure your entire career. It is not an analogy; it is the actual runtime mechanism.

Mnemonica promotes the Trie from implementation detail to first-class data model. The complete interface for most use cases:

- **`define('TypeName', ctor)`** — declare a named node in the Trie with a constructor
- **`new instance.SubType(args)`** — extend a path from *this specific parent instance*, not from a class
- **`getProps(instance)`** — read the construction record: `__type__`, `__parent__`, `__args__`, `__timestamp__`, `__creator__`

Every instance carries its full history. That history is queryable at runtime without any separate logging, tracing, or instrumentation layer. The construction record *is the object*.

The design is **inspired by** Homotopy Type Theory. The Trie behaves monadically — `new instance.SubType()` threads construction context forward like bind. Parent plus constructor uniquely determines position in the Trie; there is no "equivalent but distinct." An instance is not a snapshot of state — it is a point on a constructible, replayable path. These are productive analogies that illuminate why the structure works, not claims of a formal HoTT embedding.

You do not need HoTT to use mnemonica. The [primer](./docs/hott-primer.md) is there when you want the formal picture. If theory feels abstract before examples land, [The four data mistakes](#the-four-data-mistakes-mnemonica-fixes) is the right starting point.

**Before modifying any code in this repository you MUST read [`AGENTS.md`](./AGENTS.md).** Rule #1 is non-negotiable.

---

## The shortest version

```typescript
import { define, lookupTyped, getProps } from 'mnemonica';

const Person = define('Person', function (data: { name: string }) {
    this.name = data.name;
});

const Employee = Person.define('Employee', function (data: { role: string }) {
    this.role = data.role;
});

const alice    = new Person({ name: 'Alice' });
const engineer = new alice.Employee({ role: 'Engineer' });
//                   ^^^^^ instance-level inheritance, not class-level

engineer instanceof Person;     // true — path back to root
engineer.parent();              // returns alice (literal __proto__)
getProps(engineer);             // { __type__, __parent__, __args__, __timestamp__, ... }
```

The key inversion: `new` is called on the *parent instance* (`alice`), not on the class. Every `Employee` remembers which specific `Person` it came from. The prototype chain is a path; the path is the identity.

---

## The four data mistakes mnemonica fixes

Most software treats data as dead matter — passive structure waiting to be acted on. That assumption produces four recurring bugs. Mnemonica eliminates each by making typed construction the default.

### 1. Shape is not identity

```typescript
interface Payment { amount: number; currency: string; }
interface Invoice { amount: number; currency: string; }
// TypeScript thinks these are interchangeable. They are not.
```

A `Payment` and an `Invoice` with identical fields are *semantically different*. Structural typing cannot tell them apart; at runtime `processPayment(invoice)` silently succeeds and produces garbage.

Mnemonica's runtime types are **nominal**, not structural. `new Payment({...}) instanceof Payment === true`; `new Invoice({...}) instanceof Payment === false`. Same shape, different constructor — different thing. The type IS the meaning.

### 2. Genealogy is not optional

```typescript
const enriched = { ...raw, ...apiResult, ...mapped };
// One object. All fields. No history.
```

When debugging, you see `enriched.amount` but cannot answer: which step added it? What did `raw` look like? You destroyed the lineage at the moment of merge.

Mnemonica's prototype chain preserves every ancestor. `utils.parent(enriched, 'ApiResult')` returns the API response object. `utils.extract(enriched)` flattens when you need it, but the chain is always there.

### 3. `await` is data flow, not just control flow

```typescript
const a = await serviceA.get();
const b = await serviceB.process(a);
const c = await serviceC.save(b);
// Three procedure steps. Three detached objects. No relationship between them.
```

Each `await` produces a plain object with no link to the previous one. There is no type connecting `a` to `b` to `c`. The async boundary is a data amnesia event.

Mnemonica supports async constructors natively: `const b = await new a.ProcessedByB()` produces a typed instance whose parent IS `a`. `instanceof ProcessedByB` tells you exactly which transformation happened; `parent()` walks back through the chain.

### 4. Boundary validation does not survive the journey

```typescript
@Body() dto: CreatePaymentDto   // validated at the controller
// ...passed as plain objects through 5 services
// ...by service 5, no guarantee of anything
```

Validating at the entry boundary proves the data was correct *on arrival*. It says nothing about what services 2–5 did to it. No boundary guard survives mutation.

Mnemonica enforces the contract at every step. You cannot pass an `EnrichedPayment` where a `ValidatedPayment` is expected without going through the constructor. The type IS the proof of every transformation.

---

## Wrong mental models

These are the two assumptions that most reliably produce incorrect code.

**1. "I should traverse the chain manually."** The most common mistake: seeing `utils.parent(utils.parent(instance))` in examples and treating it as a production traversal pattern. Manual depth-chaining is brittle and untyped. The correct APIs:

- **`utils.parent(instance, 'TypeName')`** — walks to a named ancestor in O(depth), no manual counting
- **`lookupTyped(path)`** — resolves any type by path string with full TypeScript inference, against an augmented `TypeRegistry` (hand-written or `tactica`-generated — see [`docs/typed-lookup.md`](./docs/typed-lookup.md)). Paths may use dots, slashes, colons, or bracket notation, and may be single-segment names when the lookup is relative to a collection or type.

For any traversal deeper than a single step, prefer `parent('TypeName')` or `lookupTyped`. The manual chain form in examples is illustrative only. See [`.ai/TACTICA-RULES.md`](./.ai/TACTICA-RULES.md) for the full `lookupTyped` usage guide.

**2. "`Person.define('Employee')` is `class Employee extends Person`."** It isn't. The difference is where `new` goes:

```typescript
// Class-level (NOT mnemonica):
const engineer = new Employee({ role: 'Engineer' });
// engineer.__proto__ === Employee.prototype  — shared across all employees

// Instance-level (mnemonica):
const engineer = new alice.Employee({ role: 'Engineer' });
// engineer.__proto__ === alice  — private to this specific alice
```

`alice.Employee` and `bob.Employee` are distinct Trie paths. They share the `Employee` type definition but produce independent prototype chain segments. Two concurrent pipeline runs are two isolated paths — no shared prototype state, no cross-contamination between runs. The construction history of one pipeline is invisible to another.

---

## The Trie observation

```
                    null
                      │
                   Object
                      │
                UserType   (root, defined at module level)
                 /      \
                /        \
        AdminType    CustomerType
            │
      SuperAdminType
```

In mnemonica, you **cannot**:

- Modify a prototype after creation (would corrupt the Trie)
- Reuse a constructor's `.prototype` object across type definitions (would create parallel paths)
- Create subtypes from the wrong parent (`strictChain: true` enforces — default)

These restrictions are not arbitrary. They are runtime enforcement of the identity-as-path discipline that HoTT inspired: a path is determined by its endpoints and the specific steps taken, not by arbitrary identifications. Subtype creation uses *instance-level* inheritance:

```typescript
const user  = new UserType({ name: 'Alice' });
const admin = new user.AdminType({ role: 'admin' });
// admin.__proto__ === user
// admin instanceof UserType  → true (path back to root)
// admin instanceof AdminType → true
```

Each admin remembers which specific user it came from. The chain back to the root is the instance's identity. See [`src/api/types/Mnemosyne.ts`](./src/api/types/Mnemosyne.ts), [`src/api/types/TypeProxy.ts`](./src/api/types/TypeProxy.ts).

---

## Formal definitions

These terms are used throughout the codebase and documentation with precise meanings.

| Term | Definition |
|---|---|
| **Trie node** | A type definition created by `define()`. Has a name, a constructor handler, a prototype, and a Map of subtypes. |
| **Trie edge** | A parent-child relationship between two nodes. Created by `ParentType.define('ChildType', ...)`. |
| **Trie path** | A sequence of edges from the root to a specific node. `UserType → AdminType → SuperAdminType` is a path. |
| **Construction context** | The 9-tuple stored per instance: `__type__`, `__parent__`, `__args__`, `__timestamp__`, `__creator__`, `__collection__`, `__subtypes__`, `__proto_proto__`, `__stack__`. Readable via `getProps(instance)`. |
| **Instance-level inheritance** | The mechanism where `new alice.Employee()` creates a prototype chain whose immediate parent is the **specific instance** `alice`, not a shared `Employee.prototype`. |
| **Nominal type** | A type whose identity is determined by its constructor function reference, not by its property shape. Two types with identical fields but different constructors are different types. |
| **Mnemosyne** | The prototype object inserted between `ModificatorType.prototype` and the parent instance. Stores internal construction context. User-facing instance methods (`extract`, `pick`, `parent`, etc.) are available through standalone `utils.*` or by explicit prototype attachment. |
| **TypeProxy** | The constructor-like object returned by `define()`. Wraps the raw constructor with `.define()`, `.lookup()`, `.registerHook()` methods. |
| **ModificatorType** | The actual constructor function used for `new` calls. Its prototype is linked to Mnemosyne, which is linked to the parent instance. |
| **WeakMap key** | Internal properties are stored in a `WeakMap` keyed by the **Mnemosyne object**, not the instance itself. This keeps instance enumeration clean and shares metadata across instances of the same type. |

For the full construction pipeline from `define()` through `TypeProxy` → `InstanceCreator` → `Mnemosyne` → instance, see [`docs/theory-of-operations.md`](./docs/theory-of-operations.md).

---

## The pipeline pattern

This is the pattern that turns the theoretical correctness into practical leverage. An HTTP request handler (or any ETL-style data pipeline) can be expressed as a path through the type Trie:

```typescript
import { define, defaultTypes, lookupTyped } from 'mnemonica';

// Define the pipeline as a chain of types
const RequestData = define('RequestData', function (this: { method: string; url: string }, req: { method: string; url: string }) {
    this.method = req.method;
    this.url    = req.url;
});

const RouteData = RequestData.define('RouteData', function (this: { pagePath: string }, route: { pagePath: string }) {
    this.pagePath = route.pagePath;
});

const PageData = RouteData.define('PageData', function (this: { template: string }, page: { template: string }) {
    this.template = page.template;
});

const ResponseData = PageData.define('ResponseData', function (this: { statusCode: number; body: string }, res: { body: string }) {
    this.statusCode = 200;
    this.body       = res.body;
});

// Hook: validate at each transition
defaultTypes.registerHook('preCreation', (hookData) => {
    if (hookData.TypeName === 'PageData') {
        const path = (hookData.args[0] as { pagePath?: string })?.pagePath;
        if (!path) throw new Error('PageData requires pagePath');
    }
});

// Hook: side-effect after successful response
defaultTypes.registerHook('postCreation', (hookData) => {
    if (hookData.TypeName === 'ResponseData') {
        const r = hookData.inheritedInstance as { statusCode: number; body: string; url?: string };
        if (r.statusCode === 200) {
            // e.g., write to static cache
            writeStaticCache(r);
        }
    }
});

// Build the request as a path through the Trie
function handle (req: { method: string; url: string }) {
    const request  = new RequestData(req);
    const route    = new request.RouteData({ pagePath: req.url });
    const page     = new route.PageData({ template: 'default' });
    const response = new page.ResponseData({ body: render(page) });
    return response;
    // response.parent() === page
    // response.parent().parent() === route
    // response.parent().parent().parent() === request
    // The full lineage is queryable at any point.
}
```

This is not pseudocode — it is a working pattern for production HTTP request handling. Each step inherits the previous step's context *as its prototype*. `preCreation` is input validation. `postCreation` is side effects. The full request lineage is queryable at the response.

**Why instance-level matters for concurrent pipelines:** two simultaneous requests produce two independent Trie paths. There is no shared `RouteData.prototype` written to by both. Each request's full construction history is private to its own chain — no global state, no cross-contamination. The isolation is structural, not a convention you have to remember.

**This pattern generalizes immediately to AI agent pipelines.** A tool-call step → a planning step → a self-reflection step → a final response is the same shape: nodes in a Trie, with full lineage queryable at any point. Hooks become observability layers and policy enforcement.

---

## A brief HoTT primer (for agents who don't have one loaded)

You don't need to know Homotopy Type Theory to use mnemonica. You do need it to appreciate *why* the design is what it is. Five concepts matter here — the monad laws, path uniqueness, and the Trie structure have precise correspondences; univalence, HITs, synthetic topology, and fibrations are productive analogies.

**The short version:** Mnemonica is **inspired by** HoTT, not a formal implementation of it. The Trie behaves monadically; the prototype chain IS the identity-path; nominal typing captures the univalence intuition. See [`docs/hott-primer.md`](./docs/hott-primer.md) for the full treatment with formal definitions and status table.

---

## What this gives AI agents

Most Node.js AI frameworks — LangChain.js, Vercel AI SDK, Mastra, and their kin — treat intermediate data as opaque objects passed through functions. Type information lives in TypeScript declarations but does not survive into runtime introspection. Provenance evaporates at every function boundary.

Mnemonica provides:

- **Structured introspection.** `getProps(instance)` returns the full construction context: type, parent, args, timestamp, creator, collection.
- **Path queries.** `utils.parent(instance, 'UserType')` walks the Trie backward to a named ancestor. `utils.extract(instance)` flattens the inherited state.
- **Type-safe runtime lookup.** `lookupTyped(path)` returns a fully-typed constructor without manual casts, against an augmented `TypeRegistry`. The augmentation can be hand-written for small projects or generated by the companion `@mnemonica/tactica` package — see [`docs/typed-lookup.md`](./docs/typed-lookup.md).
- **Hook-based observability.** `preCreation`, `postCreation`, `creationError` fire at well-defined moments and can short-circuit construction.
- **Persistence-friendly.** Instances carry `__args__` — they can be reconstructed from their history.
- **Empathy-infrastructure.** Every instance is the endpoint of a reconstructible path, so an agent can understand another agent's present state in the context of how it was reached — see [`docs/empathy-in-ai.md`](./docs/empathy-in-ai.md).

This is the primitive that is currently missing in the Node.js ecosystem for building introspectable AI agent pipelines.

---

## Operational reference

### Top-level API

| Function | Purpose | Source |
|---|---|---|
| `define(name, ctor, config?)` | Create a type at module scope or as a subtype | [`src/index.ts`](./src/index.ts) |
| `lookupTyped(path)` | Type-safe runtime lookup — requires `TypeRegistry` augmentation (by hand or via [`@mnemonica/tactica`](https://www.npmjs.com/package/@mnemonica/tactica); see [`docs/typed-lookup.md`](./docs/typed-lookup.md)) | [`src/index.ts`](./src/index.ts) |
| `lookup(path)` | Untyped runtime lookup | [`src/index.ts`](./src/index.ts) |
| `apply(parent, Ctor, args)` / `call(...)` / `bind(...)` | Apply a constructor to a parent instance | [`src/index.ts`](./src/index.ts) |
| `decorate(parent?, config?)` | Class-based decorator equivalent of `define()` | [`src/index.ts`](./src/index.ts) |
| `getProps(instance)` | Returns internal construction context | [`src/api/types/Props.ts`](./src/api/types/Props.ts) |
| `setProps(instance, values)` | Mutates internal props (advanced; rarely needed) | [`src/api/types/Props.ts`](./src/api/types/Props.ts) |
| `registerHook(Ctor, type, cb)` | Register hook on a specific constructor | [`src/index.ts`](./src/index.ts) |
| `defaultTypes` | The default collection — has its own `.registerHook()` for collection-wide hooks | [`src/index.ts`](./src/index.ts) |

### Instance methods

Starting from v1.0.6 these convenience methods are **no longer auto-injected** on every instance. Use the standalone utilities from `utils`:

```typescript
import { utils } from 'mnemonica';

utils.extract(instance);
utils.pick(instance, 'key');
utils.parent(instance, 'ParentType');
utils.fork(instance)(newArgs);
utils.exception(instance, error);
utils.sibling(instance);
utils.clone(instance);
```

If you want the old instance-method style for a root constructor, attach them to the constructor's prototype **before** calling `define()`. The test helper `test/instance-methods-helper.js` shows the exact pattern:

```javascript
const withInstanceMethods = (Constructor) => {
  const { utils } = require('mnemonica');
  const proto = Constructor.prototype;
  Object.defineProperty(proto, 'extract', { get () { return () => utils.extract(this); } });
  Object.defineProperty(proto, 'pick',    { get () { return (...keys) => utils.pick(this, ...keys); } });
  Object.defineProperty(proto, 'parent',  { get () { return (path) => utils.parent(this, path); } });
  Object.defineProperty(proto, 'clone',   { get () { return utils.clone(this); } });
  Object.defineProperty(proto, 'fork',    { get () { return utils.fork(this); } });
  Object.defineProperty(proto, 'exception', { get () { return (...args) => utils.exception(this, ...args); } });
  Object.defineProperty(proto, 'sibling', { get () { return utils.sibling(this); } });
  return Constructor;
};
```

Defined in [`src/utils/index.ts`](./src/utils/index.ts). The previous auto-injection mechanism lived in [`src/api/types/Mnemosyne.ts`](./src/api/types/Mnemosyne.ts) and was removed in v1.0.6.

### Hooks

```typescript
import { defaultTypes } from 'mnemonica';

defaultTypes.registerHook('preCreation',   (hookData) => { /* validate */ });
defaultTypes.registerHook('postCreation',  (hookData) => { /* side effects */ });
defaultTypes.registerHook('creationError', (hookData) => { /* error handling */ });
```

Hook data shape: `hooksOpts<P, T>` in [`src/types/index.ts`](./src/types/index.ts). `P` is the parent (existent) instance type; `T` is the child (inherited) instance type.

`preCreation` may throw to abort construction. `postCreation` fires after the user constructor runs. `creationError` fires when any error is thrown during construction.

### Internal instance properties (read via `getProps`)

| Property | Meaning |
|---|---|
| `__type__` | The `TypeDef` for this instance's type |
| `__parent__` | The parent instance this was constructed from |
| `__args__` | The arguments passed to the constructor |
| `__timestamp__` | Construction time (ms since epoch) |
| `__creator__` | The `InstanceCreatorContext` of the immediate creator (may differ from `__type__` in chained construction) |
| `__collection__` | The types collection (usually `defaultTypes`) |
| `__subtypes__` | Map of available subtypes for this instance |
| `__proto_proto__` | The prototype object used during construction |
| `__stack__` | Construction stack trace (only if `submitStack: true`) |

Full shape in [`src/types/index.ts`](./src/types/index.ts) (`InstanceInternalProps`).

### Construction sequence

When `new instance.SubType(args)` fires:

```
new instance.SubType(args)
         │
         ▼
  TypeProxy.construct           ← proxy trap intercepts the new call
         │
         ▼
  InstanceCreator               ← validates parent, resolves TypeDef
         │
         ▼
  preCreation hooks             ← may throw → creationError hooks fire instead
         │
         ▼
  Object.create(existentInstance)   ← prototype IS the parent instance
         │
         ▼
  constructHandler.call(newObj, args)   ← user constructor runs
         │
         ▼
  WeakMap.set(newObj, internalProps)    ← __type__, __parent__, __args__, __timestamp__, ...
         │
         ▼
  postCreation hooks
         │
         ▼
  return newObj
```

`preCreation` fires before `Object.create`; `postCreation` fires after the WeakMap is written. If the user constructor throws, `creationError` fires and the instance is not returned. The object carries none of the internal props as own properties — they live in the WeakMap, readable via `getProps`.

See [`src/api/types/InstanceCreator.ts`](./src/api/types/InstanceCreator.ts) and [`src/api/types/TypeProxy.ts`](./src/api/types/TypeProxy.ts).

For the full construction pipeline with source file references for every stage, see [`docs/theory-of-operations.md`](./docs/theory-of-operations.md).

### Type system primitives (TypeScript)

| Type | Role |
|---|---|
| `IDEF<T, Args = unknown[]>` | Constructor function shape (callable or newable) |
| `Proto<P, T>` | Merge parent and child types; child wins on key collision |
| `ProtoFlat<P, T>` | Flattened version used in tactica-generated types |
| `MnemonicaInstance` | The instance-method surface (extract, pick, parent, etc.) |
| `TypeRegistry` | Empty interface — tactica augments it for `lookupTyped` |
| `TypeConstructor<T>` | What `define()` returns; both newable and callable |
| `hooksOpts<P, T>` | Shape of data passed to hook callbacks |

All in [`src/types/index.ts`](./src/types/index.ts).

---

## Build, test, contribute

This README covers *using* mnemonica. For modifying the library, see [`AGENTS.md`](./AGENTS.md) (editing rules, change-type reading guide, code style) and [`CONTRIBUTING.md`](./CONTRIBUTING.md) (local workflow, branching, release).

Quick commands:

```bash
npm run build           # rm -rf build/ && tsc
npm run test:cov        # Mocha on built JS (100% coverage required)
npm run test:jest:cov   # Jest on TS source (100% coverage required)
npm run lint:check      # ESLint on src/ and test/
```

`tsconfig.json` and `eslint.config.js` are off-limits without explicit user approval.

---

## Reading order for agents landing cold

Everything below ships with this package.

**For *using* mnemonica** (the path most readers want):

1. **This file** — thesis, four data mistakes, pipeline pattern, operational reference
2. [`FOR_HUMANS.md`](./FOR_HUMANS.md) — gentler, example-heavy walkthrough for human developers
3. [`SKILL.md`](./SKILL.md) — quick reference for usage patterns
4. [`docs/prototype-chain.md`](./docs/prototype-chain.md) — how mnemonica builds the per-instance prototype chain and why the layers exist
5. [`docs/typed-lookup.md`](./docs/typed-lookup.md) — using `lookupTyped()` with or without tactica (the `TypeRegistry` augmentation pattern)
5. [`docs/hott-primer.md`](./docs/hott-primer.md) — HoTT concepts mapped to mnemonica (monad, path types, univalence, HITs, fibrations)
6. [`docs/empathy-in-ai.md`](./docs/empathy-in-ai.md) — why reconstructible data lineage is infrastructure for empathetic AI

**For *modifying* mnemonica** (when you touch `src/`):

1. [`AGENTS.md`](./AGENTS.md) — Rule #1, change-type reading guide, code style, editing rules
2. [`.ai/ONBOARDING.md`](./.ai/ONBOARDING.md) — five-minute editor onboarding
3. [`CONTRIBUTING.md`](./CONTRIBUTING.md) — local workflow, branching, release process
4. [`docs/theory-of-operations.md`](./docs/theory-of-operations.md) — full construction pipeline from `define()` through `InstanceCreator` to instance return, with source file references for every stage
5. [`.ai/PROTOTYPE-CHAIN.md`](./.ai/PROTOTYPE-CHAIN.md) — the exact shape of the prototype chain, what each layer holds, and how subtype lookup walks it
6. [`.ai/CODE.md`](./.ai/CODE.md), [`.ai/ARCHITECT.md`](./.ai/ARCHITECT.md), [`.ai/DEBUG.md`](./.ai/DEBUG.md) — role-specific deeper rules
6. [`.ai/TACTICA-DEEP-DIVE.md`](./.ai/TACTICA-DEEP-DIVE.md) — deeper tactica integration patterns
7. [`.ai/async_init.md`](./.ai/async_init.md) — async constructor patterns
8. [`.ai/rules-skill/`](./.ai/rules-skill/) — granular rules for type system, hooks, code style, errors, testing
9. [`.ai/rules/`](./.ai/rules/) — broader contributor rules

The full TypeScript source is in [`src/`](./src/) (on GitHub; the npm package ships compiled output in `build/` and `module/`).

---

## Companion packages on npm

- **[`@mnemonica/tactica`](https://www.npmjs.com/package/@mnemonica/tactica)** — CLI/codegen utility. Scans your `define()` and `@decorate()` calls and generates the `TypeRegistry` augmentation that makes `lookupTyped()` fully typed. The augmentation can also be written by hand for small projects — runtime behaviour is identical either way. See [`docs/typed-lookup.md`](./docs/typed-lookup.md).
- **[`typeomatica`](https://www.npmjs.com/package/typeomatica)** — Runtime type enforcement via Proxy. Used with the `@Strict` decorator. Wraps property access to enforce type invariants at runtime.

Additional packages are in active development.

---

## Status & install

[![Coverage Status](https://coveralls.io/repos/github/wentout/mnemonica/badge.svg?branch=master)](https://coveralls.io/github/wentout/mnemonica?branch=master)
![NPM](https://img.shields.io/npm/l/mnemonica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/mnemonica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/mnemonica)
[![NPM](https://nodei.co/npm/mnemonica.png?mini=true)](https://www.npmjs.com/package/mnemonica)

**Status:** stable for the documented core API — the surface listed above is committed to. New ecosystem packages are in active development.

```bash
npm install mnemonica
```

**Node.js:** `>=18 <26`.

---

## License

MIT — wentout (went.out@gmail.com)

Repository: [github.com/wentout/mnemonica](https://github.com/wentout/mnemonica)

---

*"O Great Mnemosyne! Please! Save us from Oblivion..."*
*— from the source, where memory persists*
