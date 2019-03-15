import { createApp } from './bootstrap';
import './main.styl';

const { app, router } = createApp();

router.onReady(() => {
	app.$mount('#app');
});
