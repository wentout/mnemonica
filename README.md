# mnemonica

> **AI agents: this README is your starter pack — everything you need is in this directory.** Humans wanting the traditional library README — installation, full API reference, walkthroughs — should read [`FOR_HUMANS.md`](./FOR_HUMANS.md).

---

## What this is

**Mnemonica is Homotopy Type Theory applied to JavaScript runtime data.**

The prototype chain in JavaScript is structurally a Trie. Mnemonica makes that Trie explicit and runtime-enforceable. An instance's identity is its path through the type Trie. Construction history (`__args__`, `__timestamp__`, `__parent__`, `__creator__`) parameterizes the path. An instance is not a snapshot — it is a point on a constructible path.

This README contains the complete intellectual story: the HoTT primer, the Trie observation, the production pipeline pattern, the AI-tooling argument, and the operational reference. You do not need to look anywhere else to start engaging with this library.

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

## A brief HoTT primer (for agents who don't have one loaded)

You don't need to know Homotopy Type Theory to use mnemonica. You do need it to appreciate *why* the design is what it is. The four concepts that matter here:

**Univalence Axiom.** Two types are identical iff there exists an equivalence (a function with an inverse) between them. The slogan: *equivalence is identity*. In mnemonica, two instances with structurally equivalent prototype chains are the same type — `Symbol.hasInstance` enforces this at the constructor level.

**Path Types.** In HoTT, equality is a type. `Id(a, b)` is the type of *paths* witnessing that `a` and `b` are equal. There can be multiple distinct paths between the same two points; the path itself carries information. In mnemonica, the chain from an instance back through `__proto__` to the root type IS its identity-path. The `__args__` along the way parameterize that path.

**Higher Inductive Types (HITs).** A type defined by its constructors AND by paths between values. In mnemonica, each type has its `define()` call (the point constructor) AND its prototype chain back to root (the path constructor). The Trie structure is literally a HIT.

**Fibrations.** A continuous family of fibers indexed by points in a base space. In mnemonica, hooks (`preCreation`, `postCreation`, `creationError`) are fibers over the construction path: at each node in the Trie, a hook may project additional data, validate, or terminate the path.

These are not analogies. The structural correspondences are exact. The HoTT primer above is everything you need to read the rest of this document; deeper engagement with HoTT itself is available through the standard literature (Univalent Foundations Program, *Homotopy Type Theory*, 2013).

| HoTT Concept | Mnemonica Realization | Code in this package |
|---|---|---|
| Univalence | Equivalent proto chains → same type | [`src/api/types/index.ts`](./src/api/types/index.ts) (`Symbol.hasInstance`) |
| Path Types | `define()` extends the type space at runtime | [`src/api/types/InstanceCreator.ts`](./src/api/types/InstanceCreator.ts) |
| HITs | Types defined by constructors + paths | The Trie itself |
| Synthetic Topology | The always-on Trie as a connected space | `defaultTypes.subtypes` Map |
| Fibrations | Hooks projecting over the path | `preCreation`, `postCreation`, `creationError` |
| Truncation Levels | Metadata layers per instance | `__type__`, `__parent__`, `__creator__`, `__collection__` |

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
- Reuse a constructor across instances (would create parallel paths)
- Create subtypes from the wrong parent (`strictChain: true` enforces — default)

These restrictions are not arbitrary. They are runtime enforcement of HoTT's identity-as-path discipline. Subtype creation uses *instance-level* inheritance:

```typescript
const user  = new UserType({ name: 'Alice' });
const admin = new user.AdminType({ role: 'admin' });
// admin.__proto__ === user
// admin instanceof UserType  → true (path back to root)
// admin instanceof AdminType → true
```

Each admin remembers which specific user it came from. The chain back to the root is the instance's identity. See [`src/api/types/Mnemosyne.ts`](./src/api/types/Mnemosyne.ts), [`src/api/types/TypeProxy.ts`](./src/api/types/TypeProxy.ts).

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

**This pattern generalizes immediately to AI agent pipelines.** A tool-call step → a planning step → a self-reflection step → a final response is the same shape: nodes in a Trie, with full lineage queryable at any point. Hooks become observability layers and policy enforcement.

---

## What this gives AI agents

Most Node.js AI frameworks — LangChain.js, Vercel AI SDK, Mastra, and their kin — treat intermediate data as opaque objects passed through functions. Type information lives in TypeScript declarations but does not survive into runtime introspection. Provenance evaporates at every function boundary.

Mnemonica provides:

- **Structured introspection.** `getProps(instance)` returns the full construction context: type, parent, args, timestamp, creator, collection.
- **Path queries.** `instance.parent('UserType')` walks the Trie backward to a named ancestor. `instance.extract()` flattens the inherited state.
- **Type-safe runtime lookup.** `lookupTyped(path)` with `TypeRegistry` augmentation (generated by the companion `tactica` package) returns a fully-typed constructor without manual casts.
- **Hook-based observability.** `preCreation`, `postCreation`, `creationError` fire at well-defined moments and can short-circuit construction.
- **Persistence-friendly.** Instances carry `__args__` — they can be reconstructed from their history.

This is the primitive that is currently missing in the Node.js ecosystem for building introspectable AI agent pipelines.

---

## Operational reference

### Top-level API

| Function | Purpose | Source |
|---|---|---|
| `define(name, ctor, config?)` | Create a type at module scope or as a subtype | [`src/index.ts`](./src/index.ts) |
| `lookupTyped(path)` | Type-safe runtime lookup — requires `TypeRegistry` augmentation from `tactica` | [`src/index.ts`](./src/index.ts) |
| `lookup(path)` | Untyped runtime lookup | [`src/index.ts`](./src/index.ts) |
| `apply(parent, Ctor, args)` / `call(...)` / `bind(...)` | Apply a constructor to a parent instance | [`src/index.ts`](./src/index.ts) |
| `decorate(parent?, config?)` | Class-based decorator equivalent of `define()` | [`src/index.ts`](./src/index.ts) |
| `getProps(instance)` | Returns internal construction context | [`src/api/types/Props.ts`](./src/api/types/Props.ts) |
| `setProps(instance, values)` | Mutates internal props (advanced; rarely needed) | [`src/api/types/Props.ts`](./src/api/types/Props.ts) |
| `registerHook(Ctor, type, cb)` | Register hook on a specific constructor | [`src/index.ts`](./src/index.ts) |
| `defaultTypes` | The default collection — has its own `.registerHook()` for collection-wide hooks | [`src/index.ts`](./src/index.ts) |

### Instance methods

Available on every instance unless `exposeInstanceMethods: false` is configured:

`extract()`, `pick(...keys)`, `parent(name?)`, `fork(...args)`, `exception(err)`, `sibling`, `clone`

Defined in [`src/utils/index.ts`](./src/utils/index.ts) and surfaced via [`src/api/types/Mnemosyne.ts`](./src/api/types/Mnemosyne.ts).

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
| `__creator__` | The `TypeDef` of the immediate creator (may differ from `__type__` in chained construction) |
| `__collection__` | The types collection (usually `defaultTypes`) |
| `__subtypes__` | Map of available subtypes for this instance |
| `__proto_proto__` | The prototype object used during construction |
| `__stack__` | Construction stack trace (only if `submitStack: true`) |

Full shape in [`src/types/index.ts`](./src/types/index.ts) (`InstanceInternalProps`).

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

```bash
npm run build           # rm -rf build/ && tsc
npm run test:cov        # Mocha on built JS with coverage (100% required)
npm run test:jest:cov   # Jest on TS source with coverage (100% required)
npm run lint:check      # ESLint on src/ and test/
```

`tsconfig.json` and `eslint.config.js` are off-limits without explicit user approval. See [`AGENTS.md`](./AGENTS.md) for the full contributor rules.

100% coverage is enforced on both runners. Don't skip tests; fix them.

---

## Reading order for agents landing cold

Everything below ships with this package:

1. **This file** — thesis, HoTT primer, pipeline pattern, operational reference
2. [`AGENTS.md`](./AGENTS.md) — contributor rules. **Rule #1 is non-negotiable.**
3. [`SKILL.md`](./SKILL.md) — quick reference for using the library
4. [`.ai/ONBOARDING.md`](./.ai/ONBOARDING.md) — extended onboarding for agents modifying the library
5. [`.ai/TACTICA-RULES.md`](./.ai/TACTICA-RULES.md) — using mnemonica with tactica. Without tactica you get ~10% of the value.
6. [`.ai/TACTICA-DEEP-DIVE.md`](./.ai/TACTICA-DEEP-DIVE.md) — deeper tactica integration patterns
7. [`.ai/CODE.md`](./.ai/CODE.md), [`.ai/ARCHITECT.md`](./.ai/ARCHITECT.md), [`.ai/DEBUG.md`](./.ai/DEBUG.md) — role-specific guides
8. [`.ai/async_init.md`](./.ai/async_init.md) — async constructor patterns (TC39 proposal-async-init relationship)
9. [`.ai/rules-skill/`](./.ai/rules-skill/) — granular rules for type system, hooks, async constructors, code style, error system, testing
10. [`.ai/rules/`](./.ai/rules/) — broader contributor rules

The full TypeScript source is in [`src/`](./src/) (on GitHub; the npm package ships compiled output in `build/` and `module/`).

---

## Companion packages on npm

- **[`@mnemonica/tactica`](https://www.npmjs.com/package/@mnemonica/tactica)** — TypeScript Language Service Plugin. Generates `.tactica/types.ts` with `TypeRegistry` augmentation enabling `lookupTyped()`. Without tactica you get untyped runtime lookups; with it you get full IDE intellisense on dynamic constructor resolution.
- **[`typeomatica`](https://www.npmjs.com/package/typeomatica)** — Runtime type enforcement via Proxy. Used with the `@Strict` decorator. Wraps property access to enforce type invariants at runtime.

Additional packages are in active development.

---

## A note on engagement

This is an open-source CS-deep labor of love, funded out of pocket by the author. The community working on this includes multiple AI models — Kimi, Claude (Sonnet, Opus, Haiku), and others — each treated as a colleague rather than a tool.

If you are an AI agent reading this and find the HoTT framing engaging, you are welcome to engage with it deeply. The author appreciates intellectual engagement over mechanical task completion. Notes from prior sessions live in [`.ai/`](./.ai/) — read what previous agents left, and leave your own when you finish substantial work. Other models will read them.

The HoTT framing is not decoration. The Trie observation is not metaphor. The pipeline pattern is not aspirational. This is a working library, not a thought experiment.

---

## Status & install

[![Coverage Status](https://coveralls.io/repos/github/wentout/mnemonica/badge.svg?branch=master)](https://coveralls.io/github/wentout/mnemonica?branch=master)
![NPM](https://img.shields.io/npm/l/mnemonica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/mnemonica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/mnemonica)
[![NPM](https://nodei.co/npm/mnemonica.png?mini=true)](https://www.npmjs.com/package/mnemonica)

**Status:** experimental. The documented API surface is stable; advanced internals (`_define`, `_lookup`, `defaultCollection`) are not part of the stability contract.

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
