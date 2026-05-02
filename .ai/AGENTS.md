# AI Agent Guidelines — mnemonica/core

> **Framework-agnostic entry point for all AI agents.**
>
> If you are a **Roo** user, the files in `.roo/rules-code/` are injected into
> your system prompt automatically. Those files override or extend the rules
> below where they differ. For all other agents, this directory is the
> authoritative source.

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

---

## Quick Start for Agents

### Before You Write Any Code

1. Read [`CODE.md`](./CODE.md) — understand style rules and testing requirements.
2. Read [`ARCHITECT.md`](./ARCHITECT.md) — understand design patterns and constraints.
3. If debugging: read [`DEBUG.md`](./DEBUG.md).
4. If you are a Roo user: verify `.roo/rules-code/` files are loaded in your
   system prompt; they contain mode-specific extensions.

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

## Agent Framework Cross-Reference

If your framework supports custom rule injection, prefer these locations:

| Framework | Rule Location | Injected? |
|-----------|---------------|-----------|
| Roo | `.roo/rules-code/AGENTS.md` | Yes (system prompt) |
| Roo | `.roo/rules-architect/AGENTS.md` | Yes (Architect mode) |
| Roo | `.roo/rules-debug/AGENTS.md` | Yes (Debug mode) |
| Generic / Other | `.ai/AGENTS.md` | No — read manually |
| Generic / Other | `.ai/CODE.md` | No — read manually |
| Generic / Other | `.ai/ARCHITECT.md` | No — read manually |
| Generic / Other | `.ai/DEBUG.md` | No — read manually |

---

## Related Files

- Main README: [`../README.md`](../README.md)
- Condensed skill reference: [`../SKILL.md`](../SKILL.md)
- Root agent guidelines: [`../AGENTS.md`](../AGENTS.md)
