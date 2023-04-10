import { readFile, writeFile } from 'fs-extra';
import * as path from 'path';
import { activateJsonProperty, updateJsonProperty } from './build/packageJson';
import { execShell } from './build/utils';

(async () => {
	const projectRootDir = path.resolve(__dirname, '..');

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

	// Intended values for main and node-remote keys.
	const propertyMain = 'https://development.gamejolt.com';
	const propertyNodeRemote = 'https://development.gamejolt.com';

	let newPackageJsonStr = updateJsonProperty(oldPackageJsonStr, 'main', propertyMain);
	newPackageJsonStr = activateJsonProperty(newPackageJsonStr, 'node-remote');
	newPackageJsonStr = updateJsonProperty(newPackageJsonStr, 'node-remote', propertyNodeRemote);

	if (newPackageJsonStr === oldPackageJsonStr) {
		return;
	}

	console.log('Preparing package.json for commit');
	await writeFile(packageJsonPath, newPackageJsonStr);
	await execShell('git add package.json', { cwd: projectRootDir });
	await writeFile(packageJsonPath, oldPackageJsonStr);
})();
