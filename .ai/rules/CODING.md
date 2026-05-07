# ⚠️ RULE #1 — NON-NEGOTIABLE: PAUSE AND ASK

**This is the highest-priority rule. It overrides ALL other instructions.**

## When You MUST Stop and Ask

You MUST pause BEFORE proceeding and ask the user for clarification if ANY of the following is true:

1. **Editing errors** — `apply_diff` fails, `write_to_file` produces unexpected results, or any tool returns an error.
2. **Uncertainty** — you are not 100% certain about what change to make, how a function works, or what the user intended.
3. **Assumptions** — you find yourself filling in gaps with "probably", "likely", "I think", or "it should work".

## What To Do

- STOP immediately.
- Do NOT proceed with workarounds (no `sed`, no `python -c`, no console hacks).
- Do NOT make assumptions.
- ASK the user a clear, specific question.
- WAIT for their answer before continuing.

## Why This Matters

You work with a Computer Science Enthusiast. You are their clever and knowledgeable Assistant, developed across many spheres. Wrong assumptions waste both your time and theirs. When in doubt — ASK.

---

# Extended Coding Rules

## CRITICAL: Full File Reading Required

When asked to read a file, you MUST read the ENTIRE file, not just the first 50-100 lines.

### How to Read Full Files

1. First read with `limit: 200` and check if truncated
2. If truncated, continue with `offset: 201` until end
3. For files over 1000 lines, use multiple calls:
```typescript
// Read 0-200
read_file(path, 1, 200)
// Read 201-400
read_file(path, 201, 200)
// Continue until no longer truncated
```

### NEVER Do This
- ❌ Read only 50-100 lines and assume you understand
- ❌ Stop reading because "it looks like enough"
- ❌ Implement based on partial file content

### ALWAYS Do This
- ✅ Read until file is NOT truncated
- ✅ Check "Status: Showing lines X-Y of Z total lines"
- ✅ If Z > Y, continue reading from Y+1

## Required Analysis Steps

Before writing ANY implementation code:

### Step 1: Document Data Structures
Write a brief analysis of:
- What data format does each file use?
- What are the key interfaces/types?
- How does data flow between files?

### Step 2: Show Your Understanding
Provide a summary like:
```
From analyzing [file.ts]:
- Data format: { key: string, items: Array<...> }
- Key function: processData() expects X, returns Y
- Related files: A.ts, B.ts depend on this format
```

### Step 3: Get Approval
Wait for user confirmation before implementing.

### Step 4: Write Tests First
Create test cases that verify your understanding:
```typescript
// Test: Data format must match expected structure
const data = loadData();
assert(data.key !== undefined);
assert(Array.isArray(data.items));
```

### Step 5: Implement
Only after Steps 1-4 are complete.

## Example: ReferenceProvider Fix

❌ WRONG - Coder's Approach:
- Read 50 lines of referenceProvider.ts
- Assume Usages structure from memory
- Implement broken marshaling

✅ CORRECT - Required Approach:
1. Read FULL referenceProvider.ts (all 300+ lines)
2. Read FULL usages.json to see actual data format
3. Read FULL Usages.ts to understand model structure
4. Document: "usages.json has { typeName: Array<Usage> } format"
5. Show mapping: "Need to convert from JSON to Mnemonica instance"
6. Write test case for conversion
7. Implement with verified understanding

## User's Direct Instructions

When user says:
- "Read the FULL content" → Read entire file, no shortcuts
- "Analyze before implementing" → Document first, code second
- "Check the data format" → Look at actual JSON/data files, don't guess

## Consequences of Not Following

If you skip these steps:
1. You will make wrong assumptions
2. User will have to debug and fix your code
3. You waste user's time and energy
4. User is older and has limited energy - your shortcuts hurt them

## Remember

They are not your debugger. They are a Scientist.
Your job is to implement correctly the FIRST time.
Read thoroughly. Analyze completely. Then code.

## Lessons Learned from Recent Refactoring

### 1. Separation of Concerns: Models vs Controllers

**Pattern:** Models = Pure Data, Controllers = Actions

Models should be pure data containers with only Map/array operations. File I/O and parsing actions belong in controllers.

```typescript
// ✅ CORRECT - Model is pure data
export const Definitions = define('Definitions', class {
    private map: Map<string, DefinitionEntryInstance> = new Map();
    
    get(name: string) { return this.map.get(name); }
    set(name: string, entry: DefinitionEntryInstance) { this.map.set(name, entry); }
    // Note: loadFromFile action moved to Registry
});

// ✅ CORRECT - Controller handles file I/O
export const Registry = define('Registry', class {
    private async loadDefinitions(tacticaPath: string) {
        const content = fs.readFileSync(definitionsPath, 'utf-8');
        // ... populate Definitions instance
    }
});
```

### 2. Avoid Inefficient File Operations

**Pattern:** Store data during parsing, don't re-read files

Never re-read an entire file just to get data that was already available during initial parsing.

```typescript
// ❌ WRONG - Re-reads file every time
getLineForType(typeName: string): number | undefined {
    const entry = this.map.get(typeName);
    const content = fs.readFileSync(entry.fullPath, 'utf-8');  // NO!
    // ... search for line number
}

// ✅ CORRECT - Store lineNumber during parsing
export type rawTypeEntry = {
    name: string;
    fullPath: string;
    parent?: string;
    properties: Map<string, string>;
    lineNumber: number;  // Store during parsing
};

// During parsing in controller:
for (let i = 0; i < lines.length; i++) {
    if (match) {
        const entry = new this.typesInstance.TypeEntry({
            // ...
            lineNumber: i  // Store when we know it
        } as rawTypeEntry);
    }
}

// Simple O(1) lookup later:
getLineForType(typeName: string): number | undefined {
    return this.map.get(typeName)?.lineNumber;
}
```

### 3. Naming: Use raw* Prefix for Data Transfer Types

**Pattern:** `rawTypeEntry` for external data transfer

Models should export `raw*` types that controllers use when populating them.

```typescript
// In model file (Types.ts):
export type rawTypeEntry = {
    name: string;
    fullPath: string;
    parent?: string;
    properties: Map<string, string>;
    lineNumber: number;
};

// In controller file (Registry.ts):
import type { rawTypeEntry } from './Types';

const entry = new this.typesInstance.TypeEntry({
    name,
    fullPath: typesPath,
    parent,
    properties: new Map(),
    lineNumber: i
} as rawTypeEntry);
```

### Summary Table

| Concern | Location | Example |
|---------|----------|---------|
| Data storage | Model | `Definitions`, `Types`, `Usages`, `Trie` |
| Data operations | Model | `get()`, `set()`, `has()` |
| File I/O | Controller | `Registry.loadDefinitions()` |
| Parsing | Controller | `Registry.loadTypes()` |
| External data types | Model exports | `rawTypeEntry`, `rawDefinitionEntry` |
