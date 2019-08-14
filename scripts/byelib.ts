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
const commonDir = path.join(srcDir, '_common');
const refactorDir = path.join(srcDir, 'z');

const prettierConf = prettier.resolveConfig.sync(srcDir)!;
prettierConf.parser = 'typescript';

type Mode = 'execute' | 'dry';
const mode: Mode = 'execute' as any;

function main() {
	let files = readdir(refactorDir, (name, _, dir) => {
		const fullpath = path.resolve(dir, name);
		return fs.statSync(fullpath).isDirectory() || name.endsWith('.ts');
	});

	console.log(`Found ${files.length} files to process...`);

	files
		.map(i => fs.realpathSync(path.resolve(refactorDir, i)))
		.forEach(file => {
			console.log(file.replace(baseDir + '/', ''));
			const content = fs.readFileSync(file, { encoding: 'utf8' });
			const matches = matchAll(content, /from ['"]game\-jolt\-frontend\-lib(.*?)['"];$/gm);

			let processedContent = content;
			for (const [, importPath] of matches) {
				let resolved = importPath;
				resolved = resolved.replace(/^\/utils\//, '/../utils/');
				resolved = resolved.replace(/^\/components\//, '');
				resolved = resolved.replace(/^\/vue\/components\//, '');
				resolved = resolved.replace(/^\/vue\/filters\//, '/filters/');
				resolved = resolved.replace(/^\/vue\/services\/app\//, '/store/');
				resolved = path.join(commonDir, resolved);
				const exists = fs.existsSync(resolved) || fs.existsSync(`${resolved}.ts`);

				if (!exists) {
					console.error(`  ↳ FAILED TO RESOLVE: ${resolved}`);
					break;
				}

				const relative = path.relative(path.dirname(file), resolved);
				processedContent = processedContent.replace(
					`game-jolt-frontend-lib${importPath}`,
					relative
				);
			}

			if (processedContent !== content) {
				console.log(`  | updating content`);
				processedContent = prettier.format(processedContent, prettierConf);

				if (mode === 'execute') {
					fs.writeFileSync(file, processedContent);
					console.log(`  ↳ done`);
				} else {
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
