import { createApp } from './bootstrap';

createApp().then(({ app, router, store }) => {
	if (window.__INITIAL_STATE__) {
		store.replaceState(window.__INITIAL_STATE__.vuex);
	}

	router.onReady(() => {
		app.$mount('#app');
	});
});
