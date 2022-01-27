import { createApp } from './bootstrap';

const { app, router, store } = createApp();

if (window.__INITIAL_STATE__) {
	store.replaceState(window.__INITIAL_STATE__.vuex);
}

router.onReady(() => {
	app.$mount('#app');
});
