---
name: mnemonica-ecosystem
description: |
  The mnemonica ecosystem: sibling packages, tool integration, and
  collaboration modes. Use when the user asks about how mnemonica fits
  into a larger workflow, who uses it, what tools integrate with it, or
  the ecosystem architecture (tactica, dive, topologica, mnemographica).
metadata:
  tags: [mnemonica, ecosystem, pact, tools, integration]
---

# Ecosystem Overview

Mnemonica is not a single library — it is an ecosystem of tools for building
self-reflective, type-safe systems.

---

## Package Map

| Package | Status | Role |
|---------|--------|------|
| `mnemonica` | published | Core runtime (this repo) |
| `@mnemonica/tactica` | published | Static analyzer / type generator (`.tactica/` output); framework-blind core — instrumentation vocabulary arrives via plugins (`.tactica.js` config), shipped by framework adapters |
| `typeomatica` | published (unscoped) | Runtime type guards (`@Strict`, `BaseClass`) |
| `@mnemonica/dive` | published | Execution-flow tracing engine |
| `@mnemonica/otel` (otel) | published | Framework-free Node.js observability core (dive wiring, OTel providers, ALS backbone, pre-root store, unblind core) |
| `@mnemonica/topologica` | published | Module loader |
| `@mnemonica/nestjs` (nestjs-adapter) | published | NestJS integration; ships the `@mnemonica/nestjs/tactica` plugin subpath |
| `@mnemonica/strategy` | published | MCP/WS trace transport + log server |
| `mnemographica` | VS Code extension | Hierarchy visualization, code navigation |

---

## PACT Framework

PACT (People-Activities-Context-Technologies) is the lens the ecosystem design
uses: the **people** are AI-agent developers (runtime introspection, memory
persistence), application developers (type safety, IDE support), and library
maintainers (internal architecture, test coverage); their shared **activities**
are defining types, navigating the type hierarchy, and debugging prototype
chains; the **context** is VS Code plus the Node.js runtime; the
**technologies** are the packages above. Keep all four in mind when changing
public API — a core change ripples into tactica's generated output, dive's
traces, and mnemographica's views.

---

## Design Principles

### 1. Progressive Disclosure
- Simple `define()` for beginners
- Advanced hooks for power users
- Generated types and tracing for tool users

### 2. Self-Hosting
- Extension uses mnemonica internally
- Types self-generate
- Documentation is executable

### 3. Inheritance as UI
- Tree view shows hierarchy
- Graph shows relationships
- Code navigation follows prototype chain

---

## Publish Discipline

npm cannot republish an existing version. Standing rule (2026-09-06,
Viktor): when a change must reach npm, the agent bumps `version` in BOTH
`package.json` and `package-lock.json` (top-level and `packages[""]`) as
part of the change — a bumped-but-unpublished version in git is how the
owner sees a publish is due. Docs-only or otherwise internal changes stay
at the published version; code churn alone does not imply a publish.

---

## Future: PACT eslint Rule

When implemented, a custom eslint rule will enforce:

```typescript
// ❌ ERROR: Instance data should use TYPE
interface UserData { name: string; }

// ✅ PASS: Instance uses TYPE
type UserData = { name: string; };

// ❌ ERROR: Constructor contract should use INTERFACE
type Runnable = { run(): void };

// ✅ PASS: Contract uses INTERFACE
interface Runnable { run(): void; }
```

---

## References

- [Wikipedia: PACT (interaction design)](https://en.wikipedia.org/wiki/PACT_%28interaction_design%29)
- The ongoing ecosystem roadmap lives in the local gitignored plans
  directory (never published); ask for it in-session.
