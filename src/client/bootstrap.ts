import '../lib/gj-lib-client/utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import { App } from './app';
import './main.styl';
import { store } from './store/index';
import { router } from './views/index';

export const createApp = bootstrapCommon(store, router, App);

if (GJ_IS_CLIENT) {
	require('./bootstrap-client');
}
