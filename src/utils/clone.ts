'use strict';

import { fork } from './fork';

export const clone = <T extends object>(instance: T): T => {

	const forkFn = fork(instance);
	const result = forkFn.call(instance) as T;
	return result;

};
