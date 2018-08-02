import Vue from 'vue';
import { VueRouter } from 'vue-router/types/router';
import { VuexStore } from '../lib/gj-lib-client/utils/vuex';
import { hijackLinks } from '../lib/gj-lib-client/utils/router';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { bootstrapAppTranslations } from '../utils/translations';
import { Referrer } from '../lib/gj-lib-client/components/referrer/referrer.service';
import { AppButton } from '../lib/gj-lib-client/components/button/button';
import { AppJolticon } from '../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Settings } from './settings/settings.service';

/**
 * Bootstraps common services and returns a "createApp" function that our entry point can call to
 * get what it needs.
 */
export function bootstrapCommon(appComponent: typeof Vue, store: VuexStore, router?: VueRouter) {
	if (store.state.theme) {
		store.commit('theme/setDark', Settings.get('theme-dark'));
		store.commit('theme/setAlwaysOurs', Settings.get('theme-always-ours'));
	}

	Payload.init(store);
	Connection.init(store);

	if (router) {
		Meta.init(router);
		Referrer.init(router);
		Analytics.initRouter(router);
		hijackLinks(router, 'gamejolt.com');
	}

	// Common components.
	Vue.component('AppButton', AppButton);
	Vue.component('AppJolticon', AppJolticon);

	// Set some constants so we can use them in templates.
	Vue.use(vue => {
		const proto = vue.prototype as any;
		proto.GJ_SECTION = GJ_SECTION;
		proto.GJ_IS_CLIENT = GJ_IS_CLIENT;
		proto.GJ_IS_SSR = GJ_IS_SSR;
	});

	return () => {
		bootstrapAppTranslations();

		return new Vue({
			store,
			router,
			render: h => h(appComponent),
		});
	};
}
