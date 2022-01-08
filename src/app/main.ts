import { createApp } from './bootstrap';

const { app, router, store } = createApp();

if (window.__INITIAL_STATE__) {
	store.replaceState(window.__INITIAL_STATE__.vuex);
}

router.isReady().then(() => {
	app.mount('#app');
});

// TODO(vue3): make sure this won't break out build when we push to prod since we're removing the service worker
// if (GJ_BUILD_TYPE === 'production' && navigator.serviceWorker) {
// 	OfflinePluginRuntime.install({
// 		onUpdating() {
// 			Analytics.trackEvent('sw', 'updating');
// 		},

// 		onUpdateReady() {
// 			// Tells to new SW to take control immediately
// 			OfflinePluginRuntime.applyUpdate();
// 			Analytics.trackEvent('sw', 'update-ready');
// 		},

// 		onUpdated() {
// 			Analytics.trackEvent('sw', 'updated');

// 			// TODO: Hook into how we update based on site-api version.
// 			// Reload the webpage to load into the new version
// 			// window.location.reload();
// 		},

// 		onUpdateFailed() {
// 			Analytics.trackEvent('sw', 'update-failed');
// 		},
// 	});
// }
