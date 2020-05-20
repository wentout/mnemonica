'use strict';

import { ConstructorFunction } from '../../types';
import { constants } from '../../constants';
const {
	odp,
	SymbolReplaceGaia,
	SymbolConstructorName,
} = constants;

import { ErrorsTypes } from '../../descriptors/errors';
const {
	WRONG_MODIFICATION_PATTERN,
	BASE_MNEMONICA_ERROR
} = ErrorsTypes;

import TypesUtils from './utils';
const {
	getModificationConstructor,
	getExistentAsyncStack,
	makeFakeModificatorType
} = TypesUtils;

import { cleanupStack, getStack } from '../errors';

export const makeInstanceModificator = ( self: any ) => {

	const {
		ModificationConstructor,
		existentInstance,
		ModificatorType,
		proto,
	} = self;

	return ModificationConstructor.call(
		existentInstance,
		ModificatorType,
		Object.assign( {}, proto ),
		// tslint:disable-next-line: variable-name
		( __proto_proto__: any ) => {
			self.__proto_proto__ = __proto_proto__;
			proceedProto.call( self );
		}
	);
};


const throwModificationError = function ( this: any, error: any ) {

	// InstanceCreator
	const self = this;

	const {
		TypeName,
		type: {
			stack: typeStack
		}
	} = self;


	self.ModificatorType = makeFakeModificatorType( TypeName );

	self.InstanceModificator = makeInstanceModificator( self );

	const erroredInstance = new self.InstanceModificator();

	erroredInstance[ SymbolReplaceGaia ]( error );

	const stack: string[] = [];

	if ( error instanceof BASE_MNEMONICA_ERROR ) {

		stack.push( error.stack );

	} else {

		const title = `\n<-- creation of [ ${TypeName} ] traced -->`;

		getStack.call( erroredInstance, title, [], throwModificationError );

		stack.push( ...erroredInstance.stack );

		const errorStack = error.stack.split( '\n' );

		stack.push( '<-- with the following error -->' );

		errorStack.forEach( ( line: string ) => {
			if ( !stack.includes( line ) ) {
				stack.push( line );
			}
		} );

		stack.push( '\n<-- of constructor definitions stack -->' );
		stack.push( ...typeStack );

	}

	erroredInstance.stack = cleanupStack( stack ).join( '\n' );

	self.inheritedInstance = erroredInstance;
	const results = self.invokePostHooks();

	const {
		type,
		collection,
		namespace
	} = results;

	if ( type.has( true ) || collection.has( true ) || namespace.has( true ) ) {
		return;
	}

	throw erroredInstance;

};


const addProps = function ( this: any ) {

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


const undefineParentSubTypes = function ( this: any ) {

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


const proceedProto = function ( this: any ) {

	const self = this;
	self.addProps();
	if ( self.config.strictChain ) {
		self.undefineParentSubTypes();
	}

};


const invokePreHooks = function ( this: any ) {

	const {
		type,
		existentInstance,
		args,
		InstanceModificator
	} = this;

	const {
		namespace,
		collection,
	} = type;

	namespace.invokeHook( 'preCreation', {
		type,
		existentInstance,
		args,
		InstanceModificator
	} );

	collection.invokeHook( 'preCreation', {
		type,
		existentInstance,
		args,
		InstanceModificator
	} );

	type.invokeHook( 'preCreation', {
		type,
		existentInstance,
		args,
		InstanceModificator
	} );

};


const invokePostHooks = function ( this: any ) {

	const {
		inheritedInstance
	} = this;

	const {
		__type__: type,
		__parent__: existentInstance,
		__args__: args,
	} = inheritedInstance;

	const {
		namespace,
		collection,
	} = type;

	const hookType = inheritedInstance instanceof Error ?
		'creationError' : 'postCreation';

	return {

		type: type.invokeHook( hookType, {
			type,
			existentInstance,
			inheritedInstance,
			args
		} ),

		collection: collection.invokeHook( hookType, {
			type,
			existentInstance,
			inheritedInstance,
			args
		} ),

		namespace: namespace.invokeHook( hookType, {
			type,
			existentInstance,
			inheritedInstance,
			args
		} )

	};

};


const postProcessing = function ( this: any, continuationOf: any ) {

	const self = this;
	const {
		stack,
	} = self;

	if ( !self.inheritedInstance.constructor ) {
		const msg = 'should inherit from mnemonica instance';
		self.throwModificationError( new WRONG_MODIFICATION_PATTERN( msg, stack ) );
	}

	if ( !self.inheritedInstance.constructor[ SymbolConstructorName ] ) {
		const msg = 'should inherit from mnemonica instance';
		self.throwModificationError( new WRONG_MODIFICATION_PATTERN( msg, stack ) );
	}

	if ( continuationOf && !( self.inheritedInstance instanceof continuationOf ) ) {
		const icn = self.inheritedInstance.constructor.name;
		const msg = `should inherit from ${continuationOf.TypeName} but got ${icn}`;
		self.throwModificationError( new WRONG_MODIFICATION_PATTERN( msg, stack ) );
		// throw new WRONG_MODIFICATION_PATTERN(msg, self.stack);
	}

	odp( self.inheritedInstance, '__self__', {
		get () {
			return self.inheritedInstance;
		}
	} );

	self.invokePostHooks();

};

const addThen = function ( this: any, then: any ) {

	const self = this;

	self.inheritedInstance = self.inheritedInstance
		.then( ( instance: any ) => {
			self.inheritedInstance = instance;
			self.inheritedInstance =
				new InstanceCreator(
					then.subtype,
					self.inheritedInstance,
					then.args,
					// was chained :
					true
					// self.existentInstance
				);
			return self.inheritedInstance;
		} );

};


const makeWaiter = function ( this: any, type: any, then: any ) {

	const self = this;

	self.inheritedInstance = self.inheritedInstance
		.then( ( instance: any ) => {

			if ( !( instance instanceof self.type ) ) {
				const icn = instance.constructor.name;
				const msg = `should inherit from ${type.TypeName} but got ${icn}`;
				// self.throwModificationError(new WRONG_MODIFICATION_PATTERN(msg, self.stack));
				throw new WRONG_MODIFICATION_PATTERN( msg, self.stack );
			}

			self.inheritedInstance = instance;

			if ( self.inheritedInstance.__self__ !== self.inheritedInstance ) {
				// it was async instance,
				// so we have to add all the stuff
				// for sync instances it was done already
				self.postProcessing( type );
			}

			return self.inheritedInstance;

		} )
		.catch( ( error: Error ) => {
			if ( self.config.blockErrors ) {
				self.throwModificationError( error );
			} else {
				throw error;
			}
		} );

	if ( then ) {
		self.addThen( then );
	}

	type.subtypes.forEach( ( subtype: any, name: string ) => {
		self.inheritedInstance[ name ] = ( ...args: any[] ) => {
			self.inheritedInstance = self.makeWaiter( subtype, {
				name,
				subtype,
				args,
			} );
			return self.inheritedInstance;
		};
	} );

	return self.inheritedInstance;

};

const InstanceCreatorPrototype = {
	getExistentAsyncStack,
	postProcessing,
	makeWaiter,
	proceedProto,
	addProps,
	addThen,
	undefineParentSubTypes,
	invokePreHooks,
	invokePostHooks,
	throwModificationError
};

export const InstanceCreator = function ( this: any, type: any, existentInstance: any, args: any[], chained: boolean ) {

	const {
		constructHandler,
		proto,
		config,
		TypeName
	} = type;

	const {
		useOldStyle,
		blockErrors,
		submitStack
	} = config;


	const self = this;

	const ModificationConstructor = getModificationConstructor( useOldStyle );

	const ModificatorType = constructHandler();


	Object.assign( self, {

		type,
		TypeName,

		existentInstance,

		get args () {
			return args;
		},

		ModificationConstructor,
		ModificatorType,

		config,

		proto

	} );

	if ( submitStack || chained ) {
		const stackAddition = chained ? self.getExistentAsyncStack( existentInstance ) : [];
		const title = `\n<-- creation of [ ${TypeName} ] traced -->`;
		if ( submitStack ) {
			getStack.call( self, title, stackAddition );
		} else {
			self.stack = title;
		}
	}

	if ( blockErrors && existentInstance instanceof Error ) {

		self.ModificatorType = makeFakeModificatorType( TypeName );

		self.InstanceModificator = makeInstanceModificator( self );

		throw new self.InstanceModificator( ...args );

	}

	self.invokePreHooks();

	self.InstanceModificator = makeInstanceModificator( self );

	if ( blockErrors ) {

		try {

			self.inheritedInstance = new self.InstanceModificator( ...args );

		} catch ( error ) {

			self.throwModificationError( error );

		}

	} else {

		self.inheritedInstance = new self.InstanceModificator( ...args );

	}


	if ( self.inheritedInstance instanceof Promise ) {

		const waiter = self.makeWaiter( type );

		odp( waiter, SymbolConstructorName, {
			get () {
				return TypeName;
			}
		} );

		return waiter;

	}

	self.postProcessing( type );

	return self.inheritedInstance;

} as ConstructorFunction<typeof InstanceCreatorPrototype>;

Object.assign( InstanceCreator.prototype, InstanceCreatorPrototype );
