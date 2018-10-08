import { RouteConfig } from 'vue-router';

export const routeAuthLinkedAccountFacebookCallback: RouteConfig = {
	name: 'auth.linked-account.facebook.callback',
	path: 'facebook/callback',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeAuthLinkedAccountFacebookCallback" */ './callback'),
};
