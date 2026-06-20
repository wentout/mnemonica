'use strict';
// TypeScript type tests for nominal utilities driven by TypeRegistry augmentation.
// These tests are compiled, not executed.
import { lookup, utils } from '..';
const UserType = lookup('UserType');
const user = new UserType({ name: 'Alice' });
const admin = new user.AdminType({ role: 'admin' });
// Positive: parent returns the specific parent instance type.
const parent = utils.parent(admin, 'UserType');
const parentName = parent?.name;
// @ts-expect-error — 'UserType' is a root, so it has no parent path.
utils.parent(user, 'UserType');
// @ts-expect-error — 'NonExistent' is not a valid parent path.
utils.parent(admin, 'NonExistent');
