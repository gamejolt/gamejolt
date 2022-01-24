import { bootstrapCommon } from '../_common/bootstrap';
import App from './AppMain.vue';
import './main.styl';
import { createWidgetPackageStore, WidgetPackageStoreKey } from './store';

export function createApp() {
	const { app } = bootstrapCommon(App);

	app.provide(WidgetPackageStoreKey, createWidgetPackageStore());

	return { app };
}
