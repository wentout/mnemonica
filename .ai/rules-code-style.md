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

**Never use bare `Function`, `CallableFunction`, or `NewableFunction` as a type** — not as a parameter, return, property, `this`, index-signature, intersection or conditional type, and not as a union member either. The only allowed place for them is after `extends` in a named interface. Enforced by `no-restricted-syntax` on `TSTypeReference` in `eslint.config.js`: the selector bans type positions only — `extends` clauses and runtime `instanceof Function` stay legal.

```typescript
// ✗ Wrong — every one of these
function foo (handler: Function) { }
function bar (TypeOrTypeName: string | CallableFunction) { }
type Hooked = { registerHook: CallableFunction };

// ✓ Correct
interface ConstructHandler extends CallableFunction {
	(this: object, ...args: unknown[]): unknown;
	prototype: object;
}
function foo (handler: ConstructHandler) { }
function bar (TypeOrTypeName: string | ConstructHandler) { }
```

Why: a type answers *what* (a noun, data, structural); an interface answers
*how* (a verb, an algorithm, nominal). A constructor is an interface — it
consumes a type (its args) and produces a type (the instance), and
mnemonica is exactly that: data transformation, one set of fields turned
into another. A bare `CallableFunction` erases both sides: it says "some
callable thing", a structural shape with no name, so nothing records what
the algorithm consumes or produces. A named interface that *extends*
`CallableFunction` is declared as made from Callable, not equal to it — it
keeps its own nominal identity and spells out its input and output types.
That precision is what tactica, the generated `.tactica` files and every
tool reading them inherit.

When one parameter accepts several kinds, name each kind (`…Callable`,
`…Newable`) or the pair (`…NewableOrCallable`) — never fall back to the
bare base type. There are no file-level exceptions.
