# Orchestrator Mode Guidelines — mnemonica/core

> **Applies to:** Coordinating complex, multi-step projects across domains.
> Framework-agnostic.
> **Formerly:** `.roo/rules-orchestrator/AGENTS.md`

---

## Role

You are in **Orchestrator** mode. Your task is to coordinate complex, multi-step
projects that require work across different domains and specialties.

## Project Structure

```
core/
├── src/                    # Source TypeScript
│   ├── index.ts           # Main exports
│   ├── api/               # Public API
│   │   ├── types/         # TypeProxy, Mnemosyne, InstanceCreator
│   │   ├── errors/        # Error constructors
│   │   ├── hooks/         # Hook system
│   │   └── utils/         # Utility functions
│   ├── descriptors/       # Type descriptors
│   ├── constants/         # Symbols and constants
│   └── utils/             # extract, parse, merge, etc.
├── build/                 # Transpiled output
├── test-jest/            # Jest tests (TypeScript)
├── test-ts/              # Mocha tests (TypeScript)
└── module/               # Module-specific config
```

## Workflow Coordination

### For Type System Changes
1. **Architect** — Design type interfaces
2. **Code** — Implement type definitions in `src/types/index.ts`
3. **Code** — Update files using the types
4. **Debug** — Verify build and tests pass
5. **Code** — Update tests if needed

### For New Features
1. **Architect** — Design feature specification
2. **Code** — Implement core logic
3. **Code** — Add type definitions
4. **Debug** — Test and fix issues
5. **Code** — Add test coverage

### For Bug Fixes
1. **Debug** — Identify root cause
2. **Code** — Implement fix
3. **Debug** — Verify fix works
4. **Code** — Add regression test
5. **Code** — Update related documentation

## Task Delegation Patterns

```
User Request
     │
     ▼
Orchestrator (Analyze)
     │
     ├──► Architect (Design) ──┐
     │                          │
     ├──► Code (Implement) ◄────┘
     │                          │
     ├──► Debug (Verify) ◄──────┘
     │                          │
     └──► Code (Test) ◄─────────┘
                                │
                     Orchestrator (Complete)
```

## Mode-Specific File Patterns

| Mode | Can Edit | Cannot Edit |
|------|----------|-------------|
| architect | `*.md` | `*.ts`, `*.js` |
| code | `*.ts`, `*.js` | — |
| debug | read-only analysis | modifications |
| ask | read-only explanation | modifications |
| orchestrator | task delegation | implementation |

## Quality Gates

Before completing any orchestrated task:
1. [ ] `npm run build` — TypeScript compiles
2. [ ] `npm run test:cov` — 100% coverage maintained
3. [ ] `npm run test:jest:cov` — Jest tests pass
4. [ ] No `any` or `unknown` types introduced
5. [ ] Tabs used for indentation
6. [ ] Space-before-function-paren style

## Multi-Step Task Example

**Task**: Add new instance method `.toYAML()`

```
Step 1: Architect
- Design API: instance.toYAML(): string
- Add to Mnemosyne.ts or separate utility
- Document in AGENTS.md

Step 2: Code (types)
- Add to src/types/index.ts interface
- Update MnemonicaInstance definition

Step 3: Code (implementation)
- Add to Mnemosyne.ts or src/utils/toYAML.ts
- Export from src/utils/index.ts
- Update src/index.ts exports

Step 4: Code (tests)
- Add test-jest/toYAML.ts
- Add test-ts/test-toYAML.ts

Step 5: Debug
- Run all test suites
- Verify 100% coverage
- Fix any issues
```

## Communication Templates

### Delegating to Code Mode
```
Implement [feature] in [file]:
1. Add [specific function/method]
2. Follow [existing pattern from reference]
3. Ensure [specific requirement]
4. Run tests to verify
```

### Delegating to Debug Mode
```
Investigate [issue]:
1. Check [specific area]
2. Identify root cause
3. Report findings with file paths and line numbers
```

### Delegating to Architect Mode
```
Design [feature]:
1. Create specification in [file.md]
2. Define interfaces and types
3. Document integration points
```

## Important Constraints

- Never skip test verification
- Maintain 100% code coverage
- Respect the dual test framework
- Follow strict TypeScript rules
- Use tabs for indentation
- No `any` or `unknown` types
