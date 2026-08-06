# AGENTS.md

This file provides guidance specific to **mnemonica/core** for AI agents
modifying the library itself. If you are *using* mnemonica in your own
project, start with [`README.md`](./README.md).

---

## Rule #1 — Non-negotiable: PAUSE AND ASK

**This is the highest-priority rule. It overrides everything else in this file.**

STOP and ask the user before proceeding when ANY of these is true:

1. **An error occurred** — `Edit` failed, `Write` produced unexpected
   results, or any tool returned an error. A successful retry does NOT
   cancel this rule: report the error AND how you recovered.
2. **You are uncertain** — about what change to make, how a function works,
   or what the user intended.
3. **You are filling gaps with assumption** — "probably", "likely",
   "I think", "it should work" are signals to stop.
4. **A tool or environment constraint conflicts with the user's stated
   preference** — surface the conflict verbatim; never silently satisfy
   the tool at the user's expense.
5. **You are about to create or duplicate a file the user did not
   explicitly request** — ask first. Never copy content when `mv`,
   rename, or a reference suffices.

When in doubt: STOP, ask one clear specific question, WAIT for the answer.
Do not invent workarounds (no `sed`, no `python -c`, no console hacks,
no rewriting files to bypass a tool restriction).
**Silent recovery is a violation, even when the outcome looks fine.**

The reason this rule exists: wrong assumptions waste both your time and the
user's. The library encodes non-obvious design intent (data-flow vs control-flow,
`define()` semantics, the proxy architecture, the return-via-variable rule).
Confident guesses produce code that compiles but corrupts the design.

---

> **Note:** Framework-agnostic rules are also available in `.ai/`:
> [`AGENTS.md`](./.ai/AGENTS.md),
> [`ARCHITECT.md`](./.ai/ARCHITECT.md), [`DEBUG.md`](./.ai/DEBUG.md).
> These rules apply to all agent frameworks.

> **Document locations:** this repository is agent-tools-agnostic. Documents
> about *contributing to the core* live in [`.ai/`](./.ai/); documents about
> *using the library* (for humans and agents alike) live in
> [`docs/`](./docs/). Tool-specific directories (`.kilo/`, `.kilocode/`,
> `.opencode/`, etc.) are for tool configuration only — never put project
> documents (plans, rules, guides) there.

## What and why

For the library's thesis, the four data mistakes it eliminates, the Trie observation, the pipeline pattern, and the HoTT framing, read [`README.md`](./README.md). This file assumes you have.

The short version for editors: mnemonica is an instance inheritance system; `define()` declares types; subtypes are constructed from parent *instances* via `new instance.SubType(args)`; the prototype chain back to root IS the identity; construction context is stored in a WeakMap and exposed via `getProps()`.

## Agent Reading Guide

Load the docs that match your change type. The wrong context produces broken code; the right context is a short read.

| Change type | Read before starting |
|---|---|
| Any `src/` change | This file + [`.ai/ONBOARDING.md`](./.ai/ONBOARDING.md) |
| Involves `define()` / type graph | + [`.ai/rules-define-patterns.md`](./.ai/rules-define-patterns.md) |
| Involves hooks | + [`.ai/rules-hooks.md`](./.ai/rules-hooks.md) |
| Involves async constructors | + [`.ai/rules-async-constructors.md`](./.ai/rules-async-constructors.md) |
| Involves TypeScript types | + [`.ai/rules-type-system.md`](./.ai/rules-type-system.md) |
| Involves proxy internals | + [`.ai/PROTOTYPE-CHAIN.md`](./.ai/PROTOTYPE-CHAIN.md) |
| Uses tactica / `lookup` | + [`docs/tactica-deep-dive.md`](./docs/tactica-deep-dive.md) |
| Docs-only change | README section you're touching only |

**This file + `.ai/ONBOARDING.md` are the always-required baseline for any `src/` edit.**

### Framework-specific rules

Mode-specific files in `.ai/`:
- [`.ai/rules-coding.md`](./.ai/rules-coding.md) — universal coding rules
- [`.ai/rules-reminders.md`](./.ai/rules-reminders.md) — type vs interface, spacing reminders
- [`.ai/rules-context-condensing.md`](./.ai/rules-context-condensing.md) — context recovery protocol

## Build/Test Commands

See [`.ai/rules-testing.md`](./.ai/rules-testing.md) for the full command reference, dual-framework details, and coverage requirements. Summary:

```bash
npm run build          # full build with linting
npm run test:cov       # Mocha + coverage (runs build:all internally)
npm run test:jest:cov  # Jest on TypeScript source
npm run watch          # watch mode
```

**Must run `npm run test:cov` before completing any task.**

**Documentation changes:** When modifying any `.md` file, `npm run lint:md` is mandatory. It checks for broken links and anchors. Run it and fix any reported issues before finishing.

## Code Style (Project-Specific)

See [`.ai/rules-code-style.md`](./.ai/rules-code-style.md) for the full style reference. Key rules: tabs only, space before function parens, colons aligned in object literals, `strict: true`, **no `any`** (`no-explicit-any: error`).

## Architecture Patterns

### The `define()` Function
The core API is `define(TypeName, constructHandler, config?)` in `src/index.ts`. It returns a constructor with additional methods:
- `.define()` - define subtypes
- `.lookup()` - find types by path
- `.registerHook()` - register lifecycle hooks

### The `lookup()` Function

For user-facing semantics, see [`README.md`](./README.md) and [`docs/tactica-deep-dive.md`](./docs/tactica-deep-dive.md). The contributor-relevant detail is the implementation pattern: `TypeRegistry` starts empty, and `lookup()` uses overloads so augmented keys return the typed constructor while unaugmented keys fall back to `TypeClass | undefined`.

```typescript
// In mnemonica core (src/index.ts)
export interface TypeRegistry {
	// Intentionally empty. Augment via declaration merging.
}

export function lookup<const K extends keyof TypeRegistry>(
	this: unknown,
	TypeNestedPath: K
): TypeRegistry[K];
export function lookup(
	this: unknown,
	TypeNestedPath: string
): TypeClass | undefined {
	// Runtime delegates to types.lookup(); type safety is compile-time only.
	const types = checkThis(this) ? defaultTypes : this || defaultTypes;
	return types.lookup(TypeNestedPath);
}
```

Tactica generates the augmentation:

```typescript
// In .tactica/registry.ts (generated)
declare module 'mnemonica' {
	interface TypeRegistry {
		'UserType': TypeConstructor<UserTypeInstance>;
		'Parent.SubType': TypeConstructor<SubTypeInstance>;
	}
}
```

Runtime behavior is identical whether `TypeRegistry` is augmented or not; the only difference is the compile-time return type.

> **Roadmap.** Nested `lookup()` (a type-safe `.lookup()` method
> on constructors that preserves the prototype chain) is designed but not
> yet shipped.

### Typed registry builders

Mnemonica has three compile-time paths for the same runtime API:

- **Builder mode** (default) — chain `.define()` on the exported `mnemonica` object or on
  a `createTypesCollection()` result. No `TypeRegistry` augmentation, no Tactica.
- **Registry bridge** — one hand-written line merges a builder's local registry
  into the global `TypeRegistry`:
  `interface TypeRegistry extends RegistryOf<typeof App> {}`
  (inside `declare module 'mnemonica'`, in a dedicated `registry.ts`).
- **Augmented mode** — use free `define()`/`lookup()` or `@decorate()`, and let
  Tactica (or a hand-written file) populate the global `TypeRegistry`. Required
  for `@decorate()`: TypeScript never applies a class decorator's return type
  to the class binding, so no local-registry mechanism can type decorators.

Public types involved:

- `TypesCollection<T, Parent, Path>` — type of `createTypesCollection()`.
- `MnemonicaModule<Registry>` — type of the exported `mnemonica` object.
- `IDefinitorInstance<N, R, Registry, Path>` — type of constructors returned by
  `.define()`.
- `RegistryOf<T>` — extracts the accumulated `Registry` from any of the above,
  for the bridge.

Quick builder example:

```typescript
import { mnemonica } from 'mnemonica';

const App = mnemonica
	.define('User', function (this: User, data: { name: string }) {
		this.name = data.name;
	})
	.define('Admin', function (this: Admin, data: { role: string }) {
		this.role = data.role;
	});

const User = App.lookup('User');
const user = new User({ name: 'Ada' });
const admin = new user.Admin({ role: 'root' });
```

Constructor `.lookup()` resolves **relative first, then root fallback**: the
type's own subtypes are searched first, then the same string is resolved as an
absolute path from the collection root. Exported builder values carry the
registry across files (registry threading).

The free `define()`/`lookup()` exports resolve against the global
`TypeRegistry` (augmentation or bridge). When you hold a builder value, prefer
the explicit-source forms — `lookup(source, path)` and
`define(source, name, handler)` — which infer the registry from the source
instead of falling back to the global interface.

For the full guide — multi-file threading, the bridge, two-arg overloads,
`strictChain` notes, and `@decorate` limitations — see
[`docs/typed-lookup.md`](./docs/typed-lookup.md).

### Type System Structure
```
src/
├── index.ts           # Main exports: define, lookup, apply, call, bind
├── types/index.ts     # TypeScript type definitions
├── constants/         # Symbols and default options
├── descriptors/       # Type collection and error definitions
├── api/               # Core implementation
│   ├── types/         # Type creation (TypeProxy, InstanceCreator, Mnemosyne)
│   ├── errors/        # Error handling and stack traces
│   ├── hooks/         # Lifecycle hooks (preCreation, postCreation, creationError)
│   └── utils/         # Utilities (getTypeChecker, CreationHandler)
└── utils/             # Public utilities (extract, parse, merge, etc.)
```

### Proxy-Based Architecture
The library makes heavy use of JavaScript Proxies:
- **TypeProxy** (`src/api/types/TypeProxy.ts`): Wraps type constructors
- **Mnemosyne** (`src/api/types/Mnemosyne.ts`): Handles instance method access
- **TypesCollection Proxy** (`src/descriptors/types/index.ts`): Dynamic type lookup

### Internal Instance Properties

Stored in a `WeakMap` keyed by the instance's **Mnemosyne memory layer** — the prototype object created per construction in `createInstanceModificator` — not as own properties on the instance itself. `_getProps` reaches it by walking the prototype chain from the instance. Access via `getProps(instance)`. For the full property list (9 entries, with meanings) see the **Internal instance properties** table in [`README.md`](./README.md) — that table is the canonical reference.

`setProps(instance, values)` is the mutating counterpart; rarely needed and considered advanced.

## Build Requirements

### No Warnings Policy
The build **must have zero warnings**. Running `npm run build` should produce **no ESLint warnings** in the `./src` directory. If there are warnings:
1. Fix the source code causing the warning
2. Do not modify `./tsconfig.json` or `./eslint.config.js` to suppress warnings

### Build Output Inspection
When running `npm run build` or `npm run build:all`, **check the beginning of the output** for errors and warnings. Build failures (TypeScript compilation errors, ESLint issues, etc.) often appear at the start of the output. Do not rely only on the end of the output or `tail` for build status.

For test passing confirmations (e.g., `npm run test:cov`), checking the end of the output is acceptable.

### Configuration Files
**Disallowed without explicit approval:**
- Modifying `./tsconfig.json`
- Modifying `./eslint.config.js`

These configuration files define the project's strict standards. Any changes require user approval first.

## Return Statement Design Rule (Non-negotiable)

**Every return expression must go through an intermediate variable/constant.** No exceptions. This is critical for debuggability with `npm run debug` and Chrome Dev Tools — when execution pauses on `return result`, you can hover your mouse over `result` and inspect the value. With `return SomeFn(arg)`, the value is gone before the debugger can show it.

**This rule is enforced. If you write `return new Foo()` or `return fn()`, the PR will be rejected.**

### Prohibited patterns:
```typescript
// BAD — cannot inspect the returned value in debugger
return { target, name };
return SomeFnInvocation(arg);
return new TypeDescriptor(...);
```

### Required pattern:
```typescript
// GOOD — can set breakpoint on return and inspect result
const result = {
	target : subtypes,
	name   : head,
};
return result;

const result = SomeFnInvocation(arg);
return result;

const result = new TypeDescriptor(
	origin, target, name, handler, proto, config
);
return result;
```

This applies to **all** `return` statements where the expression is anything other than a bare variable or literal. The rule exists because Chrome Dev Tools' debugger cannot show the evaluated result of a complex expression on the `return` line — you must step past it, at which point the frame has already exited.

## TypeScript Type Rules

**Never use bare `Function`, `CallableFunction`, or `NewableFunction` as types** — always define a purpose-specific interface that extends them. See [`.ai/rules-code-style.md`](./.ai/rules-code-style.md) for examples and allowed exceptions.

## Preserving Design Comments and Memory Notes

When refactoring or reformatting code, **preserve all comments that carry design intent, architectural rationale, or developer memory**. This includes:

- Inline comments explaining *why* a non-obvious approach was chosen (e.g. `// "this" argument may be passed for tracking why something happened`)
- Comments marking intentional workarounds for JS/Node version differences (e.g. `// starting from Node.js v22 we should define this property through odp`)
- Comments describing what a code section is *about* (e.g. `// this is a direct Sub-Type invocation`)
- TODOs and commented-out code that documents explored but rejected alternatives
- Debugger statements left as breadcrumbs for future investigation

**Do NOT remove comments because they seem like "clutter" or because the code is now typed.** TypeScript types answer "what" — comments answer "why". Both are necessary.

If a comment becomes technically inaccurate after a change, update it rather than deleting it.

## Testing Requirements

See [`.ai/rules-testing.md`](./.ai/rules-testing.md) for full coverage requirements and patterns. 100% required on both Mocha and Jest. Must run `npm run test:cov` before completing any task.

## Before Saying a Task Is Done

When a task uses a TODO list, the list is part of the deliverable:

1. **Before reporting completion, update the TODO list** so every item is
   marked done (struck through). A stale `in_progress` item reads as
   unfinished work even when the work itself is complete.
2. **Only mark items done that are verified** — tests green, coverage at
   100% on both suites, `lint:md` clean where docs changed. Never mark an
   item done just to tidy the list.
3. **When the task concludes, wipe the TODO list.** A concluded task leaves
   no list behind; the next task starts fresh.

## Common Patterns

### Adding Types
```typescript
const MyType = define('MyType', function (this: MyType, data: Data) {
	Object.assign(this, data);
});

const SubType = MyType.define('SubType', function (this: SubType, extra: string) {
	this.extra = extra;
});
```

### Error Handling
All errors extend `BASE_MNEMONICA_ERROR` in `src/api/errors/index.ts`. Custom errors are dynamically generated in `src/descriptors/errors/index.ts`.

### Symbol Usage
Key symbols defined in `src/constants/index.ts`:
- `SymbolConstructorName` - stores type name on constructors
- `SymbolParentType` - links to parent type
- `SymbolDefaultTypesCollection` - default collection identifier
- `SymbolConfig` - type configuration storage
