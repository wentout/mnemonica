'use strict';

import type {
	hooksOpts, TypeDef 
} from '../../types';

// hooksOpts is used in build() return type

/**
 * Builder for hook invocation arguments.
 *
 * Replaces the Object.assign pattern with explicit construction phases:
 *   1. Base args (type, TypeName, existentInstance, args) — always present
 *   2. Optional args (inheritedInstance, throwModificationError) — added when available
 *
 * This makes the two-phase construction explicit and eliminates mutation.
 */
export class HookInvocation {
	private readonly type: TypeDef;
	private readonly TypeName: string;
	private readonly existentInstance: object;
	private readonly args: unknown[];
	private inheritedInstance?: object;
	private _throwModificationError?: (error: Error) => void;

	constructor (
		type: TypeDef,
		existentInstance: object,
		args: unknown[]
	) {
		this.type = type;
		this.TypeName = type.TypeName;
		this.existentInstance = existentInstance;
		this.args = args;
	}

	withInheritedInstance (instance: object): this {
		this.inheritedInstance = instance;
		return this;
	}

	withCreator (creator: { throwModificationError(error: Error): void }): this {
		this._throwModificationError = (error: Error) => {
			creator.throwModificationError(error);
		};
		return this;
	}

	build (): hooksOpts {
		const result: hooksOpts = {
			type             : this.type,
			TypeName         : this.TypeName,
			existentInstance : this.existentInstance,
			args             : this.args,
		};

		if (this.inheritedInstance !== undefined) {
			Object.assign(result,
				{
					inheritedInstance      : this.inheritedInstance,
					throwModificationError : this._throwModificationError,
				});
		}

		return result;
	}
}
