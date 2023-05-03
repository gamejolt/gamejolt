import * as fs from 'fs-extra';
import * as path from 'path';
import { gjSectionConfigs, GjSectionName } from '../section-config';
import { runShell } from '../utils';

const rootDir = path.resolve(__dirname, '..', '..', '..');

main();

async function main() {
	const frontendBuildDir = path.join(rootDir, 'build', 'web');
	const ssrBuildDir = path.join(rootDir, 'build', 'ssr');

	// Clean the build folder to start fresh.
	console.log('Cleaning up old build dirs');
	await fs.remove(frontendBuildDir);
	await fs.remove(ssrBuildDir);

	// const slowly = process.argv.includes('--slowly');

	// if (!slowly) {
	console.log('Building in parallel');

	await Promise.all(
		Object.keys(gjSectionConfigs).flatMap((section: GjSectionName) => {
			const sectionBuilds = [buildSection(section)];

			if (gjSectionConfigs[section].ssr) {
				sectionBuilds.push(buildSection(section, true));
			}

			return sectionBuilds;
		})
	);
	// } else {
	// 	console.log('Building sequentially');

	// 	for (const section in gjSectionConfigs) {
	// 		await buildSection(section);

	// 		if (gjSectionConfigs[section].ssr) {
	// 			await buildSection(section, true);
	// 		}
	// 	}
	// }

	// // It builds within gamejolt folder, so move the build up one directory.
	// await fs.remove(projectBuildDir);
	// await fs.move(gamejoltBuildDir, projectBuildDir);
}

async function buildSection(section: string, ssr = false) {
	const platform = ssr ? 'ssr' : 'web';

	await runShell(
		`yarn build --no-empty-outdir` +
			` --environment production` +
			` --platform ${platform}` +
			` --section ${section}`
	);
}
