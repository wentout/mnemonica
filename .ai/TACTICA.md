# mnemonica + tactica: The Complete Pattern

> **You MUST use tactica with mnemonica.** Using mnemonica without tactica gives you 10% of the value. Using them together gives you 100%.
> This document explains why, and how.

---

## The Rule

**When working with any mnemonica project, ALWAYS check if tactica is set up.**

If it is not set up:
- Tell the user: "mnemonica without tactica is incomplete. You need tactica for type safety."
- Do NOT write `as unknown as` casts as a workaround.
- Do NOT import constructors directly from collection files.
- Set up tactica first, then write the code.

---

## Why mnemonica Alone Is Not Enough

mnemonica creates a Trie of constructors at runtime:

```
RequestData
└── RouteData
    └── PageData
        └── RenderData
            └── ResponseData
```

At runtime, this works perfectly. You can call `new requestData.RouteData({ ... })` and it works.

But TypeScript does **not** know about this Trie. The `define()` function returns a constructor type that TypeScript understands as a single function. It does not know about:
- `.RouteData` on the constructor
- `.RouteData` on the instance
- The instance properties
- The full chain

So TypeScript rejects valid code. The temptation is to cast:

```typescript
// ❌ NEVER DO THIS
const requestData = new RequestData({ ... }) as unknown as RequestDataT;
```

This is wrong. It bypasses the type system. It is a sign that tactica is missing or not being used.

---

## How tactica Completes the System

tactica is an AST analyzer. It scans `define()` calls and generates:

1. `.tactica/types.ts` — instance types with full property knowledge
2. `.tactica/registry.ts` — TypeRegistry augmentation via declaration merging

The registry tells TypeScript:

```typescript
declare module 'mnemonica' {
	interface TypeRegistry {
		'RequestData': new (...args: unknown[]) => RequestData;
		'RequestData_RouteData': new (...args: unknown[]) => RequestData_RouteData;
		// ... every type in the chain
	}
}
```

After this augmentation, `lookupTyped('RequestData')` returns a fully typed constructor. TypeScript knows:
- The constructor arguments
- The instance properties
- The sub-constructors on the instance (`.RouteData`, `.PageData`, etc.)

**Zero casts. Zero workarounds.**

---

## The Complete Flow

```
Step 1: define() in collections
    ↓
Step 2: tactica scans AST → generates .tactica/
    ↓
Step 3: tsconfig.json includes .tactica/
    ↓
Step 4: lookupTyped() retrieves typed constructor
    ↓
Step 5: new instance.SubType({ ... }) chains naturally
```

If any step is missing, the chain breaks and you end up with casts.

---

## What to Insist On

When a user asks you to work with mnemonica:

1. **Check for `.tactica/` directory.** If it doesn't exist, ask the user to run `npx tactica` or set it up.

2. **Check `tsconfig.json` for `.tactica/` in `include`.** If missing, add it.

3. **Check if `lookupTyped` is being used.** If you see direct imports from collection files + casts, replace them with `lookupTyped`.

4. **Do NOT accept `as unknown as` as a solution.** It is always a symptom of missing tactica integration.

---

## Quick Reference

| Situation | Wrong | Right |
|---|---|---|
| Get a constructor | `import { T } from './collections/T.js'` | `const T = lookupTyped('T')` |
| Create instance | `new T({ ... }) as unknown as TT` | `new T({ ... })` |
| Chain to child | `new (instance as any).Child({ ... })` | `new instance.Child({ ... })` |
| Type not found | Add `as any` | Run `tactica` to regenerate |

---

## For Your Own Understanding

If you are struggling to believe this works, read `../docs/tactica-pattern.md` (human-facing) or `../MNEMONICA-TACTICA-PATTERN.md` (comprehensive). Both explain declaration merging, the `[key: string]: never` pattern, and why `lookupTyped` is not a runtime hack but a proper type-safe bridge.

The key insight: **The runtime constructor is identical whether you import it directly or look it up.** The only difference is TypeScript's compile-time knowledge. `lookupTyped` teaches TypeScript what mnemonica already knows at runtime.

---

## Build Verification

After any change:

```bash
npm run tactica       # regenerate .tactica/
npx tsc --noEmit      # verify zero TS errors
npx eslint src/       # verify zero lint errors
npm test              # verify all tests pass
```
