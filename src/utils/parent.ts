'use strict';

import type {
	InstanceOfTypeRegistry,
	ParentPathOfInstance
} from '../types';

import { ErrorsTypes } from '../descriptors/errors';
const { WRONG_INSTANCE_INVOCATION } = ErrorsTypes;

import {
	_getProps, Props 
} from '../api/types/Props';

// seek for firts parent instance
// of instance prototype chain
// with constructors of path
export function parent <T extends object> (instance: T): object | null;
export function parent <T extends object, K extends ParentPathOfInstance<T> & string> (
	instance: T,
	path: K
): InstanceOfTypeRegistry<K> | undefined;
export function parent (instance: object, path: string): object | undefined;
export function parent <T extends object> (instance: T, path?: string): object | null | undefined {

	// at this situation this check is enough
	if ( instance !== Object( instance ) ) {
		throw new WRONG_INSTANCE_INVOCATION;
	}

	const props = _getProps(instance) as Props;

	// no construction props at all — nothing to seek from. NO PARENT IS
	// null (object-typed, the end of a chain — like Object.getPrototypeOf
	// at the top); undefined is reserved for the path form's "searched,
	// not found" — and a props-less object cannot match any path either
	if ( !props ) {
		const result = path ? undefined : null;
		return result;
	}

	const { __parent__: p } = props;

	// a root instance's __parent__ points at mnemonica's internal root
	// sentinel (an object with no construction props of its own) — that
	// means there is no parent: null, not the sentinel itself
	const parentInstance: object | null = p && _getProps( p ) ? p : null;

	if ( !path ) {
		return parentInstance;
	}

	if ( !parentInstance ) {
		// searched (the chain exists) — nothing found
		return;
	}

	const segments = path.split('.');
	const last = segments.length - 1;

	// seek throuh parent instances
	// about the fist constructor with this name
	// dotted paths must match contiguously upwards:
	// each leading segment must be the direct parent
	// of the instance matched by the next one,
	// and the instance itself is never a candidate
	let current = parentInstance;
	for ( ;; ) {

		const { constructor: { name } } = current as { constructor: { name: string } };

		if ( name === segments[ last ] ) {

			if ( last === 0 ) {
				return current;
			}

			let ancestor = current;
			let matched = true;
			for ( let i = last - 1; i >= 0; i-- ) {
				const ancestorProps = _getProps( ancestor ) as Props | undefined;
				if ( !ancestorProps ) {
					matched = false;
					break;
				}
				ancestor = ancestorProps.__parent__ as object;
				const { constructor: { name: ancestorName } } = ancestor as { constructor: { name: string } };
				if ( ancestorName !== segments[ i ] ) {
					matched = false;
					break;
				}
			}

			if ( matched ) {
				return current;
			}

		}

		// every props-bearing instance chains up to an object,
		// the props-less root instance terminates the scan
		const currentProps = _getProps( current ) as Props | undefined;
		if ( !currentProps ) {
			return;
		}
		current = currentProps.__parent__ as object;

	}

}
