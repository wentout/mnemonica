# AI Agent Guidelines — mnemonica/core

> **Framework-agnostic entry point for all AI agents.**
> This directory is the authoritative source.

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
| [`CODE.md`](./CODE.md) | Coding standards: style, TypeScript rules, testing |
| [`ARCHITECT.md`](./ARCHITECT.md) | Design guidelines: patterns, planning, constraints |
| [`DEBUG.md`](./DEBUG.md) | Debugging guidelines: commands, common issues, logging |
| [`async_init.md`](./async_init.md) | Async class constructor support: wrapper pattern, `Symbol.hasInstance`, tests |
| [`ask/AGENTS.md`](./ask/AGENTS.md) | Ask mode: explaining concepts, analyzing code |
| [`orchestrator/AGENTS.md`](./orchestrator/AGENTS.md) | Orchestrator mode: multi-step task coordination |
| [`rules/CODING.md`](./rules/CODING.md) | Extended coding rules: models vs controllers, raw* prefix, full file reading |
| [`rules/REMINDERS.md`](./rules/REMINDERS.md) | Quick reference: type vs interface, spacing, before-task checklist |
| [`rules/CONTEXT-CONDENSING.md`](./rules/CONTEXT-CONDENSING.md) | Recovery protocol when context condenses |
| [`task-templates/`](./task-templates/) | Reusable task templates |

---

## Quick Start for Agents

### First Time Here?

Read [`ONBOARDING.md`](./ONBOARDING.md) — a single-file quickstart covering everything you need to know before touching code.

### Before You Write Any Code

1. Read [`CODE.md`](./CODE.md) — style rules, TypeScript rules, testing requirements.
2. Read [`ARCHITECT.md`](./ARCHITECT.md) — design patterns and constraints.
3. If debugging: read [`DEBUG.md`](./DEBUG.md).
4. If working with async constructors: read [`../docs/async-constructors.md`](../docs/async-constructors.md) — the `super()` return-value pattern and native async class wrapping.

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

**If you are an agent reading this:** You likely arrived via `README.md` → `AGENTS.md` → `.ai/AGENTS.md`. Good path. Now read `ONBOARDING.md` for the condensed version, or `CODE.md` + `ARCHITECT.md` for full detail.

**If you are a human:** These docs are for AI agents. The human-facing docs live in `docs/`.

---

## Related Files

| File | Purpose |
|------|---------|
| [`../SKILL.md`](../SKILL.md) | Condensed skill reference for framework injection |
| [`../AGENTS.md`](../AGENTS.md) | Root agent guidelines |
| [`rules-skill/philosophy.md`](./rules-skill/philosophy.md) | HoTT concepts applied to mnemonica's self-reflection model |
| [`rules-skill/ecosystem.md`](./rules-skill/ecosystem.md) | PACT framework: personas, collaboration modes, integration points |
| [`rules-skill/contributing.md`](./rules-skill/contributing.md) | Behavioral guidelines for AI contributors |
| [`TACTICA-DEEP-DIVE.md`](./TACTICA-DEEP-DIVE.md) | Comprehensive tactica + lookupTyped technical guide |
| [`../docs/async-constructors.md`](../docs/async-constructors.md) | Async constructors: super() return values, native class mixing, chains |

- Main README: [`../README.md`](../README.md)
