import { bootstrapCommon } from '../_common/bootstrap';
import './main.styl';
import { router } from './views/index';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('./AppMain.vue')).default,
		router,
	});

	// TODO(vue3) If the checkout section needs some client specific functionality,
	// we may need to initialize client safe exports in the app bootstrap above.
	// Ask david about it.
	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapCommonClient } = await import('../_common/client/bootstrap');
		const { commonStore } = await import('../_common/store/common-store');
		bootstrapCommonClient({ commonStore });
	}

	return { app, router };
}
