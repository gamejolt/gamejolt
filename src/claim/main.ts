import { createApp } from './bootstrap';

async function start() {
	const { app, router } = await createApp();

	router.isReady().then(() => {
		app.mount('#app');
	});
}

start();
