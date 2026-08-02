---
name: mnemonica-core
description: |
  Instance inheritance system for JavaScript/TypeScript using prototype chains.
  Use when the user mentions mnemonica, define(), prototype inheritance,
  TypeRegistry, lookup, tactica, instance inheritance, or when working
  with the mnemonica core library. Covers: define() patterns, type-safe
  lookup with tactica, Proxy-based architecture, hook system, async
  constructors, strict chain validation, and 100% test coverage requirements.
metadata:
  tags: [mnemonica, typescript, prototype-inheritance, type-system, nodejs]
---

# Mnemonica Core - AI Skill

## When to use

Activate this skill when:
- User mentions `mnemonica`, `define()`, `lookup`, `TypeRegistry`
- User asks about prototype chain inheritance in JavaScript/TypeScript
- User is modifying files in `core/src/` or `core/test/`
- User asks about tactica-generated types or `.tactica/` directory
- Task involves: type definitions, hooks, async constructors, error handling

## Functional vs Class-Based — Both Are Equally Supported

`define()` and `@decorate()` are runtime equivalents. When working in a codebase, **match the style already in use**. See [rules-define-patterns.md](.ai/rules-define-patterns.md) for a side-by-side comparison.

## High-priority checklist: Adding a new type

When the task involves adding or modifying a type definition:

1. **Use `type` for data, `interface` for behavior contracts**
   - Instance data → `type MyTypeData = { ... }`
   - Constructor contract → `interface MyTypeConstructor { ... }`
   - See [rules-type-system.md](.ai/rules-type-system.md)

2. **Check how `lookup()` is typed** (in order of preference)
   - Builder mode (`mnemonica.define` / `createTypesCollection`)? Nothing to do — the registry is local.
   - Free `lookup()` on a builder project? Use the one-line `RegistryOf` bridge — see [docs/typed-lookup.md](./docs/typed-lookup.md).
   - Using tactica / `@decorate()`? Does `.tactica/types.ts` need updating? Is `lookup('MyType')` properly typed? See [tactica-deep-dive.md](./docs/tactica-deep-dive.md)

3. **If the constructor needs a getter**, use `.lazy()`
   - `.define()` no longer accepts an anonymous first-argument function.
   - Use `Type.lazy('Name', () => Constructor)` or the free `lazy(...)` export.
   - See [rules-define-patterns.md](.ai/rules-define-patterns.md)

4. **Test both success and error paths**
   - Mocha test in `test/` for runtime behavior
   - Jest test in `test-jest/` for type coverage
   - Error path: test `ALREADY_DECLARED`, `WRONG_MODIFICATION_PATTERN`
   - See [rules-testing.md](.ai/rules-testing.md)

5. **Run coverage before completing**
   - `npm run test:cov` (Mocha + build)
   - `npm run test:jest:cov` (Jest on TypeScript source)

## Non-discoverable rules (must be in SKILL.md)

- `type` vs `interface` rule — not enforced by lint, not in code
- 100% coverage requirement — not discoverable from jest.config.js alone
- Space before function parens — convention, not linted
- Error constructor names are String objects — runtime quirk
- Jest tests must mirror Mocha patterns from `test/environment.js` — not in code

## Build Commands

```bash
npm run build          # Full build with linting
npm run test:cov       # Mocha tests with coverage (includes build:all)
npm run test:jest:cov  # Jest tests with coverage
npm run watch          # Watch mode
```

## Rule Reference

Read individual rule files for detailed explanations and code examples:

### Type System
- [rules-type-system.md](.ai/rules-type-system.md) — `Proto<P,T>`, `TypeConstructor`, type vs interface

### Patterns
- [rules-define-patterns.md](.ai/rules-define-patterns.md) — `define()` usage, subtypes, config options
- [tactica-deep-dive.md](./docs/tactica-deep-dive.md) — `TypeRegistry`, `lookup`, tactica integration
- [rules-async-constructors.md](.ai/rules-async-constructors.md) — async constructors, `awaitReturn`, chaining

### Architecture
- [PROTOTYPE-CHAIN.md](.ai/PROTOTYPE-CHAIN.md) — TypeProxy, InstanceCreator, Mnemosyne pipeline, construction internals
- [rules-instance-methods.md](.ai/rules-instance-methods.md) — `extract()`, `fork()`, `parent()`, internal props
- [rules-hooks.md](.ai/rules-hooks.md) — `preCreation`, `postCreation`, `creationError`

### Philosophy & Design
- [rules-philosophy.md](.ai/rules-philosophy.md) — HoTT concepts (Univalence, Path Types, Higher Inductive Types) applied to mnemonica's self-reflection model
- [rules-ecosystem.md](.ai/rules-ecosystem.md) — PACT framework: personas, collaboration modes, integration points

### Quality
- [rules-testing.md](.ai/rules-testing.md) — 100% coverage, Mocha + Jest, error path patterns
- [rules-code-style.md](.ai/rules-code-style.md) — tabs, spacing, type vs interface
- [rules-error-system.md](.ai/rules-error-system.md) — `BASE_MNEMONICA_ERROR`, `constructError`, stack cleaning

### Contributing
- [rules-contributing.md](.ai/rules-contributing.md) — behavioral guidelines: think before coding, simplicity, surgical changes, goal-driven execution

## Contributing

This file covers **usage** of mnemonica only. If you are modifying the library
itself, read [`AGENTS.md`](./AGENTS.md) (or [`.ai/AGENTS.md`](./.ai/AGENTS.md)
for framework-agnostic rules).

## External Resources

- Repository: https://github.com/wentout/mnemonica
- Main README: [README.md](./README.md)
- Contributor Guidelines: [AGENTS.md](./AGENTS.md)
