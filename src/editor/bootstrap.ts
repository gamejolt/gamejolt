import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';

export function createApp() {
	const { app } = bootstrapCommon(App);

	return { app };
}
