import { setDeviceUserAgent } from '../_common/device/device.service';
import { Environment } from '../_common/environment/environment.service';
import { renderMeta } from '../_common/meta/meta-service';
import { translationsReady } from '../_common/translate/translate.service';
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
	console.log(matchedComponents.map(component => component.name).join('\n'));
	console.log(router.currentRoute);

	if (!matchedComponents.length) {
		console.log('no matched routes');
		throw { code: 404 };
	}

	// Wait for translations to load.
	await translationsReady();

	try {
		// const componentState: { [k: string]: any } = {};
		// for (const component of matchedComponents as any[]) {
		// 	const name = component.extendOptions.name;
		// 	componentState[name] =
		// 		component.extendOptions.__RESOLVER__ &&
		// 		component.extendOptions.__RESOLVER__.payload;
		// }

		console.log(`data fetch: ${Date.now() - s}ms`);

		context.state = {
			// components: componentState,
		};

		// Gotta do it this way since the server renderer will call
		// serialize on the context.state automatically. We don't have
		// the finalized vuex state yet, so we have to make sure that it
		// gets pulled during the serialize.
		// Object.defineProperty(context.state, 'vuex', {
		// 	enumerable: true,
		// 	get: () => {
		// 		if (store.getServerState) {
		// 			return store.getServerState();
		// 		}
		// 		return {};
		// 	},
		// });

		context.meta = {
			title: 'Game Jolt - Games for the love of it',
			renderTags() {
				return renderMeta();
			},
		};

		context.prefetchTime = Date.now() - s;

		return app;
	} catch (e) {
		throw { code: 500 };
	}
};
