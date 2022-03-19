import * as fs from 'fs-extra';
import { packageJson } from '../utils';
import { NwBuilder } from './nwjs';

const path = require('path') as typeof import('path');

export type ClientBuildOptions = {
	/** True if to use the sdk version for nwjs (enables devtools and debugging features) */
	useSdkVersion: boolean;
};

export async function buildClient(config: ClientBuildOptions) {
	const rootDir = path.resolve(__dirname, '..', '..', '..');

	const buildDir = path.join(rootDir, 'build', 'desktop-app');
	const clientBuildDir = `${buildDir}-nwjs`;
	const clientBuildCacheDir = `${clientBuildDir}-cache`;

	// Clean the build folder to start fresh.
	console.log('Cleaning up old client build dir');
	await fs.remove(clientBuildDir);

	console.log('Building NW.js');
	const nwBuilder = new NwBuilder({
		packageJson,
		buildDir,
		clientBuildDir,
		clientBuildCacheDir,
		useSdkVersion: true,
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
