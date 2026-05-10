# AGENTS.md

> **First:** Read the root [`/AGENTS.md`](/AGENTS.md) for Rule #1 (PAUSE AND ASK)
> — the highest-priority rule that overrides everything else.

This file provides guidance specific to **mnemonica/core**.

> **Note:** Framework-agnostic rules are also available in `.ai/`:
> [`AGENTS.md`](./.ai/AGENTS.md), [`CODE.md`](./.ai/CODE.md),
> [`ARCHITECT.md`](./.ai/ARCHITECT.md), [`DEBUG.md`](./.ai/DEBUG.md),
> [`async_init.md`](./.ai/async_init.md).
> These rules apply to all agent frameworks.

## Project Overview

**mnemonica** is an instance inheritance system for JavaScript/TypeScript that enables prototype chain-based type definitions. It allows creating types using `define()` and building inheritance hierarchies through prototype chains.

### Vision & Philosophy

Mnemonica solves the fundamental problem that JavaScript prototype inheritance is a Trie data structure, but developers don't realize this. Common mistakes include:
- Using assignment instead of `Object.setPrototypeOf` (breaks `instanceof`)
- Reusing constructors directly (corrupts existing instances' prototype chains)
- Not understanding the Factory pattern requirement

**Mnemonica forces explicit declaration of inheritance graphs**, eliminating these bugs by design. The ultimate goal is to **reduce the cost of software development and support** by making certain classes of bugs impossible.

### AI Integration Vision

Mnemonica enables AI agents to:
1. **Structure thinking** through explicit constructor chains
2. **Self-extend** by defining new features via `define()` calls
3. **Analyze behavior** through stored invocation arguments (accessible via `getProps()`)
4. **Become more capable** by understanding the inheritance graph

The stored arguments in the prototype chain allow AI to introspect and learn from its own execution history.

## Agent Framework Rules

This repository contains additional mode-specific rules in `.ai/rules/`:
- Code mode rules: `.ai/rules/CODING.md`
- Reminders (type vs interface, spacing): `.ai/rules/REMINDERS.md`
- Context condensing protocol: `.ai/rules/CONTEXT-CONDENSING.md`

These files contain critical rules not duplicated in the main AGENTS.md. All agents should read them manually.

## Build/Test Commands

All commands run from the project root:

```bash
# Full build with linting
npm run build

# Run Mocha tests with coverage (runs npm run build:all internally)
npm run test:cov

# Run Jest tests with coverage
npm run test:jest:cov

# Watch mode for development
npm run watch
```

**Critical**: The project uses TWO test frameworks:
- **Mocha** (`npm run test:cov`): Runs on transpiled code in `build/`, runs `npm run build:all` internally
- **Jest** (`npm run test:jest:cov`): Runs TypeScript directly from `src/`, faster for development

**Important**: `npm run test:cov` runs `npm run build:all` internally, so it is not necessary to run `npm run build` before `npm run test:cov`.

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

### The `lookupTyped()` Function
Type-safe variant of `lookup()` for use with tactica-generated type definitions:

```typescript
import { lookupTyped } from 'mnemonica';

// Requires TypeRegistry augmentation from tactica
const UserType = lookupTyped('UserType');
const user = new UserType({ name: 'John' }); // Full type safety!
```

The `lookupTyped()` function uses the same implementation as `lookup()` but provides TypeScript type safety through the `TypeRegistry` interface that tactica generates.

**How It Works:**

The `TypeRegistry` interface uses a `[key: string]: never` pattern:

```typescript
// In mnemonica core (src/index.ts)
export interface TypeRegistry {
	[key: string]: never;  // Prevents usage without augmentation
}

// The lookupTyped function constrains keys to valid registry entries
export const lookupTyped = function <const K extends keyof TypeRegistry>(
	TypeNestedPath: K
): TypeRegistry[K] {
	// Runtime delegates to lookup(), types are compile-time only
	return types.lookup(TypeNestedPath as string) as TypeRegistry[K];
};
```

**Augmentation Pattern (generated by tactica):**

```typescript
// In .tactica/registry.ts (generated)
declare module 'mnemonica' {
	interface TypeRegistry {
		'UserType': new (...args: unknown[]) => UserTypeInstance;
		'Parent.SubType': new (...args: unknown[]) => SubTypeInstance;
	}
}
```

**Key differences from `lookup()`:**
- Returns properly typed constructor when TypeRegistry is augmented
- Falls back to `unknown` type when registry is not augmented
- Same runtime behavior as `lookup()`

**Usage pattern with tactica:**
1. Run `npx tactica` to generate `.tactica/types.ts`
2. Import types in your project
3. Use `lookupTyped()` for type-safe type retrieval

> **Roadmap.** Nested `lookupTyped()` (a type-safe `.lookupTyped()` method
> on constructors that preserves the prototype chain) is designed but not
> yet shipped. See the `## Roadmap` section in [README.md](README.md).

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

## Build Requirements

### No Warnings Policy
The build **must have zero warnings**. Running `npm run build` should produce **no ESLint warnings** in the `./src` directory. If there are warnings:
1. Fix the source code causing the warning
2. Do not modify `./tsconfig.json` or `./eslint.config.js` to suppress warnings

### Build Output Inspection
When running `npm run build` or `npm run build:all`, **check the beginning of the output** for errors and warnings. Build failures (TypeScript compilation errors, ESLint issues, etc.) often appear at the start of the output. Do not rely only on the end of the output or `tail` for build status.

For test passing confirmations (e.g., `npm run test:cov`), checking the end of the output is acceptable.

### Configuration Files
**Disallowed without explicit approval:**
- Modifying `./tsconfig.json`
- Modifying `./eslint.config.js`

These configuration files define the project's strict standards. Any changes require user approval first.

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

This applies to **all** `return` statements where the expression is anything other than a bare variable or literal. The rule exists because Chrome Dev Tools' debugger cannot show the evaluated result of a complex expression on the `return` line — you must step past it, at which point the frame has already exited.

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

## Preserving Design Comments and Memory Notes

When refactoring or reformatting code, **preserve all comments that carry design intent, architectural rationale, or developer memory**. This includes:

- Inline comments explaining *why* a non-obvious approach was chosen (e.g. `// "this" argument may be passed for tracking why something happened`)
- Comments marking intentional workarounds for JS/Node version differences (e.g. `// starting from Node.js v22 we should define this property through odp`)
- Comments describing what a code section is *about* (e.g. `// this is a direct Sub-Type invocation`)
- TODOs and commented-out code that documents explored but rejected alternatives
- Debugger statements left as breadcrumbs for future investigation

**Do NOT remove comments because they seem like "clutter" or because the code is now typed.** TypeScript types answer "what" — comments answer "why". Both are necessary.

If a comment becomes technically inaccurate after a change, update it rather than deleting it.

## Testing Requirements

- **100% coverage required** for Jest (statements, branches, functions, lines) - see `jest.config.js`
- **100% coverage required** for Mocha (`npm run test:cov`)
- Mocha tests run on built code in `build/` directory
- Jest tests run directly on TypeScript source
- Tests must pass with `--allow-uncaught` flag (mocha)
- **Must run `npm run test:cov` before completing task** - this validates the build and ensures 100% coverage

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
