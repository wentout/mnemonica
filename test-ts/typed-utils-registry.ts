'use strict';

// TypeScript type tests for nominal utilities driven by TypeRegistry augmentation.
// These tests are compiled, not executed.

import { lookup, utils } from '..';
import type { TypeConstructor } from '..';

declare module '..' {
	interface TypeRegistry {
		'UserType': TypeConstructor<UserTypeInstance>;
		'UserType.AdminType': TypeConstructor<AdminTypeInstance>;
	}
}

interface UserTypeData {
	name: string;
}

interface AdminTypeData {
	role: string;
}

interface UserTypeInstance extends UserTypeData {
	AdminType: TypeConstructor<AdminTypeInstance>;
}

interface AdminTypeInstance extends UserTypeInstance, AdminTypeData {}

const UserType = lookup('UserType');

if (!UserType) {
	throw new Error('UserType not found');
}

const user = new UserType({ name: 'Alice' });

const admin = new user.AdminType({ role: 'admin' });

// Positive: lookup returns a typed constructor.
const lookedUp = lookup('UserType.AdminType');
if (lookedUp) {
	const lookedUpAdmin = new lookedUp({ role: 'root' });
	const role: string = lookedUpAdmin.role;
}

// Positive: parent returns the specific parent instance type.
const parent = utils.parent(admin, 'UserType');
const parentName: string | undefined = parent?.name;
