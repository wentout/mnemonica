# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

**mnemonica** is an instance inheritance system for JavaScript/TypeScript that enables prototype chain-based type definitions. It allows creating types using `define()` and building inheritance hierarchies through prototype chains.

## Build/Test Commands

All commands run from the `core/` directory:

```bash
# Full build with linting
npm run build

# Run all tests with coverage (requires build first)
npm run test:cov

# Run Jest tests only
npm run test:jest:cov

# Watch mode for development
npm run watch
```

**Critical**: The project uses TWO test frameworks:
- **Mocha** (`npm run test:cov`): Runs on transpiled code in `build/`, requires `npm run build:all` first
- **Jest** (`npm run test:jest:cov`): Runs TypeScript directly from `src/`, faster for development

## Code Style (Project-Specific)

### Indentation
- **Tabs** for indentation (not spaces) - enforced by eslint
- See `.editorconfig`: `indent_style = tab`, `indent_size = 4`

### Function Spacing
- **Always** space before function parentheses:
  ```typescript
  function myFunc () { }  // ✓ correct
  function myFunc() { }   // ✗ wrong
  ```

### Key Spacing
- Align colons in object literals:
  ```typescript
  const obj = {
  	key1 : value1,
  	key2 : value2,  // colons aligned
  };
  ```

### TypeScript Strictness
- `strict: true` enabled
- `noImplicitAny: true` (implicit)
- `noUnusedLocals: true` - unused variables cause errors
- `noUnusedParameters: true` - unused parameters cause errors
- `isolatedModules: true` - each file must be independently transpilable

### ESLint Exceptions
- `@typescript-eslint/no-explicit-any`: **off** - `any` is allowed
- `@typescript-eslint/no-var-requires`: **off** - CommonJS requires allowed
- `new-cap`: **off** - constructor naming not enforced

## Architecture Patterns

### The `define()` Function
The core API is `define(TypeName, constructHandler, config?)` in `src/index.ts`. It returns a constructor with additional methods:
- `.define()` - define subtypes
- `.lookup()` - find types by path
- `.registerHook()` - register lifecycle hooks

### Type System Structure
```
src/
├── index.ts           # Main exports: define, lookup, apply, call, bind
├── types/index.ts     # TypeScript type definitions
├── constants/         # Symbols and default options
├── descriptors/       # Type collection and error definitions
├── api/               # Core implementation
│   ├── types/         # Type creation (TypeProxy, InstanceCreator, Mnemosyne)
│   ├── errors/        # Error handling and stack traces
│   ├── hooks/         # Lifecycle hooks (preCreation, postCreation, creationError)
│   └── utils/         # Utilities (getTypeChecker, CreationHandler)
└── utils/             # Public utilities (extract, parse, merge, etc.)
```

### Proxy-Based Architecture
The library makes heavy use of JavaScript Proxies:
- **TypeProxy** (`src/api/types/TypeProxy.ts`): Wraps type constructors
- **Mnemosyne** (`src/api/types/Mnemosyne.ts`): Handles instance method access
- **TypesCollection Proxy** (`src/descriptors/types/index.ts`): Dynamic type lookup

### Internal Instance Properties
Instances have non-enumerable internal properties accessed via `getProps()`:
- `__type__` - Type definition object
- `__parent__` - Parent instance reference
- `__args__` - Constructor arguments
- `__collection__` - Types collection reference

## Testing Requirements

- **100% coverage required** for Jest (see `jest.config.js`)
- Mocha tests run on built code in `build/` directory
- Jest tests run directly on TypeScript source
- Tests must pass with `--allow-uncaught` flag (mocha)

## Common Patterns

### Adding Types
```typescript
const MyType = define('MyType', function (this: MyType, data: Data) {
	Object.assign(this, data);
});

const SubType = MyType.define('SubType', function (this: SubType, extra: string) {
	this.extra = extra;
});
```

### Error Handling
All errors extend `BASE_MNEMONICA_ERROR` in `src/api/errors/index.ts`. Custom errors are dynamically generated in `src/descriptors/errors/index.ts`.

### Symbol Usage
Key symbols defined in `src/constants/index.ts`:
- `SymbolConstructorName` - stores type name on constructors
- `SymbolParentType` - links to parent type
- `SymbolDefaultTypesCollection` - default collection identifier
- `SymbolConfig` - type configuration storage
