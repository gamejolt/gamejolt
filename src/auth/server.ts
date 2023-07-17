import { setDeviceUserAgent } from '../_common/device/device.service';
import { Environment } from '../_common/environment/environment.service';
import { Meta } from '../_common/meta/meta-service';
import { createApp as bootstrapCreateApp } from './bootstrap';

export default async function (context: typeof Environment.ssrContext) {
	Environment.ssrContext = context;
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
