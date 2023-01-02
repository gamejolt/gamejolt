import { renderToString } from 'vue/server-renderer';
import { setDeviceUserAgent } from '../_common/device/device.service';
import { Environment } from '../_common/environment/environment.service';
import { renderMeta } from '../_common/meta/meta-service';
import { translationsReady } from '../_common/translate/translate.service';
import { createApp } from './bootstrap';

export default async (context: any) => {
	const { app, router } = await createApp();

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
				return renderMeta();
			},
		};

		const renderContext = {};
		const appHtml = await renderToString(app, renderContext);

		return [appHtml, renderContext];
	} catch (e) {
		throw { code: 500 };
	}
};
