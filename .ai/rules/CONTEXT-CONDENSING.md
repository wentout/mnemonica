# Context Condensing Protocol

**CRITICAL:** When conversation context condenses (you notice yourself forgetting established patterns):

## When This Happens

Context condenses when:
- Conversation becomes long (many tool calls)
- User says "you already know this" or "I explained this before"
- You find yourself asking questions that were already answered
- You revert to patterns that were previously corrected
- You forget about `raw*` types and start using complex casting

## Immediate Action Required

1. **STOP** - Do not continue implementing
2. **Re-read AGENTS.md files:**
   - `AGENTS.md` in workspace root (if exists)
   - `.ai/rules/CODING.md`
3. **Check specific sections:**
   - "CRITICAL: Type vs Interface vs Instance" (lines 244-279)
   - "Lessons Learned from Recent Refactoring" (lines 99-191)
4. **Re-read REMINDERS.md** in `.ai/rules/`
5. **Review recent code** - Look at the last few files you edited to confirm patterns
6. **Resume** only after context is refreshed

## Warning Signs

| Sign | What You're Forgetting |
|------|----------------------|
| Using `(obj as unknown as {...}).Type` casting | Use `raw*` types instead |
| Adding `loadFromFile` to model classes | Actions belong in Registry (controller) |
| Re-reading files to find data | Store data during parsing (lineNumber, etc.) |
| Creating redundant types (typeEntry + rawTypeEntry) | Use single `raw*` naming |
| Forgetting space before parentheses `myFunc()` | Code style: `myFunc ()` |
| Using `;` after type definitions | Tactica types end with `}` not `;` |

## Quick Recovery

If you catch yourself making these mistakes:

1. Acknowledge to user: "My context condensed, re-reading rules..."
2. Read the relevant AGENTS.md sections
3. Fix your approach before continuing

## Prevention

- Read AGENTS.md **before** starting any significant work
- Check REMINDERS at start of each task
- When uncertain, ask: "Does this align with Lessons Learned?"
