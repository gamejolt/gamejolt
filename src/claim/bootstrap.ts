import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';
import { router } from './views/index';

export async function createApp() {
	const { app } = await bootstrapCommon(App, router);

	return { app, router };
}
