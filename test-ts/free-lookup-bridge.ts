'use strict';

// Compile-only pins: free lookup over a builder-bridged TypeRegistry must
// preserve the same instance-carried subtypes as the builder's own lookup.

import { lookup, mnemonica } from '..';
import type { RegistryOf } from '..';

type FreeLookupBridgeUserShape = {
	name: string;
};

type FreeLookupBridgeAdminShape = FreeLookupBridgeUserShape & {
	role: 'root' | 'ops';
	level: number;
};

const FreeLookupBridgeApp = mnemonica
	.define('FreeLookupBridgeUser', function (
		this: FreeLookupBridgeUserShape,
		data: { name: string },
		label: string
	) {
		this.name = `${data.name}:${label}`;
	})
	.define('FreeLookupBridgeAdmin', function (
		this: FreeLookupBridgeAdminShape,
		data: { role: 'root' | 'ops' },
		level?: number
	) {
		this.name = 'admin';
		this.role = data.role;
		this.level = level ?? 0;
	});

declare module '..' {
	interface TypeRegistry extends RegistryOf<typeof FreeLookupBridgeApp> {}
}

const FreeUser = lookup('FreeLookupBridgeUser');
const freeUser = new FreeUser({ name : 'Free' }, 'root');

// @ts-expect-error — the root constructor requires both declared arguments
new FreeUser({ name : 'Missing label' });
// @ts-expect-error — the root constructor rejects a wrongly shaped argument
new FreeUser({ name : 42 }, 'wrong');

const freeAdmin = new freeUser.FreeLookupBridgeAdmin({ role : 'root' }, 2);
const freeAdminRole: 'root' | 'ops' = freeAdmin.role;
const freeAdminLevel: number = freeAdmin.level;
const freeAdminInheritedName: string = freeAdmin.name;

const BuilderUser = FreeLookupBridgeApp.lookup('FreeLookupBridgeUser');
const builderUser = new BuilderUser({ name : 'Builder' }, 'root');
const builderAdmin = new builderUser.FreeLookupBridgeAdmin({ role : 'ops' }, 3);
const adminFromFree: typeof builderAdmin = freeAdmin;
const adminFromBuilder: typeof freeAdmin = builderAdmin;

// @ts-expect-error — the subtype constructor enforces its argument shape
new freeUser.FreeLookupBridgeAdmin({ role : 'invalid' });
// @ts-expect-error — the subtype's own field is not an arbitrary value
const wrongAdminRole: number = new freeUser.FreeLookupBridgeAdmin({ role : 'root' }).role;
// @ts-expect-error — an unregistered instance subtype is rejected
freeUser.FreeLookupBridgeMissing;

FreeUser.registerHook('postCreation', (opts) => {
	const name: string = opts.inheritedInstance.name;
	const parent: object = opts.existentInstance;
	const args: unknown[] = opts.args;
	void name;
	void parent;
	void args;
	// @ts-expect-error — the root hook instance has no admin-only field
	opts.inheritedInstance.role;
});

void freeAdminRole;
void freeAdminLevel;
void freeAdminInheritedName;
void adminFromFree;
void adminFromBuilder;
void wrongAdminRole;
