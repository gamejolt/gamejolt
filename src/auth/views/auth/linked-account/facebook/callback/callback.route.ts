import { RouteRecordRaw } from 'vue-router';

export const routeAuthLinkedAccountFacebookCallback: RouteRecordRaw = {
	name: 'auth.linked-account.facebook.callback',
	path: 'facebook/callback',
	component: () => import('./RouteAuthLinkedAccountFacebookCallback.vue'),
};
