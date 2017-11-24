import { RouteConfig } from 'vue-router';

export const routeAuthLinkedAccountGoogleCallback: RouteConfig = {
	name: 'auth.linked-account.google.callback',
	path: 'google/callback',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeAuthLinkedAccountGoogleCallback" */ './callback'),
};
