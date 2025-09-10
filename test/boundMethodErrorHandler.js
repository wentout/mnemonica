'use strict';

const odp = ( o, p, attributes ) => {
	return Object.defineProperty( o, p, attributes );
};

module.exports.boundMethodErrorHandler = ( exceptionReason ) => {

	debugger;

	const {
		applyTo,
		args,
		method,
		asNew,
		error
	} = exceptionReason;

	const reThrown = error.exceptionReason !== undefined;
	if ( reThrown ) {
		error.reasons.push( exceptionReason );
		error.surplus.push( error );
		return error;
	} else {
		odp( error, 'exceptionReason', {
			get () {
				return exceptionReason;
			},
			enumerable : true
		} );
		const reasons = [ exceptionReason ];
		odp( error, 'reasons', {
			get () {
				return reasons;
			},
			enumerable : true
		} );
		const surplus = [];
		odp( error, 'surplus', {
			get () {
				return surplus;
			},
			enumerable : true
		} );
	}

	// if ( typeof applyTo === 'object' && applyTo.exception instanceof Function ) {
	if ( applyTo && applyTo.exception instanceof Function ) {
		let preparedException = error;
		try {
			// eslint-disable-next-line new-cap
			preparedException = new applyTo.exception( error, {
				args,
				exceptionReasonMethod : method,
				exceptionReasonObject : applyTo,
				reasonsIsNew          : asNew
			} );
		} catch ( additionalError ) {
			error.surplus.push( additionalError );
			return error;
		}
		if ( preparedException instanceof Error ) {
			return preparedException;
		}
	}

	return error;

};
