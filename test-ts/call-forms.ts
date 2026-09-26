'use strict';

/**
 * TypeScript type pins for the .call/.apply/.bind family (form 3) and
 * their async variants (form 5), in builder mode and tactica mode.
 *
 * What is pinned: these utilities accept ANY object as the parent and a
 * constructor carrying REQUIRED data params (the tactica-generated shape)
 * WITHOUT a cast — the CtorParameter<T> union exists for exactly this.
 */

import { mnemonica, define, apply, call, bind, lookup } from '..';

// ---------------------------------------------------------------------
// builder mode — define/lookup chains
// ---------------------------------------------------------------------

const App = mnemonica
	.define('CallFormsEntity', function (this: { id: string; email: string }, data: { id: string; email: string }) {
		this.id = data.id;
		this.email = data.email;
	})
	.define('CallFormsAsync', async function (this: { id: string; note: string }, data: { id: string; note: string }) {
		this.id = data.id;
		this.note = data.note;
		return this;
	});

const Entity = App.lookup('CallFormsEntity');

// form 5: async ROOT define — awaited construct and call forms.
// NB: a chained .define() nests the child under its parent (chain
// semantics) — a chained async type is reached by its TRUE path
// ('Parent.Child', absolute or parent-relative), never by its bare name.
const AsyncEntity = define('CallFormsAsyncRoot', async function (this: { id: string; note: string }, data: { id: string; note: string }) {
	this.id = data.id;
	this.note = data.note;
	return this;
});

// form 3: call / apply / bind — any object as parent
const viaCall = call({ some: 'parent' } as object, Entity, { id: 'c-1', email: 'c@x' });
const viaCallId: string = viaCall.id;

const viaApply = apply({ some: 'parent' } as object, Entity, [{ id: 'a-1', email: 'a@x' }]);
const viaApplyEmail: string = viaApply.email;

const bound = bind({ some: 'parent' } as object, Entity);
const viaBound = bound({ id: 'b-1', email: 'b@x' });
const viaBoundId: string = viaBound.id;

// form 5: awaited construct + call through the typed async root
async function asyncFormsBuilder (): Promise<void> {
	const parent = { host: 'object' };
	const viaAsyncCall = await call(parent, AsyncEntity, { id: 'ac-1', note: 'n' });
	const note1: string = viaAsyncCall.note;
	const viaAsyncApply = await apply(parent, AsyncEntity, [{ id: 'ac-2', note: 'n2' }]);
	const note2: string = viaAsyncApply.note;
	const awaitedConstruct = await new AsyncEntity({ id: 'ac-3', note: 'n3' });
	const note3: string = awaitedConstruct.note;
	void note1;
	void note2;
	void note3;
}

// chained async type reached by its TRUE path (absolute + relative)
const ChainedApp = mnemonica
	.define('CallFormsChainParent', function (this: { id: string }, data: { id: string }) {
		this.id = data.id;
	})
	.define('CallFormsChainAsync', async function (this: { note: string; id: string }, data: { note: string }) {
		this.note = data.note;
		return this;
	});

const byAbsolute = ChainedApp.lookup('CallFormsChainParent.CallFormsChainAsync');
const chainParent = ChainedApp.lookup('CallFormsChainParent');
const byRelative = chainParent.lookup('CallFormsChainAsync');

async function asyncChainForms (): Promise<void> {
	const a = await new byAbsolute({ note: 'abs' });
	const n1: string = a.note;
	const b = await new byRelative({ note: 'rel' });
	const n2: string = b.note;
	// the chain-tip CALL form goes through INSTANCE access — a bare call
	// on a looked-up constructor is the decorator path, not construction
	const parentInstance = new chainParent({ id: 'p' });
	const c = await parentInstance.CallFormsChainAsync({ note: 'call' });
	const n3: string = c.note;
	void n1;
	void n2;
	void n3;
}

// ---------------------------------------------------------------------
// tactica mode — the generated-ctor shape: REQUIRED data params
// ---------------------------------------------------------------------

// mirror of what .tactica/types.ts emits for a looked-up root type
type CallFormsTacticaInstance = {
	id: string;
	email: string;
};
declare const TacticaEntityCtor: new (data: { id: string; email: string }) => CallFormsTacticaInstance;

const tViaCall = call({ other: 'object' } as object, TacticaEntityCtor, { id: 't-1', email: 't@x' });
const tCallId: string = tViaCall.id;

const tViaApply = apply({ other: 'object' } as object, TacticaEntityCtor, [{ id: 't-2', email: 't2@x' }]);
const tApplyId: string = tViaApply.id;

const tBound = bind({ other: 'object' } as object, TacticaEntityCtor);
const tViaBound = tBound({ id: 't-3', email: 't3@x' });
const tBoundId: string = tViaBound.id;

// tactica-mode chain pins — the shape .tactica/types.ts emits TODAY
// (construct-only nested ctors): forms 1/2 in their construct spelling.
// The chain-tip CALL spelling (root.TacticaChainTip(...)) lands with the
// tactica codegen step; it cannot type before that, by definition.
type TacticaTipInstance = { a: string; r: number };
interface TacticaChainRootInstance {
	r: number;
	TacticaChainTip: new (data: { a: string }) => TacticaTipInstance;
}
declare const tChainRoot: TacticaChainRootInstance;
const tTip = new tChainRoot.TacticaChainTip({ a: 'tx' });
const tTipA: string = tTip.a;

// ---------------------------------------------------------------------
// forms 1/2/4 — the chain-tip forms (Option B: instance subtype members
// carry the bare call signature; raw lookups keep the this-guard)
// ---------------------------------------------------------------------

const Chain = mnemonica
	.define('ChainFormsRoot', function (this: { r: number }, data: { r: number }) {
		this.r = data.r;
	})
	.define('ChainFormsTip', function (this: { a: string; r: number }, data: { a: string }) {
		this.a = data.a;
	});

const ChainRoot = Chain.lookup('ChainFormsRoot');
const chainRoot = new ChainRoot({ r: 1 });

// form 1: construct chain (long-standing) and the chain-tip CALL form
const tipConstructed = new chainRoot.ChainFormsTip({ a: 'x' });
const tipCalled = chainRoot.ChainFormsTip({ a: 'y' });
const tipA: string = tipCalled.a;
const tipR: number = tipCalled.r;

// form 4: nested onto ANOTHER object — inst.Sub.call(other)
const otherRoot = new ChainRoot({ r: 9 });
const tipOnOther = chainRoot.ChainFormsTip.call(otherRoot, { a: 'via-call' });
const otherA: string = tipOnOther.a;

// form 2: awaited chain — sync tip through await (pass-through)
async function chainFormsBuilder (): Promise<void> {
	const awaitedSync = await chainRoot.ChainFormsTip({ a: 'z' });
	const a1: string = awaitedSync.a;

	// async subtype: await new R().AsyncTip() construct + call forms
	const AsyncChain = mnemonica
		.define('AsyncChainFormsRoot', function (this: { r: number }, data: { r: number }) {
			this.r = data.r;
		})
		.define('AsyncChainFormsTip', async function (this: { a: string; r: number }, data: { a: string }) {
			this.a = data.a;
			return this;
		});
	const AsyncRoot = AsyncChain.lookup('AsyncChainFormsRoot');
	const asyncRoot = new AsyncRoot({ r: 2 });
	const awaitedTip = await asyncRoot.AsyncChainFormsTip({ a: 'async' });
	const a2: string = awaitedTip.a;
	void a1;
	void a2;
}

export {
	viaCallId,
	viaApplyEmail,
	viaBoundId,
	asyncFormsBuilder,
	asyncChainForms,
	tCallId,
	tApplyId,
	tBoundId,
	lookup,
	tipConstructed,
	tipA,
	tipR,
	tipOnOther,
	otherA,
	chainFormsBuilder,
};

