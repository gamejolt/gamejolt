import '../utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import App from './app.vue';
import './main.styl';
import { store } from './store/index';

const _createApp = bootstrapCommon(App, store);
export function createApp() {
	return { app: _createApp(), store };
}
