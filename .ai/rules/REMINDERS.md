# Critical Reminders for AI Agents

## Before Writing Any Code

### 1. Type vs Interface - CRITICAL
**ALWAYS** check AGENTS.md section "CRITICAL: Type vs Interface vs Instance" before defining types:

```typescript
// ✅ CORRECT - Instance data uses TYPE
type UserData = { name: string; age: number; };

// ❌ WRONG - Instance is NOT an interface!
interface UserData { name: string; age: number; }

// ✅ CORRECT - Constructor/Prototype contract uses INTERFACE
interface MnemonicaInstance {
    extract(): object;
    parent(): object | null;
}
```

**Rule of thumb:**
- **Interface** = Black-box contract (constructors, callables, `implements`)
- **Type** = Runtime data structure/shape (instances, POJOs)

### 2. Indentation - TABS ONLY
- **NEVER** use spaces for indentation
- Tab width: 4
- Enforced by eslint

### 3. Function Spacing
```typescript
function myFunc () { }  // ✅ Space before parentheses
function myFunc() { }   // ❌ Wrong
```

### 4. Key Spacing
```typescript
{ key: value }          // ✅ Space after colon
{ key:value }           // ❌ Wrong
```

### 5. Before Each Task
1. Read AGENTS.md if context seems incomplete
2. Check existing code patterns in the same directory
3. Run `npm run build` before completing (core/ directory)
4. Run `npm run test:cov` for coverage validation (core/ directory)

## Quick Reference

| Decision | Check |
|----------|-------|
| Type vs Interface | AGENTS.md |
| Build commands | AGENTS.md |
| Code style | AGENTS.md |
| Error handling | AGENTS.md |
| Context condensing | CONTEXT-CONDENSING.md |

## File-Specific Notes

- `core/src/types/index.ts` - Export types here, use `type` for instances
- `core/src/api/types/*.ts` - Internal implementations, check existing patterns
- Any `provider.ts` files - Check AGENTS.md for type/interface rules
