import { Analytics } from 'game-jolt-frontend-lib/components/analytics/analytics.service';
import AppButton from 'game-jolt-frontend-lib/components/button/button.vue';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import { Payload } from 'game-jolt-frontend-lib/components/payload/payload-service';
import { Referrer } from 'game-jolt-frontend-lib/components/referrer/referrer.service';
import { hijackLinks } from 'game-jolt-frontend-lib/utils/router';
import { VuexStore } from 'game-jolt-frontend-lib/utils/vuex';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { VueRouter } from 'vue-router/types/router';
import AppExternalLink from '../lib/gj-lib-client/vue/components/external-link/external-link.vue';
import { bootstrapAppTranslations } from '../utils/translations';
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
