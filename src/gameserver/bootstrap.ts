import '../utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';
import { createGameserverStore, GameserverStoreKey } from './store';

export function createApp() {
	const { app } = bootstrapCommon(App);

	app.provide(GameserverStoreKey, createGameserverStore());

	return { app };
}
