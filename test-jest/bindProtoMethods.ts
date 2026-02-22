'use strict';

const {
	getProps,
} = require('../src/index');

const odp = (obj: any, prop: string, attributes: PropertyDescriptor) => {
	try {
		return Object.defineProperty(obj, prop, attributes);
	} catch (error) {
		console.error(error);
	}
};

const { boundMethodErrorHandler } = require('./boundMethodErrorHandler');

export const bindMethod = function (hookData: any, instance: any, methodName: string, MethodItself: Function) {
	const from = hookData;

	odp(instance, methodName, {
		get() {
			return function (this: any, ...args: any[]) {
				const applyTo = this !== undefined ? this : from;
				const exceptionReason = {
					method: MethodItself,
					methodName,
					this: this,
					from,
					instance,
					applyTo,
					asNew: false,
					args,
				};

				try {
					let answer;
					if (new.target) {
						(exceptionReason as any).asNew = true;
						answer = new (MethodItself as any)(...args);
					} else {
						answer = MethodItself.call(applyTo, ...args);
					}

					if (answer instanceof Promise) {
						answer = answer.catch((error: any) => {
							odp(exceptionReason, 'error', {
								value: error,
								enumerable: true
							});
							throw boundMethodErrorHandler(exceptionReason);
						});
					}

					return answer;
				} catch (error) {
					odp(exceptionReason, 'error', {
						value: error,
						enumerable: true
					});

					throw boundMethodErrorHandler(exceptionReason);
				}
			};
		},
		enumerable: true
	});
};

export const bindProtoMethods = function (hookData: any) {
	const {
		inheritedInstance,
	} = hookData;
	const { __type__ } = getProps(inheritedInstance);
	const { proto } = __type__;
	const protoPointer = Reflect.getPrototypeOf(inheritedInstance);
	Object.entries(protoPointer).forEach((entry) => {
		const [mayBeMethodName, MayBeMethodFunction] = entry;
		if (mayBeMethodName === 'constructor') {
			return;
		}
		if (MayBeMethodFunction instanceof Function && proto[mayBeMethodName] instanceof Function) {
			bindMethod(hookData, protoPointer, mayBeMethodName, MayBeMethodFunction as Function);
		}
	});
};
