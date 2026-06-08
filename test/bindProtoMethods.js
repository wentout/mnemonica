'use strict';

const {
	getProps,
} = require( '..' );

const odp = ( obj, prop, attributes ) => {
	try {
		const result = Object.defineProperty( obj, prop, attributes );
		return result;
	} catch ( error ) {
		console.error( error );
	}
};

const { boundMethodErrorHandler } = require( './boundMethodErrorHandler' );

const bindMethod = function ( hookData, instance, methodName, MethodItself ) {
	const from = hookData;

	odp( instance, methodName, {
		get () {
			 
			 
			const result = function ( ...args ) {
				// || instance;
				const applyTo = this !== undefined ? this : from;
				const exceptionReason = {
					method : MethodItself,
					methodName,
					this   : this,
					from,
					instance,
					applyTo,
					asNew  : false,
					args,
				};

				try {
					let answer;
					if ( new.target ) {
						exceptionReason.asNew = true;
						answer = new MethodItself( ...args );
					} else {
						answer = MethodItself.call( applyTo, ...args );
					}

					if ( answer instanceof Promise ) {
						answer = answer.catch( ( error ) => {
							odp( exceptionReason, 'error', {
								value      : error,
								enumerable : true
							} );
							throw boundMethodErrorHandler( exceptionReason );
						} );
					}

					return answer;
				} catch ( error ) {
					// debugger;
					odp( exceptionReason, 'error', {
						value      : error,
						enumerable : true
					} );

					throw boundMethodErrorHandler( exceptionReason );
				}
			};
			return result;
		},
		enumerable : true
	} );
};

const bindProtoMethods = function ( hookData ) {
	const {
		inheritedInstance,
		// existentInstance,
	} = hookData;
	const { __type__ } = getProps(inheritedInstance);
	const { proto } = __type__;
	const protoPointer = Reflect.getPrototypeOf( inheritedInstance );
	Object.entries( protoPointer ).forEach( ( entry ) => {
		const [ mayBeMethodName, MayBeMethodFunction ] = entry;
		if ( mayBeMethodName === 'constructor' ) {
			return;
		}
		if ( MayBeMethodFunction instanceof Function && proto[ mayBeMethodName ] instanceof Function ) {
		// if ( MayBeMethodFunction instanceof Function || proto[ mayBeMethodName ] instanceof Function ) {
			// if (!hop(inheritedInstance, mayBeMethodName)) {
			bindMethod( hookData, protoPointer, mayBeMethodName, MayBeMethodFunction );
			// }
		}
	} );
	// Object.entries( existentInstance ).forEach( ( entry: [ string, any ] ) => {
	// 	const [ name, MayBeMethodFunction ] = entry;
	// 	if ( MayBeMethodFunction instanceof Function ) {
	// 		bindMethod( inheritedInstance, name, MayBeMethodFunction );
	// 	}
	// } );
};


Object.assign( module.exports, {
	bindMethod,
	bindProtoMethods
} );
