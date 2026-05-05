import type { Hookable } from '../../types';
export declare const flowCheckers: WeakMap<Hookable, () => unknown>;
export declare const registerFlowChecker: (this: Hookable, cb: () => unknown) => void;
