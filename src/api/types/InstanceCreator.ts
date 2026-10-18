  
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


import {
	_Internal_TC_, InstanceCreatorContext, ThenSpec, TypeDef,
	MnemonicaError, MnemonicaConstructor
} from '../../types';
import { constants } from '../../constants';

const {
	odp,
	SymbolConstructorName
} = constants;

import { ErrorsTypes } from '../../descriptors/errors';
const { WRONG_MODIFICATION_PATTERN, } = ErrorsTypes;

import TypesUtils from '../utils';
const {
	getExistentAsyncStack,
	makeErrorModificatorType,
} = TypesUtils;

import { getStack } from '../errors';
import { throwModificationError } from '../errors/throwModificationError';

import {
	_getProps, _setSelf, Props 
} from './Props';

import { makeInstanceModificator } from './InstanceModificator';
import { parent } from '../../utils/parent';

import {
	gatherLazyDefinition,
	readLazyDefinitionFailure,
	resetLazyDefinition
} from './lazyDefinition';

// import { Mnemosyne } from './Mnemosyne';
  
const invokePreHooks = function ( this: InstanceCreatorContext ) {

	const {
		type,
		existentInstance,
		args,
		InstanceModificator
	} = this;

	const { collection, } = type;

	// fast path: nothing registered for preCreation on either side,
	// so there is no hookData to build and no invokeHook to run
	if (!type.hooks.preCreation && !collection.hooks.preCreation) {
		return;
	}

	const hookData = {
		type,
		TypeName : type.TypeName,
		existentInstance,
		args,
		InstanceModificator
	};

	collection.invokeHook(
		'preCreation',
		hookData 
	);

	type.invokeHook(
		'preCreation',
		hookData 
	);

};


  
const invokePostHooks = function ( this: InstanceCreatorContext ) {

	 
	const creator = this;
	const { type } = creator;
	const { collection, } = type;

	const hookType = creator.inheritedInstance instanceof Error ?
		'creationError' : 'postCreation';

	// fast path: nothing registered for this hookType on either side;
	// creator.type is the same object props.__type__ would give,
	// and it saves the _getProps chain walk entirely
	if (!type.hooks[ hookType ] && !collection.hooks[ hookType ]) {
		const emptyResult = {
			type       : new Set<unknown>(),
			collection : new Set<unknown>(),
		};
		return emptyResult;
	}

	const { inheritedInstance, } = creator;

	const props = _getProps(inheritedInstance) as Props;

	const {
		__parent__: existentInstance,
		__args__: args,
	} = props;

	const hookData = {
		type,
		TypeName : type.TypeName,
		existentInstance,
		inheritedInstance,
		args,
		creator
	};

	const result = {

		type : type.invokeHook(
			hookType,
			hookData 
		),

		collection : collection.invokeHook(
			hookType,
			hookData 
		),

	};
	return result;

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
		self.throwModificationError( new WRONG_MODIFICATION_PATTERN(
			msg,
			stack 
		) );
	}

	const inheritedConstructor = self.inheritedInstance.constructor as MnemonicaConstructor;
	if ( !inheritedConstructor[ SymbolConstructorName ] ) {
		const msg = 'should inherit from mnemonica instance';
		self.throwModificationError( new WRONG_MODIFICATION_PATTERN(
			msg,
			stack 
		) );
	}

	if ( continuationOf && !( self.inheritedInstance instanceof continuationOf ) ) {
		// debugger;
		const icn = self.inheritedInstance.constructor.name;
		const msg = `should inherit from ${continuationOf.TypeName} but got ${icn}`;
		self.throwModificationError( new WRONG_MODIFICATION_PATTERN(
			msg,
			stack 
		) );
		// throw new WRONG_MODIFICATION_PATTERN(msg, self.stack);
	}

	if (isSubType && strictChain) {
		
		if (self.inheritedInstance instanceof Error && !blockErrors) {
			return;
		}

		const prev = parent(self.inheritedInstance) as object | null;
		if (!prev) {
			// no-parent-is-null: prev is null for a ROOT inherited instance
			// and for a broken chain. The raw __parent__ record tells them
			// apart — a root's is the internal sentinel (has a constructor:
			// the lineage is wrong, name the expected parent); a broken
			// chain's is constructor-less or unreachable (reading it throws:
			// "some instance")
			const madeOnName = prevParentChainHeadName(self.inheritedInstance);
			let msg: string;
			if ( madeOnName === undefined ) {
				msg = 'should inherit from some instance';
			} else {
				msg = `should inherit from ${self.type.parentType!.TypeName} but made on ${inheritedConstructor.name}`;
			}
			self.throwModificationError( new WRONG_MODIFICATION_PATTERN(
				msg,
				stack 
			) );
			// throwModificationError throws unless a creationError hook
			// suppressed it — a suppressed failure is already recorded on
			// the errored instance: skip ONLY the remaining strictChain
			// checks (they would read the stale null prev); the shared tail
			// (_setSelf, the marked hook guard) still runs
		} else {
			const parentName = prev.constructor.name;
			const parentTypeName = self.type.parentType!.TypeName;
			if (parentName !== parentTypeName) {
				const msg = `should inherit from ${parentTypeName} but made on ${parentName}`;
				self.throwModificationError( new WRONG_MODIFICATION_PATTERN(
					msg,
					stack 
				) );
			}
		}

	}

	_setSelf(self.inheritedInstance);

	// when throwModificationError already fired the post hooks for this
	// construction (a suppressed failure that continued the pipeline), do
	// not fire them again — one creationError per failed construction
	if ( !self.postHooksFired ) {
		self.invokePostHooks();
	}

};

const prevParentChainHeadName = function ( inherited: object ): string | undefined {
	try {
		const inheritedProps = _getProps( inherited ) as Props;
		const chainHead = inheritedProps.__parent__ as { constructor: { name: string } };
		const chainHeadConstructorName = chainHead.constructor.name;
		return chainHeadConstructorName;
	} catch {
		return undefined;
	}
};

const addThen = function ( this: InstanceCreatorContext, then: ThenSpec ) {

	 
	const self = this;

	self.inheritedInstance = (self.inheritedInstance as Promise<object>)
		.then( () => {
			// async chain link: the lazy callback runs here, at the start of
			// THIS link's construction — once the previous link resolved,
			// not when the link was queued; a no-op for direct types, and
			// skipped when the resolved previous link is an Error with
			// blockErrors on (the circuit breaker then throws, as on the
			// body path)
			gatherLazyDefinition( then.subtype, self.inheritedInstance );
			self.inheritedInstance =
			new InstanceCreator(
				then.subtype as TypeDef,
				self.inheritedInstance as object,
				then.args,
				// was chained :
				true
				// self.existentInstance
			);
			return self.inheritedInstance;
		} );

};

const makeAwaiter = function ( this: InstanceCreatorContext, type: TypeDef, then?: ThenSpec ) {

	 
	const self = this;

	self.inheritedInstance = (self.inheritedInstance as Promise<object>)
		.then( ( instance: unknown ) => {

			// null has typeof 'object' in JS, but for the unchain decision it
			// is a VALUE like any other non-object: with unchain:true it
			// resolves as-is; with the default it takes the readable
			// mnemonica error below — never the internal TypeError from
			// reading `.constructor` of null
			if ( typeof instance !== 'object' || instance === null ) {
				if ( self.config.unchain ) {
					return instance;
				} else {
					const msg = `async constructor ${type.TypeName} must \`return this\` ` +
						`(it resolved to ${String( instance )})`;
					throw new WRONG_MODIFICATION_PATTERN(
						msg,
						self.stack
					);
				}
			}

			if ( !( instance instanceof self.type ) ) {

				const icn = (instance as object).constructor.name;
				const msg = `async constructor ${type.TypeName} must resolve to its own instance ` +
					`(\`return this\`), got ${icn}`;
				throw new WRONG_MODIFICATION_PATTERN(
					msg,
					self.stack
				);
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

  
const runSetup = function (
	self: InstanceCreatorContext,
	type: TypeDef,
	existentInstance: object,
	args: unknown[],
	chained: boolean
) {
	const {
		constructHandler,
		proto,
		config,
		TypeName
	} = type;

	// the facade destructuring above and this call must happen BEFORE
	// ModificationConstructor() below: for a lazy type they resolve the
	// current construction's gathered handler, and ModificationConstructor
	// is user code — a nested construction of the same lazy type inside it
	// would replace the gathered result
	const ModificatorType = constructHandler();

	// lazy types: snapshot the gather outcome (the failed flag AND the error
	// value — a callback may throw undefined) alongside the facades above,
	// then return the cell to its define-time state — everything the rest
	// of this construction needs now lives on self, a nested construction
	// cannot clobber it, and between constructions every facade read sees
	// the define-time state (X.prototype stays the shim's empty prototype)
	const lazyFailure = readLazyDefinitionFailure(type);
	resetLazyDefinition(type);

	const {
		ModificationConstructor,
		submitStack
	} = config;

	const mc = ModificationConstructor!();

	Object.assign(
		self,
		{
			type,
			TypeName,
			existentInstance,
			get args () {
				return args;
			},
			ModificationConstructor : mc,
			ModificatorType,
			config,
			proto,
			lazyFailed              : lazyFailure === undefined ? false : lazyFailure.failed,
			lazyError               : lazyFailure === undefined ? undefined : lazyFailure.error
		}
	);

	const title = `\n<-- creation of [ ${TypeName} ] traced -->`;
	// stack is always an ARRAY — it is unshifted into and spread later.
	// The title alone marks the creation without the captured frames;
	// getStack below replaces it with the captured frames when submitStack
	// asks for them, and runAsyncHandling captures them for async
	// constructions that are still title-only by then
	self.stack = [ title ];
	if ( submitStack || chained ) {
		const stackAddition: string[] = chained ? self.getExistentAsyncStack( existentInstance ) as string[] : [];
		if ( submitStack ) {
			getStack.call(
				self,
				title,
				stackAddition
			);
		}
	}
};

const runBlockErrorsCheck = function ( self: InstanceCreatorContext, args: unknown[] ) {
	const {
		config: { blockErrors }, TypeName, existentInstance 
	} = self;
	if ( blockErrors && existentInstance instanceof Error ) {
		self.ModificatorType = makeErrorModificatorType( TypeName );
		self.InstanceModificator = makeInstanceModificator( self );
		const blockErrorsErrorInstance = new self.InstanceModificator( ...args );
		throw blockErrorsErrorInstance;
	}
};

const runBuild = function ( self: InstanceCreatorContext, args: unknown[] ) {
	// NOTE: makeInstanceModificator runs OUTSIDE the blockErrors guard below.
	// That placement is pragmatic, not principled (too many other things were
	// on fire at the time): a custom ModificationConstructor throwing during
	// wiring propagates raw, because wrapping an error into an errored
	// instance needs a valid instance context that does not exist yet here.
	self.InstanceModificator = makeInstanceModificator( self );

	if ( self.config.blockErrors ) {
		try {
			const answer = new self.InstanceModificator( ...args );
			self.inheritedInstance = answer;
		} catch ( error ) {
			self.throwModificationError( error as MnemonicaError );
		}
	} else {
		const answer = new self.InstanceModificator( ...args );
		self.inheritedInstance = answer;
	}
};

const runAsyncHandling = function ( self: InstanceCreatorContext, type: TypeDef ) {
	if ( self.inheritedInstance instanceof Promise ) {
		// Async construction: capture the creation stack NOW, while the `new`
		// call site is still on the stack. When a rejection gets wrapped later
		// (makeAwaiter .catch → throwModificationError), the call site has
		// already unwound, and a fresh capture would hold nothing but
		// rejection-processing frames. Skipped when runSetup already captured
		// one (submitStack) — and, with runSetup's [ title ] placeholder
		// array, when the stack holds MORE than the title alone.
		if ( !Array.isArray( self.stack ) || self.stack.length < 2 ) {
			const title = `\n<-- creation of [ ${type.TypeName} ] traced -->`;
			getStack.call(
				self,
				title,
				[]
			);
		}
		const waiter = self.makeAwaiter( type );
		odp(
			waiter,
			SymbolConstructorName,
			{
				get () {
					return type.TypeName;
				}
			} 
		);
		return waiter;
	}
	return undefined;
};

const instanceCreatorImpl = function (
	this: InstanceCreatorContext,
	type: TypeDef,
	existentInstance: object,
	args: unknown[],
	chained: boolean
) {

	const self = this;

	// Phase 1: Setup — bind type, config, args, stack to context
	runSetup(
		self,
		type,
		existentInstance,
		args,
		chained 
	);

	// Phase 2: Circuit breaker — if parent is Error and blockErrors, abort early
	runBlockErrorsCheck(
		self,
		args
	);

	// Phase 2.5: lazy gather failure — a lazy type whose callback threw
	// (anything at all, undefined included), returned a non-function, or a
	// rejected shape is a construction error: route it through the regular
	// error path so creationError hooks fire with the existent instance and
	// the construction args, with preCreation never running. It must sit
	// AFTER runBlockErrorsCheck: throwModificationError splices the original
	// error into the chain that contains the existent instance, so a later
	// circuit-breaker check would see "parent is an Error" and mis-fire.
	// Reads the runSetup snapshot, never the cell. If a creationError hook
	// suppresses the throw, mirror the body-failure path: the pipeline
	// continues from the errored instance exactly as if the build had
	// failed and been suppressed there.
	if ( self.lazyFailed === true ) {
		// the same passthrough idiom as runBuild's catch: whatever the
		// callback threw reaches the error path (a thrown non-Error breaks
		// the prototype splice there exactly as it does for a constructor
		// body)
		self.throwModificationError( self.lazyError as MnemonicaError );
		self.postProcessing( type );
		return self.inheritedInstance;
	}

	// Phase 3: Pre-hooks — invoke preCreation hooks on collection and type
	self.invokePreHooks();

	// Phase 4: Build — wire prototype chain and run user constructor
	runBuild(
		self,
		args 
	);

	// Phase 5: Async handling — if Promise, defer validation/postHooks
	const asyncResult = runAsyncHandling(
		self,
		type 
	);
	if ( asyncResult !== undefined ) {
		return asyncResult;
	}

	// Phase 6: Validation + Post-hooks — validate inheritance, set __self__, invoke hooks
	self.postProcessing( type );

	// Phase 7: Return
	return self.inheritedInstance;

};

// always invoked with `new` (the TypeProxy construct trap, makeAwaiter's
// addThen); a function expression carries no construct signature, so it is
// named once as the constructor interface it is used through
export const InstanceCreator = instanceCreatorImpl as _Internal_TC_<typeof InstanceCreatorPrototype>;

Object.assign(
	InstanceCreator.prototype,
	InstanceCreatorPrototype 
);
