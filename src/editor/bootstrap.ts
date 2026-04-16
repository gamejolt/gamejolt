import '~editor/main.styl';

import { bootstrapCommon } from '~common/bootstrap';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~editor/AppMain.vue')).default,
	});

	return { app };
}
