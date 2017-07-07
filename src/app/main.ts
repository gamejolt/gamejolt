import { app, router } from './bootstrap';

// store.replaceState(window.__INITIAL_STATE__)
// console.log((window as any).__INITIAL_STATE__);

router.onReady(() => {
	app.$mount('#app');
});
