'use strict';

import {
	getProps, Props 
} from '../api/types/Props';
import { InstanceCreator } from '../api/types/InstanceCreator';
import { gatherLazyDefinition } from '../api/types/lazyDefinition';
import TypesUtils from '../api/utils/index';
import type { ForkInvoker } from '../types';

const { reflectPrimitiveWrappers } = TypesUtils;

export const fork = <T extends object>(instance: T): ForkInvoker<T> => {

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

	const result = function (this: object | void, ...forkArgs: unknown[]) {

		let forked;
		const Constructor = isSubType ?
			existentInstance :
			collection;

		const args = forkArgs.length ? forkArgs : __args__;


		if (this === __self__ || this === undefined) {

			// Constructor is the parent instance (subtype proxy) or the collection,
			// both indexed dynamically, so Constructor[TypeName] is unknown statically.
			// At runtime it is always the registered type, since TypeName comes from
			// this instance's own type; a guard would be an unreachable branch.
			// @ts-expect-error -- the registered subtype is only dynamically indexed
			forked = new (Constructor[ TypeName ])(...args);
		} else {
			// fork.call ? let's do it !
			const wrappedInstance = reflectPrimitiveWrappers(this);
			gatherLazyDefinition(type, wrappedInstance);
			forked = new InstanceCreator(
				type,
				wrappedInstance,
				args
			);
		}

		const forkResult = forked as T;
		return forkResult;

	};
	return result;

};
