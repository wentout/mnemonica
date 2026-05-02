'use strict';

import { constants } from '../../constants';
import type { CollectionDef, TypeDef, Props as PropsType } from '../../types';

const {
	odp,
} = constants;

// External props storage via WeakMap keeps instance enumeration clean.
// Instance metadata (__type__, __parent__, __args__, etc.) is stored
// against the prototype object, not the instance itself, so it never
// shows up in for...in, Object.keys, or JSON.stringify.
const __props__ = new WeakMap();

const nativeProps = new Set([
	'__proto_proto__',
	'__args__',
	'__collection__',
	'__subtypes__',
	'__type__',
	'__parent__',
	'__stack__',
	'__creator__',
	'__timestamp__',
	'__self__',
]);

export const _addProps = function (this: any): any {

	 
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

	// __props__.set(self, value);
	__props__.set(proto, value);

};

const isObjectNature = (instance: unknown) => {
	if (instance instanceof Object) return true;
	if (typeof instance === 'object' && instance != null) return true;
	return false;
};

export const _getProps = (instance: object, base?: object): PropsType | undefined => {
	if (!isObjectNature(instance)) return undefined;
	const proto = Reflect.getPrototypeOf(instance) as object;
	if (base !== undefined && isObjectNature(base) && isObjectNature(proto) && (base.constructor !== proto.constructor)) {
		// here we got rid of unnecessary chain dive
		return undefined;
	}
	const result = __props__.get(proto);
	if (result === undefined) {
		// so we jumping deeper here
		if (base === undefined) {
			base = instance;
		}
		return _getProps(proto, base);
	}
	return result;
};

export const _setSelf = (instance: object): void => {
	// const props = __props__.get(instance);
	const props = _getProps(instance);
	Object.defineProperty(props, '__self__', {
		get () {
			return instance;
		}
	});
	__props__.set(instance, props);
};

export const getProps = (instance: object): PropsType | undefined => {
	const props = _getProps(instance);
	if (props) {
		const _additions = __props__.get(props);
		if (_additions instanceof Object) {
			const descriptors = Object.getOwnPropertyDescriptors(props);
			const additions = Object.getOwnPropertyDescriptors(_additions);
			const answer = {};
			Object.defineProperties(answer, additions);
			Object.defineProperties(answer, descriptors);
			return answer as PropsType;
		} else {
			return props;
		}
	}
	return undefined;
};

export const setProps = (instance: object, _values: object): string[] | false => {
	const props = _getProps(instance);
	if (props) {
		const values = Object.getOwnPropertyDescriptors(_values);
		const written: string[] = [];
		const allowed = {};
		Object.entries(values).forEach(([ name, value ]) => {
			if (!nativeProps.has(name)) {
				written.push(name);
				Object.defineProperty(allowed, name, value);
			}
		});
		__props__.set(props, allowed);
		return written;
	}
	return false;
};

// Re-export types from centralized types
export type { CollectionDef, TypeDef, PropsType as Props };

module.exports = {
	_addProps,
	_getProps,
	_setSelf,
	getProps,
	setProps
};
