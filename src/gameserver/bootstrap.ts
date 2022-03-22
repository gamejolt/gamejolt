import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';
import { createGameserverStore, GameserverStoreKey } from './store';

export async function createApp() {
	const { app } = await bootstrapCommon(App);

	app.provide(GameserverStoreKey, createGameserverStore());

	return { app };
}
