import './main.styl';

import { bootstrapCommon } from '../_common/bootstrap';
import { createWidgetPackageStore, WidgetPackageStoreKey } from './store';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('./AppMain.vue')).default,
	});

	app.provide(WidgetPackageStoreKey, createWidgetPackageStore());

	return { app };
}
