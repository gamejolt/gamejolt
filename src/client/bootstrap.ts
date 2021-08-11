import '../utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import App from './app.vue';
import './main.styl';
import { store } from './store/index';
import { router } from './views/index';

export function createApp() {
	const app = bootstrapCommon(App, store, router);

	return { app, store, router };
}

if (GJ_IS_CLIENT) {
	require('./bootstrap-client');
}
