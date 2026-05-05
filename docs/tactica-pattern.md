# Why You MUST Use tactica with mnemonica

> **mnemonica without tactica is incomplete.** It works at runtime. It fails at compile time. You lose type safety, intellisense, and the ability to chain instances without casts.
> **Do not settle for 10%. Use tactica and get 100%.**

---

## The Problem in One Sentence

mnemonica builds a Trie of constructors at runtime. TypeScript has no idea the Trie exists. **tactica tells TypeScript.**

Without tactica, every chain operation requires a cast. With tactica, every chain operation is fully typed.

---

## What You Get Without tactica

```typescript
import { RequestData } from './collections/requestTypes.js';

const requestData = new RequestData({ method: 'GET', url: '/' });
const routeData = new requestData.RouteData({ pagePath: '/' });
// Error: Property 'RouteData' does not exist on type 'RequestData'
```

TypeScript rejects valid code. You are forced to write:

```typescript
const routeData = new (requestData as any).RouteData({ ... });
// or worse:
const routeData = new requestData.RouteData({ ... }) as unknown as RouteDataT;
```

This is not type safety. This is type suppression.

---

## What You Get With tactica

```typescript
import { lookupTyped } from 'mnemonica';

const RequestData = lookupTyped('RequestData');

const requestData = new RequestData({ method: 'GET', url: '/' });
const routeData = new requestData.RouteData({ pagePath: '/' });
const pageData = new routeData.PageData({ header: {...}, content: '' });
```

**Zero casts. Zero `any`. Zero `unknown`.**

TypeScript knows every property, every constructor, every link in the chain.

---

## How It Works (Three Steps)

### Step 1: You define types with `define()`

```typescript
const RequestData = define('RequestData', function (this: {...}, data) {
	Object.assign(this, data);
});

const RouteData = RequestData.define('RouteData', function (this: {...}, data) {
	Object.assign(this, data);
});
```

### Step 2: tactica analyzes and generates types

Run `npx tactica`. It scans your `define()` calls and creates `.tactica/`:

- `types.ts` — instance types with full property knowledge
- `registry.ts` — TypeRegistry augmentation that teaches TypeScript about the Trie

### Step 3: You use `lookupTyped()` instead of direct import

```typescript
const RequestData = lookupTyped('RequestData');
```

This returns the **same constructor** as a direct import, but TypeScript sees it through the augmented `TypeRegistry`. TypeScript now knows about `.RouteData`, `.PageData`, and every property.

---

## The Runtime Is Identical

`lookupTyped('RequestData')` and `import { RequestData }` return the **exact same object** at runtime. The only difference is TypeScript's compile-time knowledge.

| Approach | Runtime | Compile-time |
|---|---|---|
| Direct import | ✅ Constructor works | ❌ TypeScript is blind to sub-types |
| `lookupTyped` | ✅ Same constructor | ✅ TypeScript knows the full Trie |

There is no runtime cost. There is no indirection. There is only **type safety**.

---

## tsconfig.json Setup

For this to work, TypeScript must see the augmentation:

```json
{
	"include": [
		"src/**/*",
		".tactica/**/*"
	]
}
```

If `.tactica/` is not in `include`, TypeScript never learns about the `TypeRegistry` and `lookupTyped` fails.

---

## The Rule

**If you are using mnemonica, you MUST use tactica.**

- Do not write `as unknown as` with mnemonica types.
- Do not import constructors directly from collection files.
- Do not accept "it compiles with casts" as good enough.

Set up tactica. Generate the registry. Use `lookupTyped`. Chain without fear.

---

## Learn More

- **Comprehensive technical guide:** `../MNEMONICA-TACTICA-PATTERN.md`
- **Agent instructions:** `.ai/TACTICA.md`
- **Declaration merging deep dive:** `../MNEMONICA-TACTICA-PATTERN.md` §4
