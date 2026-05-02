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
- **NO `any` or `unknown` types** — Use proper interfaces instead

## ESLint Exceptions

- `@typescript-eslint/no-explicit-any`: **off** — `any` is allowed
- `@typescript-eslint/no-var-requires`: **off** — CommonJS requires allowed
- `new-cap`: **off** — constructor naming not enforced
