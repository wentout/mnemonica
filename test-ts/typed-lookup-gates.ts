'use strict';

/**
 * Strict-mode pins for lookup type gates (compile-time only).
 *
 * Registry entries are bare newables with precise parameters — the shape
 * tactica emits into TypeRegistry and per-collection registries. Under
 * strictFunctionTypes such constructors are NOT assignable to
 * `new (...args: unknown[]) => object` (parameter contravariance), which used
 * to collapse typed collection lookups to `never` and block `decorate()` on
 * classes with constructor parameters. This file is compiled with
 * `strict: true` (see tsconfig.strict.json); the legacy example:ts pass
 * compiles with default options and cannot catch this class of regression.
 */

import { createTypesCollection, decorate, lookup } from '..';

interface Program {
	name: string;
}

interface Session extends Program {
	sid: number;
}

interface CollRegistry {
	'Program': new (opts?: { name: string }) => Program;
	'Program.Session': new (opts: { name: string; sid: number }) => Session;
}

const collection = createTypesCollection<CollRegistry>();

// --- collection.lookup() with precise constructor parameters ---

const ProgramCtor = collection.lookup('Program');
const program = new ProgramCtor({ name: 'ada' });
const programName: string = program.name;

// zero arguments are allowed: the parameter is optional
const emptyProgram = new ProgramCtor();

// @ts-expect-error — wrong argument shape must be rejected
const wrongProgram = new ProgramCtor({ name: 42 });

// --- nested subtype construction from a parent instance ---

const session = new program.Session({ name: 's1', sid: 7 });
const sessionSid: number = session.sid;
const sessionName: string = session.name;

// --- relative lookup from a looked-up constructor ---

const SessionCtor = ProgramCtor.lookup('Session');
const session2 = new SessionCtor({ name: 's2', sid: 8 });
const session2Sid: number = session2.sid;

// --- free lookup() on an augmented global registry ---

declare module '..' {
	interface TypeRegistry {
		'GlobalProgram': new (opts?: { name: string }) => Program;
	}
}

const GlobalProgramCtor = lookup('GlobalProgram');
const globalProgram = new GlobalProgramCtor({ name: 'g' });
const globalProgramName: string = globalProgram.name;

// --- decorate() on a class with precise constructor parameters ---

class WithParams {
	name: string;
	constructor (opts: { name: string }) {
		this.name = opts.name;
	}
}

const DecoratedParams = decorate()(WithParams);
const decorated = new DecoratedParams({ name: 'd' });
const decoratedName: string = decorated.name;

export {
	programName,
	emptyProgram,
	wrongProgram,
	sessionSid,
	sessionName,
	session2Sid,
	globalProgramName,
	decoratedName,
};
