import '../utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import App from './app.vue';
import './main.styl';
import { store } from './store/index';

export function createApp() {
	const app = bootstrapCommon(App, store);

	return { app, store };
}
