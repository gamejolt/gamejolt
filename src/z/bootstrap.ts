import '~z/main.styl';

import { bootstrapCommon } from '~common/bootstrap';
import { createZRouter } from '~z/views/index';

export async function createApp() {
	const router = createZRouter();

	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~z/AppMain.vue')).default,
		router,
	});

	return { app, router };
}
