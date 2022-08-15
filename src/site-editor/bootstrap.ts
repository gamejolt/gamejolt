import { bootstrapCommon } from '../_common/bootstrap';
import './main.styl';
import { createSiteEditorStore, SiteEditorStoreKey } from './store';
import { router } from './views/index';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('./AppMain.vue')).default,
		router,
	});

	app.provide(SiteEditorStoreKey, createSiteEditorStore());

	return { app, router };
}
