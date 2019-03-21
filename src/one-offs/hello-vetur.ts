// Run with ts-node -P ./hello-vetur.tsconfig.json hello-vetur.ts

import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

const readdir = require('fs-readdir-recursive') as (
	path: string,
	filter?: (path: string, index: number, dir: string) => boolean
) => string[];

const baseDir = path.resolve(__dirname, '..', '..');
const srcDir = path.join(baseDir, 'src');
const frontendLibDir = path.join(srcDir, 'lib', 'gj-lib-client');

const refactorDir = srcDir;

// Execute mode will do the full refactor in place of the original files.
// Debug mode will do the refactor but save the filenames under a new name.
// the goal of debug mode is to be able to try again and rollback quickly (git clean -f)
// Dry mode will only print messages to output but will not write anything to disk.
type Mode = 'execute' | 'debug' | 'dry';
const mode: Mode = 'execute' as any;

function shortFilename(file: string) {
	return file.replace(baseDir + '/', '');
}

type importLine = {
	imported: string;
	resolvesTo: string;
	from: string;
	line: string;
	expression?: string;
};

// Tracks all TS imports that we may have to change.
// Currently we're only looking for component files which we'd have to change
// to explicitly use the .vue extension when importing after we convert them
// to single file components.
const tsImportLines: importLine[] = [];

// Tracks all style imports (styl or css).
// This is used to see which styles we may be able to inline into the
// new single file components. We can't inline styles are the imported
// anywhere else in the code.
const styleImportLines: importLine[] = [];

// Single file components that we'll be making.
// This is a list of which ts/html/style file each new single file component has.
// { ts: string; template: string; styl: string; }
type singleFileComponent = {
	ts: string;
	viewAnnotation: string;
	hasDefaultExport: boolean;
	template: string;
	style?: string;

	converted?: boolean;
};
const components: singleFileComponent[] = [];

// List of TS files that were not handled and should be looked at manually.
// These are files that MAY be components, or that have problematic stuff
// we can't automatically convert - for example files with multiple components
// in them, or files with multiple exports that we can't blindly rewrite
// to default export.
// { file: reasons[] }
const unhandledTs: { [file: string]: string[] } = {};

const matchAll = (str: string, regex: RegExp) => {
	const allMatches: RegExpExecArray[] = [];
	let matches: RegExpExecArray | null = null;
	while ((matches = regex.exec(str)) !== null) {
		allMatches.push(matches);
	}

	return allMatches;
};

// Extract properties of T of type U
type Properties<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
function groupBy<T>(arr: T[], field: NonNullable<Properties<T, String>>) {
	return arr.reduce<{ [field: string]: T[] }>((accum, item) => {
		const value = (item[field] as unknown) as string;
		if (!accum[value]) {
			accum[value] = [];
		}
		accum[value].push(item);
		return accum;
	}, {});
}

// Resolves the given import path to it's absolute real path.
function resolveImport(importPath: string, from: string, ext: 'ts' | 'styl') {
	// console.log('RESOLVING ' + importPath);
	if (!importPath) {
		console.warn(`Import path (from ${from}) cannot be empty`);
		return null;
	}

	// Webpack aliases
	// Usually we'd have to properly simulate resolving these to their real paths,
	// but luckily in our project we never import any ts or styl files for components
	// using this notion, so we're able to dismiss these imports.
	if (importPath[0] === '~') {
		console.warn(`Skipping webpack alias import path (${importPath} from ${from})`);
		return null;
	}

	// Stylus supports glob pattern imports. We never use any of these
	// for component importing, so here I try naively finding paths that may
	// look like glob patterns and skip them.
	if (ext === 'styl' && /\*\?\[\]!\+@/.test(importPath)) {
		console.warn(`Skipping stylus glob-looking import path (${importPath} from ${from})`);
		return null;
	}

	// We can rely on node's require resolution for ts and js files.
	if (ext === 'ts') {
		// Silently skip webpack loaders - these are never components.
		// e.g. !view!./component.html or !file-loader!./logo.svg
		if (importPath[0] === '!') {
			return null;
		}

		// If it's a relative path (starting with ./ or ../)
		// we first convert it to absolute path to feed to node's require.
		if (/^\.\.?\//.test(importPath)) {
			importPath = path.resolve(from, '..', importPath);
		}

		try {
			importPath = ((require as unknown) as NodeRequire).resolve(importPath);
		} catch (e) {
			console.warn(
				`Skipping ts import path that could not be resolved (${importPath} from ${from})`
			);
			return null;
		}
	} else {
		// For stylus i'm doing a naive resolution, to my knowledge we don't
		// import any file relevant to component styling in a fancy way.

		// If it's a relative path (starting with ./ or ../)
		// we first convert it to absolute path to feed to node's require.
		if (/^\.\.?\//.test(importPath)) {
			importPath = path.resolve(from, '..', importPath);
		}

		// If no styl or css extension is provided we need to first
		// try the file.ext location, and then file/index.ext location as a fallback.
		if (!importPath.endsWith('.styl') && !importPath.endsWith('.css')) {
			let found = false;
			for (let testExt of ['styl', 'css']) {
				let testPath = importPath + '.' + testExt;
				if (fs.existsSync(testPath)) {
					importPath = testPath;
					found = true;
					break;
				}

				testPath = importPath + '/index' + testExt;
				if (fs.existsSync(testPath)) {
					importPath = testPath;
					found = true;
					break;
				}
			}

			if (!found) {
				console.warn(
					`Skipping stylus import path we can't resolve (${importPath} from ${from})`
				);
				return null;
			}
		}
	}

	if (!path.isAbsolute(importPath)) {
		return null;
	}

	try {
		// console.log('REALPATH ' + importPath);
		return fs.realpathSync(importPath);
	} catch (e) {
		console.error(e);
		console.warn(
			`Skipping import path we can't resolve to a real path (${importPath} from ${from})`
		);
		return null;
	}
}

function collectTs(file: string) {
	const text = fs.readFileSync(file, { encoding: 'utf8' });

	// Gather all imports that may be components.
	const imports = matchAll(text, /^\s*import\s+(.*)?\s+from\s+['"](.*?)['"];$/gm);
	for (let [fullLine, importExpression, importPath] of imports) {
		const resolved = resolveImport(importPath, file, 'ts');
		if (!resolved) {
			continue;
		}

		// Any module that resolved outside of our src dir cannot be used as a component file.
		if (!resolved.startsWith(srcDir)) {
			continue;
		}

		tsImportLines.push({
			imported: importPath,
			resolvesTo: resolved,
			from: file,
			line: fullLine,
			expression: importExpression,
		});
	}

	const styleImports = matchAll(text, /^\s*import\s+['"](.*\.(?:styl|css))['"];$/gm);
	for (let [fullLine, importPath] of styleImports) {
		// Resolve the path to the styl file using the ts resolving logic,
		// since it is being required from a node context.
		const resolved = resolveImport(importPath, file, 'ts');
		if (!resolved) {
			continue;
		}

		// Any style file that resolved outside of our src dir cannot be inlined.
		if (!resolved.startsWith(srcDir)) {
			continue;
		}

		styleImportLines.push({
			imported: importPath,
			resolvesTo: resolved,
			from: file,
			line: fullLine,
		});
	}

	// Naive way of figuring out if we're looking at a component.
	const componentMatches = matchAll(text, /^\s*@Component\(/gm);
	const hasComponent = componentMatches && componentMatches.length !== 0;

	// In our project our components always use relative path styles.
	// If they didn't we'd have to resolve the possible paths it'll end up requiring, phew.
	const viewImportRegex = /^\s*import\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+from\s+'!view!(.*?\.html)(?:\?style=(.*?\.(?:styl|css)))?';\r?$/gm;
	const viewImportMatches = matchAll(text, viewImportRegex);
	const hasViewImport = viewImportMatches && viewImportMatches.length !== 0;
	const viewAnnotations = viewImportMatches.map(importMatch => importMatch[1]);

	const viewMatches =
		viewAnnotations.length === 0
			? []
			: matchAll(text, new RegExp('^\\s*@(?:' + viewAnnotations.join('|') + ')\\r?$', 'gm'));
	const hasView = viewMatches && viewMatches.length !== 0;

	// If it has nothing, it's definitely not a component.
	if (!hasComponent && !hasView && !hasViewImport) {
		return;
	}

	const exportMatches = matchAll(text, /^\s*export\s+([a-z]+)/gm);

	// If something is missing, or exists more than once, its a weird component file.
	if (
		componentMatches.length !== 1 ||
		viewMatches.length !== 1 ||
		viewImportMatches.length !== 1 ||
		exportMatches.length !== 1
	) {
		const reasons: string[] = [];

		if (componentMatches.length !== 1) {
			reasons.push(componentMatches.length + ' @Component annotations');
		}

		if (viewMatches.length !== 1) {
			reasons.push(viewMatches.length + ' View annotations');
		}

		if (viewImportMatches.length !== 1) {
			reasons.push(viewImportMatches.length + ' import !view! expressions');
		}

		if (exportMatches.length !== 1) {
			reasons.push(exportMatches.length + ' export expressions');
		}

		unhandledTs[file] = reasons;
		return;
	}

	const viewImportMatch = viewImportMatches[0];
	const component: singleFileComponent = {
		ts: file,
		viewAnnotation: viewAnnotations[0],
		hasDefaultExport: exportMatches[0][1] === 'default',
		template: path.resolve(file, '..', viewImportMatch[2]),
	};

	let styleFile = viewImportMatch.length < 3 ? '' : viewImportMatch[3];
	if (styleFile) {
		// Resolve the path to the styl file using the ts resolving logic,
		// since it is being required from a node context.
		const resolved = resolveImport(styleFile, file, 'ts');
		if (resolved) {
			// Any style file that resolved outside of our src dir cannot be inlined.
			if (resolved.startsWith(srcDir)) {
				styleImportLines.push({
					imported: styleFile,
					resolvesTo: resolved,
					from: file,
					line: viewImportMatch[0],
				});

				component.style = resolved;
			}
		}
	}

	components.push(component);
}

function collectStyl(file: string) {
	const text = fs.readFileSync(file, { encoding: 'utf8' });

	const imports = matchAll(text, /\b@(?:import|require)\s+['"](.*?)['"]/gm);
	for (let [fullExpression, importPath] of imports) {
		// Resolve the path to the styl file using the ts resolving logic,
		// since it is being required from a node context.
		const resolved = resolveImport(importPath, file, 'styl');
		if (!resolved) {
			continue;
		}

		// Any module that resolved outside of our src dir cannot be used as a component file.
		if (!resolved.startsWith(srcDir)) {
			continue;
		}

		styleImportLines.push({
			imported: importPath,
			resolvesTo: resolved,
			from: file,
			line: fullExpression,
		});
	}
}

const files = readdir(refactorDir, (name, _, dir) => {
	const fullpath = path.resolve(dir, name);
	return fs.statSync(fullpath).isDirectory() || name.endsWith('.ts') || name.endsWith('.styl');
});

for (let file of files) {
	const fullpath = fs.realpathSync(path.resolve(refactorDir, file));
	if (file.endsWith('.ts')) {
		collectTs(fullpath);
	} else if (file.endsWith('.styl')) {
		collectStyl(fullpath);
	}
}

const resolvedStyleImports = groupBy(styleImportLines, 'resolvesTo');

const inlineableStyleFiles = Object.keys(resolvedStyleImports).reduce(
	(accum, resolvedPath) => {
		const text = fs.readFileSync(resolvedPath, 'utf8');
		const lines = matchAll(text, /\n/g).length;
		if (lines >= 40) {
			console.warn(`Style is not inlineable (${resolvedPath}), too long: ${lines} lines`);
			return accum;
		}

		const imports = resolvedStyleImports[resolvedPath];
		if (!imports || imports.length !== 1) {
			console.warn(`Style is not inlineable (${resolvedPath}), imported multiple times: `);
			for (let importItem of imports) {
				console.warn(`\t${importItem.from}: ${importItem.line}`);
			}
			return accum;
		}

		accum[resolvedPath] = imports[0];
		return accum;
	},
	{} as { [resolvesTo: string]: importLine }
);

console.log('\n\nInlinable styles: \n\t' + Object.keys(inlineableStyleFiles).join('\n\t'));
console.log(Object.keys(inlineableStyleFiles).length + ' inlineable styles');

console.log('\n\nSingle file components to generate: ');
console.log(JSON.stringify(components, null, 2));
console.log(components.length + ' new single file components to generate');

console.log('\n\nUnhandled TS files: ');
console.log(JSON.stringify(unhandledTs, null, 2));
console.log(Object.keys(unhandledTs).length + ' unhandled TS files');

const resolvedTsImports = groupBy(tsImportLines, 'resolvesTo');

for (let component of components) {
	const vueFilename = component.template.replace(/\.html$/, '.vue');
	console.log(`Rewriting ${shortFilename(component.template)} => ${shortFilename(vueFilename)}`);

	let templateText = '',
		styleText = '',
		tsText = '';
	try {
		templateText = fs.readFileSync(component.template, 'utf8');
		styleText = component.style ? fs.readFileSync(component.style, 'utf8') : '';
		tsText = fs.readFileSync(component.ts, 'utf8');
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
			console.warn('\tFile not found, skipping');
			continue;
		}
	}

	templateText = `<template>${templateText}</template>`;

	if (component.style) {
		if (inlineableStyleFiles[component.style]) {
			if (component.style.endsWith('.styl')) {
				templateText += `\n\n<style lang="stylus" scoped>\n${styleText}\n</style>`;
			} else {
				templateText += `\n\n<style scoped>\n${styleText}\n</style>`;
			}
		} else {
			let stylePath = path.relative(path.join(vueFilename, '..'), component.style);
			if (!stylePath.startsWith('../')) {
				stylePath = './' + stylePath;
			}
			templateText += `\n\n<style src="${stylePath}" scoped />`;
		}
	}

	let tsPath = path.relative(path.join(vueFilename, '..'), component.ts);
	if (!tsPath.startsWith('../')) {
		tsPath = './' + tsPath;
	}
	tsPath = tsPath.replace(/\.ts$/, '');
	templateText += `\n\n<script lang="ts" src="${tsPath}" />`;

	// Convert export to export defeault
	if (!component.hasDefaultExport) {
		tsText = tsText.replace(/^(\s*export)(\s+)(?=class)/gm, '$1 default$2');
	}

	// Remove View imports
	tsText = tsText.replace(
		new RegExp('^\\s*import\\s+' + component.viewAnnotation + '\\s+.*\\r?$', 'gm'),
		''
	);

	// Remove @View annotations
	tsText = tsText.replace(new RegExp('^\\s*@' + component.viewAnnotation + '\\r?$', 'gm'), '');

	const prettierConf = prettier.resolveConfig.sync(vueFilename)!;
	prettierConf.parser = 'vue';
	let prettyText = prettier.format(templateText, prettierConf);
	if (mode !== 'dry') {
		fs.writeFileSync(vueFilename, prettyText);
	}

	prettierConf.parser = 'typescript';
	prettyText = prettier.format(tsText, prettierConf);
	if (mode !== 'dry') {
		const newName = mode === 'execute' ? component.ts : component.ts + '.new.ts';
		fs.writeFileSync(newName, prettyText);
	}

	component.converted = true;

	for (let tsImportLine of resolvedTsImports[component.ts] || []) {
		if (!tsImportLine.expression) {
			console.warn(`Unhandled TS import line ${tsImportLine.line} in ${tsImportLine.from}`);
			continue;
		}

		let importName = '';
		if (!component.hasDefaultExport) {
			const importAsMatch = tsImportLine.expression.match(
				/^{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}$/
			);

			if (!importAsMatch) {
				console.warn(
					`Unhandled TS import line ${tsImportLine.line} in ${tsImportLine.from}`
				);
				continue;
			}
			importName = importAsMatch[1];
		} else {
			importName = tsImportLine.expression;
		}

		let importPath = '';
		if (
			tsImportLine.resolvesTo.startsWith(frontendLibDir) &&
			!tsImportLine.from.startsWith(frontendLibDir)
		) {
			importPath = tsImportLine.resolvesTo.replace(
				/^.*\/gj-lib-client\//,
				'game-jolt-frontend-lib/'
			);
			importPath = importPath.replace(/\.ts$/, '.vue');
		} else {
			importPath = path.relative(path.join(tsImportLine.from, '..'), vueFilename);
			if (!importPath.startsWith('../')) {
				importPath = './' + importPath;
			}
		}

		const from =
			mode !== 'execute' && fs.existsSync(tsImportLine.from + '.new.ts')
				? tsImportLine.from + '.new.ts'
				: tsImportLine.from;

		let importingFileText = fs.readFileSync(from, 'utf8');
		const newImportLine = `import ${importName} from '${importPath}'`;
		importingFileText = importingFileText.replace(tsImportLine.line, newImportLine);
		if (mode !== 'dry') {
			const newName = mode === 'execute' ? tsImportLine.from : tsImportLine.from + '.new.ts';
			fs.writeFileSync(newName, importingFileText);
		}
	}
}
