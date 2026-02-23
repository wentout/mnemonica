'use strict';

const {
	getProps,
} = require('../src/index');

const odp = (obj: Record<string, unknown>, prop: string, attributes: PropertyDescriptor): void => {
	try {
		Object.defineProperty(obj, prop, attributes);
	} catch (error) {
		console.error(error);
	}
};

const { boundMethodErrorHandler } = require('./boundMethodErrorHandler');

export interface HookData {
	inheritedInstance: Record<string, unknown> & {
		__type__?: { proto: Record<string, unknown> };
		exception?: new (...args: unknown[]) => Error;
	};
}

export const bindMethod = function (hookData: HookData, instance: Record<string, unknown>, methodName: string, MethodItself: (...args: unknown[]) => unknown | ((this: Record<string, unknown>, propName: string) => unknown)) {
	const from = hookData;

	odp(instance, methodName, {
		get() {
			return function (this: unknown, ...args: unknown[]) {
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
						(exceptionReason as { asNew?: boolean }).asNew = true;
						answer = new (MethodItself as unknown as new (...args: unknown[]) => unknown)(...args);
					} else {
						answer = MethodItself.call(applyTo, ...args);
					}

					if (answer instanceof Promise) {
						answer = answer.catch((error: Error) => {
							odp(exceptionReason, 'error', {
								value: error,
								enumerable: true
							});
							throw boundMethodErrorHandler(exceptionReason);
						});
					}

					return answer;
				} catch (error: unknown) {
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

export const bindProtoMethods = function (hookData: HookData) {
	const {
		inheritedInstance,
	} = hookData;
	const { __type__ } = getProps(inheritedInstance);
	const { proto } = __type__;
	const protoPointer = Reflect.getPrototypeOf(inheritedInstance);
	if (protoPointer === null) {
		return;
	}
	Object.entries(protoPointer).forEach((entry) => {
		const [mayBeMethodName, MayBeMethodFunction] = entry;
		if (mayBeMethodName === 'constructor') {
			return;
		}
		if (MayBeMethodFunction instanceof Function && proto[mayBeMethodName] instanceof Function) {
			bindMethod(hookData, protoPointer as unknown as Record<string, unknown>, mayBeMethodName, MayBeMethodFunction as (...args: unknown[]) => unknown);
		}
	});
};
