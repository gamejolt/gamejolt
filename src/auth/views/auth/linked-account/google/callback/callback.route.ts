import { RouteRecordRaw } from 'vue-router';

export const routeAuthLinkedAccountGoogleCallback: RouteRecordRaw = {
	name: 'auth.linked-account.google.callback',
	path: 'google/callback',
	component: () => import('./RouteAuthLinkedAccountGoogleCallback.vue'),
};
