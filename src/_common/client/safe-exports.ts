/**
 * This module allows us to export client-related code safely. It'll get cleaned
 * out when doing a web build and all the exports will be undefined. In the
 * client, they'll be defined with their proper types. Use these exports when
 * interfacing with client code outside of client-specific code.
 */

import { defineAsyncComponent } from 'vue';
import AppNoop from '../AppNoop.vue';
import { lazyImportOnlyDesktopApp } from '../code-splitting';

const Client = GJ_IS_DESKTOP_APP ? (await import('./client.service')).Client : null;
const ClientHistoryNavigator = GJ_IS_DESKTOP_APP
	? (await import('./history-navigator/history-navigator.service')).ClientHistoryNavigator
	: null;
const ClientAutoStart = GJ_IS_DESKTOP_APP
	? (await import('./autostart/autostart.service')).ClientAutoStart
	: null;
const AppClientHistoryNavigator = GJ_IS_DESKTOP_APP
	? (await import('./history-navigator/history-navigator.vue')).default
	: AppNoop;
const AppClientBase = defineAsyncComponent(
	lazyImportOnlyDesktopApp(async () => {
		const { default: imported } = await import('./base/base.vue');
		return imported;
	})
);

export {
	Client,
	ClientHistoryNavigator,
	ClientAutoStart,
	AppClientHistoryNavigator,
	AppClientBase,
};
