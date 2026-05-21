# Task Template: New Feature Implementation

## Pre-Flight Checklist

- [ ] Read AGENTS.md section "CRITICAL: Type vs Interface vs Instance" (lines 244-279)
- [ ] Read AGENTS.md section "Build & Test Commands" (lines 102-116)
- [ ] Check existing code patterns in the target directory
- [ ] Run `npm run build` to ensure clean baseline (core/ directory)

## Implementation Steps

1. **Design Phase**
   - [ ] Define types (use `type` for instances, `interface` for constructors/contracts)
   - [ ] Check REMINDERS.md in `.ai/rules/`

2. **Coding Phase**
   - [ ] Follow indentation: TABS ONLY (width 4)
   - [ ] Function spacing: `function myFunc () { }`
   - [ ] Key spacing: `{ key: value }`

3. **Testing Phase**
   - [ ] Run `npm run test:cov` (validates build + 100% coverage)
   - [ ] Verify no ESLint warnings
   - [ ] Read and analyse full content of edited file as if it would be code-review

4. **Completion**
   - [ ] Update TODO list
   - [ ] Run final build
   - [ ] Use attempt_completion tool

## Context Condensing Protocol

**CRITICAL:** If you notice yourself forgetting established patterns:

→ **READ** `.ai/rules/CONTEXT-CONDENSING.md` immediately

## Quick References

| Check | Location |
|-------|----------|
| Type vs Interface | AGENTS.md |
| Build commands | AGENTS.md |
| Code style | AGENTS.md |
| Error handling | AGENTS.md |
| Lessons Learned | AGENTS.md |
| Context condensing | CONTEXT-CONDENSING.md |
