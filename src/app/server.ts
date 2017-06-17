import { app, store, router } from './bootstrap';
// import { App } from './app';
import { Device } from '../lib/gj-lib-client/components/device/device.service';

// const isDev = process.env.NODE_ENV !== 'production';
// const isDev = false;

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default (context: any) => {
	const s = Date.now();

	Device.ua = context.ua;

	return new Promise((resolve, reject) => {
		router.push(context.url);

		// Wait until the route has resolved all possible async hooks.
		router.onReady(() => {
			const matchedComponents = router.getMatchedComponents();
			console.log(`got ${matchedComponents.length} matched route components`);

			if (!matchedComponents.length) {
				console.log('no matched routes');
				reject({ code: 404 });
			}

			Promise.all(
				matchedComponents.map((component: any) => {
					if (component.extendOptions.__INITIAL_STATE__) {
						return component.extendOptions.__INITIAL_STATE__;
					} else {
						return null;
					}
				})
			)
				.then((componentState: any) => {
					console.log(`data pre-fetch: ${Date.now() - s}ms`);

					context.state = {
						vuex: store.state,
						components: componentState,
					};

					context.prefetchTime = Date.now() - s;
					resolve(app);
				})
				.catch(() => {
					reject({ code: 500 });
				});
		});
	});
};
