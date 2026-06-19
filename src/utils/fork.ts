'use strict';

import {
	getProps, Props 
} from '../api/types/Props';
import { InstanceCreator } from '../api/types/InstanceCreator';
import TypesUtils from '../api/utils/index';

const { reflectPrimitiveWrappers } = TypesUtils;

export const fork = <T extends object>(instance: T): (this: object, ...forkArgs: unknown[]) => T => {

	const props = getProps(instance) as Props;

	const {
		__type__: type,
		__collection__: collection,
		__parent__: existentInstance,
		__args__,
		__self__,
	} = props;

	const {
		isSubType,
		TypeName
	} = type;

	const result = function (this: object, ...forkArgs: unknown[]) {

		let forked;
		const Constructor = isSubType ?
			existentInstance :
			collection;

		const args = forkArgs.length ? forkArgs : __args__;


		if (this === __self__) {

			// @ts-expect-error  this is definitely a constructor
			forked = new (Constructor[ TypeName ])(...args);
		} else {
			// fork.call ? let's do it !
			forked = new InstanceCreator(
				type,
				reflectPrimitiveWrappers(this),
				args
			);
		}

		const forkResult = forked as T;
		return forkResult;

	};
	return result;

};
