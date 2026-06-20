import type { InstanceOfTypeRegistry, ParentPathOfInstance } from '../types';
export declare function parent<T extends object>(instance: T): object | undefined;
export declare function parent<T extends object, K extends ParentPathOfInstance<T> & string>(instance: T, path: K): InstanceOfTypeRegistry<K> | undefined;
export declare function parent(instance: object, path: string): object | undefined;
