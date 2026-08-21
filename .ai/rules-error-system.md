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

## Error Data Lives in Props, Not on the Error Object

Mnemonica errors are plain `Error` objects: only `.message` and `.stack` are
own properties. All mnemonica-specific data (`args`, `originalError`,
`instance`, `exceptionReason`, `reasons`, `surplus`, `error`) is stored in the
external props storage — read it with `getProps(error)`, write it with
`setProps(error, …)` (see `.ai/PROTOTYPE-CHAIN.md` for the two key-spaces).
Never read `error.originalError` etc. directly, and never add those fields back
onto the error object.

## constructError Factory

```typescript
import { constructError } from '../api/errors/index.js';

const MyError = constructError('MY_ERROR', 'Error message');
throw new MyError('additional info', stack);
```

## Asserting on Errors

Thrown mnemonica errors are real class instances: every `ErrorsTypes.X` is a
class extending `BASE_MNEMONICA_ERROR extends Error`, so `instanceof` works
and is the house pattern in both suites:

```typescript
// ✅ Correct — used throughout test/ (instanceOf) and test-jest/ (toBeInstanceOf)
expect(error).toBeInstanceOf(ErrorsTypes.ALREADY_DECLARED);
expect(error).toBeInstanceOf(Error);
```

The quirk is elsewhere: error **constructor names are `String` objects**, not
primitives (`Object.defineProperty` getter returning `new String(name)` in
`src/api/errors/index.ts`). This only bites when comparing *names*:

```typescript
// ❌ Wrong — String object !== primitive string under ===
error.constructor.name === 'ALREADY_DECLARED';

// ✅ Correct — coerce before comparing
expect(String(error.constructor.name)).toEqual('ALREADY_DECLARED');
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
