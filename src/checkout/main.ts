import { createApp } from './bootstrap';

const { app, router } = createApp();

router.isReady().then(() => {
	app.mount('#app');
});
