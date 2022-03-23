import { bootstrapCommon } from '../_common/bootstrap';
import './main.styl';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('./AppMain.vue')).default,
	});

	return { app };
}
