import { remove } from 'fs-extra';
import * as path from 'path';
import { gjSectionConfigs, GjSectionName } from '../section-config';
import { createTarGz, packageJson, runShell } from '../utils';
import { Options } from '../vite-options';
import { Gjpush } from './gjpush';
import { buildJoltron, createInstaller, ensureJoltronCloned, restructureProject } from './joltron';
import { NwBuilder } from './nwjs-builder';

const rootDir = path.resolve(__dirname, '..', '..', '..');

const clientSections = Object.entries(gjSectionConfigs)
	.filter(([_k, v]) => v.desktopApp)
	.map(([k, _v]) => k as GjSectionName);

export type ClientBuildOptions = {
	environment: Options['environment'];

	/** The build type to do */
	buildType: 'build' | 'serve-build';

	/** Whether to produce a staging build. */
	staging: boolean;
};

export async function buildClient(options: ClientBuildOptions) {
	const frontendBuildDir = path.join(rootDir, 'build', 'desktop');

	// Clean the build folder to start fresh.
	console.log('Cleaning up old client build dir');
	await remove(frontendBuildDir);

	for (const section of clientSections) {
		await buildSection(section, options);
	}
}

async function buildSection(section: GjSectionName, options: ClientBuildOptions) {
	console.log(`Building ${section} section`);
	await runShell(
		`yarn build --no-empty-outdir --platform desktop` +
			` --environment ${options.environment}` +
			` --build-type ${options.buildType}` +
			` --section ${section}` +
			`${options.staging ? ' --staging' : ''}`
	);
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

export async function packageClient(options: ClientPackageOptions) {
	const gameId = options.environment === 'development' ? 1000 : 362412;
	let packageId: number;
	let installerPackageId: number;

	if (options.environment === 'development') {
		if (!options.staging) {
			packageId = 1001;
			installerPackageId = 1000;
		} else {
			packageId = 1004;
			installerPackageId = 1003;
		}
	} else {
		if (!options.staging) {
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
	await remove(clientBuildDir);

	console.log('Building NW.js');
	const nwBuilder = new NwBuilder({
		packageJson,
		frontendBuildDir,
		clientBuildDir,
		cacheDir,
		useSdkVersion: options.environment === 'development' || options.staging,
		noCache: options.noCache,
	});

	await nwBuilder.build();

	const gjpush = new Gjpush({
		environment: options.environment,
		cacheDir,
		noCache: options.noCache,
	});

	let packageBuildId = 0;
	if (options.pushBuild) {
		await gjpush.ensureGjpush();

		console.log('Creating archive for package');
		const archiveBasename = `${nwBuilder.platformName}64-package.tar.gz`;
		const archiveFilepath = path.join(clientBuildDir, archiveBasename);
		await createTarGz(nwBuilder.buildDir, archiveFilepath);

		packageBuildId = await gjpush.push({ gameId, packageId, filepath: archiveFilepath });
	}

	await ensureJoltronCloned();
	await buildJoltron({ environment: options.environment });

	const installerDir = await restructureProject({
		packageDir: nwBuilder.buildDir,
		packageId,
		packageBuildId,
		environment: options.environment,
	});

	const installerFilepath = await createInstaller({
		installerDir,
		outDir: clientBuildDir,
		environment: options.environment,
		staging: options.staging,
	});

	if (options.pushBuild) {
		await gjpush.push({ gameId, packageId: installerPackageId, filepath: installerFilepath });
	}

	console.log('Done with client build.');
}
