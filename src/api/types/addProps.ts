'use strict';

import {constants} from '../../constants';

const {
	odp,
} = constants;

export const addProps = function (this: any): any {

	const self = this;

	const {
		type,
		existentInstance,
		args,
		config: {
			submitStack
		},
		__proto_proto__: proto
	} = self;

	const {
		namespace,
		collection,
		subtypes,
	} = type;

	odp(proto, '__proto_proto__', {
		get () {
			return proto;
		}
	});

	odp(proto, '__args__', {
		get () {
			return args;
		}
	});

	odp(proto, '__collection__', {
		get () {
			return collection;
		}
	});

	odp(proto, '__namespace__', {
		get () {
			return namespace;
		}
	});

	odp(proto, '__subtypes__', {
		get () {
			return subtypes;
		}
	});

	odp(proto, '__type__', {
		get () {
			return type;
		}
	});

	odp(proto, '__parent__', {
		get () {
			return existentInstance;
		}
	});

	if (submitStack) {
		const {stack} = this;
		odp(proto, '__stack__', {
			get () {
				return stack.join('\n');
			}
		});
	}

	odp(proto, '__creator__', {
		get () {
			return self;
		}
	});

	const timestamp = Date.now();
	odp(proto, '__timestamp__', {
		get () {
			return timestamp;
		}
	});

};
module.exports = {
	addProps
};
