import '~widget-package/main.styl';

import { bootstrapCommon } from '~common/bootstrap';
import { createWidgetPackageStore, WidgetPackageStoreKey } from '~widget-package/store';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~widget-package/AppMain.vue')).default,
	});

	app.provide(WidgetPackageStoreKey, createWidgetPackageStore());

	return { app };
}
