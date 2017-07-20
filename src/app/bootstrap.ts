import '../lib/gj-lib-client/utils/polyfills';

// This has to go first so the popstate event gets attached first.
import { History } from '../lib/gj-lib-client/components/history/history.service';

import Vue from 'vue';

import { store } from './store/index';
import { router } from './views/index';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { App } from './app';
import { bootstrapShortkey } from '../lib/gj-lib-client/vue/shortkey';
import { Scroll } from '../lib/gj-lib-client/components/scroll/scroll.service';
import { Registry } from '../lib/gj-lib-client/components/registry/registry.service';
import { GamePlayModal } from '../lib/gj-lib-client/components/game/play-modal/play-modal.service';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { Ads } from '../lib/gj-lib-client/components/ad/ads.service';
import { bootstrapAppTranslations } from '../utils/translations';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';

if (GJ_IS_CLIENT) {
	// require( './bootstrap-client' );
}

Payload.init(store);
History.init(router);
Analytics.initRouter(router);
Ads.init(router);
Connection.init(store);

GamePlayModal.init({ canMinimize: true });
bootstrapShortkey();

Registry.setConfig('Game', { maxItems: 100 });
Registry.setConfig('FiresidePost', { maxItems: 50 });
Registry.setConfig('User', { maxItems: 100 });

// Match this to the shell top nav height.
Scroll.setOffsetTop(50);

export async function createApp() {
	await bootstrapAppTranslations();

	const app = new Vue({
		store: store as any,
		router,
		render: h => h(App),
	});

	return { app, store, router };
}
