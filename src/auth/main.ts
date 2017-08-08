import { createApp } from './bootstrap';

const { app, router } = createApp();

router.onReady(() => {
	app.$mount('#app');
});
