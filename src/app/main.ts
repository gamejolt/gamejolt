import { createApp } from '~app/bootstrap';

async function start() {
	const { app, router } = await createApp();
	await router.isReady();
	app.mount('#app');
}

start();
