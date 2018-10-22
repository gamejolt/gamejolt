import { Ads } from '../lib/gj-lib-client/components/ad/ads.service';
import { GamePlayModal } from '../lib/gj-lib-client/components/game/play-modal/play-modal.service';
import { Registry } from '../lib/gj-lib-client/components/registry/registry.service';
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

Ads.init(router);

GamePlayModal.init({ canMinimize: true });
// bootstrapShortkey();

Registry.setConfig('Game', { maxItems: 100 });
Registry.setConfig('User', { maxItems: 150 });
Registry.setConfig('FiresidePost', { maxItems: 50 });
