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
const user = new UserType({ name: 'Alice' });

const admin = new user.AdminType({ role: 'admin' });

// Positive: parent returns the specific parent instance type.
const parent = utils.parent(admin, 'UserType');
const parentName: string | undefined = parent?.name;
