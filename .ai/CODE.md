# Coding Standards — mnemonica/core

> **Applies to:** All code changes. Framework-agnostic.
> See also `.ai/rules/CODING.md` for extended coding rules.

---

## Build & Test Commands

```bash
# Build TypeScript
npm run build

# Run Mocha tests with coverage (runs npm run build:all internally)
npm run test:cov

# Run Jest tests with coverage (TypeScript source)
npm run test:jest:cov

# Run single test file
npx jest test-jest/types.ts

# Run single Mocha test
npx mocha --require ts-node/register test-ts/test-example.ts

# Watch mode
npm run watch
```

**Important**: `npm run test:cov` runs `npm run build:all` internally — no need
to run `npm run build` first.

**Must run `npm run test:cov` before completing any task** — validates build and
ensures 100% coverage.

---

## Code Style Rules

### Indentation
- **TABS ONLY** — Never use spaces for indentation
- Tab width: 4 (see `.editorconfig`)

### Function Spacing
```typescript
// REQUIRED: Space before function parentheses
function myFunc () { }           // ✓ Correct
function myFunc() { }            // ✗ Wrong

const fn = function () { };      // ✓ Correct
const fn = function() { };       // ✗ Wrong

class MyClass {
	method () { }                 // ✓ Correct
	method() { }                  // ✗ Wrong
}
```

### Key Spacing
```typescript
// REQUIRED: key-spacing with space after colon
{ key: value }                   // ✓ Correct
{ key:value }                    // ✗ Wrong
```

---

## TypeScript Strictness

- `strict: true` — All strict options enabled
- `noUnusedLocals: true` — No unused variables
- `noUnusedParameters: true` — No unused parameters
- `isolatedModules: true` — Each file must be independently transpilable

### ESLint Exceptions
- `@typescript-eslint/no-explicit-any`: **off** — `any` is allowed
- `@typescript-eslint/no-var-requires`: **off** — CommonJS requires allowed
- `new-cap`: **off** — constructor naming not enforced

---

## Return Statement Design Rule

**Always use an intermediate variable before returning.** This is critical for debuggability with `npm run debug` and Chrome Dev Tools.

### Prohibited patterns:
```typescript
// BAD — cannot inspect the returned value in debugger
return { target, name };
return SomeFnInvocation(arg);
return new TypeDescriptor(...);
```

### Required pattern:
```typescript
// GOOD — can set breakpoint on return and inspect result
const result = {
	target : subtypes,
	name   : head,
};
return result;

const result = SomeFnInvocation(arg);
return result;

const result = new TypeDescriptor(
	origin, target, name, handler, proto, config
);
return result;
```

This applies to **all** return statements where the expression is anything other than a bare variable or literal. Chrome Dev Tools cannot show the evaluated result of a complex expression on the `return` line — you must step past it, at which point the frame has exited.

---

## TypeScript Type Rules

### Never use bare `Function`, `CallableFunction`, or `NewableFunction`

These are escape hatches from the type system. Always define and use purpose-specific interfaces that extend them.

### Prohibited:
```typescript
function foo(handler: Function) { }
const result = something() as CallableFunction;
interface Bad { fn: NewableFunction; }
```

### Required:
```typescript
interface ConstructHandler extends CallableFunction {
	(this: object, ...args: unknown[]): unknown;
	prototype: object;
}

function foo(handler: ConstructHandler) { }
```

Existing allowed exceptions (do not change without approval):
- `src/types/index.ts` — central type definitions may use `CallableFunction`/`NewableFunction` as base types for exported interfaces
- `src/api/types/compileNewModificatorFunctionBody.ts` — `ConstructHandler`/`CreationHandler` interfaces already exist

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

- Maintain **100% code coverage** (statements, branches, functions, lines)
- Mocha tests run on transpiled code (`build/`)
- Jest tests run directly on TypeScript source
- Always run both test suites before completing
- **Must run `npm run test:cov` before completing task** — validates build and
  ensures 100% coverage

### Jest Test Patterns (Follow Mocha Tests)

When fixing Jest test coverage, **copy patterns from `test/environment.js`**
(mocha tests). The user maintains mocha tests with 100% coverage — Jest tests
should mirror those patterns.

#### Key Pattern: Type Re-definition Coverage

For coverage of error paths like `ALREADY_DECLARED`, follow the mocha pattern:

```javascript
// From test/environment.js lines 795-846:
define('SetSomeName', function () { });

// Later, re-define with same name to trigger ALREADY_DECLARED
define('SetSomeName', function () { });  // throws ALREADY_DECLARED

// Or with factory returning anonymous function
define('SetSomeName', () => {
	return function () { };  // Also throws ALREADY_DECLARED
});
```

#### Translation to Jest

```typescript
// In test-jest/index.ts or test-jest/environment.ts:

// First define the type
define('TestTypeName', function () { });

// Then test re-definition throws
try {
	define('TestTypeName', function () { });
} catch (error) {
	expect(error).toBeInstanceOf(ErrorsTypes.ALREADY_DECLARED);
	expect((error as Error).message).toEqual('this type has already been declared : TestTypeName');
}
```

#### Error Constructor Name Handling

Error constructor names are String objects, not primitives:

```typescript
// Compare as strings, not with toBeInstanceOf
const expectedName = (err as { name: string }).name;
const actualName = (error as Error).constructor.name;
expect(String(actualName)).toEqual(String(expectedName));
```

**Always check `test/environment.js` first for the correct test pattern.**

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
