const fs = require('fs-extra');
const readdirp = require('readdirp');
const path = require('path');

// <script lang="ts" src="./account"></script>
const SCRIPT_REGEX = /<script lang="ts" src="(.*?)"><\/script>/;

const base = path.resolve(__dirname, '../src');

main();

async function main() {
	// const files = (await readdirp.promise(buildDir))
	// 	.map(i => './' + i.path.replace(/\\/g, '/'))
	// 	.sort();

	let i = 0;

	for await (const entry of readdirp(base, { fileFilter: '*.vue' })) {
		const { fullPath } = entry;

		let contents = await fs.readFile(fullPath, { encoding: 'utf8' });

		console.log(`${fullPath}`);
		console.log(`  | Finding typescript`);

		const match = contents.match(SCRIPT_REGEX);
		if (!match) {
			console.log(`  !!! Couldn't find match`);
			continue;
		}

		let tsPath = match[1];
		if (!tsPath.endsWith('.ts')) {
			tsPath += '.ts';
		}

		if (tsPath.includes('..')) {
			console.log(`  !!! Typescript file is not in the same directory as Vue file`);
			continue;
		}

		tsPath = path.resolve(path.dirname(fullPath), tsPath);

		let tsContents = '';
		try {
			tsContents = await fs.readFile(tsPath, { encoding: 'utf8' });
		} catch (e) {
			console.log(`  !!! Couldn't get contents of typescript file`);
			continue;
		}

		contents = contents.replace(SCRIPT_REGEX, '').trim();
		contents = `<script lang="ts">\n${tsContents}</script>\n\n${contents}\n`;

		await fs.writeFile(fullPath, contents);
		await fs.remove(tsPath);

		console.log(`  - DONE`);
	}
}
