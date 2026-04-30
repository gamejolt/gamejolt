import '~client/main.styl';

import { createClientRouter } from '~client/views/index';
import { bootstrapCommon } from '~common/bootstrap';

export async function createApp() {
	const router = createClientRouter();

	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~client/AppMain.vue')).default,
		router,
	});

	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapCommonClient } = await import('~common/client/bootstrap');
		const { commonStore } = await import('~common/store/common-store');
		bootstrapCommonClient({ commonStore });
	}

	return { app, router };
}
