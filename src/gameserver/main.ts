import { createApp } from '~gameserver/bootstrap';

async function start() {
	const { app } = await createApp();
	app.mount('#app');
}

start();
