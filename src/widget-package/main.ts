import { createApp } from '~widget-package/bootstrap';

async function start() {
	const { app } = await createApp();
	app.mount('#app');
}

start();
