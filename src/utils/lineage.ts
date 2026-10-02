'use strict';

// utils.lineage — the lineage walker (lineage-export plan, layer 3).
// Exports the lineage graph of the given instances in the lethe format —
// the cross-language contract (@mnemonica/lethe): what survives when live
// instances are forgotten. Built on the parse() primitive (the one-level
// snapshot deepParse walks): the recursion follows parse().parent, the
// REAL parent-instance links, so the per-type prototype hops never appear.

import { parse } from './parse';
import {
	_getProps as getPropsRef, Props
} from '../api/types/Props';
import { constants } from '../constants';

const { SymbolConfig } = constants;

import type {
	LineageGraph,
	LineageNode,
	LineageOptions,
	LineageValue
} from '../types';

// Instance ids are implementation-specific by contract: a per-realm random
// prefix plus a process-local counter, held in a WeakMap — stable within
// one realm, never reused, nothing retained, and never compared across
// processes or languages (the fixture comparison maps them 1:1 in
// first-encounter order — see @mnemonica/lethe testdata README)
const realmPrefix = Math.random().toString( 16 )
	.slice( 2, 10 );
let idCounter = 0;
const instanceIds = new WeakMap<object, string>();
const idOf = ( instance: object ): string => {
	let id = instanceIds.get( instance );
	if ( id === undefined ) {
		idCounter += 1;
		id = `${realmPrefix}:${idCounter}`;
		instanceIds.set( instance, id );
	}
	return id;
};

const unsupported = ( kind: string ): LineageValue => {
	const result: LineageValue = {
		'$mnemonica' : 'unsupported',
		kind
	};
	return result;
};

const isInstance = ( value: object ): boolean => {
	const instanceCheck = getPropsRef( value ) !== undefined;
	return instanceCheck;
};

export const lineage = ( instances: object[], options?: LineageOptions ): LineageGraph => {

	const nodes: Record<string, LineageNode> = {};
	const nodePaths: Record<string, string> = {};
	const visiting = new Set<string>();

	const exportValue = ( value: unknown, seen: Set<unknown> ): LineageValue => {

		if ( value === null || value === undefined ) {
			return null;
		}

		if ( typeof value === 'boolean' || typeof value === 'string' ) {
			return value;
		}

		if ( typeof value === 'number' ) {
			if ( Number.isNaN( value ) ) {
				const nanResult = unsupported( 'nan' );
				return nanResult;
			}
			if ( value === Infinity ) {
				const infResult = unsupported( '+inf' );
				return infResult;
			}
			if ( value === -Infinity ) {
				const ninfResult = unsupported( '-inf' );
				return ninfResult;
			}
			return value;
		}

		// the schema's kind enum is the cross-language set: JS-only shapes
		// (symbols, bigints) report as 'invalid' — never an error
		if ( typeof value === 'bigint' || typeof value === 'symbol' ) {
			const invalidResult = unsupported( 'invalid' );
			return invalidResult;
		}
		if ( typeof value === 'function' ) {
			const funcResult = unsupported( 'func' );
			return funcResult;
		}

		// a field holding another mnemonica instance exports as $ref; the
		// referenced instance joins the graph at first encounter
		if ( isInstance( value as object ) ) {
			const refResult: LineageValue = {
				$ref : visit( value as object )
			};
			return refResult;
		}

		if ( seen.has( value ) ) {
			const cycleResult = unsupported( 'cycle' );
			return cycleResult;
		}
		seen.add( value );

		let objectResult: LineageValue;
		if ( Array.isArray( value ) ) {
			const arrayResult: LineageValue[] = [];
			value.forEach( ( item ) => {
				arrayResult.push( exportValue( item, seen ) );
			} );
			objectResult = arrayResult;
		} else {
			const recordResult: { [ key: string ]: LineageValue } = {};
			Object.keys( value as object ).forEach( ( key ) => {
				recordResult[ key ] = exportValue(
					( value as Record<string, unknown> )[ key ],
					seen
				);
			} );
			objectResult = recordResult;
		}
		seen.delete( value );
		return objectResult;
	};

	const visit = ( instance: object ): string => {

		const id = idOf( instance );
		// dedup at any depth; the visiting set also breaks instance-valued
		// field cycles (a field pointing at its own instance)
		if ( nodes[ id ] !== undefined || visiting.has( id ) ) {
			return id;
		}
		visiting.add( id );

		const parsed = parse( instance );

		// own fields in declaration order FIRST — a $ref target is exported
		// at first encounter, before the parent link (the encounter order
		// the cross-language comparison maps ids by)
		const own: { [ key: string ]: LineageValue } = {};
		const ownProps = parsed.props as Record<string, unknown>;
		Object.keys( ownProps ).forEach( ( key ) => {
			own[ key ] = exportValue( ownProps[ key ], new Set() );
		} );

		const baseProps = getPropsRef( instance ) as Props;

		let nodeArgs: LineageValue | undefined;
		if ( options && options.args ) {
			nodeArgs = exportValue( baseProps.__args__, new Set() );
		}

		let nodeProps: { [ key: string ]: LineageValue } | undefined;
		if ( options && Array.isArray( options.props ) ) {
			nodeProps = {};
			options.props.forEach( ( key ) => {
				nodeProps![ key ] = exportValue( baseProps[ key ], new Set() );
			} );
		}

		// then the parent — the type path is the parent's path plus this
		// level's name (names alone collide across levels and collections)
		let parentId: string | null = null;
		let path = parsed.name;
		if ( parsed.parent !== null ) {
			parentId = visit( parsed.parent );
			path = `${nodePaths[ parentId ]}.${parsed.name}`;
		}

		const { __collection__: collection } = baseProps;
		const collectionConfig = ( collection as unknown as { [ SymbolConfig ]?: { name?: string } } )[
			SymbolConfig
		];
		const collectionName = ( collectionConfig && collectionConfig.name )
			? collectionConfig.name
			: 'defaultTypes';

		const node: LineageNode = {
			type : {
				collection : collectionName,
				path
			},
			own,
			parent : parentId
		};
		if ( nodeArgs !== undefined ) {
			node.args = nodeArgs;
		}
		if ( nodeProps !== undefined ) {
			node.props = nodeProps;
		}

		nodes[ id ] = node;
		nodePaths[ id ] = path;
		visiting.delete( id );
		return id;
	};

	const heads = instances.map( ( instance ) => visit( instance ) );

	const result: LineageGraph = {
		version : '1',
		heads,
		nodes
	};
	return result;

};
