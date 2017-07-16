import { createApp } from './bootstrap';

createApp().then(({ app, router }) => {
	router.onReady(() => {
		app.$mount('#app');
	});
});
