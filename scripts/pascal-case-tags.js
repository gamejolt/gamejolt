const fs = require('fs-extra');
const readdirp = require('readdirp');
const path = require('path');

const base = path.resolve(__dirname, '../src');

main();

async function main() {
	let i = 0;

	for await (const entry of readdirp(base, { fileFilter: '*.vue' })) {
		const { fullPath } = entry;

		let contents = await fs.readFile(fullPath, { encoding: 'utf8' });

		console.log(`${fullPath}`);

		console.log(`  | Opening tags`);
		const openingMatches = contents.match(/<app-([a-z-]+)/g);
		if (openingMatches) {
			for (let match of openingMatches) {
				const newTag = match
					.replace(/-\w/g, text => text.replace(/-/, '').toUpperCase())
					.replace(/^<\w/, text => text.toUpperCase());
				console.log('old tag', match);
				console.log('new tag', newTag);
				contents = contents.replace(match, newTag);
			}
		}

		console.log(`  | Closing tags`);
		const closingMatches = contents.match(/<\/app-([a-z-]+)/g);
		if (closingMatches) {
			for (let match of closingMatches) {
				const newTag = match
					.replace(/-\w/g, text => text.replace(/-/, '').toUpperCase())
					.replace(/^<\/\w/, text => text.toUpperCase());
				console.log('old tag', match);
				console.log('new tag', newTag);
				contents = contents.replace(match, newTag);
			}
		}

		console.log(`  | Form tags`);
		const formMatches = contents.match(/<form-([a-z-]+)/g);
		if (formMatches) {
			for (let match of formMatches) {
				const newTag = match
					.replace(/-\w/g, text => text.replace(/-/, '').toUpperCase())
					.replace(/^<\w/, text => text.toUpperCase());
				console.log('old tag', match);
				console.log('new tag', newTag);
				contents = contents.replace(match, newTag);
			}
		}

		console.log(`  | Translate tags`);
		contents = contents.replace(/<translate/g, '<AppTranslate');
		contents = contents.replace(/<\/translate>/g, '</AppTranslate>');

		await fs.writeFile(fullPath, contents);

		console.log(`  - DONE`);
	}
}
