import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';
import { router } from './views/index';

export function createApp() {
	const { app } = bootstrapCommon(App, router);

	return { app, router };
}
