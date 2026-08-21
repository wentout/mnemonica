---
name: mnemonica-hooks
description: |
  Lifecycle hooks in mnemonica: preCreation, postCreation, creationError.
  Use when the user asks about hooks, registerHook, lifecycle events, or
  when adding hook-related functionality to mnemonica.
metadata:
  tags: [mnemonica, hooks, lifecycle, events]
---

# Lifecycle Hooks

## Hook Types

| Hook | When Fired | Data |
|------|-----------|------|
| `preCreation` | Before constructor runs | `type`, `TypeName`, `existentInstance`, `args` |
| `postCreation` | After successful construction | plus `inheritedInstance`, `throwModificationError` |
| `creationError` | Construction produced an errored instance | plus `inheritedInstance`, `throwModificationError` |

## Registration Levels

Hooks can be registered at two levels:

### Type-level
```typescript
MyType.registerHook('postCreation', (opts) => {
	console.log(`Created ${opts.type.TypeName}`);
});
```

### Collection-level
```typescript
import { registerHook } from 'mnemonica';
registerHook(MyType, 'preCreation', (opts) => {
	console.log('About to create instance');
});
```

## Hook Execution Order

1. Collection `preCreation`
2. Type `preCreation`
3. Constructor invocation
4. If error: Collection `creationError`, Type `creationError`
5. If success: Collection `postCreation`, Type `postCreation`
