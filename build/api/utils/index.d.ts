export type asyncStack = {
    __stack__?: string;
    __type__: {
        isSubType: boolean;
    };
    parent: () => asyncStack;
};
type parentSub = {
    __type__: {
        subtypes: Map<string, parentSub>;
    };
    __parent__: parentSub;
};
declare const TypesUtils: {
    isClass: (fn: CallableFunction) => boolean;
    CreationHandler: (this: unknown, constructionAnswer: unknown) => unknown;
    checkProto: (proto: unknown) => void;
    getTypeChecker: (TypeName: string) => unknown;
    getTypeSplitPath: (path: string) => string[];
    getExistentAsyncStack: (existentInstance: asyncStack) => unknown;
    checkTypeName: (name: string) => void;
    findParentSubType: (instance: parentSub, prop: string) => parentSub;
    makeFakeModificatorType: (TypeName: string, fakeModificator?: () => void) => any;
    reflectPrimitiveWrappers: (_thisArg: unknown) => unknown;
};
export default TypesUtils;
