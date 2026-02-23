 
'use strict';

import { ConstructorFunction } from '../../types';

import {
	constants
} from '../../constants';

const {
	odp,
	SymbolConstructorName
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

import { _getProps, _setSelf, Props } from './Props';

import { makeInstanceModificator } from './InstanceModificator';

 
const invokePreHooks = function ( this: any ) {

	const {
		type,
		existentInstance,
		args,
		InstanceModificator
	} = this;

	const {
		collection,
	} = type;

	const hookData = {
		type,
		existentInstance,
		args,
		InstanceModificator
	};

	collection.invokeHook( 'preCreation', hookData );

	type.invokeHook( 'preCreation', hookData );

};


 
const invokePostHooks = function ( this: any ) {

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const creator = this;
	const {
		inheritedInstance,
	} = creator;

	const props = _getProps(inheritedInstance) as Props;

	const {
		__type__: type,
		__parent__: existentInstance,
		__args__: args,
	} = props;

	const {
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

	_setSelf(self.inheritedInstance);

	self.invokePostHooks();

};

export interface ThenSpec {
	subtype: object;
	args: unknown[];
	name?: string;
}

 
const addThen = function ( this: any, then: ThenSpec ) {

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const self = this;

	self.inheritedInstance = self.inheritedInstance
		.then( () => {
			self.inheritedInstance =
				new InstanceCreator(
					then.subtype,
					self.inheritedInstance,
					then.args,
					// was chained :
					true
					// self.existentInstance
				) as unknown as Promise<unknown>;
			return self.inheritedInstance;
		} );

};

 
const makeAwaiter = function ( this: any, type: any, then?: ThenSpec ) {

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const self = this;

	self.inheritedInstance = self.inheritedInstance
		.then( ( instance: unknown ) => {

			if ( typeof instance !== 'object' ) {
				if ( self.config.awaitReturn ) {
					const msg = `should inherit from ${type.TypeName}: seems async ${type.TypeName} has no return statement`;
					throw new WRONG_MODIFICATION_PATTERN( msg, self.stack );
				} else {
					return instance;
				}
			}

			if ( !( instance instanceof self.type ) ) {
				 
				const icn = (instance as any).constructor.name;
				const msg = `should inherit from ${type.TypeName} but got ${icn}`;
				throw new WRONG_MODIFICATION_PATTERN( msg, self.stack );
			}

			self.inheritedInstance = instance;

			const props = _getProps(self.inheritedInstance) as Props;

			 
			if ( props.__self__ !== (self.inheritedInstance as unknown) ) {
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

	type.subtypes.forEach( ( subtype: object, name: string ) => {
		 
		(self.inheritedInstance as any)[ name ] = ( ...args: unknown[] ) => {
			self.inheritedInstance = self.makeAwaiter( subtype, {
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
	makeAwaiter,
	addThen,
	invokePreHooks,
	invokePostHooks,
	throwModificationError
};

 
export const InstanceCreator = function ( this: any, type: any, existentInstance: unknown, args: unknown[], chained: boolean ) {

	const {
		constructHandler,
		proto,
		config,
		TypeName
	} = type;

	const {
		ModificationConstructor,
		blockErrors,
		submitStack
	} = config;

	 
	const mc = ModificationConstructor();

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

		ModificationConstructor : mc,
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

	if ( blockErrors ) {

		if ( existentInstance instanceof Error ) {

			self.ModificatorType = makeFakeModificatorType( TypeName );

			self.InstanceModificator = makeInstanceModificator( self );

			throw new self.InstanceModificator( ...args );

		}
	}

	self.invokePreHooks();

	self.InstanceModificator = makeInstanceModificator( self );

	if ( blockErrors ) {

		try {
			// Constructor Invocation Itself
			const answer = new self.InstanceModificator( ...args );
			// debugger;
			self.inheritedInstance = answer;

		} catch ( error ) {

			self.throwModificationError( error );

		}

	} else {

		// Constructor Invocation Itself
		const answer = new self.InstanceModificator( ...args );
		// debugger;
		self.inheritedInstance = answer;

	}


	if ( self.inheritedInstance instanceof Promise ) {

		const waiter = self.makeAwaiter( type );

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
