// Run with ts-node -P ./script.tsconfig.json byelib.ts

import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

const readdir = require('fs-readdir-recursive') as (
	path: string,
	filter?: (path: string, index: number, dir: string) => boolean
) => string[];

const baseDir = path.resolve(__dirname, '..');
const srcDir = path.join(baseDir, 'src');

const prettierConf = prettier.resolveConfig.sync(srcDir)!;
prettierConf.parser = 'typescript';

type Mode = 'execute' | 'dry';
const mode: Mode = 'execute' as any;

function main() {
	let files = readdir(srcDir, (name, _, dir) => {
		const fullpath = path.resolve(dir, name);
		return fs.statSync(fullpath).isDirectory() || name.endsWith('.ts') || name.endsWith('.vue');
	});
	files = files.map(i => fs.realpathSync(path.resolve(srcDir, i)));

	console.log(`Found ${files.length} files to process...`);

	files.forEach(file => {
		// Only process TS files.
		if (!file.endsWith('.ts')) {
			return;
		}

		console.log(file.replace(baseDir + '/src/', ''));

		const content = fs.readFileSync(file, { encoding: 'utf8' });
		const imports = matchAll(content, /from ['"](.*?)['"]/g);

		let processedContent = content;
		for (const [, importPath] of imports) {
			if (!importPath.startsWith('../')) {
				continue;
			}

			let stripped = '/' + importPath.replace(/\.\.\//g, '');
			if (
				!stripped.endsWith('.styl') &&
				!stripped.endsWith('.vue') &&
				!stripped.endsWith('.ts')
			) {
				stripped += '.ts';
			}

			let resolved = files
				.filter(i => i.endsWith(stripped))
				.filter(i => fs.existsSync(i))
				// Find the path relative to the file that's importing.
				.map(i => path.relative(path.dirname(file), i))
				// Fix relative paths to the current directory to always begin
				// with `./` instead of nothing.
				.map(i => (!i.startsWith('../') ? './' + i : i))
				// Take the shortest relative path
				.reduce((acc, cur) => (acc && acc.length < cur.length ? acc : cur), '');

			if (!resolved) {
				console.log('  | stripped', stripped);
				console.log('  | UNRESOLVED!!!!!!!!!!!!!!!!!!!!!!!!!', stripped);
				continue;
			} else {
				if (resolved.endsWith('.ts')) {
					resolved = resolved.substring(0, resolved.length - 3);
				}
				console.log('  | resolved', resolved);
			}

			processedContent = processedContent.replace(importPath, resolved);
		}

		if (processedContent !== content) {
			console.log(`  | updating content`);
			processedContent = prettier.format(processedContent, prettierConf);

			if (mode === 'execute') {
				fs.writeFileSync(file, processedContent);
				console.log(`  ↳ done`);
			} else {
				console.log(processedContent);
				console.log(`  ↳ skipped`);
			}
		} else {
			console.log(`  ↳ nothing to replace`);
		}
	});
}

function matchAll(str: string, regex: RegExp) {
	const allMatches: RegExpExecArray[] = [];
	let matches: RegExpExecArray | null = null;
	while ((matches = regex.exec(str)) !== null) {
		allMatches.push(matches);
	}

	return allMatches;
}

main();
