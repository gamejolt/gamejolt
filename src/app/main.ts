import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import { createApp } from './bootstrap';

const { app, router, store } = createApp();

if (window.__INITIAL_STATE__) {
	store.replaceState(window.__INITIAL_STATE__.vuex);
}

router.onReady(() => {
	app.$mount('#app');
});

if (GJ_BUILD_TYPE === 'production' && navigator.serviceWorker) {
	OfflinePluginRuntime.install();
}
