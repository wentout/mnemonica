import type { Hookable, FlowChecker } from '../../types';
export declare const flowCheckers: WeakMap<Hookable, FlowChecker>;
export declare const registerFlowChecker: (this: Hookable, cb: FlowChecker) => void;
