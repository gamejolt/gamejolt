import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountDeviceSettings: RouteRecordRaw = {
	name: 'dash.account.device-settings',
	path: '/settings',
	component: () => import('./device-settings.vue'),
	// TODO(pronouns): This component itself is technically able to be offline,
	// but it's not nested within a route that requires a connection.
	meta: {
		availableOffline: true,
	},
};
