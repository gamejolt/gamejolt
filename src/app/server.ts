import { setDeviceUserAgent } from '../_common/device/device.service';
import { Environment } from '../_common/environment/environment.service';
import { renderMeta } from '../_common/meta/meta-service';
import { createApp } from './bootstrap';

export default (context: any) => {
	const { app, router } = createApp();

	return new Promise((resolve, reject) => {
		const s = Date.now();

		Environment.ssrContext = context;
		setDeviceUserAgent(context.ua);
		router.push(context.url);

		// Wait until the route has resolved all possible async components and
		// hooks.
		router.onReady(() => {
			const matchedComponents = router.getMatchedComponents();
			console.log(`got ${matchedComponents.length} matched route components`);

			if (!matchedComponents.length) {
				console.log('no matched routes');
				return reject({ code: 404 });
			}

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

				resolve(app);
			} catch (e) {
				reject({ code: 500 });
			}
		});
	});
};
