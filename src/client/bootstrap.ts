import '../lib/gj-lib-client/utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import { App } from './app';
import './main.styl';
import { store } from './store/index';
import { router } from './views/index';

const _createApp = bootstrapCommon(App, store, router);
export function createApp() {
	return { app: _createApp(), store, router };
}

if (GJ_IS_CLIENT) {
	require('./bootstrap-client');
}
