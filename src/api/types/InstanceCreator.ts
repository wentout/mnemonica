/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import { ConstructorFunction } from '../../types';

import { constants } from '../../constants';

const {
	odp,
	SymbolConstructorName,
} = constants;

import { ErrorsTypes } from '../../descriptors/errors';
const {
	WRONG_MODIFICATION_PATTERN,
} = ErrorsTypes;

import TypesUtils from '../utils';
const {
	getExistentAsyncStack,
	makeFakeModificatorType,
} = TypesUtils;

import { getStack } from '../errors';
import { throwModificationError } from '../errors/throwModificationError';

import { addProps } from './addProps';

import { makeInstanceModificator } from './InstanceModificator';

import { obey } from './obeyConstructor';

import defaultMC from './createInstanceModificator';

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

	const hookData = {
		type,
		existentInstance,
		args,
		InstanceModificator
	};

	namespace.invokeHook( 'preCreation', hookData );

	collection.invokeHook( 'preCreation', hookData );

	type.invokeHook( 'preCreation', hookData );

};


const invokePostHooks = function ( this: any ) {

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const creator = this;
	const {
		inheritedInstance,
	} = creator;

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

	const hookData = {
		type,
		existentInstance,
		inheritedInstance,
		args,
		creator
	};

	return {

		type : type.invokeHook( hookType, hookData ),

		collection : collection.invokeHook( hookType, hookData ),

		namespace : namespace.invokeHook( hookType, hookData )

	};

};

const postProcessing = function ( this: any, continuationOf: any ) {

	// eslint-disable-next-line @typescript-eslint/no-this-alias
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
		// debugger;
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

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const self = this;

	self.inheritedInstance = self.inheritedInstance
		// .then( ( instance: any ) => {
		.then( () => {
			// self.inheritedInstance = instance;
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

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const self = this;

	self.inheritedInstance = self.inheritedInstance
		.then( ( instance: any ) => {

			if ( typeof instance !== 'object' ) {
				if ( self.config.awaitReturn ) {
					const msg = `should inherit from ${type.TypeName}: seems async ${type.TypeName} has no return statement`;
					throw new WRONG_MODIFICATION_PATTERN( msg, self.stack );
				} else {
					return instance;
				}
			}

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
	addProps,
	addThen,
	invokePreHooks,
	invokePostHooks,
	throwModificationError
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const InstanceCreator = function ( this: any, type: any, existentInstance: any, args: any[], chained: boolean ) {

	const {
		constructHandler,
		proto,
		config,
		TypeName
	} = type;

	const {
		ModificationConstructor: mc,
		blockErrors,
		submitStack
	} = config;

	const ModificationConstructor = mc( obey, defaultMC );

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const self = this;

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
		const stackAddition: string[] = chained ? self.getExistentAsyncStack( existentInstance ) : [];
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

			const answer = new self.InstanceModificator( ...args );
			// debugger;
			self.inheritedInstance = answer;

		} catch ( error ) {

			self.throwModificationError( error );

		}

	} else {

		const answer = new self.InstanceModificator( ...args );
		// debugger;
		self.inheritedInstance = answer;

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
