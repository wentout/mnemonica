'use strict';

/**
 * TypeScript type tests for CreationError<T> — the catch side of `new T()`.
 * A failed construction throws either the errored instance (`T & Error`,
 * blockErrors: true) or the plain original error; `instanceof` narrows both.
 */

import { define } from '..';
import type { CreationError } from '..';

const CreationWidget = define('CreationWidget', function (this: {
	size: number;
}) {
	this.size = 1;
});

type CreationWidgetInstance = InstanceType<typeof CreationWidget>;

const report = (failed: CreationError<CreationWidgetInstance>) => {
	// every value it holds is an Error
	const message: string = failed.message;
	if (failed instanceof CreationWidget) {
		// the errored instance: still a CreationWidget, and still an Error
		const size: number = failed.size;
		const alsoMessage: string = failed.message;
		const result = { size, alsoMessage };
		return result;
	}
	const result = { message };
	return result;
};

try {
	new CreationWidget();
} catch (e) {
	if (e instanceof Error) {
		// a caught Error is exactly what CreationError accepts
		report(e);
	}
	// @ts-expect-error — the caught value is unknown until narrowed
	report(e);
}

// @ts-expect-error — a CreationError is not the happy-path instance
export const notHappy: CreationWidgetInstance = {} as CreationError<CreationWidgetInstance>;

export { report };
