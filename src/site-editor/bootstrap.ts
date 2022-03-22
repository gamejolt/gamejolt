import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';
import { createSiteEditorStore, SiteEditorStoreKey } from './store';
import { router } from './views/index';

export async function createApp() {
	const { app } = await bootstrapCommon(App, router);

	app.provide(SiteEditorStoreKey, createSiteEditorStore());

	return { app, router };
}
