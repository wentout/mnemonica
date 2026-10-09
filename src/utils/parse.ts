'use strict';


import { ErrorsTypes } from '../descriptors/errors';
const {
	WRONG_MODIFICATION_PATTERN,
	WRONG_ARGUMENTS_USED
} = ErrorsTypes;

// import { constants } from '../constants';
// const {
// 	MNEMONICA,
// 	SymbolConstructorName
// } = constants;

import { extract } from './extract';
import type {
	InstanceConstructor,
	EmptyParsed, Parsed
} from '../types';

import {
	_getProps, Props
} from '../api/types/Props';

export function parse<T extends object>( self: T ): Parsed<T>;
export function parse( self: null ): EmptyParsed;
export function parse<T extends object> ( self: T | null ): Parsed<T> | EmptyParsed {

	if ( self === null ) {
		// null is the one non-object input parse accepts: the empty shape —
		// nothing was given. undefined and every other non-object keep
		// throwing WRONG_MODIFICATION_PATTERN
		const nullResult: EmptyParsed = {
			name   : undefined,
			props  : {},
			self   : null,
			proto  : undefined,
			joint  : {},
			parent : undefined
		};
		return nullResult;
	}

	if ( !self || !( self as { constructor?: InstanceConstructor } ).constructor ) {
		throw new WRONG_MODIFICATION_PATTERN;
	}

	const proto = Reflect.getPrototypeOf( self ) as object;

	const selfConstructor = ( self as { constructor: { name: string } } ).constructor;
	const protoConstructor = ( proto as { constructor: { name: string } } ).constructor;

	if ( selfConstructor.name.toString() !== protoConstructor.name.toString() ) {
		const msg = 'have to use "instance" itself: ' +
			`'${selfConstructor.name}' vs '${protoConstructor.name}'`;
		throw new WRONG_ARGUMENTS_USED( msg );
	}

	const protoProto: unknown = Reflect.getPrototypeOf( proto );
	if ( protoProto ) {
		const protoProtoConstructor = ( protoProto as { constructor?: { name: string } } ).constructor;
		if ( protoProtoConstructor && protoConstructor.name.toString() !== protoProtoConstructor.name.toString() ) {
			const msg2 = 'have to use "instance" itself: ' +
				`'${protoConstructor.name}' vs '${protoProtoConstructor.name}'`;
			throw new WRONG_ARGUMENTS_USED( msg2 );
		}
	}

	// const args = self[SymbolConstructorName] ?
	// self[SymbolConstructorName].args : [];

	const { name } = protoConstructor;

	const props = extract( { ...self } as T );
	// props.constructor = undefined;
	delete ( props as { constructor?: unknown } ).constructor;

	const joint = extract( Object.assign(
		{},
		proto 
	) as Record<string, unknown> );
	delete ( joint as { constructor?: unknown } ).constructor;

	// parent is the PARENT INSTANCE — the same object utils.parent(self)
	// returns (the __parent__ record of the construction props), not a
	// prototype layer. A root instance's __parent__ points at mnemonica's
	// internal root sentinel (an object with no construction props of its
	// own) — parse reports NO parent for it, and NO PARENT IS null
	// (object-typed, the end of a chain — like Object.getPrototypeOf at the
	// top). Walking the whole lineage level by level is what
	// utils.deepParse does — this function stays the one-level primitive.

	// The explored recursive-parse alternative, kept as the record of what
	// was considered before deepParse became the plan's next step:
	// let parent;
	// if ( protoProto[ SymbolConstructorName ] === MNEMONICA ) {
	// 	parent = parse( protoProto );
	// } else {
	// 	parent = Reflect.getPrototypeOf( protoProto );
	// }
	const selfProps = _getProps( self ) as Props | undefined;
	const parentRecord = selfProps ? selfProps.__parent__ : undefined;
	const parent: object | null =
		parentRecord && _getProps( parentRecord ) ? parentRecord : null;

	const result: Parsed<T> = {

		name,

		props,
		// the line below copy symbols also

		self,
		proto,

		joint,
		// args,
		parent,

	};
	return result;
}
