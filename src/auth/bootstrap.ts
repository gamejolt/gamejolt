import '../lib/gj-lib-client/utils/polyfills';
import './main.styl';

import Vue from 'vue';

import { store } from './store/index';
import { router } from './views/index';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { App } from './app';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { bootstrapAppTranslations } from '../utils/translations';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';

Meta.init(router);
Payload.init(store);
Analytics.initRouter(router);
Connection.init(store);

export function createApp() {
	bootstrapAppTranslations();

	const app = new Vue({
		store,
		router,
		render: h => h(App),
	});

	return { app, store, router };
}
