import Vue from 'vue';
import { VueRouter } from 'vue-router/types/router';
import { hijackLinks } from '../utils/router';
import { bootstrapAppTranslations } from '../utils/translations';
import { VuexStore } from '../utils/vuex';
import { initAnalytics, initAnalyticsRouter } from './analytics/analytics.service';
import { AppTrackEvent } from './analytics/track-event.directive';
import AppButton from './button/button.vue';
import { ensureConfig } from './config/config.service';
import { Connection } from './connection/connection-service';
import AppJolticon from './jolticon/jolticon.vue';
import AppLinkExternal from './link/external/external.vue';
import AppLinkHelp from './link/help/help.vue';
import { Meta } from './meta/meta-service';
import { Payload } from './payload/payload-service';
import { Referrer } from './referrer/referrer.service';
import { SettingThemeAlwaysOurs, SettingThemeDark } from './settings/settings.service';

/**
 * Bootstraps common services and returns a "createApp" function that our entry point can call to
 * get what it needs.
 */
export function bootstrapCommon(appComponent: typeof Vue, store: VuexStore, router?: VueRouter) {
	// Try to start loading this as soon as possible.
	ensureConfig();

	if (store.state.theme) {
		store.commit('theme/setDark', SettingThemeDark.get());
		store.commit('theme/setAlwaysOurs', SettingThemeAlwaysOurs.get());
	}

	initAnalytics(store);
	Payload.init(store);
	Connection.init(store);

	if (router) {
		Meta.init(router);
		Referrer.init(router);
		initAnalyticsRouter(router);
		hijackLinks(router, 'gamejolt.com');
	}

	// Common components.
	Vue.component('AppButton', AppButton);
	Vue.component('AppJolticon', AppJolticon);
	Vue.component('AppLinkExternal', AppLinkExternal);
	Vue.component('AppLinkHelp', AppLinkHelp);
	Vue.directive('AppTrackEvent', AppTrackEvent);

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
			// Needed for our vue plugins to know when it's the root vue instance.
			gjIsRoot: true,
			store,
			router,
			render: h => h(appComponent),
		});
	};
}
