import Vue from 'vue';
import { VueRouter } from 'vue-router/types/router';
import { hijackLinks } from '../utils/router';
import { bootstrapAppTranslations } from '../utils/translations';
import { VuexStore } from '../utils/vuex';
import { Analytics } from './analytics/analytics.service';
import AppButton from './button/button.vue';
import { Connection } from './connection/connection-service';
import AppExternalLink from './external-link/external-link.vue';
import AppJolticon from './jolticon/jolticon';
import { Meta } from './meta/meta-service';
import { Navigate } from './navigate/navigate.service';
import { Payload } from './payload/payload-service';
import { Referrer } from './referrer/referrer.service';
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
		Navigate.init(router);
		hijackLinks(router, 'gamejolt.com');
	}

	// Common components.
	Vue.component('AppButton', AppButton);
	Vue.component('AppJolticon', AppJolticon);
	Vue.component('ExternalLink', AppExternalLink);

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
