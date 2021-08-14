import { setDeviceUserAgent } from '../_common/device/device.service';
import { Environment } from '../_common/environment/environment.service';
import { Meta } from '../_common/meta/meta-service';
import { createApp } from './bootstrap';

export default async (context: any) => {
	const { app, router } = createApp();

	const s = Date.now();

	Environment.ssrContext = context;
	setDeviceUserAgent(context.ua);
	router.push(context.url);

	// Wait until the route has resolved all possible async components and
	// hooks.
	await router.isReady();
	const matchedComponents = router.currentRoute.value.matched.flatMap(record =>
		Object.values(record.components)
	);
	console.log(`got ${matchedComponents.length} matched route components`);

	if (!matchedComponents.length) {
		console.log('no matched routes');
		throw { code: 404 };
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

		return app;
	} catch (e) {
		throw { code: 500 };
	}
};
