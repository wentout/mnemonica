import type { EmptyParsed, Parsed } from '../types';
export declare function parse<T extends object>(self: T): Parsed<T>;
export declare function parse(self: null): EmptyParsed;
