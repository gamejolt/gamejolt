import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import { createApp } from './bootstrap';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';

const { app, router, store } = createApp();

if (window.__INITIAL_STATE__) {
	store.replaceState(window.__INITIAL_STATE__.vuex);
}

router.onReady(() => {
	app.$mount('#app');
});

if (GJ_BUILD_TYPE === 'production' && navigator.serviceWorker) {
	OfflinePluginRuntime.install({
		onUpdating() {
			Analytics.trackEvent('sw', 'updating');
		},

		onUpdateReady() {
			// Tells to new SW to take control immediately
			OfflinePluginRuntime.applyUpdate();
			Analytics.trackEvent('sw', 'update-ready');
		},

		onUpdated() {
			Analytics.trackEvent('sw', 'updated');

			// TODO: Hook into how we update based on site-api version.
			// Reload the webpage to load into the new version
			// window.location.reload();
		},

		onUpdateFailed() {
			Analytics.trackEvent('sw', 'update-failed');
		},
	});
}
