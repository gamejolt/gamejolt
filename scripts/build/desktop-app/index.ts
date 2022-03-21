import { buildClient, packageClient } from './build';

(async () => {
	if (process.argv.includes('--build')) {
		await buildClient({ buildType: 'production' });
	}
	if (process.argv.includes('--package')) {
		await packageClient({ useSdkVersion: true });
	}
})();
