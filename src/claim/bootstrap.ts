import { bootstrapCommon } from '../_common/bootstrap';
import './main.styl';
import { router } from './views/index';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('./AppMain.vue')).default,
		router,
	});

	return { app, router };
}
