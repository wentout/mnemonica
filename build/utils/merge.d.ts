import type { Merge, InstanceResult, constructorOptions } from '../types';
export declare const merge: <A extends object, B extends object>(a: A, b: B, ...args: unknown[]) => InstanceResult<Merge<B, A>, constructorOptions>;
