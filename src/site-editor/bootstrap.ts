import '~site-editor/main.styl';

import { bootstrapCommon } from '~common/bootstrap';
import { createSiteEditorStore, SiteEditorStoreKey } from '~site-editor/store';
import { createSiteEditorRouter } from '~site-editor/views/index';

export async function createApp() {
	const router = createSiteEditorRouter();

	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~site-editor/AppMain.vue')).default,
		router,
	});

	app.provide(SiteEditorStoreKey, createSiteEditorStore());

	return { app, router };
}
