import { bootstrapCommon } from '../_common/bootstrap';
import AppMain from './AppMain.vue';
import './main.styl';
import { authStore, AuthStoreKey } from './store';
import { router } from './views/index';

export async function createApp() {
	const { app } = bootstrapCommon(AppMain, router);

	app.provide(AuthStoreKey, authStore);

	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapCommonClient } = await import('../_common/client/bootstrap');
		const { commonStore } = await import('../_common/store/common-store');
		bootstrapCommonClient({ commonStore });
	}

	return { app, router };
}
