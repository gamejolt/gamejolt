import { remove } from 'fs-extra';
import * as path from 'path';
import { gjSectionConfigs, GjSectionName } from '../section-config';
import { runShell } from '../utils';

const rootDir = path.resolve(__dirname, '..', '..', '..');

const sectionsToBuild = Object.entries(gjSectionConfigs)
	.filter(([_k, v]) => v.webApp || v.ssr)
	.map(([k, _v]) => k as GjSectionName);

export async function buildWebAndSSR() {
	const frontendBuildDir = path.join(rootDir, 'build', 'web');

	// Clean the build folder to start fresh.
	console.log('Cleaning up old web build dir');
	await remove(frontendBuildDir);

	const buildPromises: Promise<void>[] = [];
	for (const sectionName of sectionsToBuild) {
		const section = gjSectionConfigs[sectionName];

		if (section.webApp) {
			buildPromises.push(buildSection(sectionName, { platform: 'web' }));
		}

		if (section.ssr) {
			buildPromises.push(buildSection(sectionName, { platform: 'ssr' }));
		}
	}
	await Promise.all(buildPromises);
}

type BuildSectionOptions = {
	platform: 'web' | 'ssr';
};

async function buildSection(section: GjSectionName, options: BuildSectionOptions) {
	console.log(`Building ${section} section`);

	await runShell(
		`yarn build --no-empty-outdir --platform ${options.platform}` +
			` --environment production` +
			` --build-type build` +
			` --section ${section}`
	);
}
