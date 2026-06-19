export declare function pick<T extends object, K extends keyof T>(instance: T, ...args: (K | K[])[]): {
    [P in K]: T[P];
} & {};
export declare function pick<T extends object>(instance: T, ...args: (string | string[])[]): Record<string, unknown>;
