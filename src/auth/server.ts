import { AsyncLocalStorage } from 'node:async_hooks';

import { createApp as bootstrapCreateApp } from '~auth/bootstrap';
import { setDeviceUserAgent } from '~common/device/device.service';
import { getSsrContext } from '~common/environment/environment.service';
import { Meta } from '~common/meta/meta-service';
import { initIsolatedScope, runInIsolatedScope } from '~common/ssr/isolated-state';

initIsolatedScope(new AsyncLocalStorage());

export default async function (context: any) {
	return runInIsolatedScope(() => renderRequest(context));
}

async function renderRequest(context: any) {
	Object.assign(getSsrContext(), context);
	setDeviceUserAgent(context.ua);

	const { app, router } = await bootstrapCreateApp();

	const s = Date.now();

	// set the router to the desired URL before rendering
	router.push(context.url);
	await router.isReady();

	console.log(`data pre-fetch: ${Date.now() - s}ms`);

	context.meta = {
		title: Meta.title,
	};

	(context as any).prefetchTime = Date.now() - s;

	return app;
}
