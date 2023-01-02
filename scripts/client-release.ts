import { readFile, writeFile } from 'fs-extra';
import * as path from 'path';
import { execShell, runShell } from './build/utils';

const { version } = require('../package.json');
const argv = process.argv;

main();

async function main() {
	console.log('Current version:', version);

	const branch = (await execShell('git branch --show-current')).trim();
	console.log('Current branch:', branch);

	if (branch !== 'main') {
		throw new Error(`You must be on the main branch to release.`);
	}

	const operations = ['major', 'minor', 'patch', 'prod'];
	const operation = operations.find(i => argv.includes(i));
	if (!operation) {
		throw new Error(`You must specify a valid operation: ${operations}`);
	} else if (operation === 'prod' && !version.endsWith('-stage')) {
		throw new Error(
			`You can't release a production build from a production build. Make a staging release and test it first, and then release the production build from that.`
		);
	}

	const newVersion = bump(version, operation);
	console.log(`Will be bumping version to:`, newVersion);

	const packageFile = path.resolve(__dirname, '../package.json');
	let packageJson = await readFile(packageFile, { encoding: 'utf8' });

	packageJson = packageJson.replace(/"version": "(.*?)",/, `"version": "${newVersion}",`);

	await writeFile(packageFile, packageJson, { encoding: 'utf8' });

	await runShell('git add', { args: [packageFile] });
	await runShell(`git commit -m "Release: ${newVersion}"`);
	await runShell('git tag', { args: [`release/${newVersion}`] });
	await runShell('git push');
	await runShell('git push', { args: ['origin', `release/${newVersion}`] });

	console.log(`Version has been bumped to: ${newVersion}`);
}

function bump(version, operation) {
	const match = version.match(/^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?<tag>-.*)?$/);
	if (!match || !match.groups) {
		throw new Error('Invalid looking semver.');
	}

	const groups = match.groups;
	let major = groups.major;
	let minor = groups.minor;
	let patch = groups.patch;
	let tag = groups.tag || '';

	switch (operation) {
		case 'patch':
			patch++;
			tag = '-stage';
			break;
		case 'minor':
			patch = 0;
			minor++;
			tag = '-stage';
			break;
		case 'major':
			patch = 0;
			minor = 0;
			major++;
			tag = '-stage';
			break;
		case 'prod':
			tag = '';
			break;
		default:
			throw new Error('Unsupported operation');
	}

	return major + '.' + minor + '.' + patch + tag;
}
