# Coding Standards — mnemonica/core

> **Applies to:** All code changes. Framework-agnostic.
> See also `.ai/rules/CODING.md` for extended coding rules.

---

## Build & Test Commands

See [`rules-skill/testing.md`](./rules-skill/testing.md) for the full reference. Summary:
```bash
npm run build          # full build with linting
npm run test:cov       # Mocha + coverage (runs build:all internally)
npm run test:jest:cov  # Jest on TypeScript source
npm run watch          # watch mode
```
**Must run `npm run test:cov` before completing any task.**

---

## Code Style Rules

See [`rules-skill/code-style.md`](./rules-skill/code-style.md) for the full style guide (tabs, function spacing, aligned colons, TypeScript strictness, no `any`).

The return-statement rule is design-critical and is documented in full in [`../AGENTS.md`](../AGENTS.md#return-statement-design-rule). Summary: **always use an intermediate variable before returning** so Chrome DevTools can inspect the value at a breakpoint.

---

## TypeScript Type Rules

**Never use bare `Function`, `CallableFunction`, or `NewableFunction` as parameter or return types.** Define a purpose-specific interface that extends them. See [`rules-skill/code-style.md`](./rules-skill/code-style.md) for examples and allowed exceptions.

---

## Build Output Inspection

When running `npm run build` or `npm run build:all`, **check the beginning of the output** for errors and warnings. Build failures (TypeScript compilation errors, ESLint issues, etc.) often appear at the start of the output. Do not rely only on the end of the output or `tail` for build status.

For test passing confirmations (e.g., `npm run test:cov`), checking the end of the output is acceptable.

---

## Type Patterns

### Proxy Handlers
```typescript
type ProxyHandler<T> = {
	get?(target: T, prop: string, receiver: unknown): unknown;
	set?(target: T, prop: string, value: unknown, receiver: unknown): boolean;
};
```

### Internal Instance Properties
```typescript
interface MnemonicaInstance {
	[SymbolConstructorName]?: string;
	[SymbolParentType]?: object;
	[SymbolSubTypes]?: Map<string, object>;
}
```

---

## Testing Requirements

See [`rules-skill/testing.md`](./rules-skill/testing.md) for full details. 100% coverage required on both Mocha and Jest. Jest tests should mirror Mocha patterns from `test/environment.js`.

---

## Symbols Reference

See [`AGENTS.md`](./AGENTS.md) for the complete symbol reference table.

---

## Adding Type Definitions

```typescript
// 1. Define type in src/types/index.ts
export interface NewTypeConfig {
	property: string;
}

// 2. Update existing interfaces if needed
export interface MnemonicaInstance {
	newProperty?: NewTypeConfig;
}
```

---

## Error Handling

```typescript
// Use MnemonicaErrorConstructor for custom errors
import { constructError } from '../api/errors/index.js';

const MyError = constructError('MY_ERROR', 'Error message');
throw new MyError('additional info', stack);
```

---

## Configuration Files

**Disallowed without explicit approval:**
- Modifying `./tsconfig.json`
- Modifying `./eslint.config.js`

These configuration files define the project's strict standards. Any changes
require user approval first.
