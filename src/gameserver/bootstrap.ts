import '~styles/tailwind.css';
import '~gameserver/main.styl';

import { bootstrapCommon } from '~common/bootstrap';
import { createGameserverStore, GameserverStoreKey } from '~gameserver/store';

export async function createApp() {
	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~gameserver/AppMain.vue')).default,
	});

	app.provide(GameserverStoreKey, createGameserverStore());

	return { app };
}
