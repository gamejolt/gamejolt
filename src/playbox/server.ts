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

		// Wait until the route has resolved all possible async components and hooks.
		router.onReady(() => {
			const matchedComponents = router.getMatchedComponents();
			console.log(`got ${matchedComponents.length} matched route components`);

			if (!matchedComponents.length) {
				console.log('no matched routes');
				return reject({ code: 404 });
			}

			try {
				console.log(`data fetch: ${Date.now() - s}ms`);

				context.state = {};

				context.meta = {
					title: 'Game Jolt - Indie games for the love of it',
					renderTags() {
						return Meta.render();
					},
				};

				context.prefetchTime = Date.now() - s;

				resolve(app);
			} catch (e) {
				reject({ code: 500 });
			}
		});
	});
};
