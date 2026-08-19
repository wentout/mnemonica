'use strict';

// Packages bound-method failures the way throwModificationError does:
// error data lives in the external props storage (WeakMap), never on the
// error object itself — getProps(error) is the accessor.
const { getProps, setProps } = require('..');

module.exports.boundMethodErrorHandler = ( exceptionReason ) => {

	// debugger;

	const {
		applyTo,
		args,
		method,
		asNew,
		error
	} = exceptionReason;

	const errorProps = getProps( error );
	const reThrown = errorProps !== undefined && errorProps.exceptionReason !== undefined;
	if ( reThrown ) {
		errorProps.reasons.push( exceptionReason );
		errorProps.surplus.push( error );
		return error;
	}

	const reasons = [ exceptionReason ];
	const surplus = [];
	setProps( error, {
		exceptionReason,
		reasons,
		surplus
	} );

	// if ( typeof applyTo === 'object' && applyTo.exception instanceof Function ) {
	if ( applyTo && applyTo.exception instanceof Function ) {
		let preparedException = error;
		try {
			 
			preparedException = new applyTo.exception( error, {
				args,
				exceptionReasonMethod : method,
				exceptionReasonObject : applyTo,
				reasonsIsNew          : asNew
			} );
		} catch ( additionalError ) {
			surplus.push( additionalError );
			return error;
		}
		if ( preparedException instanceof Error ) {
			return preparedException;
		}
	}

	return error;

};
