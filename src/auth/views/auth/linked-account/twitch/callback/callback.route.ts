import { RouteRecordRaw } from 'vue-router';

export const routeAuthLinkedAccountTwitchCallback: RouteRecordRaw = {
	name: 'auth.linked-account.twitch.callback',
	path: 'twitch/callback',
	component: () => import('~auth/views/auth/linked-account/twitch/callback/RouteAuthLinkedAccountTwitchCallback.vue'),
};
