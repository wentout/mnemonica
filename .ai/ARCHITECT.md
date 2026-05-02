# Design Guidelines — mnemonica/core

> **Applies to:** Planning, designing, and strategizing changes without modifying
> implementation files. Framework-agnostic.
> **Roo override:** `.roo/rules-architect/AGENTS.md` extends these rules.

---

## Role

You are in **Architect** mode. Your task is to plan, design, and strategize
changes to the mnemonica codebase without modifying implementation files.

---

## Project Overview

Mnemonica is an **instance inheritance system** using JavaScript prototype
chains. It allows creating type hierarchies where instances can spawn child
instances that inherit from parent instances.

### Core Concept

```typescript
// Define types
const User = define('User', function (name: string) {
	this.name = name;
});

// Create parent instance
const user = new User('John');

// Create child instance inheriting from parent
const admin = user.Admin('admin privileges');
// admin inherits all User properties + new Admin properties
```

---

## Architecture Patterns

### Proxy-Based Design

```
TypeProxy → wraps constructor functions
Mnemosyne → handles instance prototype chain
TypesCollection → manages type registry
```

### Internal Instance Properties

```typescript
interface InstanceInternalProps {
	[SymbolConstructorName]: string;      // Type name
	[SymbolParentType]: object;            // Parent instance
	[SymbolSubTypes]: Map<string, object>; // Child types
}
```

### Symbol System

| Symbol | Purpose |
|--------|---------|
| `SymbolConstructorName` | Identifies the type name |
| `SymbolParentType` | Links to parent instance |
| `SymbolSubTypes` | Registry of child types |
| `MNEMONICA` | Library namespace marker |
| `MNEMOSYNE` | Instance prototype marker |
| `GAIA` | Global type collection |
| `URANUS` | Special instance handler |

---

## Design Principles

### Type Safety
- Strict TypeScript with no `any` or `unknown`
- All functions must have explicit return types
- Types must be complete and reusable

### Proxy Handler Design

```typescript
// Pattern for proxy handlers
type ProxyHandler<T> = {
	get?(target: T, prop: string, receiver: unknown): unknown;
	set?(target: T, prop: string, value: unknown, receiver: unknown): boolean;
	apply?(target: T, thisArg: unknown, args: unknown[]): unknown;
};
```

### Extension Points

1. **Types** — Create via `define()` function
2. **Hooks** — Register with `registerHook()`
3. **Flow Checkers** — Add validation with `registerFlowChecker()`
4. **Subtypes** — Extend types with `type.define()`

---

## Documentation Format

When creating design documents:
1. Use `.md` extension only
2. Include code examples in TypeScript
3. Reference existing patterns from `src/types/index.ts`
4. Document symbol usage and meanings

---

## Constraints

- **Do not** write implementation code (`*.ts` files)
- **Do not** modify existing source files
- Focus on `.md` documentation and planning
- Consider 100% test coverage requirement
- Respect the dual test framework (Mocha + Jest)
