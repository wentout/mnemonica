'use strict';

// TypeScript type tests for nominal utilities driven by TypeRegistry augmentation.
// These tests are compiled, not executed.

import { lookupTyped, utils } from '..';
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

const UserType = lookupTyped('UserType');
const user = new UserType({ name: 'Alice' });

const admin = new user.AdminType({ role: 'admin' });

// Positive: parentTyped returns the specific parent instance type.
const parent = utils.parentTyped(admin, 'UserType');
const parentName: string | undefined = parent?.name;

// @ts-expect-error — 'UserType' is a root, so it has no parent path.
utils.parentTyped(user, 'UserType');

// @ts-expect-error — 'NonExistent' is not a valid parent path.
utils.parentTyped(admin, 'NonExistent');
