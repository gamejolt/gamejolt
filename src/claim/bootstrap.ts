import '~styles/tailwind.css';
import '~claim/main.styl';

import { router } from '~claim/views/index';
import { bootstrapCommon } from '~common/bootstrap';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~claim/AppMain.vue')).default,
		router,
	});

	return { app, router };
}
