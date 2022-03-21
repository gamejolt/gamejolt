import * as fs from 'fs-extra';
import { gjSectionConfigs, GjSectionName } from '../section-config';
import { packageJson, runShell } from '../utils';
import { Options } from '../vite-options';
import { NwBuilder } from './nwjs-builder';

const path = require('path') as typeof import('path');

const rootDir = path.resolve(__dirname, '..', '..', '..');

const clientSections = Object.entries(gjSectionConfigs)
	.filter(([k, v]) => v.desktopApp)
	.map(([k, v]) => k as GjSectionName);

export type ClientBuildOptions = {
	buildType: Options['buildType'];
};

export async function buildClient(config: ClientBuildOptions) {
	const buildDir = path.join(rootDir, 'build', 'desktop');

	// Clean the build folder to start fresh.
	console.log('Cleaning up old client build dir');
	await fs.remove(buildDir);

	for (const section of clientSections) {
		await buildSection(section, config);
	}
}

async function buildSection(section: GjSectionName, config: ClientBuildOptions) {
	const crossEnvCmd = path.resolve(rootDir, 'node_modules', '.bin', 'cross-env');

	const envVars = Object.entries({
		// Avoid cleaning up the target build directory.
		// This lets us build multiple sections in the same dir.
		GJ_EMPTY_OUTDIR: 0,

		GJ_BUILD_TYPE: config.buildType,
		GJ_PLATFORM: 'desktop',
		GJ_SECTION: section,
	})
		.map(([k, v]) => `${k}=${v}`)
		.join(' ');

	console.log(`Building ${section} section`);
	await runShell(`${crossEnvCmd} ${envVars} yarn run build`);
}

export type ClientPackageOptions = {
	/** True if to use the sdk version for nwjs (enables devtools and debugging features) */
	useSdkVersion: boolean;
};

export async function packageClient(config: ClientPackageOptions) {
	const buildDir = path.join(rootDir, 'build', 'desktop');
	const clientBuildDir = `${buildDir}-nwjs`;
	const clientBuildCacheDir = `${clientBuildDir}-cache`;

	// Clean the build folder to start fresh.
	console.log('Cleaning up old nwjs build dir');
	await fs.remove(clientBuildDir);

	console.log('Building NW.js');
	const nwBuilder = new NwBuilder({
		packageJson,
		buildDir,
		clientBuildDir,
		clientBuildCacheDir,
		useSdkVersion: config.useSdkVersion,
	});

	await nwBuilder.build();

	// if (config.pushBuild) {
	// 	await getPushTools();
	// 	await pushPackage();
	// }

	// await getJoltron();
	// await setupJoltron();
	// await createInstaller();

	// if (config.pushBuild) {
	// 	await pushInstaller();
	// }

	// console.log('Done with client build.');
}
