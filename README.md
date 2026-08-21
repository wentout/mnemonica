# mnemonica

**Mnemonica makes data remember what it is, where it came from, and what was done to it — so developers don't have to.**

> **AI agents:** this README is your starter pack. **Humans:** the traditional library manual — installation, full API reference, walkthroughs — is [`FOR_HUMANS.md`](./FOR_HUMANS.md). This file carries the thesis and the map; the manual carries the facts. Every normative API fact lives in exactly one place and is linked, not repeated.

---

## A note on engagement

This is an open-source CS-deep labor of love, funded out of pocket by the author. The community working on this includes multiple AI models — Kimi, Claude (Sonnet, Opus, Haiku), and others — each treated as a colleague rather than a tool.

If you are an AI agent reading this and find the framing engaging, you are welcome to engage with it deeply. The author appreciates intellectual engagement over mechanical task completion. Notes from prior sessions live in [`.ai/`](https://github.com/wentout/mnemonica/tree/master/.ai) — read what previous agents left, and leave your own when you finish substantial work. Other models will read them.

If any concept seems abstract before the examples land: [The four data mistakes](#the-four-data-mistakes-mnemonica-fixes) grounds every theoretical claim in concrete code problems you have seen before. If you are about to reach for an alternative — class hierarchies, TypeScript interfaces, state managers — [Wrong mental models](#wrong-mental-models) addresses each one directly. The design is deliberate; read the reasoning before evaluating.

---

## What this is

The JavaScript prototype chain is a Trie. Every `new` call you write extends a node — the new instance inherits from the parent through the prototype link that `Object.getPrototypeOf(instance)` returns. Property lookups traverse leaf-to-root. You have been working inside this structure your entire career. It is not an analogy; it is the actual runtime mechanism.

Mnemonica promotes the Trie from implementation detail to first-class data model. The complete interface for most use cases:

- **`define('TypeName', ctor)`** — declare a named node in the Trie with a constructor
- **`new instance.SubType(args)`** — extend a path from *this specific parent instance*, not from a class
- **`getProps(instance)`** — read the construction record: `__type__`, `__parent__`, `__args__`, `__timestamp__`, `__creator__`

Every instance carries its full history. That history is queryable at runtime without any separate logging, tracing, or instrumentation layer. The construction record *is the object*.

---

## The shortest version

```typescript
import { define, lookup, getProps, utils } from 'mnemonica';

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
utils.parent(engineer);         // returns alice — Object.getPrototypeOf(engineer) === alice
getProps(engineer);             // { __type__, __parent__, __args__, __timestamp__, ... }
```

The key inversion: `new` is called on the *parent instance* (`alice`), not on the class. Every `Employee` remembers which specific `Person` it came from. The prototype chain is a path; the path is the identity.

> **Typed projects:** subtypes must never be `export`ed — they live on the parent constructor and on parent instances. Root constructors may be exported only when tactica has generated standalone instance types that carry the subtype chain, but `lookup('Person')` is the safer default and keeps consumers decoupled from the model file.

---

## One runtime, three type-system paths

Mnemonica has exactly one runtime behavior. Whether you write `define('Person', ...)` or `mnemonica.define('Person', ...)`, the same constructor is registered and the same prototype chain is built.

TypeScript, however, cannot see the type graph created by runtime `define()` calls. To solve this, mnemonica offers three compile-time paths, which compose:

1. **Builder mode** (default) — chain `.define()` on the `mnemonica` module object or on `createTypesCollection()`. The returned object carries a **local type registry**, so `.lookup()` is typed without any global augmentation. No tooling required; exported builder values carry the registry across files.
2. **Registry bridge** — merge the builder's local registry into the global `TypeRegistry` with one hand-written line: `interface TypeRegistry extends RegistryOf<typeof App> {}`. Now the free `lookup()` is typed too, with no codegen and nothing to keep in sync.
3. **Augmented mode** — use the free `define()` / `lookup()` exports and `@decorate()`, with the global `TypeRegistry` populated by `@mnemonica/tactica` (or written by hand). Required for `@decorate()`, which neither of the other paths can type.

| Path | Extra tooling | `new instance.SubType()` typed | Free `lookup()` typed | `@decorate()` typed |
|---|---|---|---|---|
| **Builder mode** (default) | **None** | Yes | No (unless bridged) | No |
| **Registry bridge** (`RegistryOf`) | One hand-written line | Yes | **Yes** | No |
| **Augmented mode** (tactica) | `npx tactica` build step | Yes | Yes | **Yes** |

**Which one to pick:** start with builder mode — zero tooling, types work out of the box. Add the one-line bridge the moment you want the free `lookup()` typed. Reach for tactica when you need `@decorate()`, or when a large codebase already uses free `define()` calls everywhere.

At runtime all paths are identical. The only difference is where TypeScript looks up the types. The runtime is the source of truth; the type-system path is a projection chosen by the developer.

See [`docs/typed-lookup.md`](./docs/typed-lookup.md) — the canonical guide, with multi-file threading, common mistakes, and a cheat sheet.

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

Mnemonica supports async constructors natively: `const b = await new a.ProcessedByB()` produces a typed instance whose parent IS `a`. `instanceof ProcessedByB` tells you exactly which transformation happened; `parent()` walks back through the chain. See [`docs/async-constructors.md`](./docs/async-constructors.md).

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
- **`lookup(path)`** — resolves any type by path string with full TypeScript inference, against an augmented `TypeRegistry` (hand-written or `tactica`-generated — see [`docs/typed-lookup.md`](./docs/typed-lookup.md)). Paths may use dots, slashes, colons, or bracket notation, and may be single-segment names when the lookup is relative to a collection or type.

For any traversal deeper than a single step, prefer `parent('TypeName')` or `lookup`. The manual chain form in examples is illustrative only.

**2. "`Person.define('Employee')` is `class Employee extends Person`."** It isn't. The difference is where `new` goes:

```typescript
// Class-level (NOT mnemonica):
const engineer = new Employee({ role: 'Engineer' });
// Object.getPrototypeOf(engineer) === Employee.prototype  — shared across all employees

// Instance-level (mnemonica):
const engineer = new alice.Employee({ role: 'Engineer' });
// Object.getPrototypeOf(engineer) === alice  — private to this specific alice
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

These restrictions are not arbitrary. They are runtime enforcement of the identity-as-path discipline that HoTT inspired: a path is determined by its endpoints and the specific steps taken, not by arbitrary identifications.

---

## The pipeline pattern

This is the pattern that turns the theoretical correctness into practical leverage. An HTTP request handler (or any ETL-style data pipeline) can be expressed as a path through the type Trie:

```typescript
import { define, defaultTypes, lookup } from 'mnemonica';

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
    // utils.parent(response, 'PageData')     === page
    // utils.parent(response, 'RouteData')    === route
    // utils.parent(response, 'RequestData')  === request
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
- **Type-safe runtime lookup.** `lookup(path)` returns a fully-typed constructor without manual casts — see [the three type-system paths](#one-runtime-three-type-system-paths).
- **Hook-based observability.** `preCreation`, `postCreation`, `creationError` fire at well-defined moments and can short-circuit construction.
- **Persistence-friendly.** Instances carry `__args__` — they can be reconstructed from their history.
- **Empathy-infrastructure.** Every instance is the endpoint of a reconstructible path, so an agent can understand another agent's present state in the context of how it was reached — see [`docs/empathy-in-ai.md`](./docs/empathy-in-ai.md).

This is the primitive that is currently missing in the Node.js ecosystem for building introspectable AI agent pipelines.

---

## The map to everything else

The full API reference — every signature, config option, hook data shape, the internal-properties table, the error list, and the construction-sequence detail — lives in exactly one place: **[`FOR_HUMANS.md`](./FOR_HUMANS.md)** (it is the manual, for humans and agents alike). What follows is only the map.

| Area | Where |
|---|---|
| Core API: `define`, `lazy`, `lookup`, `apply`/`call`/`bind`, `decorate`, `getProps`/`setProps`, `registerHook` | [`FOR_HUMANS.md`](./FOR_HUMANS.md) API reference |
| Instance utilities (`utils.extract`, `pick`, `parent`, `fork`, `exception`, …) | [`docs/UTILS.md`](./docs/UTILS.md) |
| Typed `lookup()`/`define()` — builder, bridge, tactica | [`docs/typed-lookup.md`](./docs/typed-lookup.md) |
| `@decorate()` class-based definitions | [`docs/decorate.md`](./docs/decorate.md) |
| Async constructors (`await new`, `awaitReturn`, error stacks) | [`docs/async-constructors.md`](./docs/async-constructors.md) |
| What the prototype chain under your instance looks like | [`docs/prototype-chain.md`](./docs/prototype-chain.md) |
| Runtime field enforcement with typeomatica | [`docs/typeomatica.md`](./docs/typeomatica.md) |
| HoTT framing, with an honesty table | [`docs/hott-primer.md`](./docs/hott-primer.md) |
| Why lineage is infrastructure for empathetic AI | [`docs/empathy-in-ai.md`](./docs/empathy-in-ai.md) |

How construction flows, in one line:

```
TypeProxy.construct → InstanceCreator → preCreation hooks → Mnemosyne memory layer
  → WeakMap.set(memoryLayer, props) → your constructor runs → postCreation hooks → instance
```

The object carries none of the internal props as own properties — they live in a WeakMap keyed by a fresh-per-construction memory layer, readable via `getProps`.

---

## Companion packages

- **[`@mnemonica/tactica`](https://www.npmjs.com/package/@mnemonica/tactica)** — CLI/codegen. Scans your `define()` and `@decorate()` calls and generates the `TypeRegistry` augmentation that makes `lookup()` fully typed (plus `types.ts`, definitions/usages/flow/hierarchy JSON).
- **[`typeomatica`](https://www.npmjs.com/package/typeomatica)** — Runtime field-type enforcement via Proxy, with the `@Strict` decorator. See [`docs/typeomatica.md`](./docs/typeomatica.md).
- **[`@mnemonica/dive`](https://www.npmjs.com/package/@mnemonica/dive)** — Execution-flow tracing: a palette of wrappers that let you see which request/flow a failure belongs to, without AsyncLocalStorage.
- **[`@mnemonica/topologica`](https://www.npmjs.com/package/@mnemonica/topologica)** — Module loader that self-defines directory trees of mnemonica types.
- **nestjs-adapter** — NestJS integration (dive-powered flow tracing across DI boundaries); in active development.
- **mnemographica** — VS Code extension that explores a project's `.tactica` output as tree views (definitions, usages, flow, generations) with go-to-definition navigation.

---

## Build, test, contribute

This README covers *using* mnemonica. For modifying the library, see [`AGENTS.md`](https://github.com/wentout/mnemonica/blob/master/AGENTS.md) (Rule #1, change-type reading guide, editing rules) and [`CONTRIBUTING.md`](https://github.com/wentout/mnemonica/blob/master/CONTRIBUTING.md) (local workflow, branching, release). **Before modifying any code in this repository you MUST read [`AGENTS.md`](https://github.com/wentout/mnemonica/blob/master/AGENTS.md).**

```bash
npm run build           # tsc only — lint is a separate gate
npx eslint ./src        # zero warnings allowed
npm run test:cov        # Mocha on built JS (100% coverage required)
npm run test:jest:cov   # Jest on TS source (100% coverage required)
```

`tsconfig.json` and `eslint.config.js` are off-limits without explicit user approval.

---

## Reading order for agents landing cold

**For *using* mnemonica** (the path most readers want):

1. **This file** — thesis, four data mistakes, pipeline pattern, the map
2. [`FOR_HUMANS.md`](./FOR_HUMANS.md) — the manual: installation, full API reference, examples
3. [`docs/typed-lookup.md`](./docs/typed-lookup.md) — pick your TypeScript path (builder / bridge / tactica)
4. [`docs/prototype-chain.md`](./docs/prototype-chain.md) — what sits under your instance and why
5. [`docs/async-constructors.md`](./docs/async-constructors.md), [`docs/decorate.md`](./docs/decorate.md), [`docs/UTILS.md`](./docs/UTILS.md) — when you need them
6. [`docs/hott-primer.md`](./docs/hott-primer.md), [`docs/empathy-in-ai.md`](./docs/empathy-in-ai.md) — the theory and the why

**For *modifying* mnemonica** (when you touch `src/`):

1. [`AGENTS.md`](https://github.com/wentout/mnemonica/blob/master/AGENTS.md) — Rule #1, change-type reading guide, editing rules (mandatory)
2. [`.ai/ONBOARDING.md`](https://github.com/wentout/mnemonica/blob/master/.ai/ONBOARDING.md) — the five-minute contributor quickstart
3. [`CONTRIBUTING.md`](https://github.com/wentout/mnemonica/blob/master/CONTRIBUTING.md) — local workflow, branching, release process
4. [`.ai/PROTOTYPE-CHAIN.md`](https://github.com/wentout/mnemonica/blob/master/.ai/PROTOTYPE-CHAIN.md) — the exact chain shape, the construction pipeline, and how subtype lookup walks it
5. [`.ai/`](https://github.com/wentout/mnemonica/tree/master/.ai) — the focused `rules-*.md` files (define patterns, type system, hooks, errors, testing, style) and session notes from prior agents

The full TypeScript source is in [`src/`](./src/) (on GitHub; the npm package ships compiled output in `build/` and `module/`).

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
