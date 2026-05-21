import type { hooksOpts, Hookable } from '../../types';
export declare const invokeHook: (this: Hookable, hookType: string, opts: hooksOpts) => Set<unknown>;
