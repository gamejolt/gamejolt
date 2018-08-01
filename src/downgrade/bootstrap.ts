import '../lib/gj-lib-client/utils/polyfills';
import './main.styl';

import { store } from './store/index';
import { router } from './views/index';
import { App } from './app';
import { bootstrapCommon } from '../_common/bootstrap';

export const createApp = bootstrapCommon(store, router, App);

if (GJ_IS_CLIENT) {
	require('./bootstrap-client');
}
