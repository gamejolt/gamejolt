import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';
import { router } from './views/index';

export function createApp() {
	const { app } = bootstrapCommon(App, router);

	// TODO(vue3): gotta make createApp async to support this
	if (GJ_IS_DESKTOP_APP) {
		// import('../_common/client/bootstrap').then(({ bootstrapCommonClient }) => {
		// 	bootstrapCommonClient({ commonStore });
		// });
	}

	return { app, router };
}
