import type { Hookable } from '../../types';
export declare const flowCheckers: WeakMap<Hookable, (opts: object) => unknown>;
export declare const registerFlowChecker: (this: Hookable, cb: () => unknown) => void;
