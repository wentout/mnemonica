'use strict';

import { constants } from '../../constants';
import type {
	CollectionDef, InstanceCreatorContext, Props as PropsType, TypeDef 
} from '../../types';

const { odp, } = constants;

// External props storage via WeakMap keeps instance enumeration clean.
// Instance metadata (__type__, __parent__, __args__, etc.) is stored
// against the prototype object, not the instance itself, so it never
// shows up in for...in, Object.keys, or JSON.stringify.
//
// Records may also be keyed by an object itself (not its prototype):
// this is how error instances carry their data (args, originalError,
// instance, exceptionReason, reasons, surplus) — nothing is defined
// on the error object, getProps(error) finds the record directly.
// That second key-space lives in a separate WeakMap: memory layer
// objects are themselves keys in __props__, so sharing one map would
// conflate the two spaces (a layer would "find" its own record when
// the caller meant to reach the parent layer's one).
const __props__ = new WeakMap();
const __object_props__ = new WeakMap();

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

export const _addProps = function (this: InstanceCreatorContext): void {

	 
	const self = this;

	const {
		type,
		existentInstance,
		args,
		config: { submitStack },
		__proto_proto__: proto
	} = self;

	const {
		collection,
		subtypes,
	} = type;

	const value = Object.create(null);

	odp(
		value,
		'__proto_proto__',
		{
			get () {
				return proto;
			}
		}
	);

	odp(
		value,
		'__args__',
		{
			get () {
				return args;
			}
		}
	);

	odp(
		value,
		'__collection__',
		{
			get () {
				return collection;
			}
		}
	);

	odp(
		value,
		'__subtypes__',
		{
			get () {
				return subtypes;
			}
		}
	);

	odp(
		value,
		'__type__',
		{
			get () {
				return type;
			}
		}
	);

	odp(
		value,
		'__parent__',
		{
			get () {
				return existentInstance;
			}
		}
	);

	if (submitStack) {
		const { stack } = this;
		odp(
			value,
			'__stack__',
			{
				get () {
					const result = stack!.join('\n');
					return result;
				}
			}
		);
	}

	odp(
		value,
		'__creator__',
		{
			get () {
				return self;
			}
		}
	);

	const timestamp = Date.now();
	odp(
		value,
		'__timestamp__',
		{
			get () {
				return timestamp;
			}
		}
	);

	// __props__.set(self, value);
	__props__.set(
proto!,
value
	);

};

const isObjectNature = (instance: unknown) => {
	if (instance instanceof Object) return true;
	if (typeof instance === 'object' && instance != null) return true;
	return false;
};

export const _getProps = (instance: object, base?: object): PropsType | undefined => {
	if (!isObjectNature(instance)) return undefined;
	// object-keyed records (error props etc.) take precedence over
	// the prototype-layer records looked up below
	const ownRecord = __object_props__.get(instance);
	if (ownRecord !== undefined) {
		const ownResult = ownRecord as PropsType;
		return ownResult;
	}
	const proto = Reflect.getPrototypeOf(instance) as object;
	if (
		base !== undefined &&
		isObjectNature(base) &&
		isObjectNature(proto) &&
		(base.constructor !== proto.constructor)
	) {
		// here we got rid of unnecessary chain dive
		return undefined;
	}
	const result = __props__.get(proto);
	if (result === undefined) {
		// so we jumping deeper here
		if (base === undefined) {
			base = instance;
		}
		const nestedResult = _getProps(
			proto,
			base
		);
		return nestedResult;
	}
	return result;
};

export const _setSelf = (instance: object): void => {
	// const props = __props__.get(instance);
	const props = _getProps(instance);
	// __self__ is installed here, not in _addProps, because it is the
	// only prop whose value is the instance itself — which does not
	// exist yet when _addProps runs. It serves as the async completion
	// marker (makeAwaiter) and the self-call detector (fork).
	Object.defineProperty(
		props,
		'__self__',
		{
			get () {
				return instance;
			}
		}
	);
};

export const getProps = (instance: object): PropsType | undefined => {
	const props = _getProps(instance);
	if (props) {
		const _additions = __props__.get(props);
		if (_additions instanceof Object) {
			const descriptors = Object.getOwnPropertyDescriptors(props);
			const additions = Object.getOwnPropertyDescriptors(_additions);
			const answer = {};
			Object.defineProperties(
				answer,
				additions
			);
			Object.defineProperties(
				answer,
				descriptors
			);
			const result = answer as PropsType;
			return result;
		} else {
			return props;
		}
	}
	return undefined;
};

export const setProps = (instance: object, _values: object): string[] | false => {
	const props = _getProps(instance);
	const prevAdditions = props ? __props__.get(props) : undefined;
	const values = Object.getOwnPropertyDescriptors(_values);
	const written: string[] = [];
	const allowed = {};
	if (prevAdditions instanceof Object) {
		// repeated setProps calls accumulate: previous additions are the
		// base, new values override per key
		Object.defineProperties(
			allowed,
			Object.getOwnPropertyDescriptors(prevAdditions)
		);
	}
	Object.entries(values).forEach(([ name, value ]) => {
		if (!nativeProps.has(name)) {
			written.push(name);
			Object.defineProperty(
				allowed,
				name,
				value
			);
		}
	});
	if (props) {
		__props__.set(
			props,
			allowed
		);
		return written;
	}
	if (isObjectNature(instance)) {
		// no props record anywhere in the chain (plain objects, Error
		// objects, library errors) — start one, keyed by the object itself
		__object_props__.set(
			instance,
			allowed
		);
		return written;
	}
	return false;
};

// Re-export types from centralized types
export type {
	CollectionDef, TypeDef, PropsType as Props 
};

module.exports = {
	_addProps,
	_getProps,
	_setSelf,
	getProps,
	setProps
};
