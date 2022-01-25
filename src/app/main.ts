import { createApp } from './bootstrap';

async function start() {
	const { app, router } = await createApp();
	await router.isReady();
	app.mount('#app');
}

start();

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
