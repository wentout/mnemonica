---
name: mnemonica-error-system
description: |
  Error handling in mnemonica: BASE_MNEMONICA_ERROR, constructError, stack
  cleaning, and error constructor quirks. Use when the user asks about errors,
  WRONG_MODIFICATION_PATTERN, ALREADY_DECLARED, or error handling in mnemonica.
metadata:
  tags: [mnemonica, errors, stack, exceptions]
---

# Error System

## BASE_MNEMONICA_ERROR

All errors extend from `BASE_MNEMONICA_ERROR` which provides:
- Stack cleaning via configurable regex filters
- Additional stack prepending
- BaseStack preservation

## constructError Factory

```typescript
import { constructError } from '../api/errors/index.js';

const MyError = constructError('MY_ERROR', 'Error message');
throw new MyError('additional info', stack);
```

## Error Constructor Names Are String Objects

Error constructor names are `String` objects, not primitives. Compare as strings:

```typescript
// ❌ Wrong — may fail
expect(error).toBeInstanceOf(ErrorsTypes.ALREADY_DECLARED);

// ✅ Correct
const expectedName = (err as { name: string }).name;
const actualName = (error as Error).constructor.name;
expect(String(actualName)).toEqual(String(expectedName));
```

## Common Error Types

| Error | When Thrown |
|-------|------------|
| `WRONG_TYPE_DEFINITION` | Invalid type name, non-function handler |
| `WRONG_INSTANCE_INVOCATION` | extract() on non-object |
| `WRONG_MODIFICATION_PATTERN` | Bad prototype chain, wrong parent type |
| `ALREADY_DECLARED` | Type name already exists |
| `WRONG_ARGUMENTS_USED` | Invalid constructor arguments |
| `WRONG_HOOK_TYPE` | Unknown hook type |
| `MISSING_HOOK_CALLBACK` | registerHook without callback |
| `MISSING_CALLBACK_ARGUMENT` | Callback required but missing |
| `OPTIONS_ERROR` | Invalid config options |
| `WRONG_STACK_CLEANER` | Invalid stack cleaner regex |
