import type { MnemonicaConstructor, AddPropsCallback } from '../../types';
export default function (): (this: object, ModificatorType: MnemonicaConstructor, ModificatorTypePrototype: {
    [index: string]: unknown;
}, _addProps: AddPropsCallback) => MnemonicaConstructor;
