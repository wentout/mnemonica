// N1 — naive free define, NO registry merge: MUST STILL FAIL (TS2883 GlobalRegistry).
import { define } from 'mnemonica';

interface JobShape { title : string }

export const Job = define('Job', function (this : JobShape, title : string) {
	this.title = title;
});
