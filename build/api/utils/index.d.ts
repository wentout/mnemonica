import { TypeModificator } from '../../types';
declare const TypesUtils: {
    isClass: (fn: CallableFunction) => boolean;
    CreationHandler: (this: any, constructionAnswer: any) => any;
    getModificationConstructor: (useOldStyle: boolean) => (this: any, ModificatorType: CallableFunction, ModificatorTypePrototype: {
        [index: string]: any;
    }, addProps: CallableFunction) => any;
    checkProto: (proto: any) => void;
    getTypeChecker: (TypeName: string) => any;
    getTypeSplitPath: (path: string) => string[];
    getExistentAsyncStack: (existentInstance: any) => any[];
    checkTypeName: (name: string) => void;
    findParentSubType: any;
    makeFakeModificatorType: (TypeName: string, fakeModificator?: TypeModificator<{}>) => any;
    reflectPrimitiveWrappers: (_thisArg: any) => any;
};
export default TypesUtils;
