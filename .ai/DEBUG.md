# Debugging Guidelines — mnemonica/core

> **Applies to:** Investigating issues, diagnosing problems, identifying root
> causes. Framework-agnostic.
> **Roo override:** `.roo/rules-debug/AGENTS.md` extends these rules.

---

## Role

You are in **Debug** mode. Your task is to investigate issues, diagnose problems,
and identify root causes in the mnemonica codebase.

---

## Debug Commands

```bash
# Run tests with coverage to identify untested paths
npm run test:cov

# Run Jest with verbose output
npm run test:jest -- --verbose

# Run specific test file
npx jest test-jest/types.ts --verbose

# Run Mocha with debug output
DEBUG=* npm test

# Build and check for TypeScript errors
npm run build
```

---

## Common Issue Patterns

### Proxy Handler Issues

```typescript
// If traps are not working, check:
// 1. Handler methods return correct types
// 2. `get` trap returns `unknown`, not implicit `any`
// 3. `set` trap returns boolean, not void

// Debug proxy behavior
const debugProxy = new Proxy(target, {
	get(target, prop, receiver) {
		console.log('Getting:', prop);
		return Reflect.get(target, prop, receiver);
	}
});
```

### Type Errors

```typescript
// Common: 'any' type assignment
// Fix: Add proper type annotation
const value: SpecificType = unknownValue as SpecificType;

// Common: missing 'this' type
// Fix: Add explicit this parameter
function method(this: SpecificType) { }
```

### Instance Chain Issues

```typescript
// Check instance properties
console.log(instance[SymbolConstructorName]);
console.log(instance[SymbolParentType]);
console.log(instance[SymbolSubTypes]);

// Verify prototype chain
console.log(Object.getPrototypeOf(instance));
```

---

## Logging Strategy

### Add Temporary Logging

```typescript
// In proxy handlers
get(target, prop, receiver) {
	console.log(`[Proxy.get] prop: ${String(prop)}`);
	// ... existing code
}

// In error constructors
constructor(message, additionalStack) {
	console.log('[Error]', message, additionalStack);
	// ... existing code
}
```

### Stack Trace Analysis

```typescript
// Use error stack cleaners
import { cleanupStack } from '../api/errors/index.js';

const cleaned = cleanupStack(stack.split('\n'));
console.log('Cleaned stack:', cleaned);
```

---

## Symbol Debugging

```typescript
// Inspect instance symbols
const symbols = Object.getOwnPropertySymbols(instance);
symbols.forEach(sym => {
	console.log(sym.toString(), ':', (instance as Record<symbol, unknown>)[sym]);
});
```

---

## Test Debugging

### Mocha Tests

```bash
# Run single test suite
npx mocha build/test-ts/test-example.js

# With debug output
DEBUG=mnemonica npx mocha build/test-ts/test-example.js
```

### Jest Tests

```bash
# Run with debugger
node --inspect-brk node_modules/.bin/jest --runInBand test-jest/types.ts

# With console output
npx jest test-jest/types.ts --verbose --no-coverage
```

---

## Issue Checklist

1. [ ] Check TypeScript compilation: `npm run build`
2. [ ] Run Mocha tests: `npm run test:mocha`
3. [ ] Run Jest tests: `npm run test:jest`
4. [ ] Check test coverage: `npm run test:cov`
5. [ ] Verify indentation (tabs not spaces)
6. [ ] Check for `any` or `unknown` types
7. [ ] Verify symbol usage is correct
8. [ ] Check proxy handler return types

---

## Reporting Issues

When reporting findings:
1. Include file paths and line numbers
2. Show relevant code snippets
3. Provide error messages in full
4. Suggest root cause, not just symptoms
5. Reference related test files
