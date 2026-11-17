'use strict';

// Checker cost: an instance passed to a parameter typed as a union of
// generated instance types, the matching member last. Two flows with the
// same subtree under `Save` (depth 3, fan 3). Before TypePathMark, ruling
// out the first member walked both subtrees structurally, at a cost
// exponential in depth and fan: this file ran the checker out of memory.
// With it, a constructor of another path is rejected at its first member.

import type { LookedUpConstructor, RegistryEntry } from '..';

type Step = 'S0' | 'S1' | 'S2';
type Flow = 'Flow0' | 'Flow1';
type Paths =
	| Flow
	| `${Flow}.Save`
	| `${Flow}.Save.${Step}`
	| `${Flow}.Save.${Step}.${Step}`
	| `${Flow}.Save.${Step}.${Step}.${Step}`;

// a generated instance type: shared data, plus a subtype constructor
// property for every registered child path
type Children<P extends string> = {
	[C in 'Save' | Step as `${P}.${C}` extends Paths ? C : never]:
		LookedUpConstructor<Registry, `${P}.${C}` & Paths, true>;
};
type Instance<P extends string> = { n: number } & Children<P>;

type Registry = {
	[K in Paths]: RegistryEntry<Instance<K>, K, object, []>;
};

type AnySave = Instance<'Flow0.Save'> | Instance<'Flow1.Save'>;

const save = function (flow: AnySave): number {
	const result = flow.n;
	return result;
};

declare const Flow1: LookedUpConstructor<Registry, 'Flow1'>;

export const run = function (): number {
	const flow = new Flow1();
	const result = save(new flow.Save());
	return result;
};

// The path is part of the type, as at runtime: same shape, other path,
// another type.
declare const save1: LookedUpConstructor<Registry, 'Flow1.Save'>;
// @ts-expect-error a looked-up constructor of another path is not assignable
export const save0: LookedUpConstructor<Registry, 'Flow0.Save'> = save1;
export const sameSave: LookedUpConstructor<Registry, 'Flow1.Save'> = save1;
