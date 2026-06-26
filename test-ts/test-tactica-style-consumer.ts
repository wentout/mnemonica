'use strict';

// Naive consumer: imports the constructors directly, no lookup().

import { User } from './test-tactica-style-definitions.js';

const user = new User({ name: 'Alice' });

const admin = new user.Admin({ role: 'super' });

type name = typeof admin.name; // string
type role = typeof admin.role; // string

export interface overall {
	name: name,
	role: role
}

console.log(user, admin);
