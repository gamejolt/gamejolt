import { buildClient, packageClient } from './build';

(async () => {
	if (process.argv.includes('--build')) {
		await buildClient({ buildType: 'production' });
	}
	if (process.argv.includes('--package')) {
		await packageClient({ environment: 'development', staging: false, pushBuild: true });
	}
})();
