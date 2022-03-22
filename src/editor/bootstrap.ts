import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';

export async function createApp() {
	const { app } = await bootstrapCommon(App);

	return { app };
}
