import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';
import { createWidgetPackageStore, WidgetPackageStoreKey } from './store';

export async function createApp() {
	const { app } = await bootstrapCommon(App);

	app.provide(WidgetPackageStoreKey, createWidgetPackageStore());

	return { app };
}
