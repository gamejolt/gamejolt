import '~claim/main.styl';

import { createClaimRouter } from '~claim/views/index';
import { bootstrapCommon } from '~common/bootstrap';
import { createGamePlayStore, GamePlayStoreKey } from '~common/game/play-modal/play-modal.service';

export async function createApp() {
	const router = createClaimRouter();

	const { app } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~claim/AppMain.vue')).default,
		router,
	});

	app.provide(GamePlayStoreKey, createGamePlayStore({ canMinimize: false }));

	return { app, router };
}
