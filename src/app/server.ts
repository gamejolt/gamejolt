import { renderToString } from 'vue/server-renderer';

import { createApp } from '~app/bootstrap';
import { setDeviceUserAgent } from '~common/device/device.service';
import { Environment } from '~common/environment/environment.service';
import { ssrRenderMeta } from '~common/meta/meta-service';
import { translationsReady } from '~common/translate/translate.service';

export default async (context: any) => {
	Environment.ssrContext = context;
	setDeviceUserAgent(context.ua);

	const { app, router } = await createApp();

	const s = Date.now();

	router.push(context.url);

	// Wait until the route has resolved all possible async components and
	// hooks.
	await router.isReady();
	const matchedComponents = router.currentRoute.value.matched.flatMap(record =>
		record.components ? Object.values(record.components) : []
	);

	if (!matchedComponents.length) {
		console.log('no matched routes');
		throw { code: 404 };
	}

	// Wait for translations to load.
	await translationsReady();

	try {
		context.prefetchTime = Date.now() - s;
		console.log(`data fetch: ${context.prefetchTime}ms`);

		context.meta = {
			title: 'Game Jolt - Share your creations',
			renderTags() {
				return ssrRenderMeta();
			},
		};

		const renderContext = {};
		const appHtml = await renderToString(app, renderContext);

		return [appHtml, renderContext];
	} catch (e) {
		throw { code: 500 };
	}
};
