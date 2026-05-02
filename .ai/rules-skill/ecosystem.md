---
name: mnemonica-ecosystem
description: |
  The mnemonica ecosystem: PACT framework, user personas, tool integration,
  and collaboration modes. Use when the user asks about how mnemonica fits
  into a larger workflow, who uses it, what tools integrate with it, or
  the ecosystem architecture (tactica, strategy, mnemographica, topologica).
metadata:
  tags: [mnemonica, ecosystem, pact, tools, integration]
---

# Ecosystem Overview

Mnemonica is not a single library — it is an ecosystem of tools for building
self-reflective, type-safe systems.

---

## PACT Framework

PACT (People-Activities-Context-Technologies) describes how the ecosystem
supports different users.

### People (Personas)

| Persona | Goal | Needs | Skills |
|---------|------|-------|--------|
| **AI Agent Developer** | Build self-reflective, self-extending AI systems | Runtime type introspection, memory persistence, command execution | TypeScript, prototype chains, MCP protocols |
| **Application Developer** | Build robust inheritance-based applications | Type safety, IDE support, debugging tools | JavaScript/TypeScript, OOP patterns |
| **Library Maintainer** | Extend mnemonica with new features | Understanding internal architecture, test coverage | Advanced TypeScript, AST manipulation |

### Activities

| Activity | Who | Frequency | Complexity |
|----------|-----|-----------|------------|
| Define new types | All | High | Low |
| Navigate type hierarchy | AI Agent, App Dev | High | Medium |
| Debug prototype chains | All | Medium | High |
| Extend via MCP | AI Agent | Medium | High |
| Visualize inheritance | App Dev | Low | Low |

### Activity Flow: Type Definition

```
1. Write define() call
2. Tactica analyzes AST
3. Types generated in .tactica/
4. IDE provides autocomplete
5. Mnemographica visualizes
6. Strategy MCP exposes for AI
```

### Context

#### Development Environments

| Environment | Tools |
|-------------|-------|
| **VS Code** | Mnemographica extension, Tactica LSP, Mnemonica Logger |
| **Runtime (Node.js)** | CDP Connection (port 9229), Strategy MCP (ports 9230/9231) |

#### Collaboration Modes

| Mode | Human | AI | Tools |
|------|-------|-----|-------|
| Solo Coding | Active | None | Tactica |
| AI Pairing | Active | Assistant | Strategy MCP |
| AI Autonomous | Supervisory | Active | Full ecosystem |

---

## Technology Stack

```
┌─────────────────────────────────────────┐
│         Mnemonica Ecosystem             │
├─────────────────────────────────────────┤
│  mnemographica  │  VS Code Extension    │
│  tactica        │  Type Generator/LSP   │
│  strategy       │  MCP Server           │
│  topologica     │  Module Loader        │
│  mnemonica      │  Core Runtime         │
├─────────────────────────────────────────┤
│  Chrome Debug Protocol (CDP)            │
│  Model Context Protocol (MCP)           │
└─────────────────────────────────────────┘
```

### Integration Points

1. **Tactica → VS Code**: Language Service Plugin
2. **Strategy → CDP**: Runtime evaluation
3. **Mnemographica → Strategy**: HTTP/WebSocket servers
4. **All → Topologica**: Module loading

---

## Design Principles

### 1. Progressive Disclosure
- Simple `define()` for beginners
- Advanced hooks for power users
- MCP tools for AI agents

### 2. Self-Hosting
- Extension uses mnemonica internally
- Types self-generate
- Documentation is executable

### 3. Inheritance as UI
- Tree view shows hierarchy
- Graph shows relationships
- Code navigation follows prototype chain

---

## Future: PACT eslint Rule

When implemented, a custom eslint rule will enforce:

```typescript
// ❌ ERROR: Instance data should use TYPE
interface UserData { name: string; }

// ✅ PASS: Instance uses TYPE
type UserData = { name: string; };

// ❌ ERROR: Constructor contract should use INTERFACE
type Runnable = { run(): void };

// ✅ PASS: Contract uses INTERFACE
interface Runnable { run(): void; }
```

---

## References

- [Wikipedia: PACT (interaction design)](https://en.wikipedia.org/wiki/PACT_(interaction_design))
- `strategy/README.md` — MCP architecture
