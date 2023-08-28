/**
 * This module allows us to export client-related code safely. It'll get cleaned
 * out when doing a web build and all the exports will be undefined. In the
 * client, they'll be defined with their proper types. Use these exports when
 * interfacing with client code outside of client-specific code.
 */

import { defineAsyncComponent } from 'vue';
import AppNoop from '../AppNoop.vue';
import { getDeviceOS } from '../device/device.service';
import type { startDesktopAudioCapture as startDesktopAudioCaptureType } from './asg/asg';
import type { ClientAutoStart as ClientAutoStartType } from './autostart/autostart.service';
import type AppClientBaseType from './base/base.vue';
import type { Client as ClientType } from './client.service';
import type { ClientHistoryNavigator as ClientHistoryNavigatorType } from './history-navigator/history-navigator.service';
import type AppClientHistoryNavigatorType from './history-navigator/history-navigator.vue';

// Vue components
export let AppClientHistoryNavigator: typeof AppClientHistoryNavigatorType = AppNoop as any;
export let AppClientBase: typeof AppClientBaseType = AppNoop as any;

// ASG
export let startDesktopAudioCapture: typeof startDesktopAudioCaptureType = null as any;

// Misc
export let Client: typeof ClientType = null as any;
export let ClientHistoryNavigator: typeof ClientHistoryNavigatorType = null as any;
export let ClientAutoStart: typeof ClientAutoStartType = null as any;

export async function initSafeExportsForClient() {
	if (!GJ_IS_DESKTOP_APP) {
		return;
	}

	// Vue components
	AppClientHistoryNavigator = defineAsyncComponent(
		async () => (await import('./history-navigator/history-navigator.vue')).default
	);
	AppClientBase = defineAsyncComponent(async () => (await import('./base/base.vue')).default);

	// ASG
	if (getDeviceOS() === 'windows') {
		const asg = await import('./asg/asg');
		startDesktopAudioCapture = asg.startDesktopAudioCapture;
	}

	// Misc
	Client = (await import('./client.service')).Client;
	ClientHistoryNavigator = (await import('./history-navigator/history-navigator.service'))
		.ClientHistoryNavigator;
	ClientAutoStart = (await import('./autostart/autostart.service')).ClientAutoStart;
}
