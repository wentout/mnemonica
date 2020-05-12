'use strict';

import { collectConstructors } from './collectConstructors';
import { extract } from './extract';
import { parent } from './parent';
import { pick } from './pick';
import { toJSON } from './toJSON';
import { parse } from './parse';
import { merge } from './merge';

export const utils = {

	extract,
	parent,
	pick,
	toJSON,

	parse,
	merge,

	get collectConstructors () {
		return collectConstructors;
	}

};
