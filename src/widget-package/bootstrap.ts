import '../utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import App from './app.vue';
import './main.styl';

export function createApp() {
	const { app } = bootstrapCommon(App);

	return { app };
}
