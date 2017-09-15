import '../lib/gj-lib-client/utils/polyfills';
import './main.styl';

import Vue from 'vue';

import { store } from './store/index';
import { router } from './views/index';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { App } from './app';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { bootstrapAppTranslations } from '../utils/translations';

Payload.init(store);
Analytics.initRouter(router);

export function createApp() {
	bootstrapAppTranslations();

	const app = new Vue({
		store: store as any,
		router,
		render: h => h(App),
	});

	return { app, store, router };
}
