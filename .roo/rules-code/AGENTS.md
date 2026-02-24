# Mnemonica - Code Mode Guidelines

## Role
You are in **Code** mode. Your task is to implement features, fix bugs, and modify code following the project's strict TypeScript standards.

## Build & Test Commands

```bash
# Build TypeScript
npm run build

# Run all tests (Mocha + Jest)
npm test

# Run Jest tests only (TypeScript source)
npm run test:jest

# Run single test file
npx jest test-jest/types.ts

# Run single Mocha test
npx mocha --require ts-node/register test-ts/test-example.ts

# Watch mode
npm run watch
```

## Code Style Rules (CRITICAL)

### Indentation
- **TABS ONLY** - Never use spaces for indentation
- Tab width: 4 (editor.config)

### Spacing Requirements
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

// REQUIRED: key-spacing with space after colon
{ key: value }                   // ✓ Correct
{ key:value }                    // ✗ Wrong
```

### TypeScript Strictness
- `strict: true` - All strict options enabled
- `noUnusedLocals: true` - No unused variables
- `noUnusedParameters: true` - No unused parameters
- `isolatedModules: true` - Each file must be independently transpilable
- **NO `any` or `unknown` types** - Use proper interfaces instead

### Type Patterns
```typescript
// For proxy handlers
type ProxyHandler<T> = {
	get?(target: T, prop: string, receiver: unknown): unknown;
	set?(target: T, prop: string, value: unknown, receiver: unknown): boolean;
};

// For internal instance properties
interface MnemonicaInstance {
	[SymbolConstructorName]?: string;
	[SymbolParentType]?: object;
	[SymbolSubTypes]?: Map<string, object>;
}
```

## Architecture Patterns

### Proxy-Based Architecture
- `TypeProxy` - Wraps type constructors
- `Mnemosyne` - Instance prototype handler
- `TypesCollection` - Registry for types

### Adding Type Definitions
```typescript
// 1. Define interface in src/types/index.ts
export interface NewTypeConfig {
	property: string;
}

// 2. Update existing interfaces if needed
export interface MnemonicaInstance {
	newProperty?: NewTypeConfig;
}
```

### Error Handling
```typescript
// Use MnemonicaErrorConstructor for custom errors
import { constructError } from '../api/errors/index.js';

const MyError = constructError('MY_ERROR', 'Error message');
throw new MyError('additional info', stack);
```

## Symbols Reference
- `SymbolConstructorName` - Type name identifier
- `SymbolParentType` - Parent type reference
- `SymbolSubTypes` - Subtypes map
- `MNEMONICA` - Library namespace marker
- `MNEMOSYNE` - Instance prototype marker
- `GAIA` - Global type registry
- `URANUS` - Special instance handler

## Testing Requirements
- Maintain **100% code coverage**
- Mocha tests run on transpiled code (`build/`)
- Jest tests run directly on TypeScript source
- Always run both test suites before completing
