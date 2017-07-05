import '../lib/gj-lib-client/utils/polyfills';

// This has to go first so the popstate event gets attached first.
import { History } from '../lib/gj-lib-client/components/history/history.service';

import Vue from 'vue';
const VueGettext = require('vue-gettext');

import { store } from './store/index';
import { router } from './views/index';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { App } from './app';
import { Translate } from '../lib/gj-lib-client/components/translate/translate.service';
import { bootstrapShortkey } from '../lib/gj-lib-client/vue/shortkey';
import { Scroll } from '../lib/gj-lib-client/components/scroll/scroll.service';
import { Registry } from '../lib/gj-lib-client/components/registry/registry.service';
import { GamePlayModal } from '../lib/gj-lib-client/components/game/play-modal/play-modal.service';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { Ads } from '../lib/gj-lib-client/components/ad/ads.service';

Payload.init(store as any, router);
History.init(router);
Analytics.initRouter(router);
Ads.init(router);

if (GJ_IS_CLIENT) {
	// require( './bootstrap-client' );
}

GamePlayModal.init({ canMinimize: true });
bootstrapShortkey();

Registry.setConfig('Game', { maxItems: 100 });
Registry.setConfig('FiresidePost', { maxItems: 50 });
Registry.setConfig('User', { maxItems: 100 });

// Match this to the shell top nav height.
Scroll.setOffsetTop(50);

const availableLanguages: any = {};
for (const lang of Translate.langs) {
	availableLanguages[lang.code] = lang.label;
}

Vue.use(VueGettext, {
	silent: true,
	availableLanguages,
	defaultLanguage: Translate.lang,
	translations: {
		en: Object.assign(
			{},
			require(`!!../translations/en_US/main.json`).en_US,
			require(`!!../translations/en_US/dash.json`).en_US
		),
	},
});

const app = new Vue({
	store: store as any,
	router,
	render: h => h(App),
});

export { app, store, router };
