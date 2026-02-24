export type asyncStack = {
    __stack__?: string;
    __type__: {
        isSubType: boolean;
    };
    parent: () => asyncStack;
};
export type parentSub = {
    __type__: {
        subtypes: Map<string, parentSub>;
    };
    __parent__: parentSub;
};
declare const TypesUtils: {
    isClass: (fn: CallableFunction) => boolean;
    CreationHandler: (this: object & {
        constructor: NewableFunction;
    }, constructionAnswer: unknown) => unknown;
    checkProto: (proto: unknown) => void;
    getTypeChecker: (TypeName: string) => unknown;
    getTypeSplitPath: (path: string) => string[];
    getExistentAsyncStack: (existentInstance: asyncStack) => unknown;
    checkTypeName: (name: string) => void;
    findSubTypeFromParent: (instance: parentSub | object | undefined, subType: string) => parentSub | null;
    makeFakeModificatorType: (TypeName: string, fakeModificator?: () => void) => any;
    reflectPrimitiveWrappers: (_thisArg: unknown) => object;
};
export default TypesUtils;
