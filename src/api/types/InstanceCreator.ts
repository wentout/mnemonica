  
'use strict';

/**
 * InstanceCreator orchestrates the full instance construction lifecycle.
 *
 * Pipeline stages (see also createInstanceModificator.ts and InstanceModificator.ts):
 *   1. Setup      - extract type, config, prepare ModificationConstructor
 *   2. Stack      - collect creation stack if submitStack or chained
 *   3. blockErrors- if parent is Error, optionally block further construction
 *   4. Pre-hooks  - invoke preCreation hooks on collection and type
 *   5. Build      - makeInstanceModificator() wires prototype chain
 *   6. Construct  - new InstanceModificator(...args) runs user constructor
 *   7. Async      - if result is Promise, attach awaiter and subtype factories
 *   8. Post-proc  - validate inheritance, set __self__, invoke postCreation hooks
 */


import { _Internal_TC_, InstanceCreatorContext, ThenSpec, TypeDef, MnemonicaError, MnemonicaConstructor } from '../../types';
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
	makeErrorModificatorType,
} = TypesUtils;

import { getStack } from '../errors';
import { throwModificationError } from '../errors/throwModificationError';

import { _getProps, _setSelf, Props } from './Props';

import { makeInstanceModificator } from './InstanceModificator';
import { parent } from '../../utils/parent';

// import { Mnemosyne } from './Mnemosyne';
  
const invokePreHooks = function ( this: InstanceCreatorContext ) {

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
		TypeName : type.TypeName,
		existentInstance,
		args,
		InstanceModificator
	};

	collection.invokeHook( 'preCreation', hookData );

	type.invokeHook( 'preCreation', hookData );

};


  
const invokePostHooks = function ( this: InstanceCreatorContext ) {

	 
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
		TypeName : type.TypeName,
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


  
const postProcessing = function ( this: InstanceCreatorContext, continuationOf?: TypeDef ) {
	 
	const self = this;
	const {
		stack,
		type: {
			isSubType,
			config: {
				strictChain,
				blockErrors
			}
		}
	} = self;

	if ( !self.inheritedInstance.constructor ) {
		const msg = 'should inherit from mnemonica instance';
		self.throwModificationError( new WRONG_MODIFICATION_PATTERN( msg, stack ) );
	}

	const inheritedConstructor = self.inheritedInstance.constructor as MnemonicaConstructor;
	if ( !inheritedConstructor[ SymbolConstructorName ] ) {
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

	if (isSubType && strictChain) {
		
		if (self.inheritedInstance instanceof Error && !blockErrors) {
			return;
		}

		const prev = parent(self.inheritedInstance) as object | null;
		if (!prev || (prev && !prev.constructor)) {
			const msg = 'should inherit from some instance';
			self.throwModificationError( new WRONG_MODIFICATION_PATTERN( msg, stack ) );
		}
		const parentName = prev!.constructor.name;
		const parentTypeName = self.type.parentType!.TypeName;
		if (parentName !== parentTypeName) {
			const msg = `should inherit from ${parentTypeName} but made on ${parentName}`;
			self.throwModificationError( new WRONG_MODIFICATION_PATTERN( msg, stack ) );
		}

	}

	_setSelf(self.inheritedInstance);

	self.invokePostHooks();

};

const addThen = function ( this: InstanceCreatorContext, then: ThenSpec ) {

	 
	const self = this;

	self.inheritedInstance = (self.inheritedInstance as Promise<object>)
		.then( () => {
			self.inheritedInstance =
			new InstanceCreator(
				then.subtype as TypeDef,
				self.inheritedInstance as object,
				then.args,
				// was chained :
				true
				// self.existentInstance
			) as unknown as Promise<object>;
			return self.inheritedInstance;
		} );

};

const makeAwaiter = function ( this: InstanceCreatorContext, type: TypeDef, then?: ThenSpec ) {

	 
	const self = this;

	self.inheritedInstance = (self.inheritedInstance as Promise<object>)
		.then( ( instance: unknown ) => {

			if ( typeof instance !== 'object' ) {
				if ( self.config.awaitReturn ) {
					const msg = `should inherit from ${type.TypeName}: seems async ${type.TypeName} has no return statement`;
					throw new WRONG_MODIFICATION_PATTERN( msg, self.stack );
				} else {
					return instance;
				}
			}

			if ( instance === null || !( instance instanceof self.type ) ) {
				 
				const icn = (instance as object).constructor.name;
				const msg = `should inherit from ${type.TypeName} but got ${icn}`;
				throw new WRONG_MODIFICATION_PATTERN( msg, self.stack );
			}

			self.inheritedInstance = instance as object;

			const props = _getProps(self.inheritedInstance as object) as Props;

			 
			if ( props.__self__ !== self.inheritedInstance ) {
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
		 
		(self.inheritedInstance as Record<string, unknown>)[ name ] = ( ...args: unknown[] ) => {
			self.inheritedInstance = self.makeAwaiter( subtype as TypeDef, {
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

  
export const InstanceCreator = function ( this: InstanceCreatorContext, type: TypeDef, existentInstance: object, args: unknown[], chained: boolean ) {

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

	 
	const mc = ModificationConstructor!() as CallableFunction;

	 
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
		const stackAddition: string[] = chained ? self.getExistentAsyncStack( existentInstance ) as string[] : [];
		const title = `\n<-- creation of [ ${TypeName} ] traced -->`;
		if ( submitStack ) {
			getStack.call( self, title, stackAddition );
		} else {
			self.stack = title as unknown as string[];
		}
	}

	if ( blockErrors ) {

		if ( existentInstance instanceof Error ) {

			self.ModificatorType = makeErrorModificatorType( TypeName );

			self.InstanceModificator = makeInstanceModificator( self );

			const blockErrorsErrorInstance = new self.InstanceModificator( ...args );

			throw blockErrorsErrorInstance;

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

			self.throwModificationError( error as MnemonicaError );

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

} as unknown as _Internal_TC_<typeof InstanceCreatorPrototype>;

Object.assign( InstanceCreator.prototype, InstanceCreatorPrototype );
