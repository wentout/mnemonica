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
export function parent <T extends object> (instance: T): object | undefined;
export function parent <T extends object, K extends ParentPathOfInstance<T> & string> (
	instance: T,
	path: K
): InstanceOfTypeRegistry<K> | undefined;
export function parent (instance: object, path: string): object | undefined;
export function parent <T extends object> (instance: T, path?: string): object | undefined {

	// at this situation this check is enough
	if ( instance !== Object( instance ) ) {
		throw new WRONG_INSTANCE_INVOCATION;
	}

	const props = _getProps(instance) as Props;

	if ( !props ) {
		return;
	}

	const { __parent__: p } = props;

	if ( !path ) {
		return p;
	}

	const { constructor: { name } } = p;

	// seek throuh parent instances
	// about the fist constructor with this name
	const result = name === path ?
		p : parent( p as object, path );
	return result;

}
