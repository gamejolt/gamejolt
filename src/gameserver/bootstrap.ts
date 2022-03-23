import { bootstrapCommon } from '../_common/bootstrap';
import './main.styl';
import { createGameserverStore, GameserverStoreKey } from './store';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('./AppMain.vue')).default,
	});

	app.provide(GameserverStoreKey, createGameserverStore());

	return { app };
}
