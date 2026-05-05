import type { Hookable, HookFunction } from '../../types';
export declare const registerHook: (this: Hookable, hookType: string, cb: HookFunction) => void;
