---
name: mnemonica-contributing
description: |
  Behavioral guidelines for contributing to mnemonica.
  Use when modifying mnemonica source code, adding features, fixing bugs,
  or reviewing code. Covers: avoiding assumptions, simplicity, surgical
  changes, and goal-driven execution with 100% coverage as success criteria.
  Derived from Andrej Karpathy's LLM coding principles, adapted for
  mnemonica's proxy-based architecture and type system.
metadata:
  tags: [mnemonica, contributing, behavior, guidelines, karpathy]
---

# Contributing Guidelines

> **Tradeoff:** These guidelines bias toward caution over speed.
> For trivial tasks (typo fixes, obvious one-liners), use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing, analyze the type graph impact:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### Mnemonica-Specific Checklist

Before modifying `src/types/index.ts` or the type system:
1. Does this change affect `Proto<P,T>` merging?
2. Does it break `_Internal_TC_` / `TypeConstructor` contracts?
3. Will tactica-generated `TypeRegistry` need regeneration?
4. Are subtypes in the Trie affected?

### Example: Hidden Assumptions

**User Request:** "Add a config option to TypeProxy"

**❌ Wrong** (assumes where to add, ignores Proxy handler compatibility)
```typescript
// Adds config to TypeProxy without checking handler compatibility
TypeProxy.prototype.set = function (_target, name, value) {
	if (name === 'newConfig') { /* ... */ }
	// ... existing code
};
```

**✅ Correct** (surfaces assumptions, checks impact)
```
Before implementing, I need to clarify:

1. **Scope**: Should this config be per-type or per-collection?
2. **Proxy compatibility**: TypeProxy handles `.get`, `.set`, `.construct`.
   Adding config requires checking all three traps.
3. **Existing options**: `strictChain`, `blockErrors`, `exposeInstanceMethods`
   already exist. Does this fit the pattern?
4. **TypeRegistry impact**: Will tactica need to regenerate types?

What's the use case — can an existing option cover it?
```

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

### Mnemonica-Specific: Respect the Proxy Architecture

The construction pipeline (`TypeProxy` → `InstanceCreator` → `Mnemosyne`) is already
sophisticated. Don't add wrapper layers.

**❌ Over-engineered**
```typescript
class TypeBuilder {
	private name: string;
	private handler?: CallableFunction;
	private config?: constructorOptions;

	withName(name: string) { this.name = name; return this; }
	withHandler(handler: CallableFunction) { this.handler = handler; return this; }
	withConfig(config: constructorOptions) { this.config = config; return this; }

	build() {
		return define(this.name, this.handler, this.config);
	}
}

// 50 lines for: define('MyType', handler, config)
```

**✅ Simple**
```typescript
const MyType = define('MyType', function (this: MyType, data: Data) {
	Object.assign(this, data);
});
```

### The Test

> "Would a senior engineer say this is overcomplicated?" If yes, simplify.

For mnemonica: "Does this respect the existing proxy architecture, or does it
add indirection that the framework already handles?"

---

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

### Mnemonica-Specific: Instance Chain Immutability

The prototype chain is fragile. Every changed line should trace directly to the
user's request.

**Critical rules:**
- Don't modify `tsconfig.json` or `eslint.config.js` without approval.
- Don't reformat files unrelated to the task.
- Don't change `Object.setPrototypeOf` patterns without explicit reason.
- Don't "improve" JSDoc comments in files you don't touch.

### The Test

> Every changed line should trace directly to the user's request.

For mnemonica: "Does this change affect the prototype chain of existing types?
If yes, is it necessary?"

---

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

| Instead of... | Transform to... |
|---------------|-----------------|
| "Add a feature" | "Write tests, run `npm run test:cov`, achieve 100%" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |

### Multi-Step Task Plan

```
1. [Analyze type impact] → verify: `npm run build` compiles
2. [Implement change] → verify: `npm run build` still passes
3. [Add tests] → verify: `npm run test:cov` shows 100% coverage
4. [Check style] → verify: `npm run lint` passes
5. [Review] → verify: Only requested lines changed
```

### Strong vs Weak Criteria

- **Weak:** "Make it work" → requires constant clarification
- **Strong:** "Add `strictChain` validation to `postProcessing`, test with
  `ALREADY_DECLARED` and `WRONG_MODIFICATION_PATTERN`, verify 100% coverage" →
  lets the agent loop independently

---

## How to Know It's Working

These guidelines are working if you see:

- **Fewer unnecessary changes in diffs** — Only requested changes appear
- **Fewer rewrites due to overcomplication** — Code is simple the first time
- **Clarifying questions come before implementation** — Not after mistakes
- **Clean, minimal PRs** — No drive-by refactoring or "improvements"
- **100% coverage maintained** — Tests verify every change
