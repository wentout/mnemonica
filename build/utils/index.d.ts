export declare const utils: {
    extract: (instance: any) => {
        [index: string]: any;
    };
    parent: (instance: any, path: string) => any;
    pick: (instance: any, ...args: string[]) => {
        [index: string]: any;
    };
    toJSON: (instance: object) => string;
    parse: (self: any) => any;
    merge: (a: any, b: any, ...args: any[]) => any;
    readonly collectConstructors: (self: object, asSequence?: boolean) => {};
};
