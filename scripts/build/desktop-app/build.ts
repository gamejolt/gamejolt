import * as fs from 'fs-extra';
import { gjSectionConfigs, GjSectionName } from '../section-config';
import { createTarGz, isWindows, packageJson, runShell } from '../utils';
import { Options } from '../vite-options';
import { Gjpush } from './gjpush';
import { buildJoltron, ensureJoltronCloned, restructureProject } from './joltron';
import { NwBuilder } from './nwjs-builder';

const path = require('path') as typeof import('path');

const rootDir = path.resolve(__dirname, '..', '..', '..');

const clientSections = Object.entries(gjSectionConfigs)
	.filter(([k, v]) => v.desktopApp)
	.map(([k, v]) => k as GjSectionName);

export type ClientBuildOptions = {
	environment: Options['environment'];
	buildType: Options['buildType'];
};

export async function buildClient(config: ClientBuildOptions) {
	const frontendBuildDir = path.join(rootDir, 'build', 'desktop');

	// Clean the build folder to start fresh.
	console.log('Cleaning up old client build dir');
	await fs.remove(frontendBuildDir);

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

		GJ_ENVIRONMENT: config.environment,
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
	environment: Options['environment'];

	/** Whether to produce a staging build. */
	staging: boolean;

	/** True if to push the build to Game Jolt */
	pushBuild: boolean;

	/** True if to disable using cache for some things. False by default. */
	noCache?: boolean;
};

export async function packageClient(config: ClientPackageOptions) {
	const gameId = config.environment === 'development' ? 1000 : 362412;
	let packageId: number;
	let installerPackageId: number;

	if (config.environment === 'development') {
		if (!config.staging) {
			packageId = 1001;
			installerPackageId = 1000;
		} else {
			packageId = 1004;
			installerPackageId = 1003;
		}
	} else {
		if (!config.staging) {
			packageId = 376715;
			installerPackageId = 376713;
		} else {
			packageId = 428842;
			installerPackageId = 428840;
		}
	}

	const buildDir = path.join(rootDir, 'build');
	const cacheDir = path.join(buildDir, '.cache');
	const frontendBuildDir = path.join(buildDir, 'desktop');
	const clientBuildDir = path.join(buildDir, 'desktop-app');

	// Clean the build folder to start fresh.
	console.log('Cleaning up old nwjs build dir');
	await fs.remove(clientBuildDir);

	console.log('Building NW.js');
	const nwBuilder = new NwBuilder({
		packageJson,
		frontendBuildDir,
		clientBuildDir,
		cacheDir,
		useSdkVersion: config.environment === 'development' || config.staging,
		noCache: config.noCache,
	});

	await nwBuilder.build();

	const gjpush = new Gjpush({
		environment: config.environment,
		cacheDir,
		noCache: config.noCache,
	});

	let packageBuildId = 0;
	if (config.pushBuild) {
		await gjpush.ensureGjpush();

		console.log('Creating archive for package');
		const archiveBasename = `${nwBuilder.platformName}64-package.tar.gz`;
		const archiveFilepath = path.join(clientBuildDir, archiveBasename);
		await createTarGz(nwBuilder.buildDir, archiveFilepath);

		packageBuildId = await gjpush.push({ gameId, packageId, filepath: archiveFilepath });
	}

	await ensureJoltronCloned();
	await buildJoltron();
	const installerDir = await restructureProject({
		packageDir: nwBuilder.buildDir,
		packageId,
		packageBuildId,
		environment: config.environment,
	});

	// await createInstaller();

	// if (config.pushBuild) {
	// 	await pushInstaller();
	// }

	// console.log('Done with client build.');
}
