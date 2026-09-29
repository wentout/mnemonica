// M1 — hand-written TypeRegistry merge + exported free lookup()
// (claude's PASSING shape from the consumer-paths probe — registry
// entries typed with the PUBLIC TypeConstructor name; define() results
// never bound, so no inferred-type naming is forced on them).
import { define, lookup } from 'mnemonica';
import type { TypeConstructor } from 'mnemonica';

interface JobShape { id : string; Task : TypeConstructor<TaskShape> }
interface TaskShape extends JobShape { done : boolean }

declare module 'mnemonica' {
	interface TypeRegistry {
		'Job' : TypeConstructor<JobShape>;
		'Job.Task' : TypeConstructor<TaskShape>;
	}
}

define('Job', function (this : JobShape, id : string) {
	this.id = id;
});
define('Job.Task', function (this : TaskShape) {
	this.done = false;
});

export const Job = lookup('Job');
const job = new Job('j1');
export const task = new job.Task();
export const done : boolean = task.done;
