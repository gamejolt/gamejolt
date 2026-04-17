/**
 * One-shot codemod that rewrites every relative import under `src/` to use
 * a `~section` alias.
 *
 * Run:
 *   yarn tsscript scripts/migrate-imports.ts            # apply
 *   yarn tsscript scripts/migrate-imports.ts --dry-run  # report only
 *   yarn tsscript scripts/migrate-imports.ts --section app  # restrict scope
 *
 * The script resolves each relative path against the file's directory,
 * figures out which section root the resolved path falls under, and
 * rewrites the string to `<alias>/<remainder>`. Running it twice is a no-op.
 */

import * as fs from 'fs';
import * as path from 'path';

const fastGlob = require('fast-glob');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2), {
	boolean: ['dry-run', 'verbose'],
	string: ['section'],
});

const DRY_RUN: boolean = argv['dry-run'] === true;
const VERBOSE: boolean = argv['verbose'] === true;
const SECTION_FILTER: string | undefined = argv['section'];

const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(REPO_ROOT, 'src');
const TYPINGS_ROOT = path.join(REPO_ROOT, 'typings');

// Map of alias -> absolute path to its section root.
// Order matters for prefix matching only if two roots nest; here all roots are
// direct children of src/ and don't nest, so order is irrelevant.
const ALIASES: Array<{ alias: string; root: string }> = [
	{ alias: '~app', root: path.join(SRC_ROOT, 'app') },
	{ alias: '~auth', root: path.join(SRC_ROOT, 'auth') },
	{ alias: '~checkout', root: path.join(SRC_ROOT, 'checkout') },
	{ alias: '~claim', root: path.join(SRC_ROOT, 'claim') },
	{ alias: '~client', root: path.join(SRC_ROOT, 'client') },
	{ alias: '~common', root: path.join(SRC_ROOT, '_common') },
	{ alias: '~editor', root: path.join(SRC_ROOT, 'editor') },
	{ alias: '~gameserver', root: path.join(SRC_ROOT, 'gameserver') },
	{ alias: '~lib', root: path.join(SRC_ROOT, 'lib') },
	{ alias: '~site-editor', root: path.join(SRC_ROOT, 'site-editor') },
	{ alias: '~styles', root: path.join(SRC_ROOT, '_styles') },
	{ alias: '~utils', root: path.join(SRC_ROOT, 'utils') },
	{ alias: '~widget-package', root: path.join(SRC_ROOT, 'widget-package') },
	{ alias: '~z', root: path.join(SRC_ROOT, 'z') },
	{ alias: '~typings', root: TYPINGS_ROOT },
];

// Patterns that capture an import-like statement. Each pattern must have exactly
// three capture groups: (prefix)(quote)(path). We replace group 3 in place.
//
// Notes:
//   - \s matches newlines in JS regex, so dynamic `import(\n  '...'\n)` works.
//   - We only match strings that begin with './' or '../' — absolute specifiers
//     (npm packages, '~' aliases, URLs) are left alone.
//   - The final \2 backreference ensures the same quote style closes the match.
const PATTERNS: RegExp[] = [
	// TS/JS static: `from '...'` (covers `import ... from` and `export ... from`)
	/(\bfrom\s+)(['"])(\.\.?\/[^'"\n]*)\2/g,

	// TS/JS bare-side-effect import: `import '...'` (no `from`)
	/(\bimport\s+)(['"])(\.\.?\/[^'"\n]*)\2/g,

	// Dynamic import: `import('...')`. Guarded to NOT match `import.meta.glob(`
	// (whose key format depends on the pattern string, so we must leave it alone).
	/(\bimport(?!\.meta\.glob)\s*\(\s*)(['"])(\.\.?\/[^'"\n]*)\2/g,

	// CommonJS: `require('...')`
	/(\brequire\s*\(\s*)(['"])(\.\.?\/[^'"\n]*)\2/g,

	// Vue SFC block src: `<style src="..."` / `<script src="..."`
	/(\bsrc\s*=\s*)(['"])(\.\.?\/[^'"\n]*)\2/g,

	// NOTE: Stylus `@import` is deliberately NOT handled here. Stylus's
	// preprocessor resolves @import paths itself before Vite's CSS resolver
	// sees them, and stylus has no alias support. Keep stylus @imports as
	// relative paths.
];

type FileResult = {
	file: string;
	rewrites: number;
	skippedOutsideSrc: number;
};

function resolveAlias(fileDir: string, importPath: string): string | null {
	const absolute = path.resolve(fileDir, importPath);

	// Find which section root this resolves under.
	for (const { alias, root } of ALIASES) {
		if (absolute === root) {
			return alias;
		}
		const prefix = root + path.sep;
		if (absolute.startsWith(prefix)) {
			const remainder = absolute.slice(prefix.length);
			// Normalize to forward slashes for import syntax.
			return `${alias}/${remainder.split(path.sep).join('/')}`;
		}
	}

	return null;
}

function processFile(file: string): FileResult {
	const original = fs.readFileSync(file, 'utf8');
	const fileDir = path.dirname(file);

	let rewrites = 0;
	let skippedOutsideSrc = 0;
	let updated = original;

	for (const pattern of PATTERNS) {
		updated = updated.replace(pattern, (match, prefix: string, quote: string, importPath: string) => {
			const aliased = resolveAlias(fileDir, importPath);
			if (aliased == null) {
				skippedOutsideSrc++;
				if (VERBOSE) {
					console.warn(
						`  ! ${path.relative(REPO_ROOT, file)}: '${importPath}' resolves outside any section — leaving as-is`
					);
				}
				return match;
			}
			rewrites++;
			return `${prefix}${quote}${aliased}${quote}`;
		});
	}

	if (rewrites > 0 && !DRY_RUN) {
		fs.writeFileSync(file, updated);
	}

	return { file, rewrites, skippedOutsideSrc };
}

function main() {
	const globPattern = SECTION_FILTER
		? `${SECTION_FILTER === 'common' ? '_common' : SECTION_FILTER === 'styles' ? '_styles' : SECTION_FILTER}/**/*.{ts,vue,styl}`
		: '**/*.{ts,vue,styl}';

	const files = fastGlob.sync(globPattern, {
		cwd: SRC_ROOT,
		absolute: true,
		dot: false,
	});

	console.log(
		`${DRY_RUN ? '[DRY RUN] ' : ''}Scanning ${files.length} file(s) under ${path.relative(REPO_ROOT, SRC_ROOT)}...`
	);

	const perSection = new Map<string, number>();
	let totalRewrites = 0;
	let totalSkipped = 0;
	let filesChanged = 0;

	for (const file of files) {
		const result = processFile(file);
		if (result.rewrites > 0) {
			filesChanged++;
			totalRewrites += result.rewrites;

			// Tally by section (first path segment under src/).
			const rel = path.relative(SRC_ROOT, file);
			const section = rel.split(path.sep)[0];
			perSection.set(section, (perSection.get(section) ?? 0) + result.rewrites);
		}
		totalSkipped += result.skippedOutsideSrc;
	}

	console.log('');
	console.log(`Files changed: ${filesChanged}`);
	console.log(`Total rewrites: ${totalRewrites}`);
	if (totalSkipped > 0) {
		console.log(`Skipped (resolved outside any section root): ${totalSkipped}`);
	}
	console.log('');
	console.log('Rewrites by section:');
	for (const [section, count] of [...perSection.entries()].sort((a, b) => b[1] - a[1])) {
		console.log(`  ${section.padEnd(18)} ${count}`);
	}

	if (DRY_RUN) {
		console.log('');
		console.log('(dry run — no files written)');
	}
}

main();
