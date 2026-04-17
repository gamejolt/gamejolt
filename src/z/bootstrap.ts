import '~styles/tailwind.css';
import '~z/main.styl';

import { bootstrapCommon } from '~common/bootstrap';
import { router } from '~z/views/index';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~z/AppMain.vue')).default,
		router,
	});

	return { app, router };
}
