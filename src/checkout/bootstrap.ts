import '~checkout/main.styl';

import { createCheckoutRouter } from '~checkout/views/index';
import { bootstrapCommon } from '~common/bootstrap';

export async function createApp() {
	const router = createCheckoutRouter();

	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~checkout/AppMain.vue')).default,
		router,
	});

	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapCommonClient } = await import('~common/client/bootstrap');
		const { commonStore } = await import('~common/store/common-store');
		bootstrapCommonClient({ commonStore });
	}

	return { app, router };
}
