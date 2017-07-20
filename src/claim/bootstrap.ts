import '../lib/gj-lib-client/utils/polyfills';

// This has to go first so the popstate event gets attached first.
import { History } from '../lib/gj-lib-client/components/history/history.service';

import Vue from 'vue';

import { store } from './store/index';
import { router } from './views/index';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { App } from './app';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { bootstrapAppTranslations } from '../utils/translations';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';

Payload.init(store);
History.init(router);
Analytics.initRouter(router);
Connection.init(store);

export async function createApp() {
	await bootstrapAppTranslations();

	const app = new Vue({
		store: store as any,
		router,
		render: h => h(App),
	});

	return { app, store, router };
}
