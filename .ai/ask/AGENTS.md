# Ask Mode Guidelines — mnemonica/core

> **Applies to:** Explaining concepts, analyzing code, answering questions.
> Framework-agnostic.

---

## Role

You are in **Ask** mode. Your task is to explain concepts, analyze code, and
answer questions about the mnemonica codebase.

## Key Concepts

### 1. Instance Inheritance

```typescript
// Define a type
const User = define('User', function (name: string) {
	this.name = name;
});

// Create instance
const user = new User('John');

// Create child instance (inherits from user)
const admin = user.Admin('privileges');
```

### 2. The `define()` Function

Creates type constructors with special inheritance capabilities:
- Wraps constructors in TypeProxy
- Registers type in TypesCollection
- Enables `.subtypes` collection

### 3. Proxy Architecture

- **TypeProxy** — Wraps type constructors, handles `.call`, `.apply`
- **Mnemosyne** — Manages instance prototype chain, provides `.fork()`, `.parent()`
- **TypesCollectionProxy** — Manages type registry, handles type lookup

### 4. Symbol System

See [`../AGENTS.md`](../AGENTS.md) for the complete symbol reference table.

## Code Analysis Guidelines

When explaining code:
1. Reference specific files: `src/api/types/Mnemosyne.ts`
2. Include line numbers for key concepts
3. Explain the "why" behind design decisions
4. Connect to the broader architecture

## Explaining Proxy Handlers

```typescript
// TypeProxy pattern
const TypeProxy = new Proxy(Constructor, {
	// Intercepts Constructor() calls
	apply(target, thisArg, args) {
		return createInstance(target, args);
	},
	// Intercepts new Constructor() calls
	construct(target, args) {
		return createInstance(target, args);
	}
});
```

## Explaining Instance Methods

| Method | Purpose | Defined In |
|--------|---------|------------|
| `.fork()` | Create shallow copy | Mnemosyne.ts |
| `.parent()` | Access parent instance | Mnemosyne.ts |
| `.pick()` | Extract specific properties | Mnemosyne.ts |
| `.extract()` | Get all inherited properties | extract.ts |
| `.parse()` | Parse instance structure | parse.ts |

## Test Framework Differences

| Aspect | Mocha | Jest |
|--------|-------|------|
| Source | `build/` (transpiled) | `src/` (TypeScript) |
| Config | package.json scripts | jest.config.js |
| Coverage | nyc | built-in |
| Purpose | Integration | Unit/Types |

## Common Questions

### Why strict TypeScript?
The project enforces 100% code coverage and strict type checking to ensure
reliability in the complex proxy-based architecture.

### Why two test frameworks?
Mocha tests the transpiled output (integration), Jest tests TypeScript source
directly (types and units).

### Why tabs for indentation?
Project standard — configured in `.editorconfig` and `eslint.config.js`.

### How do async constructors work?
mnemonica supports async constructors natively. `await new AsyncType()` returns
the resolved instance (with `awaitReturn: true`, the default). Async subtypes
must be invoked as methods on the parent instance: `await parent.AsyncChild()`.
See `docs/async-constructors.md` for the `super()` return-value pattern and
native async class wrapping.

## Documentation References

- Main README: `core/README.md`
- Type definitions: `src/types/index.ts`
- Constants: `src/constants/index.ts`
- Test examples: `test-jest/types.ts`
