import 'game-jolt-frontend-lib/utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import App from './app.vue';
import './main.styl';
import { store } from './store/index';
import { router } from './views/index';

const _createApp = bootstrapCommon(App, store, router);
export function createApp() {
	return { app: _createApp(), store, router };
}
