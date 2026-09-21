'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// TypeScript type tests for nominal utilities driven by TypeRegistry augmentation.
// These tests are compiled, not executed.
const __1 = require("..");
const UserType = (0, __1.lookup)('UserType');
const user = new UserType({ name: 'Alice' });
const admin = new user.AdminType({ role: 'admin' });
// Positive: parent returns the specific parent instance type.
const parent = __1.utils.parent(admin, 'UserType');
const parentName = parent?.name;
