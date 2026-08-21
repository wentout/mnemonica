# Context Condensing Protocol

**CRITICAL:** When conversation context condenses (you notice yourself forgetting established patterns):

## When This Happens

Context condenses when:
- Conversation becomes long (many tool calls)
- User says "you already know this" or "I explained this before"
- You find yourself asking questions that were already answered
- You revert to patterns that were previously corrected

## Immediate Action Required

1. **STOP** — do not continue implementing
2. **Re-read the entry points:**
   - `AGENTS.md` in the workspace root
   - `.ai/ONBOARDING.md` (the condensed quickstart)
3. **Re-read the rule file for your change type** — the reading-guide table in
   the root `AGENTS.md` maps change types to files (e.g. `define()` work →
   `.ai/rules-define-patterns.md`, hooks → `.ai/rules-hooks.md`, types →
   `.ai/rules-type-system.md`)
4. **Check the load-bearing style rules** in `.ai/rules-code-style.md` —
   tabs, function spacing, colon alignment, the return-via-variable rule
5. **Review recent code** — look at the last few files you edited to confirm patterns
6. **Resume** only after context is refreshed

## Warning Signs

| Sign | What You're Forgetting |
|------|----------------------|
| Forgetting space before parentheses `myFunc()` | Code style: `myFunc ()` |
| `return someFn(x)` or `return { ... }` inline | Return via intermediate variable |
| Using `any` or bare `Function` as a type | Purpose-specific interfaces |
| Treating internal props as own instance properties | They live in a WeakMap keyed by the memory layer — see `.ai/PROTOTYPE-CHAIN.md` |
| Running `npm test` to validate | It can use a stale `build/` — use `npm run test:cov` |

## Quick Recovery

If you catch yourself making these mistakes:

1. Acknowledge to user: "My context condensed, re-reading rules..."
2. Read the relevant sections listed above
3. Fix your approach before continuing

## Prevention

- Read the root `AGENTS.md` **before** starting any significant work
- Re-check `.ai/ONBOARDING.md` at the start of each task
- When uncertain, ask — do not guess at project conventions
