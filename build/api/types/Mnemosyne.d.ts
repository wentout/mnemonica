import { ConstructorFunction } from '../../types';
declare const _default: {
    Gaia: ConstructorFunction<{}>;
    Mnemosyne: ConstructorFunction<{
        [x: string]: (this: any) => any;
        extract(): (this: any) => {
            [index: string]: any;
        };
        pick(): (this: any, ...args: any[]) => {
            [index: string]: any;
        };
        parent(): (this: any, constructorLookupPath: string) => any;
        clone(this: any): any;
        fork(this: any): (this: any, ...forkArgs: any[]) => any;
        exception(): (error: Error, ...args: any[]) => any;
        sibling(): (SiblingTypeName: string) => any;
    }>;
    readonly MnemosynePrototypeKeys: string[];
};
export default _default;
