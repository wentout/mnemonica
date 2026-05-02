---
name: mnemonica-core
description: |
  Instance inheritance system for JavaScript/TypeScript using prototype chains.
  Use when the user mentions mnemonica, define(), prototype inheritance,
  TypeRegistry, lookupTyped, tactica, instance inheritance, or when working
  with the mnemonica core library. Covers: define() patterns, type-safe
  lookup with tactica, Proxy-based architecture, hook system, async
  constructors, strict chain validation, and 100% test coverage requirements.
metadata:
  tags: [mnemonica, typescript, prototype-inheritance, type-system, nodejs]
---

# Mnemonica Core - AI Skill

## When to use

Activate this skill when:
- User mentions `mnemonica`, `define()`, `lookupTyped`, `TypeRegistry`
- User asks about prototype chain inheritance in JavaScript/TypeScript
- User is modifying files in `core/src/` or `core/test/`
- User asks about tactica-generated types or `.tactica/` directory
- Task involves: type definitions, hooks, async constructors, error handling

## High-priority checklist: Adding a new type

When the task involves adding or modifying a type definition:

1. **Use `type` for data, `interface` for behavior contracts**
   - Instance data → `type MyTypeData = { ... }`
   - Constructor contract → `interface MyTypeConstructor { ... }`
   - See [rules-skill/type-system.md](.ai/rules-skill/type-system.md)

2. **Check TypeRegistry augmentation** (if using tactica)
   - Does `.tactica/types.ts` need updating?
   - Is `lookupTyped('MyType')` properly typed?
   - See [rules-skill/lookup-typed.md](.ai/rules-skill/lookup-typed.md)

3. **Test both success and error paths**
   - Mocha test in `test/` for runtime behavior
   - Jest test in `test-jest/` for type coverage
   - Error path: test `ALREADY_DECLARED`, `WRONG_MODIFICATION_PATTERN`
   - See [rules-skill/testing.md](.ai/rules-skill/testing.md)

4. **Run coverage before completing**
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
- [rules-skill/type-system.md](.ai/rules-skill/type-system.md) — `Proto<P,T>`, `TypeConstructor`, type vs interface

### Patterns
- [rules-skill/define-patterns.md](.ai/rules-skill/define-patterns.md) — `define()` usage, subtypes, config options
- [rules-skill/lookup-typed.md](.ai/rules-skill/lookup-typed.md) — `TypeRegistry`, `lookupTyped`, tactica integration
- [rules-skill/async-constructors.md](.ai/rules-skill/async-constructors.md) — async constructors, `awaitReturn`, chaining

### Architecture
- [rules-skill/proxy-architecture.md](.ai/rules-skill/proxy-architecture.md) — TypeProxy, InstanceCreator, Mnemosyne pipeline
- [rules-skill/instance-methods.md](.ai/rules-skill/instance-methods.md) — `extract()`, `fork()`, `parent()`, internal props
- [rules-skill/hooks.md](.ai/rules-skill/hooks.md) — `preCreation`, `postCreation`, `creationError`

### Philosophy & Design
- [rules-skill/philosophy.md](.ai/rules-skill/philosophy.md) — HoTT concepts (Univalence, Path Types, Higher Inductive Types) applied to mnemonica's self-reflection model
- [rules-skill/ecosystem.md](.ai/rules-skill/ecosystem.md) — PACT framework: personas, collaboration modes, integration points

### Quality
- [rules-skill/testing.md](.ai/rules-skill/testing.md) — 100% coverage, Mocha + Jest, error path patterns
- [rules-skill/code-style.md](.ai/rules-skill/code-style.md) — tabs, spacing, type vs interface
- [rules-skill/error-system.md](.ai/rules-skill/error-system.md) — `BASE_MNEMONICA_ERROR`, `constructError`, stack cleaning

### Contributing
- [rules-skill/contributing.md](.ai/rules-skill/contributing.md) — behavioral guidelines: think before coding, simplicity, surgical changes, goal-driven execution

## Contributing

This file covers **usage** of mnemonica only. If you are modifying the library
itself, read [`AGENTS.md`](./AGENTS.md) (or [`.ai/AGENTS.md`](./.ai/AGENTS.md)
for framework-agnostic rules).

## External Resources

- Repository: https://github.com/mythographica/mnemonica
- Main README: [README.md](../README.md)
- Contributor Guidelines: [AGENTS.md](./AGENTS.md)
