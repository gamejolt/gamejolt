import { RouteConfig } from 'vue-router';

export const routeAuthLinkedAccountTwitterCallback: RouteConfig = {
	name: 'auth.linked-account.twitter.callback',
	path: 'twitter/callback',
	component: () =>
		import(/* webpackChunkName: "routeAuthLinkedAccountTwitterCallback" */ './callback'),
};
