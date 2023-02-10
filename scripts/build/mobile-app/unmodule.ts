import * as fg from 'fast-glob';
import * as fs from 'fs-extra';

const path = require('path') as typeof import('path');

const buildDir = path.resolve(__dirname, '..', '..', '..', 'build', 'mobile');

async function main() {
	const editorHtmlPath = path.join(buildDir, 'editor.html');
	const files = await fg(path.join(buildDir, 'assets', 'editor-*.js'));

	if (files.length === 0) {
		throw new Error(`Could not find editor JS file.`);
	}
	if (files.length > 1) {
		throw new Error(`Found too many editor files. Something might be wrong.`);
	}

	const editorJsPath = files[0];

	// Vite builds a module by default. We need to convert this to a non-module JS
	// file.
	let editorHtml = await fs.readFile(editorHtmlPath, 'utf8');

	// Gotta replace the HTML import of the script tag to no longer be a module import.
	editorHtml = editorHtml.replace(`type="module" crossorigin`, `defer`);
	await fs.writeFile(editorHtmlPath, editorHtml, 'utf8');

	let editorJs = await fs.readFile(editorJsPath, 'utf8');

	// Wrap in a function that will execute immediately.
	editorJs = '(function() {' + editorJs + '})();';

	// Replace all instances of `import.meta.url` since it only works in a
	// module context.
	editorJs = editorJs.replace(/import\.meta\.url/g, 'window.location.href');

	await fs.writeFile(editorJsPath, editorJs, 'utf8');

	console.log('Unmoduled editor.');
}

main();
