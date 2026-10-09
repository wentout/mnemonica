import type { ForkInvoker } from '../types';
export declare const fork: <T extends object>(instance: T) => ForkInvoker<T>;
