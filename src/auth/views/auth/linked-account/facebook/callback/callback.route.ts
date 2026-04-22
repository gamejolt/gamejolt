import { RouteRecordRaw } from 'vue-router';

export const routeAuthLinkedAccountFacebookCallback: RouteRecordRaw = {
	name: 'auth.linked-account.facebook.callback',
	path: 'facebook/callback',
	component: () =>
		import('~auth/views/auth/linked-account/facebook/callback/RouteAuthLinkedAccountFacebookCallback.vue'),
};
