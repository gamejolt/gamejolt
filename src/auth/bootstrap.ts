import '~auth/main.styl';

import { AuthStoreKey, createAuthStore } from '~auth/store';
import { createAuthRouter } from '~auth/views/index';
import { bootstrapCommon } from '~common/bootstrap';

export async function createApp() {
	const router = createAuthRouter();

	const { app, commonStore } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~auth/AppMain.vue')).default,
		router,
	});

	const authStore = createAuthStore();
	app.provide(AuthStoreKey, authStore);

	// Toggle the cover image based on the current route's meta. Registered
	// here so it runs against the per-request router + authStore pair.
	router.beforeEach(to => {
		if (to.matched.some(record => record.meta.hideCoverImage)) {
			authStore.hideCoverImage();
		} else {
			authStore.showCoverImage();
		}
	});

	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapCommonClient } = await import('~common/client/bootstrap');
		bootstrapCommonClient({ commonStore });
	}

	return { app, router };
}
