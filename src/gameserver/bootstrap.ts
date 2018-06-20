import '../lib/gj-lib-client/utils/polyfills';
import './main.styl';

import { store } from './store/index';
import { App } from './app';
import { bootstrapCommon } from '../_common/bootstrap';

const _createApp = bootstrapCommon(App, store);
export function createApp() {
	return { app: _createApp(), store };
}
