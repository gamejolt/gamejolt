import '../lib/gj-lib-client/utils/polyfills';
import './main.styl';

import { store } from './store/index';
import { router } from './views/index';
import { App } from './app';
import { bootstrapShortkey } from '../lib/gj-lib-client/vue/shortkey';
import { Registry } from '../lib/gj-lib-client/components/registry/registry.service';
import { GamePlayModal } from '../lib/gj-lib-client/components/game/play-modal/play-modal.service';
import { Ads } from '../lib/gj-lib-client/components/ad/ads.service';
import { bootstrapCommon } from '../_common/bootstrap';

export const createApp = bootstrapCommon(App, store, router);

if (GJ_IS_CLIENT) {
	require('./bootstrap-client');
}

Ads.init(router);

GamePlayModal.init({ canMinimize: true });
bootstrapShortkey();

Registry.setConfig('Game', { maxItems: 100 });
Registry.setConfig('FiresidePost', { maxItems: 50 });
