import { Component, createApp } from 'vue';
import { Router } from 'vue-router';
import { hijackLinks } from '../utils/router';
import { StoreKey, VuexStore } from '../utils/vuex';
import { initAnalytics, initAnalyticsRouter } from './analytics/analytics.service';
import { AppTrackEvent } from './analytics/track-event.directive';
import AppButton from './button/button.vue';
import { ensureConfig } from './config/config.service';
import { initConnectionService } from './connection/connection-service';
import AppJolticon from './jolticon/jolticon.vue';
import AppLinkExternal from './link/external.vue';
import AppLinkHelp from './link/help/help.vue';
import { initMetaService } from './meta/meta-service';
import { Payload } from './payload/payload-service';
import { Referrer } from './referrer/referrer.service';
import { SettingThemeAlwaysOurs, SettingThemeDark } from './settings/settings.service';
import { initTranslations } from './translate/translate.service';

/**
 * Bootstraps common services and returns a "createApp" function that our entry
 * point can call to get what it needs.
 */
export function bootstrapCommon(appComponent: Component, store: VuexStore, router?: Router) {
	const app = createApp(appComponent);

	// Try to start loading this as soon as possible.
	ensureConfig();

	if (store.state.theme) {
		store.commit('theme/setDark', SettingThemeDark.get());
		store.commit('theme/setAlwaysOurs', SettingThemeAlwaysOurs.get());
	}

	initAnalytics(store);
	Payload.init(store);
	initConnectionService(store);

	if (router) {
		initMetaService(router);
		Referrer.init(router);
		initAnalyticsRouter(router);
		hijackLinks(router, 'gamejolt.com');
	}

	// Common components.
	app.component('AppButton', AppButton);
	app.component('AppJolticon', AppJolticon);
	app.component('AppLinkExternal', AppLinkExternal);
	app.component('AppLinkHelp', AppLinkHelp);
	app.directive('AppTrackEvent', AppTrackEvent);

	// Set some constants so we can use them in templates.
	app.config.globalProperties.GJ_SECTION = GJ_SECTION;
	app.config.globalProperties.GJ_IS_CLIENT = GJ_IS_CLIENT;
	app.config.globalProperties.GJ_IS_SSR = GJ_IS_SSR;

	initTranslations(app);

	app.use(store, StoreKey);
	if (router) {
		app.use(router);
	}

	return app;

	// return () => {

	// 	// return new VueGlobal({
	// 	// 	// TODO(vue3)
	// 	// 	// Needed for our vue plugins to know when it's the root vue
	// 	// 	// instance.
	// 	// 	gjIsRoot: true,
	// 	// 	store,
	// 	// 	router,
	// 	// 	render: h => h(appComponent),
	// 	// });
	// };
}
