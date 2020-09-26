'use strict';

import { constants } from '../../constants';

const {
	odp,
} = constants;

export const addProps = function ( this: any ) {

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

	odp( proto, '__proto_proto__', {
		get () {
			return proto;
		}
	} );

	odp( proto, '__args__', {
		get () {
			return args;
		}
	} );

	odp( proto, '__collection__', {
		get () {
			return collection;
		}
	} );

	odp( proto, '__namespace__', {
		get () {
			return namespace;
		}
	} );

	odp( proto, '__subtypes__', {
		get () {
			return subtypes;
		}
	} );

	odp( proto, '__type__', {
		get () {
			return type;
		}
	} );

	odp( proto, '__parent__', {
		get () {
			return existentInstance;
		}
	} );

	if ( submitStack ) {
		const { stack } = this;
		odp( proto, '__stack__', {
			get () {
				return stack.join( '\n' );
			}
		} );
	}

	odp( proto, '__creator__', {
		get () {
			return self;
		}
	} );

	const timestamp = Date.now();
	odp( proto, '__timestamp__', {
		get () {
			return timestamp;
		}
	} );

};


export const undefineParentSubTypes = function ( this: any ) {

	const self = this;

	const {
		__proto_proto__: proto,
		existentInstance: {
			__subtypes__: subtypes
		}
	} = self;

	if ( !subtypes ) {
		return;
	}

	const unscopables: any = {};

	[ ...subtypes.keys() ].forEach( ( name: string ) => {
		odp( proto, name, {
			get () {
				return undefined;
			}
		} );
		unscopables[ name ] = true;
	} );

	proto[ Symbol.unscopables ] = unscopables;

};


export const proceedProto = function ( this: any ) {

	const self = this;
	self.addProps();
	if ( self.type.isSubType && self.config.strictChain ) {
		self.undefineParentSubTypes();
	}

};

