'use strict';

import { constants } from '../../constants';

const {
	odp,
} = constants;

const __props__ = new WeakMap();

export const _addProps = function (this: any): any {

	// eslint-disable-next-line no-debugger
	// debugger;

	// eslint-disable-next-line @typescript-eslint/no-this-alias
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
		collection,
		subtypes,
	} = type;

	const value = Object.create(null);

	odp(value, '__proto_proto__', {
		get () {
			return proto;
		}
	});

	odp(value, '__args__', {
		get () {
			return args;
		}
	});

	odp(value, '__collection__', {
		get () {
			return collection;
		}
	});

	odp(value, '__subtypes__', {
		get () {
			return subtypes;
		}
	});

	odp(value, '__type__', {
		get () {
			return type;
		}
	});

	odp(value, '__parent__', {
		get () {
			return existentInstance;
		}
	});

	if (submitStack) {
		const { stack } = this;
		odp(value, '__stack__', {
			get () {
				return stack.join('\n');
			}
		});
	}

	odp(value, '__creator__', {
		get () {
			return self;
		}
	});

	const timestamp = Date.now();
	odp(value, '__timestamp__', {
		get () {
			return timestamp;
		}
	});

	__props__.set(proto, value);

};

export type CollectionDef = {
	define: CallableFunction
	lookup: CallableFunction
	invokeHook: CallableFunction
	registerHook: CallableFunction
	registerFlowChecker: CallableFunction
	subtypes: object
	hooks: object
	[key: string]: unknown
}
// | Map<string, object>

export type TypeDef = {
	proto: object;
	collection: CollectionDef
	invokeHook: CallableFunction
	config: {
		strictChain: boolean
	}
	subtypes: Map<string, Props>
	isSubType: boolean
	TypeName: string
	prototype: unknown
	stack?: string
};

export type Props = {
	__proto_proto__: object,
	__args__: unknown[],
	__collection__: CollectionDef,
	__subtypes__: Map<string, object>,
	__type__: TypeDef,
	__parent__: Props,
	__stack__?: string,
	__creator__: TypeDef,
	__timestamp__: number,
	__self__?: {
		extract: CallableFunction
		[key: string]: unknown
	}
}

export const _getProps = (instance: object, base?: object): Props | undefined => {
	const proto = Reflect.getPrototypeOf(instance) as object;
	if (base !== undefined && (base.constructor !== proto.constructor)) {
		// here we got rid of unnecessary chain dive
		return undefined;
	}
	const result = __props__.get(proto);
	if (result === undefined) {
		if (base === undefined) {
			base = instance;
		}
		return _getProps(proto, base);
	}
	return result;
};

export const _setSelf = (instance: object): void => {
	const props = _getProps(instance);
	Object.defineProperty(props, '__self__', {
		get () {
			return instance;
		}
	});
	__props__.set(instance, props);
};

export const getProps = (instance: object): Props | undefined => {

	const props = _getProps(instance);
	if (props) {
		const additions = __props__.get(props);
		if (additions instanceof Object) {
			const descriptors = Object.getOwnPropertyDescriptors(props);
			const answer = { ...additions };
			Object.defineProperties(additions, descriptors);
			return answer;
		} else {
			return props;
		}
	}
	return undefined;

};

export const setProps = (instance: object, values: object): boolean => {

	const props = _getProps(instance);
	if (props) {
		__props__.set(props, values);
		return true;
	}
	return false;

};

module.exports = {
	_addProps,
	_getProps,
	_setSelf,
	getProps,
	setProps
};
