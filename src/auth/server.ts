import { createApp } from './bootstrap';
import { Device } from '../lib/gj-lib-client/components/device/device.service';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';

export default (context: any) => {
	const { app, router } = createApp();

	return new Promise((resolve, reject) => {
		const s = Date.now();

		Environment.ssrContext = context;
		Device.ua = context.ua;
		router.push(context.url);

		// Wait until the route has resolved all possible async components and
		// hooks.
		router.onReady(async () => {
			const matchedComponents = router.getMatchedComponents();
			console.log(`got ${matchedComponents.length} matched route components`);

			if (!matchedComponents.length) {
				console.log('no matched routes');
				return reject({ code: 404 });
			}

			try {
				// const componentState = await Promise.all(
				// 	matchedComponents.map((component: any) => {
				// 		if (component.extendOptions.__INITIAL_STATE__) {
				// 			return component.extendOptions.__INITIAL_STATE__;
				// 		} else {
				// 			return null;
				// 		}
				// 	})
				// );

				console.log(`data pre-fetch: ${Date.now() - s}ms`);

				context.state = {
					// vuex: store.state,
					// components: componentState,
				};

				context.meta = {
					title: Meta.title,
				};

				context.prefetchTime = Date.now() - s;

				resolve(app);
			} catch (e) {
				reject({ code: 500 });
			}
		});
	});
};
