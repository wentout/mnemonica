---
name: mnemonica-code-style
description: |
  Code style rules for mnemonica: tabs, spacing, type vs interface.
  Use when writing or modifying mnemonica source code, or when the user asks
  about formatting, indentation, spacing, or TypeScript style in mnemonica.
metadata:
  tags: [mnemonica, style, formatting, tabs, typescript]
---

# Code Style

## Indentation

- **TABS ONLY** — Never use spaces for indentation
- Tab width: 4
- Enforced by eslint

```typescript
// ✅ Correct
function myFunc () {
	if (true) {
		return 42;
	}
}

// ❌ Wrong (spaces)
function myFunc () {
    if (true) {
        return 42;
    }
}
```

## Function Spacing

- **Always** space before function parentheses:

```typescript
function myFunc () { }           // ✓ Correct
function myFunc() { }            // ✗ Wrong

const fn = function () { };      // ✓ Correct
const fn = function() { };       // ✗ Wrong

class MyClass {
	method () { }                 // ✓ Correct
	method() { }                  // ✗ Wrong
}
```

## Key Spacing

- Align colons in object literals:

```typescript
const obj = {
	key1 : value1,
	key2 : value2,  // colons aligned
};
```

## TypeScript Strictness

- `strict: true` enabled
- `noUnusedLocals: true` — unused variables cause errors
- `noUnusedParameters: true` — unused parameters cause errors
- `isolatedModules: true` — each file must be independently transpilable
- **NO `any`** — use purpose-specific interfaces instead

## ESLint Exceptions

- `@typescript-eslint/no-explicit-any`: **error** — `any` is forbidden
- `@typescript-eslint/no-var-requires`: **off** — CommonJS requires allowed
- `new-cap`: **off** — constructor naming not enforced

## Function Type Rules

**Never use bare `Function`, `CallableFunction`, or `NewableFunction` as parameter or return types.** Define a purpose-specific interface that extends them:

```typescript
// ✗ Wrong
function foo (handler: Function) { }

// ✓ Correct
interface ConstructHandler extends CallableFunction {
	(this: object, ...args: unknown[]): unknown;
	prototype: object;
}
function foo (handler: ConstructHandler) { }
```

Allowed exceptions (do not change without approval):
- `src/types/index.ts` — central type definitions use `CallableFunction`/`NewableFunction` as base types for exported interfaces
- `src/api/types/compileNewModificatorFunctionBody.ts` — `ConstructHandler`/`CreationHandler` interfaces already defined there
