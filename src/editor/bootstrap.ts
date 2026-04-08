import './main.styl';

import { bootstrapCommon } from '../_common/bootstrap';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('./AppMain.vue')).default,
	});

	return { app };
}
