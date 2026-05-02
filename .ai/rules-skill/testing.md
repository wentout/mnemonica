---
name: mnemonica-testing
description: |
  Testing requirements for mnemonica: dual test framework (Mocha + Jest),
  100% coverage mandate, error path coverage patterns. Use when writing tests,
  modifying test files, or when the user mentions coverage, test:cov, jest,
  mocha, or test patterns for mnemonica.
metadata:
  tags: [mnemonica, testing, coverage, mocha, jest]
---

# Testing Requirements

## Dual Test Framework

Mnemonica uses TWO test frameworks:

| Framework | Command | Runs on | Purpose |
|-----------|---------|---------|---------|
| **Mocha** | `npm run test:cov` | Transpiled `build/` code | Runtime behavior, coverage |
| **Jest** | `npm run test:jest:cov` | TypeScript `src/` directly | Type-level tests, faster dev |

**Important**: `npm run test:cov` runs `npm run build:all` internally — no need
to run build first.

## 100% Coverage Requirement

All metrics must be 100%:
- Statements
- Branches
- Functions
- Lines

## Error Path Coverage Pattern

For coverage of error paths like `ALREADY_DECLARED`, follow the Mocha pattern
from `test/environment.js`:

**Before** (incomplete — misses error path)
```typescript
define('TestType', function () {});
// No test for re-definition — coverage gap!
```

**After** (full coverage)
```typescript
// First define
define('TestType', function () {});

// Then test re-definition throws
try {
	define('TestType', function () {});
} catch (error) {
	expect(error).toBeInstanceOf(ErrorsTypes.ALREADY_DECLARED);
	expect((error as Error).message)
		.toEqual('this type has already been declared : TestType');
}
```

## Key Testing Rules

1. **Jest tests must mirror Mocha patterns** from `test/environment.js`
2. **Error constructor names are String objects**, not primitives — compare as strings
3. **Run `npm run test:cov` before completing** any task
4. **Run `npm run test:jest:cov`** for Jest coverage validation
5. Tests must pass with `--allow-uncaught` flag (mocha)
