import { RouteConfig } from 'vue-router';

export const routeAuthLinkedAccountTwitterCallback: RouteConfig = {
	name: 'auth.linked-account.twitter.callback',
	path: 'twitter/callback',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeAuthLinkedAccountTwitterCallback" */ './callback'),
};
