# AI Agent Guidelines — mnemonica/core

> **Entry point for AI agents contributing to mnemonica core.**
> This directory is for *editing the library*. Documentation for *using* the
> library (humans and agents alike) lives in [`docs/`](../docs/).

---

## What This Project Is

**mnemonica** is an instance inheritance system for JavaScript / TypeScript.
It enables prototype chain-based type definitions through the `define()`
function, creating explicit inheritance graphs that eliminate common prototype
bugs.

Key insight: JavaScript prototype inheritance is a Trie data structure, but
developers don't realize this. Mnemonica forces explicit declaration of
inheritance graphs, making certain classes of bugs impossible by design.

---

## Files in This Directory

| File | Purpose |
|------|---------|
| [`AGENTS.md`](./AGENTS.md) | This file — main entry point and overview |
| [`ONBOARDING.md`](./ONBOARDING.md) | Five-minute editor quickstart |
| [`ARCHITECT.md`](./ARCHITECT.md) | Design guidelines: patterns, planning, constraints |
| [`DEBUG.md`](./DEBUG.md) | Debugging guidelines: commands, common issues, logging |
| [`PROTOTYPE-CHAIN.md`](./PROTOTYPE-CHAIN.md) | The exact shape of the prototype chain, layer by layer |
| [`theory-of-operations.md`](./theory-of-operations.md) | Full construction pipeline, stage by stage |
| [`performance-vs-security.md`](./performance-vs-security.md) | Performance/security trade-off analysis |
| [`mode-ask.md`](./mode-ask.md) | Ask mode: explaining concepts, analyzing code |
| [`mode-orchestrator.md`](./mode-orchestrator.md) | Orchestrator mode: multi-step task coordination |
| [`rules-coding.md`](./rules-coding.md) | Extended coding rules: models vs controllers, raw* prefix, full file reading |
| [`rules-reminders.md`](./rules-reminders.md) | Quick reference pointers to canonical sources |
| [`rules-context-condensing.md`](./rules-context-condensing.md) | Recovery protocol when context condenses |
| [`rules-contributing.md`](./rules-contributing.md) | Behavioral guidelines + new feature checklist |
| [`rules-type-system.md`](./rules-type-system.md) | `Proto<P,T>`, `TypeConstructor`, type vs interface |
| [`rules-define-patterns.md`](./rules-define-patterns.md) | `define()` usage, subtypes, config options |
| [`rules-async-constructors.md`](./rules-async-constructors.md) | Async constructors, `awaitReturn`, chaining |
| [`rules-hooks.md`](./rules-hooks.md) | `preCreation`, `postCreation`, `creationError` |
| [`rules-instance-methods.md`](./rules-instance-methods.md) | `extract()`, `fork()`, `parent()`, internal props |
| [`rules-code-style.md`](./rules-code-style.md) | Tabs, spacing, type vs interface |
| [`rules-testing.md`](./rules-testing.md) | 100% coverage, Mocha + Jest, error path patterns |
| [`rules-error-system.md`](./rules-error-system.md) | `BASE_MNEMONICA_ERROR`, `constructError`, stack cleaning |
| [`rules-philosophy.md`](./rules-philosophy.md) | HoTT concepts applied to mnemonica's self-reflection model |
| [`rules-ecosystem.md`](./rules-ecosystem.md) | PACT framework: personas, collaboration modes, integration points |

---

## Quick Start for Agents

### First Time Here?

Read [`ONBOARDING.md`](./ONBOARDING.md) — a single-file quickstart covering everything you need to know before touching code.

### Before You Write Any Code

1. Read [`ONBOARDING.md`](./ONBOARDING.md) — style rules, TypeScript rules, testing requirements.
2. Read [`ARCHITECT.md`](./ARCHITECT.md) — design patterns and constraints.
3. If debugging: read [`DEBUG.md`](./DEBUG.md).
4. If working with async constructors: read [`rules-async-constructors.md`](./rules-async-constructors.md) — the `super()` return-value pattern and native async class wrapping.

### Build & Test Commands

```bash
# Full build with linting
npm run build

# Run Mocha tests with coverage (runs npm run build:all internally)
npm run test:cov

# Run Jest tests with coverage (TypeScript source)
npm run test:jest:cov

# Watch mode
npm run watch
```

**Critical**: `npm run test:cov` runs `npm run build:all` internally. You do
not need to run `npm run build` first.

**Must run `npm run test:cov` before completing any task** — this validates
build and ensures 100% coverage.

---

## Architecture at a Glance

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

### Proxy-Based Architecture

- **TypeProxy** (`src/api/types/TypeProxy.ts`): Wraps type constructors
- **Mnemosyne** (`src/api/types/Mnemosyne.ts`): Handles instance method access
- **TypesCollection Proxy** (`src/descriptors/types/index.ts`): Dynamic type lookup

### Key Symbols

| Symbol | Purpose |
|--------|---------|
| `SymbolConstructorName` | Stores type name on constructors |
| `SymbolParentType` | Links to parent type |
| `SymbolDefaultTypesCollection` | Default collection identifier |
| `SymbolConfig` | Type configuration storage |

---

## How Agents Discover These Docs

Based on observed agent behavior:

| What agents do | Result |
|----------------|--------|
| Read `README.md` first | Usually discovers the `.ai/` pointer |
| Read `package.json` second | Learns scripts, dependencies |
| Read source code third | Infers architecture from implementation |
| Skip `AGENTS.md` unless told | Often misses build rules, style constraints |

**If you are an agent reading this:** You likely arrived via `README.md` → `AGENTS.md` → `.ai/AGENTS.md`. Good path. Now read `ONBOARDING.md` for the condensed version, or `ARCHITECT.md` + `DEBUG.md` for full detail.

**If you are a human:** This directory documents *contributing to the core*. For *using* the library, see [`docs/`](../docs/).

---

## Related Files

| File | Purpose |
|------|---------|
| [`../SKILL.md`](../SKILL.md) | Condensed skill reference for framework injection |
| [`../AGENTS.md`](../AGENTS.md) | Root agent guidelines |
| [`rules-philosophy.md`](./rules-philosophy.md) | HoTT concepts applied to mnemonica's self-reflection model |
| [`rules-ecosystem.md`](./rules-ecosystem.md) | PACT framework: personas, collaboration modes, integration points |
| [`rules-contributing.md`](./rules-contributing.md) | Behavioral guidelines for AI contributors |
| [`../docs/tactica-deep-dive.md`](../docs/tactica-deep-dive.md) | Comprehensive tactica + lookup technical guide |
| [`../docs/async-constructors.md`](../docs/async-constructors.md) | Async constructors: super() return values, native class mixing, chains |

- Main README: [`../README.md`](../README.md)
