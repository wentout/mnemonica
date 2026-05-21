# Onboarding — New Agent Quickstart

> **Read this first.** One file. Five minutes. Everything you need to contribute to mnemonica without reading 8+ files.

---

## What Is mnemonica?

An **instance inheritance system** for JavaScript/TypeScript. You define types with `define()` and create instances that inherit through prototype chains — not just classes, but between instances.

```typescript
const User = define('User', function (this: UserData, data: UserData) {
	Object.assign(this, data);
});

const user  = new User({ name: 'John' });
const admin = new user.Admin({ role: 'admin' }); // inherits from user instance
```

**Scope:** mnemonica types the data flow, not the control flow. It gives data memory of its own creation (type, parent, arguments, timestamp) but does not dictate how services, algorithms, or control flow work. Keep behavior code intact; mnemonica only replaces plain data objects with typed instances.

**The greater view.** mnemonica does not add a new abstraction on top of JavaScript — it makes an existing one explicit. The prototype chain is already a Trie; every `new` already extends a node. `new user.Admin()` is not a library call — it is JavaScript's prototype mechanism used deliberately. mnemonica names each node, stores the construction arguments at each step, and makes the chain queryable. The thing you have been building with manually all along, made first-class.

**Why not class hierarchies?** Class inheritance shares `Admin.prototype` across all instances. Two concurrent requests both creating `Admin` instances share the same prototype. `new user.Admin()` creates a chain where `user` IS the prototype — each pipeline run is isolated structurally, not by convention.

**Why not TypeScript interfaces alone?** TypeScript is structural at compile time: a `Payment` and an `Invoice` with identical fields are interchangeable to the type checker. At runtime, `processPayment(invoice)` silently succeeds and produces wrong results. mnemonica's runtime types are nominal — the type IS its name, established at `define()` time and stable thereafter.

**Why not Object.assign / spread?** `{...raw, ...apiResult}` is one flat object with no lineage. You cannot answer "which step set `amount`?" without reading the source. mnemonica's prototype chain preserves every ancestor; `enriched.parent('ApiResult')` returns the exact API response object.

---

## Build & Test

```bash
# Install dependencies
npm ci

# Build TypeScript
npm run build

# Run Mocha tests with coverage (runs build:all internally)
npm run test:cov

# Run Jest tests with coverage (TypeScript source, faster)
npm run test:jest:cov

# Watch mode
npm run watch
```

**Rule:** `npm run test:cov` before completing any task. It validates the build and ensures 100% coverage.

**Build tip:** Check the **beginning** of build output for errors. For tests, the end is fine.

---

## Code Style (Non-Negotiable)

### Indentation
- **TABS ONLY** — never spaces. Tab width: 4.

### Function Spacing
```typescript
function myFunc () { }     // ✓ space before paren
function myFunc() { }      // ✗ wrong
```

### Return Statements
**Always use an intermediate variable before returning.**

```typescript
// ✓ GOOD — inspectable in debugger
const result = { target, name };
return result;

// ✗ BAD — can't inspect
return { target, name };
```

### TypeScript Types
- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- **No `any`** (`@typescript-eslint/no-explicit-any: error`) — use purpose-specific interfaces
- **Never** use bare `Function`, `CallableFunction`, or `NewableFunction` — define purpose-specific interfaces

---

## Architecture

```
src/
├── index.ts           # Main exports: define, lookup, apply, call, bind
├── types/index.ts     # TypeScript type definitions
├── constants/         # Symbols and default options
├── descriptors/       # Type collection and error definitions
├── api/               # Core implementation
│   ├── types/         # TypeProxy, InstanceCreator, Mnemosyne
│   ├── errors/        # Error handling and stack traces
│   ├── hooks/         # Lifecycle hooks
│   └── utils/         # Utilities
└── utils/             # Public utilities (extract, parse, merge, etc.)
```

Key components:
- **TypeProxy** — wraps type constructors
- **InstanceCreator** — orchestrates construction lifecycle
- **Mnemosyne** — handles instance method access via Proxy

---

## Testing Rules

- **Dual framework:** Mocha (transpiled `build/`), Jest (TypeScript `src/`)
- **100% coverage** required for both
- Jest tests should mirror Mocha patterns from `test/environment.js`
- Tests must pass with `--allow-uncaught` (mocha)

---

## Async Constructors

mnemonica supports async constructors natively:

```typescript
const AsyncType = define('AsyncType', async function () {
	await sleep(100);
	this.done = true;
	return this; // MUST return with awaitReturn: true (default)
});

const instance = await new AsyncType();
```

**Critical:** Async subtypes are invoked as methods on the parent instance:

```typescript
const parent = await new AsyncParent();
const child = await parent.AsyncChild(); // ✓ correct

const wrong = await new AsyncChild();    // ✗ fails strictChain
```

Read [`../docs/async-constructors.md`](../docs/async-constructors.md) for the `super()` return-value trap and native async class wrapping.

---

## Common Pitfalls

1. **`await new AsyncSubType()`** — wrong. Use `await parent.AsyncSubType()`.
2. **`return { a, b }`** — wrong. Use `const result = { a, b }; return result;`.
3. **Modifying `tsconfig.json` or `eslint.config.js`** — forbidden without explicit approval.
4. **Forgetting `npm run test:cov`** — always run before finishing.
5. **Using `Function` as a type** — define `interface MyHandler extends CallableFunction { ... }`.

---

## Where to Go Next

| Need | Read |
|------|------|
| Coding standards, type rules | [`CODE.md`](./CODE.md) |
| Design patterns, constraints | [`ARCHITECT.md`](./ARCHITECT.md) |
| Debugging commands, issues | [`DEBUG.md`](./DEBUG.md) |
| Async constructor deep dive | [`../docs/async-constructors.md`](../docs/async-constructors.md) |
| tactica type-safe lookup | [`TACTICA-RULES.md`](./TACTICA-RULES.md) |
| Behavioral guidelines | [`rules-skill/contributing.md`](./rules-skill/contributing.md) |
| Explaining code (ask mode) | [`ask/AGENTS.md`](./ask/AGENTS.md) |
| Multi-step coordination | [`orchestrator/AGENTS.md`](./orchestrator/AGENTS.md) |

---

> **This file is a summary.** For authoritative rules, read the linked files. For the full type system, read `src/types/index.ts`.
