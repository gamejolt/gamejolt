import { Device } from 'game-jolt-frontend-lib/components/device/device.service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { createApp } from './bootstrap';

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
