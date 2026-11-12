'use strict';

// Compile-only pin: defining on a looked-up constructor must accumulate onto
// the registry it came from, not an empty registry.

import { lookup, mnemonica } from '..';
import type { RegistryOf } from '..';

interface UserShape { name: string; tags: string[] }
interface AdminShape { role: 'root' | 'ops'; level: number }
interface SessionShape { token: string }

const App = mnemonica
	.define('LookupDefineUser', function (this: UserShape, data: { name: string }, ...tags: string[]) {
		this.name = data.name;
		this.tags = tags;
	})
	.define('LookupDefineAdmin', function (this: AdminShape, data: { role: 'root' | 'ops' }, level?: number) {
		this.role = data.role;
		this.level = level ?? 0;
	});

const sessionHandler = async function (this: SessionShape, token: string) {
	this.token = token;
	return this;
};

const Sessions = App.lookup('LookupDefineUser').define('LookupDefineSession', sessionHandler);
const sessionUser = Sessions.lookup('LookupDefineUser');
const sessionUserInstance = new sessionUser({ name : 'Ada' }, 'a', 'b');
export const admin = new sessionUserInstance.LookupDefineAdmin({ role : 'root' }, 2);
export const session = new sessionUserInstance.LookupDefineSession('t');
export const sessionArgsOk: ConstructorParameters<typeof sessionUserInstance.LookupDefineSession> = [ 't' ];
export const nameOk: string = sessionUserInstance.name;
const readToken = async () => {
	const resolved = await session;
	const result: string = resolved.token;
	return result;
};
export const token = readToken();

declare module '..' {
	interface TypeRegistry extends RegistryOf<typeof App> {}
}

const FreeSessions = lookup('LookupDefineUser').define('LookupDefineFreeSession', sessionHandler);
const freeSessionUser = FreeSessions.lookup('LookupDefineUser');
const freeSessionUserInstance = new freeSessionUser({ name : 'Ada' }, 'a', 'b');
export const freeAdmin = new freeSessionUserInstance.LookupDefineAdmin({ role : 'root' }, 2);
export const freeSession = new freeSessionUserInstance.LookupDefineFreeSession('t');
export const freeSessionArgsOk: ConstructorParameters<typeof freeSessionUserInstance.LookupDefineFreeSession> = [ 't' ];
export const freeNameOk: string = freeSessionUserInstance.name;
const readFreeToken = async () => {
	const resolved = await freeSession;
	const result: string = resolved.token;
	return result;
};
export const freeToken = readFreeToken();
