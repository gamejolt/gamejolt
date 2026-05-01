import type { AsyncLocalStorage } from 'node:async_hooks';

import { App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { Router } from 'vue-router';

import { setDeviceUserAgent } from '~common/device/device.service';
import { getSsrContext } from '~common/environment/environment.service';
import { ssrRenderMeta } from '~common/meta/meta-service';
import { initIsolatedScope, runInIsolatedScope } from '~common/ssr/isolated-state';
import { translationsReady } from '~common/translate/translate.service';

export type SsrRequestContext = {
	url: string;
	ua: string;
	accept: string;
};

export type SsrRenderResult = ReturnType<typeof render>;

type CreateSsrHandlerOptions = {
	createApp: () => Promise<{ app: App; router: Router }>;
	// Owned by the section's Node entry so this module can be imported from
	// browser code for its types without pulling node builtins into the client
	// bundle.
	asyncLocalStorage: AsyncLocalStorage<Map<symbol, any>>;
};

export function createSsrHandler({ createApp, asyncLocalStorage }: CreateSsrHandlerOptions) {
	initIsolatedScope(asyncLocalStorage);

	return (request: SsrRequestContext) => runInIsolatedScope(() => render(createApp, request));
}

async function render(createApp: CreateSsrHandlerOptions['createApp'], request: SsrRequestContext) {
	const ssrContext = getSsrContext();
	ssrContext.url = request.url;
	ssrContext.ua = request.ua;
	ssrContext.accept = request.accept;

	setDeviceUserAgent(request.ua);

	const { app, router } = await createApp();

	const start = Date.now();

	router.push(request.url);
	await router.isReady();

	const matchedComponents = router.currentRoute.value.matched.flatMap(record =>
		record.components ? Object.values(record.components) : []
	);
	if (!matchedComponents.length) {
		throw { code: 404 };
	}

	await translationsReady();

	const prefetchTime = Date.now() - start;

	const renderContext: { modules?: Set<string> } = {};
	const html = await renderToString(app, renderContext);

	return {
		html,
		modules: renderContext.modules ?? new Set(),
		metaTagsHtml: ssrRenderMeta(),
		redirect: ssrContext.redirect,
		errorCode: ssrContext.errorCode,
		prefetchTime,
	};
}
