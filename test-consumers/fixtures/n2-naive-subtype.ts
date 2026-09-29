// N2 — naive subtype export (Root.define(...)): record pass/fail
// (desired per brief: fail).
import { define } from 'mnemonica';

interface JobShape { title : string }
interface SubShape extends JobShape { level : number }

export const Job = define('Job', function (this : JobShape, title : string) {
	this.title = title;
});

export const Sub = Job.define('Sub', function (this : SubShape, level : number) {
	this.level = level;
});
