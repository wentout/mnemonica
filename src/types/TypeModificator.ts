'use strict';

import { ConstructorFunction } from './ConstructorFunction';

export type TypeModificator<T extends object> = ( ...args: any[] ) => ConstructorFunction<T>;
