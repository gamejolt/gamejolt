import { createApp } from './bootstrap';

async function start() {
	const { app } = await createApp();

	app.mount('#app');
}

start();
