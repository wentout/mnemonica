'use strict';

// Consumer file showing that the typed registry travels with the imported
// builder value across files. This file is compile-only.

import { DefaultApp, UserShape, AdminShape } from './registry-holder';
import { lookup } from '..';

const UserCtor = DefaultApp.lookup('User');
const user = new UserCtor({ name: 'Ada' });
const userName = user.name;

// The registry type travels with the imported builder, so `user.Admin` is
// typed here as well.
const admin = new user.Admin({ role: 'root' });
const adminRole = admin.role;

// Two-arg lookup(source, path) across the module boundary: the free lookup
// infers the registry from the imported builder value.
const AdminViaTwoArg = lookup(DefaultApp, 'User.Admin');
const adminViaTwoArgRole = AdminViaTwoArg.prototype.role;

// Relative lookup on a constructor imported from another file.
const AdminCtor = UserCtor.lookup('Admin');
const SuperAdminCtor = AdminCtor.lookup('SuperAdmin');
const superAdminRole = SuperAdminCtor.prototype.role;

// Defining an extra subtype on the imported root constructor.
interface ModeratorShape extends UserShape {
	forum: string;
}
DefaultApp.lookup('User').define('Moderator', function (this: ModeratorShape, data: { forum: string }) {
	this.forum = data.forum;
});

// The shapes can also be used directly for additional declarations.
const makeAdmin = (data: { name: string; role: string }): AdminShape => {
	return { ...data };
};

console.log(
	userName,
	adminRole,
	adminViaTwoArgRole,
	superAdminRole,
	makeAdmin({ name: 'Bob', role: 'admin' })
);
