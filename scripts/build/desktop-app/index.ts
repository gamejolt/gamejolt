import { Options } from '../vite-options';
import { buildClient, packageClient } from './build';

(async () => {
	const environment: Options['environment'] = process.argv.includes('--development')
		? 'development'
		: 'production';

	if (process.argv.includes('--build')) {
		await buildClient({
			environment,
			buildType: process.argv.includes('--serve') ? 'serve-build' : 'build',
			staging: process.argv.includes('--staging'),
		});
	}
	if (process.argv.includes('--package')) {
		await packageClient({
			environment,
			staging: process.argv.includes('--staging'),
			pushBuild: process.argv.includes('--push'),
		});
	}
})();
