import { TypeModificator } from '../../types';
declare const TypesUtils: {
    isClass: (functionPointer: CallableFunction) => boolean;
    CreationHandler: (this: any, constructionAnswer: any) => any;
    getModificationConstructor: (useOldStyle: boolean) => (this: any, ModificatorType: Function, ModificatorTypePrototype: {
        [index: string]: any;
    }, addProps: Function) => any;
    checkProto: (proto: any) => void;
    getTypeChecker: (TypeName: string) => any;
    getTypeSplitPath: (path: string) => string[];
    getExistentAsyncStack: (existentInstance: any) => any[];
    checkTypeName: (name: string) => void;
    findParentSubType: any;
    makeFakeModificatorType: (TypeName: string, fakeModificator?: TypeModificator<{}>) => any;
};
export default TypesUtils;
