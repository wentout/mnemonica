'use strict';

import { fork } from './fork';

export const clone = (instance: object) => {

	const forkFn = fork(instance);
	const result = forkFn.call(instance);
	return result;

};
