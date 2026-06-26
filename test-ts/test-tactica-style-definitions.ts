'use strict';

// This file simulates what tactica sees and generates.
// The top part is hand-written model code; the bottom part is what tactica produces.

import { define } from '..';

// --- hand-written model code -------------------------------------------------

export const User = define('User', function (
	this: User,
	data: { name: string }
) {
	this.name = data.name;
});

User.define('Admin', function (
	this: Admin,
	data: { role: string }
) {
	this.role = data.role;
});

// --- tactica-generated instance types (normally .tactica/types.ts) -----------

type User = {
	name: string;
	Admin: new (data: { role: string }) => Admin;
}

type Admin = {
	role: string;
} & User;

// --- tactica-generated registry (normally .tactica/registry.ts) --------------

declare module '..' {
	interface TypeRegistry {
		'User': new (data: { name: string }) => User;
		'User.Admin': new (data: { role: string }) => Admin;
	}
}
