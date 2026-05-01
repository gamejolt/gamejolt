import '~client/main.styl';

import { createClientRouter } from '~client/views/index';
import { bootstrapCommon } from '~common/bootstrap';

export async function createApp() {
	const router = createClientRouter();

	const { app, commonStore } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~client/AppMain.vue')).default,
		router,
	});

	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapCommonClient } = await import('~common/client/bootstrap');
		bootstrapCommonClient({ commonStore });
	}

	return { app, router };
}
