import { readFile, writeFile } from 'fs-extra';
import * as path from 'path';
import { execShell } from './build/utils';

// Intended values for main and node-remote keys.
const propertyMain = 'https://development.gamejolt.com/';
const propertyNodeRemote = 'https://development.gamejolt.com';

const projectRootDir = path.resolve(__dirname, '..');

(async () => {
	const gitOut = await execShell(
		'git diff --staged --name-only --no-color -- package.json 2>&1',
		{
			cwd: projectRootDir,
		}
	);

	const isStaged = gitOut.trim() === 'package.json';
	if (!isStaged) {
		return;
	}

	const packageJsonPath = path.join(projectRootDir, 'package.json');
	const oldPackageJsonStr = await readFile(packageJsonPath, {
		encoding: 'utf8',
	});

	// Replace properties using a dumb string replace. stringifying json does
	// not preserve whitespace or quotation style. its easier to just monkey
	// patch a string like this.
	const newPackageJsonStr = oldPackageJsonStr
		.replace(
			/^(\s*['"]main['"]\s*:\s*['"]).*?(['"],?\s*)$/gim,
			(_match, before, after) => `${before}${propertyMain}${after}`
		)
		// Rename _node-remote property back to node-remote.
		.replace(
			/^(\s*['"])_node-remote(['"].*)$/gim,
			(_match, before, after) => `${before}node-remote${after}`
		)
		// Replace wrong value on node-remote property.
		.replace(
			/^(\s*['"]node-remote['"]\s*:\s*['"]).*?(['"],?\s*)$/gim,
			(_match, before, after) => `${before}${propertyNodeRemote}${after}`
		);

	if (newPackageJsonStr === oldPackageJsonStr) {
		return;
	}

	console.log('Preparing package.json for commit');
	await writeFile(packageJsonPath, newPackageJsonStr);
	await execShell('git add package.json', { cwd: projectRootDir });
	await writeFile(packageJsonPath, oldPackageJsonStr);
})();
