import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { Referrer } from 'game-jolt-frontend-lib/components/referrer/referrer.service';
import 'game-jolt-frontend-lib/utils/polyfills';
import Vue from 'vue';
import { bootstrapAppTranslations } from '../utils/translations';
import { App } from './app';
import './main.styl';
import { store } from './store/index';
import { router } from './views/index';

const _createApp = () => {
	bootstrapAppTranslations();

	// Payload.init(store);

	if (router) {
		Meta.init(router);
		Referrer.init(router);
	}

	// Set some constants so we can use them in templates.
	Vue.use(vue => {
		const proto = vue.prototype as any;
		proto.GJ_SECTION = GJ_SECTION;
		proto.GJ_IS_CLIENT = GJ_IS_CLIENT;
		proto.GJ_IS_SSR = GJ_IS_SSR;
	});

	return new Vue({
		store,
		router,
		render: h => h(App),
	});
};

export function createApp() {
	return { app: _createApp(), store, router };
}
