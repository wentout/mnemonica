'use strict';

import {
	getProps,
	Props
} from '../api/types/Props';

export const sibling = (instance: object): unknown => {

	const siblings = (SiblingTypeName: string) => {
		const props = getProps(instance) as Props;
		const { __collection__: collection, } = props;
		const answer = collection[ SiblingTypeName ];
		return answer;
	};

	const result = new Proxy(
		siblings,
		{
			get (_, prop: string) {
				const proxyResult = siblings(prop);
				return proxyResult;
			},
			apply (_, __, args,) {
				const proxyResult = siblings(args[ 0 ]);
				return proxyResult;
			}
		}
	);

	return result;

};
