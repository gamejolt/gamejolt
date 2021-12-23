const { runShell } = require('../gulp/tasks/build-utils');
const { version } = require('../package.json');
const path = require('path');
const { readFile, writeFile } = require('fs-extra');

const argv = process.argv;

main();

async function main() {
	console.log('Current version:', version);

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
	await runShell('git commit', { args: ['-m', `Release: ${newVersion}`] });
	await runShell('git tag', `release/${newVersion}`);
	// await runShell('git push origin --tags');

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
