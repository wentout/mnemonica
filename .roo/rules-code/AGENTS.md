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
| [`ask/AGENTS.md`](./ask/AGENTS.md) | Ask mode: explaining concepts, analyzing code |
| [`orchestrator/AGENTS.md`](./orchestrator/AGENTS.md) | Orchestrator mode: multi-step task coordination |

---

## Quick Start for Agents

### Before You Write Any Code

1. Read [`CODE.md`](./CODE.md) — understand style rules and testing requirements.
2. Read [`ARCHITECT.md`](./ARCHITECT.md) — understand design patterns and constraints.
3. If debugging: read [`DEBUG.md`](./DEBUG.md).

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

## Related Files

| File | Purpose |
|------|---------|
| [`../../SKILL.md`](../../SKILL.md) | Condensed skill reference for framework injection |
| [`../../AGENTS.md`](../../AGENTS.md) | Root agent guidelines (legacy Roo entrypoint) |
| [`../../.ai/rules-skill/philosophy.md`](../../.ai/rules-skill/philosophy.md) | HoTT concepts applied to mnemonica's self-reflection model |
| [`../../.ai/rules-skill/ecosystem.md`](../../.ai/rules-skill/ecosystem.md) | PACT framework: personas, collaboration modes, integration points |
| [`../../.ai/rules-skill/contributing.md`](../../.ai/rules-skill/contributing.md) | Behavioral guidelines for AI contributors |

- Main README: [`../../README.md`](../../README.md)
