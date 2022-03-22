import { Component, createApp, createSSRApp } from 'vue';
import { Router } from 'vue-router';
import { hijackLinks } from '../utils/router';
import { initAnalytics, initAnalyticsRouter } from './analytics/analytics.service';
import { vAppTrackEvent } from './analytics/track-event.directive';
import AppButton from './button/AppButton.vue';
import { initSafeExportsForClient } from './client/safe-exports';
import { ensureConfig } from './config/config.service';
import { initConnectionService } from './connection/connection-service';
import AppJolticon from './jolticon/AppJolticon.vue';
import AppLinkExternal from './link/AppLinkExternal.vue';
import AppLinkHelp from './link/AppLinkHelp.vue';
import { initMetaService } from './meta/meta-service';
import { Payload } from './payload/payload-service';
import { Referrer } from './referrer/referrer.service';
import { commonStore, CommonStoreKey } from './store/common-store';
import { createThemeStore, ThemeStoreKey } from './theme/theme.store';
import { initTranslations } from './translate/translate.service';

/**
 * Bootstraps common services and returns a "createApp" function that our entry
 * point can call to get what it needs.
 */
export async function bootstrapCommon(appComponent: Component, router?: Router) {
	// Check to make sure our build config is correct.
	if (GJ_BUILD_TYPE === 'development' && GJ_HAS_ROUTER !== !!router) {
		throw new Error(
			`Invalid vite config. Section router config is wrong. GJ_HAS_ROUTER: ${GJ_HAS_ROUTER}, router: ${!!router}`
		);
	}

	if (GJ_IS_DESKTOP_APP) {
		await initSafeExportsForClient();
	}

	const app = import.meta.env.SSR ? createSSRApp(appComponent) : createApp(appComponent);

	// Our global stores.
	app.provide(CommonStoreKey, commonStore);
	app.provide(ThemeStoreKey, createThemeStore({ commonStore }));

	// Try to start loading this as soon as possible.
	ensureConfig();

	initAnalytics({ commonStore });
	Payload.init({ commonStore });
	initConnectionService({ commonStore });

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
	app.directive('AppTrackEvent', vAppTrackEvent);

	// We want our "env" constants to be available in vue templates.
	app.config.globalProperties.GJ_SECTION = GJ_SECTION;
	app.config.globalProperties.GJ_ENVIRONMENT = GJ_ENVIRONMENT;
	app.config.globalProperties.GJ_BUILD_TYPE = GJ_BUILD_TYPE;
	app.config.globalProperties.GJ_IS_DESKTOP_APP = GJ_IS_DESKTOP_APP;
	app.config.globalProperties.GJ_IS_MOBILE_APP = GJ_IS_MOBILE_APP;
	app.config.globalProperties.GJ_IS_SSR = import.meta.env.SSR;
	app.config.globalProperties.GJ_VERSION = GJ_VERSION;
	app.config.globalProperties.GJ_WITH_UPDATER = GJ_WITH_UPDATER;

	initTranslations(app);

	if (router) {
		app.use(router);
	}

	return { app, commonStore };
}
