import { AsyncComponentLoader, type Component, createApp, createSSRApp } from 'vue';
import { Router } from 'vue-router';

import { initAnalytics, initAnalyticsRouter } from '~common/analytics/analytics.service';
import { BackdropStoreKey, createBackdropStore } from '~common/backdrop/backdrop.service';
import AppButton from '~common/button/AppButton.vue';
import { initSafeExportsForClient as initCommonSafeExportsForClient } from '~common/client/safe-exports';
import { ensureConfig } from '~common/config/config.service';
import { initConnectionService } from '~common/connection/connection-service';
import { setTimezoneOffsetCookie } from '~common/cookie/cookie.service';
import {
	createEscapeStackStore,
	EscapeStackStoreKey,
} from '~common/escape-stack/escape-stack.service';
import { initHistoryTickStore } from '~common/history-tick/history-tick-service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLinkExternal from '~common/link/AppLinkExternal.vue';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { initMetaService } from '~common/meta/meta-service';
import { Payload } from '~common/payload/payload-service';
import { setCurrentRouter } from '~common/route/current-router-service';
import { initScreenService } from '~common/screen/screen-service';
import { CommonStoreKey, createCommonStore } from '~common/store/common-store';
import { createThemeStore, ThemeStoreKey } from '~common/theme/theme.store';
import { initTranslations } from '~common/translate/translate.service';
import { hijackLinks } from '~utils/router';

export type BootstrapOptions<T = Component> = {
	appComponentLoader: AsyncComponentLoader<T>;
	initSectionSafeExportsForClient?: (router?: Router) => Promise<void>;
	router?: Router;
};

/**
 * Bootstraps common services and returns a "createApp" function that our entry
 * point can call to get what it needs.
 */
export async function bootstrapCommon(options: BootstrapOptions) {
	const router = options?.router ?? null;

	// Do this first so that everything has access to it from here on.
	const commonStore = createCommonStore();

	// Check to make sure our build config is correct.
	// We only want to throw this while developing as it is not a critical error at the time of writing.
	const isDevelopmentBuild =
		GJ_BUILD_TYPE !== 'build' || GJ_ENVIRONMENT !== 'production' || GJ_IS_STAGING;
	if (isDevelopmentBuild && GJ_HAS_ROUTER !== !!router) {
		throw new Error(
			`Invalid vite config. Section router config is wrong. GJ_HAS_ROUTER: ${GJ_HAS_ROUTER}, router: ${!!router}`
		);
	}

	// Client safe exports have to be initialized before the app component is imported in,
	// otherwise some components and services will not be available when building client.
	// For this reason we HAVE TO lazily import the main app component. If we didn't, the main app
	// component will get bundled into the main index.js chunk, and since imports are hoisted to the top,
	// it means it'll attempt to use client export modules before they were actually initialized.
	// Annoyingly enough, we cant conditionally import anything syncronously, which means
	// we have to asyncronously import the main app component even in non client builds.
	if (GJ_IS_DESKTOP_APP) {
		await initCommonSafeExportsForClient();
		await options.initSectionSafeExportsForClient?.(options.router);
	}

	const appComponent = await options.appComponentLoader();
	const app = import.meta.env.SSR ? createSSRApp(appComponent) : createApp(appComponent);

	app.provide(CommonStoreKey, commonStore);
	app.provide(ThemeStoreKey, createThemeStore({ commonStore }));

	const backdropStore = createBackdropStore();
	app.provide(BackdropStoreKey, backdropStore);
	app.provide(EscapeStackStoreKey, createEscapeStackStore());

	// Try to start loading this as soon as possible.
	ensureConfig();

	initHistoryTickStore(router ?? undefined);
	initScreenService();
	initTranslations(app);
	initAnalytics({ commonStore });
	Payload.init({ commonStore });
	initConnectionService({ commonStore });
	setTimezoneOffsetCookie();

	if (router) {
		setCurrentRouter(router);
		initMetaService(router);
		initAnalyticsRouter(router);
		hijackLinks(router, 'gamejolt.com');
	}

	// Common components.
	app.component('AppButton', AppButton);
	app.component('AppJolticon', AppJolticon);
	app.component('AppLinkExternal', AppLinkExternal);
	app.component('AppLinkHelp', AppLinkHelp);

	// We want our "env" constants to be available in vue templates.
	app.config.globalProperties.GJ_SECTION = GJ_SECTION;
	app.config.globalProperties.GJ_ENVIRONMENT = GJ_ENVIRONMENT;
	app.config.globalProperties.GJ_IS_STAGING = GJ_IS_STAGING;
	app.config.globalProperties.GJ_BUILD_TYPE = GJ_BUILD_TYPE;
	app.config.globalProperties.GJ_IS_DESKTOP_APP = GJ_IS_DESKTOP_APP;
	app.config.globalProperties.GJ_IS_MOBILE_APP = GJ_IS_MOBILE_APP;
	app.config.globalProperties.GJ_IS_SSR = import.meta.env.SSR;
	app.config.globalProperties.GJ_VERSION = GJ_VERSION;
	app.config.globalProperties.GJ_WITH_UPDATER = GJ_WITH_UPDATER;

	if (router) {
		app.use(router);
	}

	return { app, commonStore, backdropStore };
}
