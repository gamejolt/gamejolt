import '~styles/tailwind.css';
import '~auth/main.styl';

import { authStore, AuthStoreKey } from '~auth/store';
import { router } from '~auth/views/index';
import { bootstrapCommon } from '~common/bootstrap';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~auth/AppMain.vue')).default,
		router,
	});

	app.provide(AuthStoreKey, authStore);

	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapCommonClient } = await import('~common/client/bootstrap');
		const { commonStore } = await import('~common/store/common-store');
		bootstrapCommonClient({ commonStore });
	}

	return { app, router };
}
