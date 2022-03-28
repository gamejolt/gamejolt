import { Options } from '../vite-options';
import { buildClient, packageClient } from './build';

(async () => {
	const environment: Options['environment'] = process.argv.includes('--development')
		? 'development'
		: 'production';

	const indexOfBuildType = process.argv.indexOf('--buildType');
	const buildType: 'production' | 'development' =
		indexOfBuildType != -1 ? (process.argv[indexOfBuildType + 1] as any) : 'production';
	if (buildType !== 'production' && buildType !== 'development') {
		throw new Error('Invalid value for --buildType. Expected production or development');
	}

	if (process.argv.includes('--build')) {
		await buildClient({ environment, buildType });
	}
	if (process.argv.includes('--package')) {
		await packageClient({
			environment,
			staging: process.argv.includes('--staging'),
			pushBuild: process.argv.includes('--push'),
		});
	}
})();
