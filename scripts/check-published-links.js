'use strict';

/*
 * Shipped-set link audit.
 *
 * markdown-link-check validates links against the local disk, where the
 * author's whole monorepo exists (articles/, hott/, test_async/, ...).
 * This script validates them against the PUBLISHED package instead:
 * for every shipped .md file, every relative markdown link must resolve
 * inside the `files` list of package.json.
 *
 * Fenced code blocks and inline code are ignored — `[x](y)` there is
 * code, not a link (learned from two false positives on 2026-08-03).
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

const shipped = new Set(pkg.files);

const rootFiles = [
	'README.md',
	'FOR_HUMANS.md',
	'AGENTS.md',
	'SKILL.md',
	'CONTRIBUTING.md',
];

const shippedDirs = [ '.ai', 'docs' ];

const mdFiles = [];
const walk = (dir) => {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(full);
		} else if (entry.name.endsWith('.md')) {
			mdFiles.push(full);
		}
	}
};
for (const file of rootFiles) {
	const full = path.join(root, file);
	if (fs.existsSync(full)) mdFiles.push(full);
}
for (const dir of shippedDirs) {
	const full = path.join(root, dir);
	if (fs.existsSync(full)) walk(full);
}

const problems = [];

const scanFile = (file) => {
	const rel = path.relative(root, file);
	const lines = fs.readFileSync(file, 'utf8').split('\n');
	let inFence = false;
	lines.forEach((rawLine, idx) => {
		if (/^\s*```/.test(rawLine)) {
			inFence = !inFence;
			return;
		}
		if (inFence) return;
		// strip inline code so `[x](y)` inside backticks is not a link
		const line = rawLine.replace(/`[^`]*`/g, '');
		const re = /\]\(\s*<([^>]+)>|\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
		let m;
		while ((m = re.exec(line))) {
			const target = (m[ 1 ] || m[ 2 ] || '').split('#')[ 0 ];
			if (!target || /^(https?:|mailto:|#)/.test(target)) continue;
			const resolved = path.normalize(path.join(path.dirname(file), target));
			const relTarget = path.relative(root, resolved);
			if (relTarget.startsWith('..')) {
				problems.push(`${rel}:${idx + 1} → ${target} (escapes the repository)`);
				continue;
			}
			if (!fs.existsSync(resolved)) {
				problems.push(`${rel}:${idx + 1} → ${target} (missing on disk)`);
				continue;
			}
			const top = relTarget.split(path.sep)[ 0 ];
			if (!shipped.has(top)) {
				problems.push(`${rel}:${idx + 1} → ${target} (resolves to ${relTarget}, not shipped)`);
			}
		}
	});
};

mdFiles.forEach(scanFile);

if (problems.length) {
	console.error('Published-link audit failed:');
	problems.forEach((p) => console.error(`  ${p}`));
	process.exit(1);
}

console.log(`Published-link audit passed (${mdFiles.length} shipped files checked).`);
