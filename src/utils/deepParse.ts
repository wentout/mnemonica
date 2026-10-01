'use strict';

import { parse } from './parse';
import type { Parsed } from '../types';

// the lineage walker (lineage-export plan, layer 2): from the instance to
// its root through the REAL parent instances — parse().parent hops directly
// from instance to instance, so the per-type prototype layers between them
// never enter the picture. The result is the ordered list of parsed levels,
// index 0 being the instance itself, the last level its root (parent null).
export const deepParse = <T extends object>( instance: T ): Array<Parsed<T>> => {

	const levels: Array<Parsed<object>> = [];
	let current: object = instance;
	for ( ;; ) {
		const parsed: Parsed<object> = parse( current );
		levels.push( parsed );
		const next: object | null = parsed.parent;
		if ( next === null ) {
			break;
		}
		current = next;
	}

	const result = levels as Array<Parsed<T>>;
	return result;

};
